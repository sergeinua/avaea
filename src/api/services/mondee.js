/* global memcache */
/* global async */
/* global sails */
/* global utils */
const util = require('util');
const lodash = require('lodash');

const serviceName = require('path').basename(module.filename, '.js');
const currency = 'USD';
const apiCallTimeWarn = 7000; // ms

class MondeeClient {
  constructor(api) {
    this.api = api;
    this.apiOptions = {
      flightSearch: {
        url: 'flightSearch',
        method: 'FlightSearch',
        request: (req, params) => {
          // minimum requirements for search request
          req.FlightSearchRequest = {
            OriginDestination: [{
              DepartureLocationCode: params.DepartureLocationCode,
              DepartureTime: params.departureDate,
              ArrivalLocationCode: params.ArrivalLocationCode
            }],
            PaxDetails: {
              NoOfAdults: params.passengers
            },
            CurrencyInfo: {
              CurrencyCode: currency
            }
          };
          // add return OriginDestination if we have return date
          if (params.returnDate) {
            req.FlightSearchRequest.OriginDestination.push({
              DepartureLocationCode: params.ArrivalLocationCode,
              DepartureTime: params.returnDate,
              ArrivalLocationCode: params.DepartureLocationCode
            });
          }
          // set the same CabinClass for all OriginDestination elements
          if (['E','B','F','P'].indexOf(params.CabinClass) != -1) {
            req.FlightSearchRequest.OriginDestination.forEach(function(val) {
              val.CabinClass = params.CabinClass;
            });
          }
          return req;
        }
      },
      flightBooking: {
        url: 'flightBooking',
        method: 'BookItinerary',
        request: (req, params) => {
          let paxDetails = [];
          for (let i=0; i<params.passengers.length; i++) {
            // Check input date
            let d_birth = sails.moment(params.passengers[i].DateOfBirth);
            if(!d_birth.isValid()) {
              return new Error('Invalid date format: '+params.passengers[i].DateOfBirth+' Must be MM/DD/YYYY');
            }
            params.passengers[i].DateOfBirth = d_birth.format('MM/DD/YYYY');
            let paxType = 'ADT',
              age = sails.moment().diff(d_birth, 'years');
            if (age < 2) {
              // less than 2
              paxType = 'INF';
            }
            else if (age < 12) {
              // between and including 2 and 11
              paxType = 'CHD';
            }
            paxDetails.push({
              PaxType: paxType,
              FirstName: params.passengers[i].FirstName,
              LastName: params.passengers[i].LastName,
              Gender: params.passengers[i].Gender,
              DateOfBirth: params.passengers[i].DateOfBirth
            });
          }

          req.BookItineraryRequest = {
            ItineraryId: params.itineraryId,
            PaxDetails: paxDetails,
            // Optional fields, but may be need
            //MarkUp: {
            //  PaxType: params.PaxDetails.PaxType,
            //  Agent: 20 // unknown param
            //},
            //PaxContactInfo: {
            //  PhoneNumber: "9888854785",
            //  Email: "apibookingtest@gmail.com"
            //},
            PaymentDetails: {
              PaymentType: "CC",
              CCDetails: {
                CardType: params.CardType,
                CardNumber: params.CardNumber,
                CVV: params.CVV,
                ExpiryDate: params.ExpiryDate
              },
              BillingAddress: {
                Name: params.FirstName+' '+params.LastName,
                Address1: params.Address1,
                City: params.City,
                State: params.State,
                Country: params.Country,
                ZipCode: params.ZipCode
              }
            }
          };
          return req;
        }
      },
      readEticket: {
        url: 'readEticket',
        method: 'ReadETicket',
        request: (req, params) => {
          req.ReadETicketRequest = {
            RecordLocator: params.pnr,
            ReferenceNumber: params.reference_number,
          };
          return req;
        }
      },
      cancelPnr: {
        url: 'cancelPnr',
        method: 'CancelPNR',
        request: (req, params) => {
          req.CancelPNRRequest = {
            RecordLocator: params.PNR
          };
          return req;
        }
      },
      fareRules: {
        url: 'fareRules',
        method: 'FareRules',
        request: (req, params) => {
          req.FareRulesRequest = {
            ItineraryId: params.id
          };
          return req;
        }
      }
    };
  }
  getEndPointUrl() {
    return sails.config.flightapis[serviceName].baseEndPoint + '/' + this.apiOptions[this.api].url;
  }
  getWsdlUrl() {
    return this.getEndPointUrl() + '?wsdl';
  }
  getBaseRq(id) {
    return {
      'common:TPContext': {
        attributes: {
          'xmlns:common': sails.config.flightapis[serviceName].commonNamespace
        },
        'common:clientId': sails.config.flightapis[serviceName].clientId,
        'common:messageId': id
      }
    };
  }
  getRequest(id, params) {
    let req = this.getBaseRq(id);
    return this.apiOptions[this.api].request(req, params);
  }
  getResponse(guid, params, callback) {
    let op = serviceName + '.' + this.api + ': ' + this.apiOptions[this.api].method;
    utils.timeLog(op);

    let wsdlUrl = this.getWsdlUrl();
    sails.log.info(op + ': (SOAP) Trying to connect to ' + wsdlUrl);
    soap.createClient(wsdlUrl, {endpoint: this.getEndPointUrl()}, (err, client) => {

      if (err) {
        sails.log.error(op + ": (SOAP) An error occurs:\n" + err);
        return callback( err, null );
      } else {
        let req = this.getRequest(guid, params);
        if(req instanceof Error) {
          return callback( req, null );
        }

        sails.log.info(op + ": (SOAP) request:\n", util.inspect(req, {showHidden: true, depth: null}));

        return client[this.apiOptions[this.api].method](req, (err, result, raw) => {
          let _err = null, _res = null;
          try {
            let
              apiCallTime = utils.timeLogGet(op),
              apiCallTimeHr = utils.durationHr(apiCallTime, 'm', 's');
            sails.log.info(op + ' request time: %s, request=%s, response=%s', apiCallTimeHr, JSON.stringify(req), raw);
            if (err) {
              throw "(SOAP) An error occurs:\n" + err;
            }
            if (('TPErrorList' in result && result.TPErrorList)) {
              let err = result.TPErrorList.TPError.errorText;
              if (lodash.isArray(result.TPErrorList.TPError)) {
                err = [];
                for(let i=0; i<result.TPErrorList.TPError.length; i++) {
                  err.push(result.TPErrorList.TPError[i].errorText);
                }
                err = "\n" + err.join("\n");
              }
              throw err || '(API) Unknown Error';
            }
            let responseKey = this.apiOptions[this.api].method + 'Response';
            if ((typeof result[responseKey] != "object") || lodash.isEmpty(result[responseKey])) {
              throw '(API) Wrong Response';
            }
            _res = result[responseKey];
          } catch(e) {
            sails.log.error(op + ": " + e);
            _err = e;
          }
          return callback(_err, _res);
        });
      }
    });
  }
}

