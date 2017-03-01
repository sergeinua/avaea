const util = require('util'),
  lodash = require('lodash'),
  x2j = require('xml2json');

const serviceName = require('path').basename(module.filename, '.js'),
  apiCallTimeWarn = 7000; // ms

let currency = 'USD';

const getErrorReport = function (errorObject) {
  let err = 'Error';
  if ('ErrorCode' in errorObject) {
    err = errorObject.ErrorCode + ': '
  }
  if ('ErrorDescription' in errorObject) {
    err += errorObject.ErrorDescription
  }
  if ('ErrorAtNode' in errorObject) {
    err += errorObject.ErrorAtNode
  }
  return err
};

const getCabinClass = function (CabinClass) {
  switch (CabinClass) {
    case 'B':
      return 'BUSINESS';
    case 'F':
      return 'FIRST';
    case 'P':
      return 'PREMIUMECONOMY';
    case 'E':
    default:
      return 'ECONOMY'
  }
};

const mapReverseClass = {
  'Y': 'E', // Economy Class
  'C': 'B', // Business Class
  'F': 'F', // First Class
  'W': 'P'  // Premium Economy
};

const getTypeOfTrip = (flightType) => {
  switch (flightType) {
    case 'round_trip':
      return 'ROUNDTRIP';
    case 'multi_city':
      return 'MULTICITY';
    case 'one_way':
    default:
      return 'ONEWAYTRIP'
  }
};

const getGender = (gender) => {
  switch (gender) {
    case 'M':
      return 'MALE';
    case 'F':
      return 'FEMALE';
    default:
      return 'NONE'
  }
};