class Mapper {

  constructor() {
  }

  run(itineraries, callback) {
    utils.timeLog(serviceName + '_prepare_result');
    let itineraryIds = lodash.map(itineraries, 'ItineraryId');
    // Merchandising Fake keys Issue #39
    this._keysMerchandisingWiFi = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 50 / 100) );
    this._keysMerchandising1bagfree = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 75 / 100) );
    this._keysMerchandisingPrioritySeat = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 25 / 100) );

    async.map(itineraries, (itinerary, doneCb) => {
      return doneCb(null, this.mapItinerary(itinerary));
    }, (err, resArr) => {
      if ( err ) {
        sails.log.error( err );
      }
      sails.log.info(serviceName + ': Map result data (%d itineraries) to our structure time: %s', resArr.length, utils.timeLogGetHr(serviceName + '_prepare_result'));
      return callback( null, resArr );
    });

  }

  mapIntermediateStops(stops) {
    let res = {
      stops: [],
      stopsDurationMinutes: 0
    };
    for (let i = 0; i < stops.length; i++) {
      let stop = stops[i];
      let cpStopDuration = sails.moment.duration(
        sails.moment(stop.departureDate).diff(stop.arrivalDate)
      ).asMinutes();
      let mappedStop = {
        code: stop.locationCode,
        begin: {
          date: sails.moment(stop.arrivalDate).format('YYYY-MM-DD'),
          time: sails.moment(stop.arrivalDate).format('hh:mma').slice(0, -1)
        },
        end: {
          date: sails.moment(stop.departureDate).format('YYYY-MM-DD'),
          time: sails.moment(stop.departureDate).format('hh:mma').slice(0, -1)
        },
        duration: utils.minutesToDuration(cpStopDuration),
        durationMinutes: cpStopDuration
      };
      res.stopsDurationMinutes += mappedStop.durationMinutes;
      res.stops.push( mappedStop );
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
    for (let j=0; j < flights.length; j++) {
      let flight = flights[j];

      if (j>0) {
        // fill the citypair stops
        let cpStopDuration = sails.moment.duration(
          sails.moment(flight.DepartureDateTime).diff(flights[j-1].ArrivalDateTime)
        ).asMinutes();
        res.stopsCodes.push(flight.DepartureLocationCode);
        res.stops.push({
          code: flight.DepartureLocationCode,
          begin: {
            date: sails.moment(flights[j-1].ArrivalDateTime).format('YYYY-MM-DD'),
            time: sails.moment(flights[j-1].ArrivalDateTime).format('hh:mma').slice(0, -1)
          },
          end: {
            date: sails.moment(flight.DepartureDateTime).format('YYYY-MM-DD'),
            time: sails.moment(flight.DepartureDateTime).format('hh:mma').slice(0, -1)
          },
          duration: utils.minutesToDuration(cpStopDuration),
          durationMinutes: cpStopDuration
        });
        res.stopsDurationMinutes += cpStopDuration;
      }

      let mappedFlight = {
        number: flight.FlightNumber,
        abbrNumber: flight.MarketingAirline.toUpperCase() + flight.FlightNumber,
        from: {
          code: flight.DepartureLocationCode,
          date: sails.moment(flight.DepartureDateTime).format('YYYY-MM-DD'),
          time: sails.moment(flight.DepartureDateTime).format('hh:mma').slice(0, -1)
        },
        to: {
          code: flight.ArrivalLocationCode,
          date: sails.moment(flight.ArrivalDateTime).format('YYYY-MM-DD'),
          time: sails.moment(flight.ArrivalDateTime).format('hh:mma').slice(0, -1)
        },
        duration: utils.minutesToDuration(utils.durationToMinutes(flight.Duration)),
        durationMinutes: utils.durationToMinutes(flight.Duration),
        bookingClass: flight.BookingClass,
        cabinClass: flight.CabinClass,
        airline: /*flight.MarketingAirline.toUpperCase(), */ flight.MarketingAirlineName,
        airlineCode: flight.MarketingAirline.toUpperCase(),
        noOfStops: flight.NoOfStops,
        stopsDuration: '',
        stopsDurationMinutes: 0,
        stops: [],
        merchandising: [] // Merchandising Fake data Issue #39
      };
      if (flight.IntermediateStops) {
        mappedFlight.noOfStops = flight.IntermediateStops.length;

        let mStops = this.mapIntermediateStops(flight.IntermediateStops);
        mappedFlight.stops = mStops.stops;
        mappedFlight.stopsDurationMinutes = mStops.stopsDurationMinutes;
        mappedFlight.stopsDuration = utils.minutesToDuration(mappedFlight.stopsDurationMinutes);
        res.stopsDurationMinutes += mappedFlight.stopsDurationMinutes;
      }
      res.flights.push( mappedFlight );

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

  mapCitypairs(citypairs) {
    let res = {
      durationMinutes: 0,
      citypairs: [],
      key: ''
    };
    for (let i=0; i < citypairs.length; i++) {
      let currentDurationArr = [];
      let pair = citypairs[i];
      let from = pair.FlightSegment[0];
      let to = pair.FlightSegment[pair.FlightSegment.length-1];
      let mappedPair = {
        direction: i==0 ? 'Depart' : 'Return',
        from: {
          code: from.DepartureLocationCode,
          date: sails.moment(from.DepartureDateTime).format('YYYY-MM-DD'),
          time: sails.moment(from.DepartureDateTime).format('hh:mma').slice(0, -1),
          quarter: utils.calculateDayTimeQuarter(from.DepartureDateTime),
          airlineCode: from.MarketingAirline.toUpperCase(),
          airline: from.MarketingAirlineName,
          minutes: sails.moment.duration(
            sails.moment(from.DepartureDateTime).diff(sails.moment(from.DepartureDateTime).format('YYYY-MM-DD'))
          ).asMinutes()
        },
        to: {
          code: to.ArrivalLocationCode,
          date: sails.moment(to.ArrivalDateTime).format('YYYY-MM-DD'),
          time: sails.moment(to.ArrivalDateTime).format('hh:mma').slice(0, -1),
          quarter: utils.calculateDayTimeQuarter(to.ArrivalDateTime),
          minutes: sails.moment.duration(
            sails.moment(to.ArrivalDateTime).diff(sails.moment(to.ArrivalDateTime).format('YYYY-MM-DD'))
          ).asMinutes()
        },
        duration: utils.minutesToDuration(utils.durationToMinutes(pair.Duration)),
        durationMinutes: utils.durationToMinutes(pair.Duration),
        noOfStops: pair.NoOfStops,
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

      res.citypairs.push( mappedPair );

      res.key += '|' + mappedPair.pathFlights.join(',');
    }
    return res;
  }

  mapMerchandising(citypairs, val) {
    let _cityPairKey = ((citypairs.length > 1) ? lodash.random(0, citypairs.length - 1) : 0),
      _flightKey = ((citypairs[_cityPairKey].flights.length > 1) ? lodash.random(0, citypairs[_cityPairKey].flights.length - 1) : 0);

    citypairs[_cityPairKey].flights[_flightKey].merchandising.push(val);
  }

  mapItinerary(itinerary) {
    let res = {
      id: itinerary.ItineraryId,
      service: 'mondee',
      price: parseFloat((parseFloat(itinerary.Fares[0].BaseFare) + parseFloat(itinerary.Fares[0].Taxes)).toFixed(2)),
      currency: itinerary.Fares[0].CurrencyCode,
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

    return res;
  }
}

module.exports = {

  flightSearch: function(guid, params, callback) {
    let
      api = 'flightSearch',
      _api_name = serviceName + '.' + api;

    utils.timeLog(_api_name);
    sails.log.info(_api_name + ' started');
    // re-init callback for adding final measure of api processing time and show info in log
    let _cb = (err, result) => {
      sails.log.info(_api_name + ' processing time: %s', utils.timeLogGetHr(_api_name));
      return callback(err, result);
    };

    let op = _api_name + '.response';
    utils.timeLog(op);
    return new MondeeClient(api).getResponse(guid, params.searchParams, (err, result) => {
      let
        apiCallTime = utils.timeLogGet(op),
        apiCallTimeHr = utils.durationHr(apiCallTime, 'm', 's');
      if (apiCallTime > apiCallTimeWarn) {
        params.session.time_log.push(_api_name + ' took %s to respond', apiCallTimeHr);
      }
      err = 'No Results Found';
      if (err) {
        if (err == 'No Results Found') {
          return _cb(null, []);
        } else {
          return _cb(err, []);
        }
      }
      if (!result.FlightItinerary) {
        // throw 'No Results Found';
        return _cb(null, []);
      }
      return new Mapper().run(result.FlightItinerary, _cb);
    });
  },

  /**
   * Itinerary booking
   *
   * @param {string} guid Own request id
   * @param {object} params Corresponding to http://developer.trippro.com/xwiki/bin/view/Developer+Network/Flight+Booking+API
   * @param {function} callback
   */
  flightBooking: function(guid, params, callback) {
    let
      api = 'flightBooking',
      _api_name = serviceName + '.' + api;

    sails.log.info(_api_name + ' started');

    return new MondeeClient(api).getResponse(guid, params, function(err, result) {
      return callback(err, result || {});
    });
  },

  /**
   * Read e-ticker after booking
   *
   * @param {string} guid Own request id
   * @param {object} params Corresponding to http://developer.trippro.com/xwiki/bin/view/Developer+Network/Read+ETicket+API
   * @param {function} callback
   */
  readEticket: function(guid, params, callback) {
    let
      api = 'readEticket',
      _api_name = serviceName + '.' + api;

    sails.log.info(_api_name + ' started');

    return new MondeeClient(api).getResponse(guid, params, function(err, result) {
      if (err) {
        // Temporary fake - return reference_number as e-ticket number. Because this action does not work on the mondee side at this moment
        err = null;
        result = {
          ETicketNumber: params.reference_number
        };
      }
      return callback(err, result.ETicketNumber || '');
    });
  },

  /**
   * Cancel booked itinerary by PNR
   *
   * @param {string} guid Own request id
   * @param {object} params {PNR: value}. Corresponding to http://developer.trippro.com/xwiki/bin/view/Developer+Network/Cancel+PNR+API
   * @param {function} callback
   */
  cancelPnr: function(guid, params, callback) {
    let
      api = 'cancelPnr',
      _api_name = serviceName + '.' + api;

    sails.log.info(_api_name + ' started');

    return new MondeeClient(api).getResponse(guid, params, function(err, result) {
      return callback(err, result || {});
    });
  },

  fareRules: function (guid, params, callback) {
    let
      api = 'fareRules',
      _api_name = serviceName + '.' + api;

    sails.log.info(_api_name + ' started');

    return new MondeeClient(api).getResponse(guid, params, function(err, result) {
      return callback(err, result || null);
    });
  }
};