class CheapoairClient {
  constructor(api) {
    this.api = api;
    this.apiOptions = {
      flightSearch: {
        url: 'SearchFlightAvailability34',
        method: 'SearchFlightAvailability34',
        request: (req, params) => {
          req.flightSearchRequest_ = {
            TypeOfTrip: getTypeOfTrip(params.flightType),
            Adults: params.passengers,
            Child: 0,
            Seniors: 0,
            InfantInLap: 0,
            InfantOnSeat: 0,
            Youths: 0,
            "SearchAlternateDates": false,
            "AirLinePreferences": null,
            "ResponseAsObject": true,
            AffiliateCode: sails.config.flightapis[serviceName].security.AffiliateCode,
            SegmentDetails: {
              FlightSegmentDetails: [{
                Origin: params.DepartureLocationCode,
                DepartureDate: sails.moment(params.departureDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                Destination: params.ArrivalLocationCode,
                DepartureTime: '0001'
              }]
            }
          };
          // add return OriginDestination if we have return date
          if (params.returnDate) {
            req.flightSearchRequest_.SegmentDetails.FlightSegmentDetails.push({
              Origin: params.ArrivalLocationCode,
              DepartureDate: sails.moment(params.returnDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              Destination: params.DepartureLocationCode,
              DepartureTime: '0001'
            })
          }

          // set the same CabinClass for all OriginDestination elements
          if (['E', 'B', 'F', 'P'].indexOf(params.CabinClass) != -1) {
            req.flightSearchRequest_.ClassOfService = getCabinClass(params.CabinClass)
          }

          return req;
        }
      },
      flightBooking: {
        url: 'BookFlightAvailibilty20',
        method: 'BookFlightAvailibilty20',
        request: (req, params) => {
          let paxDetails = [];
          for (let i = 0; i < params.passengers.length; i++) {
            // Check input date
            let d_birth = sails.moment(params.passengers[i].DateOfBirth);
            if (!d_birth.isValid()) {
              return new Error('Invalid date format: ' + params.passengers[i].DateOfBirth + ' Must be YYYY-MM-DD');
            }
            params.passengers[i].DateOfBirth = d_birth.format('YYYY-MM-DD');
            let paxType = 'ADULT',
              age = sails.moment().diff(d_birth, 'years');
            if (age < 2) {
              // less than 2
              paxType = 'INFANTONSEAT';
            } else if (age < 12) {
              // between and including 2 and 11
              paxType = 'CHILD';
            }
            paxDetails.push({
              PaxType: paxType,
              FirstName: params.passengers[i].FirstName,
              LastName: params.passengers[i].LastName,
              Gender: getGender(params.passengers[i].Gender),
              BirthDate: params.passengers[i].DateOfBirth,
              Phone: ('' + params['passengers[1].phone']).replace(/[\s+]/g, '')
            });
          }

          req.bookAvailabilityRequest_ = {
            // UserId: params.user.id,
            // Amount: params.booking_itinerary.price,
            ContractId: params.booking_itinerary.ContractId,
            ContractLocatorKey: params.booking_itinerary.ContractLocatorKey,
            AffiliateCode: sails.config.flightapis[serviceName].security.AffiliateCode,

            CardCode: params.CardType,
            CardHolderName: params.FirstName + ' ' + params.LastName,
            CardNumber: params.CardNumber,
            CVNumber: params.CVV,
            CCExpirationDate: params.ExpiryDate,

            BillingInfo: {
              Name: params.FirstName + ' ' + params.LastName,
              Address1: params.Address1,
              City: params.City,
              State: params.State || '',
              Country: params.Country,
              Zip: params.ZipCode,
              Email: params.user.email,
              Phone: ('' + params['passengers[1].phone']).replace(/[\s+]/g, '')
            },
            traveler: {Traveler: paxDetails}
          };
          return req;
        }
      },
      cancelPnr: {
        url: 'CancelPNR',
        method: 'CancelPNR',
        request: (req, params) => {
          req.cancelPNRDetails_ = {
            PNR: params.PNR
          };
          return req;
        }
      },
      readEticket: {
        url: 'BookingDetails',
        method: 'BookingDetails',
        request: (req, params) => {
          req.bookingDetailsRQ_ = {
            PNR: params.pnr,
            BookingNumber: params.reference_number,
          };
          return req;
        }
      },
      fareRules: {
        url: 'GetFlightMoreInfo',
        method: 'GetFlightMoreInfo',
        request: (req, params) => {
          let advFlightInfoRQ = [];
          params.citypairs.forEach((item) => {
            item.pathFlights.forEach((it) => {
              let _fnAir = it.match(/([a-z0-9]{2})(\d+)/i);
              if (_fnAir.length && _fnAir[1] && _fnAir[2]) {
                advFlightInfoRQ.push({
                  ContractId: params.ContractId, // Not
                  CntKey: params.ContractLocatorKey,
                  FlightNumber: _fnAir[2],
                  AirlineCode: _fnAir[1]
                })
              }
            })
          });
          req.advFlightInfoRQ_ = advFlightInfoRQ[0];
          return req;
        }
      }
    }
  }

  getEndPointUrl() {
    return sails.config.flightapis[serviceName].baseEndPoint;
  }

  getWsdlUrl() {
    return this.getEndPointUrl() + '?wsdl';
  }

  getHeaderRq() {
    return {
      'GatewaySoapAuthentication': {
        attributes: {
          xmlns: sails.config.flightapis[serviceName].commonNamespace
        },
        'Username': sails.config.flightapis[serviceName].security.User,
        'Password': sails.config.flightapis[serviceName].security.Password
      }
    }
  }

  getRequest(id, params) {
    return this.apiOptions[this.api].request({}, params)
  }

  getResponse(guid, params, callback) {
    let op = serviceName + '.' + this.api + ': ' + this.apiOptions[this.api].method;
    utils.timeLog(op);
    let wsdlUrl = this.getWsdlUrl();
    onvoya.log.info(op + ': (SOAP) Trying to connect to ' + wsdlUrl);

    soap.createClient(wsdlUrl, {endpoint: this.getEndPointUrl()}, (err, client) => {
      client.addSoapHeader(this.getHeaderRq());
      if (err) {
        onvoya.log.error(op + ": (SOAP) An error occurs:\n" + err);
        return callback(err, null);
      } else {
        let req = this.getRequest(guid, params);
        if (req instanceof Error) {
          return callback(req, null);
        }

        onvoya.log.info(op + ": (SOAP) request:", util.inspect(req, {showHidden: true, depth: null}));

        return client[this.apiOptions[this.api].method](req, (err, result, raw) => {
          let _err = null, _res = null;
          try {
            let
              apiCallTime = utils.timeLogGet(op),
              apiCallTimeHr = utils.durationHr(apiCallTime, 'm', 's');
            onvoya.log.info(util.format(op + ' request time: %s, request=%s, response=%s', apiCallTimeHr, JSON.stringify(req), raw));
            if (err) {
              throw "(SOAP) An error occurs:\n" + err;
            }

            let responseKey = this.apiOptions[this.api].method + 'Result';
            if (lodash.isEmpty(result) || !result[responseKey] ||
              lodash.isEmpty(result[responseKey])
            ) {
              throw '(API) Wrong Response';
            }
            if (typeof result[responseKey] === 'object') {
              _res = result[responseKey]
            } else {
              let _resJson = x2j.toJson(result[responseKey], {object: true});
              if (lodash.isEmpty(_resJson)) {
                throw '(API) Error parser xml to json';
              }
              _res = _resJson;
            }
          } catch (e) {
            onvoya.log.error(op + ": " + e);
            _err = e;
          }
          return callback(_err, _res);
        })
      }
    })
  }

}


class Mapper {

  constructor() {
  }

  run(data, callback) {
    utils.timeLog(serviceName + '_prepare_result');
    return this.convertItineraries(data, (itineraries) => {
      if (!lodash.isArray(itineraries)) {
        return callback('Error converting Itineraries', null)
      }
      currency = data.Currency.CurrencyCode;
      let itineraryIds = lodash.map(itineraries, 'ItineraryId');
      // Merchandising Fake keys Issue #39
      this._keysMerchandisingWiFi = lodash.sampleSize(lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 50 / 100));
      this._keysMerchandising1bagfree = lodash.sampleSize(lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 75 / 100));
      this._keysMerchandisingPrioritySeat = lodash.sampleSize(lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 25 / 100));

      async.map(itineraries, (itinerary, doneCb) => {
        return doneCb(null, this.mapItinerary(itinerary));
      }, (err, resArr) => {
        if (err) {
          onvoya.log.error(err);
        }
        onvoya.log.info(util.format(serviceName + ': Map result data (%d itineraries) to our structure time: %s',
          resArr.length, utils.timeLogGetHr(serviceName + '_prepare_result')
        ));
        return callback(null, resArr);
      })
    })
  }

  convertItineraries(data, callback) {
    let itineraries = [],
      SegmentRefDetails = data['SegmentReference']['SegmentRefDetails'],
      OutBoundOption = data['OriginDestinationOptions']['OutBoundOptions']['OutBoundOption'];
    if (!lodash.isArray(SegmentRefDetails)) {
      SegmentRefDetails = [SegmentRefDetails];
    }
    if (!lodash.isArray(OutBoundOption)) {
      OutBoundOption= [OutBoundOption];
    }
    SegmentRefDetails.forEach((item, indx) => {
      let OutBoundOptions = OutBoundOption.find((outItem) => {
        return outItem['segmentid'] === item['OutBoundOptionId']
      });
      lodash.assign(item,
        {ItineraryId: item['OutBoundOptionId'] + '-itin-' + indx},
        {Citypairs: [OutBoundOptions]},
        {ContractId: item.CNT.ID},
        {ContractLocatorKey: data.CntKey}
      );

      if (data['OriginDestinationOptions']['InBoundOptions']['InBoundOption'] &&
        lodash.isArray(data['OriginDestinationOptions']['InBoundOptions']['InBoundOption'])
      ) {
        let InBoundOptions = data['OriginDestinationOptions']['InBoundOptions']['InBoundOption'].find((inItem) => {
          return inItem['segmentid'] === item['InBoundOptionId']
        });
        item.Citypairs.push(InBoundOptions);
      }

      itineraries.push(lodash.assign({}, item));
    });

    let airlinesCode = [];
    itineraries.forEach((itr) => {
      itr.Citypairs.forEach((pair) => {
        if (!lodash.isArray(pair.FlightSegment)) {
          pair.FlightSegment = [pair.FlightSegment];
        }
        pair.FlightSegment.forEach((flight) => {
          if (flight.MarketingAirline && 'Code' in flight.MarketingAirline) {
            airlinesCode.push(flight.MarketingAirline.Code);
          }
        })
      })
    });

    if (!airlinesCode.length) {
      return callback(itineraries);
    }

    return Airlines.findByCriteria({iata_2code: lodash.uniq(airlinesCode), active: true})
      .then((records) => {
        if (!records.length) {
          return callback(itineraries);
        }
        let airlinesName = [];
        records.forEach((curAirline) => {
          if (curAirline.iata_2code && curAirline.iata_2code != '') {
            airlinesName.push({
              code: curAirline.iata_2code,
              name: curAirline.name
            })
          }
        });
        if (airlinesName.length) {
          itineraries.forEach((itr) => {
            itr.Citypairs.forEach((pair) => {
              if (!lodash.isArray(pair.FlightSegment)) {
                pair.FlightSegment = [pair.FlightSegment];
              }
              pair.FlightSegment.forEach((flight) => {
                if (flight.MarketingAirline && 'Code' in flight.MarketingAirline) {
                  let airline = lodash.find(airlinesName, ['code', flight.MarketingAirline.Code]);
                  if (airline && 'name' in airline) {
                    lodash.assignIn(flight, {airlineName: airline.name});
                  }
                }
              })
            })
          })
        }
        return callback(itineraries);
      })
  }

  mapItinerary(itinerary) {
    let res = {
      id: itinerary.ItineraryId,
      ContractId: itinerary.ContractId,
      ContractLocatorKey: itinerary.ContractLocatorKey,
      service: serviceName,
      price: parseFloat(itinerary['PTC_FareBreakdown'].Adult.TotalAdultFare).toFixed(2),
      fare: parseFloat(itinerary['PTC_FareBreakdown'].Adult.BaseFare).toFixed(2), // for transactions report
      taxes: parseFloat(itinerary['PTC_FareBreakdown'].Adult.TaxesandFees).toFixed(2), // for transactions report
      currency: currency,
      duration: '',
      durationMinutes: 0,
      citypairs: [],
      key: ''
    };

    let mCitypairs = this.mapCitypairs(itinerary.Citypairs);
    res.citypairs = mCitypairs.citypairs;
    res.durationMinutes = mCitypairs.durationMinutes;
    res.duration = utils.minutesToDuration(res.durationMinutes);
    res.key = mCitypairs.key;
    // Set itinerary cabin class as value from the first flight at this moment
    res.cabinClass = (res.citypairs && res.citypairs[0].flights) ? res.citypairs[0].flights[0].cabinClass : '';

    // Merchandising Fake data Issue #39
    if (lodash.isArray(this._keysMerchandisingWiFi) && lodash.indexOf(this._keysMerchandisingWiFi, itinerary.ItineraryId) != -1) {
      this.mapMerchandising(res.citypairs, 'WiFi');
    }
    if (lodash.isArray(this._keysMerchandising1bagfree) && lodash.indexOf(this._keysMerchandising1bagfree, itinerary.ItineraryId) != -1) {
      this.mapMerchandising(res.citypairs, '1st bag free');
    }
    if (lodash.isArray(this._keysMerchandisingPrioritySeat) && lodash.indexOf(this._keysMerchandisingPrioritySeat, itinerary.ItineraryId) != -1) {
      this.mapMerchandising(res.citypairs, 'Priority seat');
    }
    if (lodash.isArray(this._keysMerchandisingPrioritySeat) && lodash.indexOf(this._keysMerchandisingPrioritySeat, itinerary.ItineraryId) != -1) {
      this.mapMerchandising(res.citypairs, 'Lounge');
    }

    return res
  }

  mapMerchandising(citypairs, val) {
    let _cityPairKey = ((citypairs.length > 1) ? lodash.random(0, citypairs.length - 1) : 0),
      _flightKey = ((citypairs[_cityPairKey].flights.length > 1) ? lodash.random(0, citypairs[_cityPairKey].flights.length - 1) : 0);

    citypairs[_cityPairKey].flights[_flightKey].merchandising.push(val);
  }

  jorneyTimeToMinutes(jt) {
    jt = jt.split('.');
    return parseInt(jt[0]) * 60 + parseInt(jt[1]);
  }

  mapCitypairs(citypairs) {
    let res = {
      durationMinutes: 0,
      citypairs: [],
      key: ''
    };
    for (let i = 0; i < citypairs.length; i++) {
      let currentDurationArr = [],
        pair = citypairs[i];
      if (!lodash.isArray(pair.FlightSegment)) {
        pair.FlightSegment = [pair.FlightSegment];
      }

      let from = pair.FlightSegment[0];
      let to = pair.FlightSegment[pair.FlightSegment.length - 1];
      let allDurationMinutes = 0;
      pair.FlightSegment.forEach((it) => {
        allDurationMinutes += this.jorneyTimeToMinutes(it.FlightDuration);
      })
      let mappedPair = {
        direction: i == 0 ? 'Depart' : 'Return',
        from: {
          code: from.DepartureAirport.LocationCode,
          date: sails.moment(from.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('YYYY-MM-DD'),
          time: sails.moment(from.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('hh:mma').slice(0, -1),
          quarter: utils.calculateDayTimeQuarter(sails.moment(from.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A'])),
          airlineCode: from.MarketingAirline.Code.toUpperCase(),
          airline: from.airlineName || from.MarketingAirline.Code,
          minutes: sails.moment.duration(
            sails.moment(from.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).diff(sails.moment(from.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('YYYY-MM-DD'))
          ).asMinutes()
        },
        to: {
          code: to.ArrivalAirport.LocationCode,
          date: sails.moment(to.ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('YYYY-MM-DD'),
          time: sails.moment(to.ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('hh:mma').slice(0, -1),
          quarter: utils.calculateDayTimeQuarter(sails.moment(to.ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A'])),
          minutes: sails.moment.duration(
            sails.moment(to.ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).diff(sails.moment(to.ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('YYYY-MM-DD'))
          ).asMinutes()
        },
        duration: utils.minutesToDuration(allDurationMinutes),
        durationMinutes: allDurationMinutes,
        noOfStops: pair.FlightSegment.length,
        stopsDurationMinutes: 0,
        stopsDuration: '',
        stopsCodes: [],
        stops: [],
        path: [],
        flights: [],
        pathFlights: []
      };
      res.durationMinutes += mappedPair.durationMinutes;

      let mFlights = this.mapFlights(pair.FlightSegment);
      mappedPair.flights = mFlights.flights;
      mappedPair.pathFlights = mFlights.pathFlights;
      mappedPair.path = mFlights.path;
      mappedPair.stops = mFlights.stops;
      mappedPair.noOfStops = mFlights.stops.length;
      mappedPair.stopsCodes = mFlights.stopsCodes;
      mappedPair.stopsDurationMinutes = mFlights.stopsDurationMinutes;
      mappedPair.stopsDuration = utils.minutesToDuration(mappedPair.stopsDurationMinutes);

      res.citypairs.push(mappedPair);

      res.key += '|' + mappedPair.pathFlights.join(',');
    }
    return res;
  }

  mapFlights(flights) {
    let res = {
      flights: [],
      pathFlights: [],
      path: [],
      stops: [],
      stopsCodes: [],
      stopsDurationMinutes: 0
    };
    for (let j = 0; j < flights.length; j++) {
      let flight = flights[j];

      if (j > 0) {
        // fill the citypair stops
        let cpStopDuration = sails.moment.duration(
          sails.moment(flight.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).diff(sails.moment(flights[j - 1].ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']))
        ).asMinutes();
        res.stopsCodes.push(flight.DepartureAirport.LocationCode);
        res.stops.push({
          code: flight.DepartureAirport.LocationCode,
          begin: {
            date: sails.moment(flights[j - 1].ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('YYYY-MM-DD'),
            time: sails.moment(flights[j - 1].ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('hh:mma').slice(0, -1)
          },
          end: {
            date: sails.moment(flight.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('YYYY-MM-DD'),
            time: sails.moment(flight.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('hh:mma').slice(0, -1)
          },
          duration: utils.minutesToDuration(cpStopDuration),
          durationMinutes: cpStopDuration
        });
        res.stopsDurationMinutes += cpStopDuration;
      }

      let mappedFlight = {
        number: flight.FlightNumber,
        abbrNumber: flight.MarketingAirline.Code.toUpperCase() + flight.FlightNumber,
        from: {
          code: flight.DepartureAirport.LocationCode,
          date: sails.moment(flight.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('YYYY-MM-DD'),
          time: sails.moment(flight.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('hh:mma').slice(0, -1)
        },
        to: {
          code: flight.ArrivalAirport.LocationCode,
          date: sails.moment(flight.ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('YYYY-MM-DD'),
          time: sails.moment(flight.ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('hh:mma').slice(0, -1)
        },
        duration: utils.minutesToDuration(this.jorneyTimeToMinutes(flight.FlightDuration)),
        durationMinutes: this.jorneyTimeToMinutes(flight.FlightDuration),
        bookingClass: '', //flight.BookingClass,
        cabinClass: mapReverseClass[flight.FlightCabin.CabinType],
        airline: flight.airlineName || flight.MarketingAirline.Code,
        airlineCode: flight.MarketingAirline.Code.toUpperCase(),
        noOfStops: flight.StopQuantity,
        stopsDuration: '',
        stopsDurationMinutes: 0,
        stops: [],
        merchandising: [] // Merchandising Fake data Issue #39
      };
      if (flight.StopAirports) {
        // mappedFlight.noOfStops = flight.IntermediateStops.length;

        let mStops = this.mapIntermediateStops(flight.StopAirports);
        mappedFlight.stops = mStops.stops;
        mappedFlight.stopsDurationMinutes = mStops.stopsDurationMinutes;
        mappedFlight.stopsDuration = utils.minutesToDuration(mappedFlight.stopsDurationMinutes);
        res.stopsDurationMinutes += mappedFlight.stopsDurationMinutes;
      }
      res.flights.push(mappedFlight);

      // prepare paths
      res.path.push(mappedFlight.from.code.toUpperCase());
      res.pathFlights.push(mappedFlight.abbrNumber);
      // push last node of path
      if (j > 0 && j == flights.length - 1) {
        res.path.push(mappedFlight.from.code.toUpperCase());
        res.pathFlights.push(mappedFlight.abbrNumber);
      }
    }
    return res;
  }

  mapIntermediateStops(stops) {
    let res = {
      stops: [],
      stopsDurationMinutes: 0
    };
    for (let i = 0; i < stops.length; i++) {
      let stop = stops[i];
      let cpStopDuration = sails.moment.duration(
        sails.moment(stop.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).diff(sails.moment(stop.ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']))
      ).asMinutes();
      let mappedStop = {
        code: stop.locationCode,
        begin: {
          date: sails.moment(stop.ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('YYYY-MM-DD'),
          time: sails.moment(stop.ArrivalDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('hh:mma').slice(0, -1)
        },
        end: {
          date: sails.moment(stop.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('YYYY-MM-DD'),
          time: sails.moment(stop.DepartureDateTime, ['DDMMMMYYYYhh:mm a', 'DDMMMYYhh:mm A']).format('hh:mma').slice(0, -1)
        },
        duration: utils.minutesToDuration(cpStopDuration),
        durationMinutes: cpStopDuration
      };
      res.stopsDurationMinutes += mappedStop.durationMinutes;
      res.stops.push(mappedStop);
    }
    return res;
  }

}

module.exports = {

  flightSearch: function (guid, params, callback) {
    let
      api = 'flightSearch',
      _api_name = serviceName + '.' + api;

    utils.timeLog(_api_name);
    onvoya.log.info(_api_name + ' started');

    let _cb = (err, result) => {
      onvoya.log.info(util.format(_api_name + ' processing time: %s', utils.timeLogGetHr(_api_name)));
      return callback(err, result);
    };

    let op = _api_name + '.response';
    utils.timeLog(op);

    return new CheapoairClient(api).getResponse(guid, params.searchParams, (err, result) => {
      let
        apiCallTime = utils.timeLogGet(op),
        apiCallTimeHr = utils.durationHr(apiCallTime, 'm', 's');
      if (apiCallTime > apiCallTimeWarn) {
        params.session.time_log.push(util.format(_api_name + ' took %s to respond', apiCallTimeHr));
      }

      try {
        if (err) {
          throw err;
        }
        if ('ErrorReport' in result.Fareportal && result.Fareportal.ErrorReport) {
          throw getErrorReport(result.Fareportal.ErrorReport)
        }
        if ('ErrorCode' in result && 'ErrorDescription' in result) {
          throw getErrorReport({ErrorCode: result.ErrorCode, ErrorDescription: result.ErrorDescription})
        }
        if (!result.Fareportal || !result.Fareportal['FpSearch_AirLowFaresRS'] || !result.Fareportal['FpSearch_AirLowFaresRS']['OriginDestinationOptions'] || !result.Fareportal['FpSearch_AirLowFaresRS']['OriginDestinationOptions']['OutBoundOptions'] || !result.Fareportal['FpSearch_AirLowFaresRS']['OriginDestinationOptions']['OutBoundOptions']['OutBoundOption'] ||
          lodash.isEmpty(result.Fareportal['FpSearch_AirLowFaresRS']['OriginDestinationOptions']['OutBoundOptions']['OutBoundOption'])
        ) {
          throw 'No Results Found'
        }
        if (!result.Fareportal['FpSearch_AirLowFaresRS']['SegmentReference'] || !result.Fareportal['FpSearch_AirLowFaresRS']['SegmentReference']['SegmentRefDetails'] ||
          lodash.isEmpty(result.Fareportal['FpSearch_AirLowFaresRS']['SegmentReference']['SegmentRefDetails'])
        ) {
          throw 'Error no SegmentRefDetails Found'
        }
        if (!result.Fareportal['FpSearch_AirLowFaresRS'].Currency || !result.Fareportal['FpSearch_AirLowFaresRS'].Currency.CurrencyCode
        ) {
          throw 'Error no Currency found'
        }

      } catch (e) {
        return _cb(e, []);
      }


      return new Mapper().run(result.Fareportal['FpSearch_AirLowFaresRS'], _cb)
    })
  },

  flightBooking: function (guid, params, callback) {
    let
      api = 'flightBooking',
      _api_name = serviceName + '.' + api;

    onvoya.log.info(_api_name + ' started');

    let _cb = callback;
    callback = function (errors, result) {
      onvoya.log.info(util.format(_api_name + ' processing time: %s', utils.timeLogGetHr(_api_name)));
      return _cb(errors, result);
    };

    return new CheapoairClient(api).getResponse(guid, params, function (err, result) {
      try {
        if (err) {
          throw err;
        }
        if (('ErrorCode' in result && !lodash.isEmpty(result.ErrorCode)) ||
          ('ErrorAtNode' in result && !lodash.isEmpty(result.ErrorAtNode)) ||
          ('ErrorDescription' in result && !lodash.isEmpty(result.ErrorDescription))
        ) {
          throw getErrorReport({
            ErrorCode: result.ErrorCode,
            ErrorDescription: result.ErrorDescription || result.ErrorAtNode || ''
          })
        }
        if (!result.BookingNumber || !result.PNR) {
          throw 'Error: no booking PNR'
        }

        return callback(err, {
          ReferenceNumber: result.BookingNumber,
          PNR: result.PNR,
          BookingGUID: result.BookingGUID
        })
      } catch (e) {
        onvoya.log.error(_api_name + ': An error occurs: ' + e);
        return callback(e, null);
      }
    });
  },

  readEticket: function (guid, params, callback) {
    let
      api = 'readEticket',
      _api_name = serviceName + '.' + api;

    onvoya.log.info(_api_name + ' started');

    let _cb = callback;
    callback = function (errors, result) {
      onvoya.log.info(util.format(_api_name + ' processing time: %s', utils.timeLogGetHr(_api_name)));
      return _cb(errors, result);
    };

    return new CheapoairClient(api).getResponse(guid, params, function (err, result) {
      try {
        if (err) {
          throw err;
        }
        if (('ErrorCode' in result && !lodash.isEmpty(result.ErrorCode)) ||
          ('ErrorAtNode' in result && !lodash.isEmpty(result.ErrorAtNode)) ||
          ('ErrorDescription' in result && !lodash.isEmpty(result.ErrorDescription))
        ) {
          throw getErrorReport({
            ErrorCode: result.ErrorCode,
            ErrorDescription: result.ErrorDescription || result.ErrorAtNode || ''
          })
        }

        let eTicketNumber = (result && result.BookingNumber) ? result.BookingNumber : '';
        return callback(err, eTicketNumber);

      } catch (e) {
        onvoya.log.error(_api_name + ': An error occurs: ' + e);
        return callback(e, null);
      }
    });
  },

  cancelPnr: function (guid, params, callback) {
    let
      api = 'cancelPnr',
      _api_name = serviceName + '.' + api;

    onvoya.log.info(_api_name + ' started');

    let _cb = callback;
    callback = function (errors, result) {
      onvoya.log.info(util.format(_api_name + ' processing time: %s', utils.timeLogGetHr(_api_name)));
      return _cb(errors, result);
    };

    return new CheapoairClient(api).getResponse(guid, params, function (err, result) {
      try {
        if (err) {
          throw err;
        }
        if (('ErrorCode' in result && !lodash.isEmpty(result.ErrorCode)) ||
          ('ErrorAtNode' in result && !lodash.isEmpty(result.ErrorAtNode)) ||
          ('ErrorDescription' in result && !lodash.isEmpty(result.ErrorDescription))
        ) {
          throw getErrorReport({
            ErrorCode: result.ErrorCode,
            ErrorDescription: result.ErrorDescription || result.ErrorAtNode || ''
          })
        }

        return callback(err, result || null);
      } catch (e) {
        onvoya.log.error(_api_name + ': An error occurs: ' + e);
        return callback(e, null);
      }
    });
  },

  fareRules: function (guid, params, callback) {
    let
      api = 'fareRules',
      _api_name = serviceName + '.' + api;


    onvoya.log.info(_api_name + ' started');

    // @todo Facke data remove
    return callback(null, []);
    // @todo To wait for a response from CheapOair.com about Refunded Type

    let _cb = callback;
    callback = function (errors, result) {
      onvoya.log.info(util.format(_api_name + ' processing time: %s', utils.timeLogGetHr(_api_name)));
      return _cb(errors, result);
    };

    return new CheapoairClient(api).getResponse(guid, params, function (err, result) {
      try {
        if (err) {
          throw err;
        }
        if (('ErrorCode' in result && !lodash.isEmpty(result.ErrorCode)) ||
          ('ErrorAtNode' in result && !lodash.isEmpty(result.ErrorAtNode)) ||
          ('ErrorDescription' in result && !lodash.isEmpty(result.ErrorDescription))
        ) {
          throw getErrorReport({
            ErrorCode: result.ErrorCode,
            ErrorDescription: result.ErrorDescription || result.ErrorAtNode || ''
          })
        }

        return callback(err, result || null);
      } catch (e) {
        onvoya.log.error(_api_name + ': An error occurs: ' + e);
        return callback(e, null);
      }
    })


  }
}
