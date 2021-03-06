/* global memcache */
/* global async */
/* global sails */
var util = require('util');
var lodash = require('lodash');

var TPContext = {
  messageId: ['string', true],
  correlationId: ['string', false],
  sessionId: ['string', false],
  creationTimestamp: ['dateTime', false],
  clientId: ['string', true],
  hostName: ['string', false],
  customBehavior: ['string', false],
  processingTime: ['string', false],
  originatorIP: ['string', false]
};
var errorDetail = {
  severity: ['string', false],
  stackTrace: ['string', false]
};
var TPError = {
  errorCode: ['string', false],
  errorType: ['string', false],
  errorText: ['string', false],
  errorDetail: [errorDetail, false]
};

var TPErrorList = {
  TPError: [[TPError], true]
};

var CustomData = {};

var PaxDetailInfo = {
  NoOfAdults: ['int', false, {
    _attributes: {
      count: 'int'
    }
  }],
  NoOfChildren: ['int', false, {
    _attributes: {
      count: 'int',
      age: 'string'
    }
  }],
  NoOfInfants: ['int', false, {
    _attributes: {
      count: 'int',
      age: 'string'
    }
  }]
};

var CurrencyInfo = {
  CurrencyCode: ['string', true]
};

var OriginDestination = {
  DepartureLocationCode: ['string', true],
  DepartureTime: ['string', true],
  ArrivalLocationCode: ['string', true],
  CabinClass: ['string', false]
};

// FlightSearchRequestBody {{{
var FlightSearchRequest = {
  OriginDestination: [[OriginDestination], false],
  PreferredAirlines: [['string'], false],
  PaxDetails: [PaxDetailInfo, false],
  CurrencyInfo: [CurrencyInfo, false],
  CustomData: [CustomData, false]
};

var FlightSearchRequestBody = {
  TPContext: [TPContext, true],
  FlightSearchRequest: [FlightSearchRequest, true]
};
// }}}

// FlightSearchResponseBody {{{
var IntermediateStop = {
  locationCode: ['string', false],
  arrivalDate: ['string', false],
  departureDate: ['string', false],
  stopDuration: ['string', false]
};

var FlightSegment = {
  SegmentRef: ['string', false],
  SegStatus: ['string', false],
  DepartureLocationCode: ['string', true],
  DepartureDateTime: ['string', true],
  ArrivalLocationCode: ['string', true],
  ArrivalDateTime: ['string', true],
  OperatingAirline: ['string', false],
  OperatingAirlineName: ['string', false],
  MarketingAirline: ['string', false],
  MarketingAirlineName: ['string', false],
  FlightNumber: ['int', false],
  NoOfStops: ['int', false],
  AirEquipmentType: ['string', false],
  Duration: ['string', false],
  CabinClass: ['string', false],
  BookingClass: ['string', false],
  AirlinePnr: ['string', false],
  TerminalId: ['int', false],
  FareBasisCode: ['string', false],
  baggageAllowance: ['string', false],
  IntermediateStops: [[IntermediateStop], false],
  baggageInfoUrl: ['string', false]
};

var Fares = {
  CurrencyCode: ['string', true],
  BaseFare: ['double', true],
  Taxes: ['double', true],
  CCFee: ['double', false],
  AgentMarkup: ['double', false],
  FullFare: ['double', true],
  PaxType: ['string', true]
};

var Citypair = {
  FlightSegment: [[FlightSegment], true],
  Duration: ['string', false],
  NoOfStops: ['int', false],
  _attributes: {
    sector: 'string'
  }
};

var FlightItinerary = {
  ItineraryId: ['string', true],
  Citypairs: [[Citypair], false],
  Fares: [[Fares], true],
  ValidatingCarrierCode: ['string', false],
  Deeplink: ['string', false],
  FareType: ['string', false]
};

var FlightSearchResponse = {
  FlightItinerary: [[FlightItinerary], false],
  CustomData: [CustomData, false]
};

var FlightSearchResponseBody = {
  TPContext: [TPContext, false],
  TPErrorList: [TPErrorList, false],
  FlightSearchResponse: [FlightSearchResponse, false]
};
// }}}

var getWsdlUrl = function(method) {
  return sails.config.flightapis.mondee.baseEndPoint + '/' + method + '?wsdl';
};

var getEndPointUrl = function(method) {
  return sails.config.flightapis.mondee.baseEndPoint + '/' + method;
};

var getBaseRq = function(id) {
  return {
    'common:TPContext': {
      attributes: {
        'xmlns:common': sails.config.flightapis.mondee.commonNamespace
      },
      'common:clientId': sails.config.flightapis.mondee.clientId,
      'common:messageId': id
    }
  }
};

var getFlightSearchRq = function(id, params) {
  var req = getBaseRq(id);
  // minimum requirements for search request
  req.FlightSearchRequest = {
    OriginDestination: [{
      DepartureLocationCode: params.DepartureLocationCode,
      DepartureTime: params.departureDate,
      ArrivalLocationCode: params.ArrivalLocationCode
    }]
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
};

var mapIntermediateStops = function (stops) {
  var res = {
    stops: [],
    stopsDurationMinutes: 0
  };
  for (var i = 0; i < stops.length; i++) {
    var stop = stops[i];
    var cpStopDuration = sails.moment.duration(
      sails.moment(stop.departureDate).diff(stop.arrivalDate)
    ).asMinutes();
    var mappedStop = {
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
};

var mapFlights = function(flights) {
  var res = {
    flights: [],
    pathFlights: [],
    path: [],
    stops: [],
    stopsCodes: [],
    stopsDurationMinutes: 0
  };
  for (var j=0; j < flights.length; j++) {
    var flight = flights[j];

    if (j>0) {
      // fill the citypair stops
      var cpStopDuration = sails.moment.duration(
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

    var mappedFlight = {
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

      var mStops = mapIntermediateStops(flight.IntermediateStops);
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
};

var mapCitypairs = function(citypairs) {
  var res = {
    durationMinutes: 0,
    citypairs: [],
    key: ''
  };
  for (var i=0; i < citypairs.length; i++) {
    var currentDurationArr = [];
    var pair = citypairs[i];
    var from = pair.FlightSegment[0];
    var to = pair.FlightSegment[pair.FlightSegment.length-1];
    var mappedPair = {
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

    var mFlights = mapFlights(pair.FlightSegment);
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
};

// Merchandising Fake keys Issue #39
var _keysMerchandisingWiFi, _keysMerchandising1bagfree, _keysMerchandisingPrioritySeat;
var mapMerchandising = function (citypairs, val) {
    var _cityPairKey = ((citypairs.length > 1) ? lodash.random(0, citypairs.length - 1) : 0),
        _flightKey = ((citypairs[_cityPairKey].flights.length > 1) ? lodash.random(0, citypairs[_cityPairKey].flights.length - 1) : 0);

    citypairs[_cityPairKey].flights[_flightKey].merchandising.push(val);
};

var mapItinerary = function(itinerary) {
  var res = {
    id: itinerary.ItineraryId,
    service: 'mondee',
    price: parseFloat((parseFloat(itinerary.Fares[0].BaseFare) + parseFloat(itinerary.Fares[0].Taxes) - 30).toFixed(2)),
    currency: itinerary.Fares[0].CurrencyCode,
    duration: '',
    durationMinutes: 0,
    citypairs: [],
    key: ''
  };

  var mCitypairs = mapCitypairs(itinerary.Citypairs);
  res.citypairs = mCitypairs.citypairs;
  res.durationMinutes = mCitypairs.durationMinutes;
  res.duration = utils.minutesToDuration(res.durationMinutes);
  res.key = mCitypairs.key;

  // Merchandising Fake data Issue #39
  if (lodash.isArray(_keysMerchandisingWiFi) && lodash.indexOf(_keysMerchandisingWiFi, itinerary.ItineraryId) != -1) {
      mapMerchandising(res.citypairs, 'WiFi');
  }
  if (lodash.isArray(_keysMerchandising1bagfree) && lodash.indexOf(_keysMerchandising1bagfree, itinerary.ItineraryId) != -1) {
      mapMerchandising(res.citypairs, '1st bag free');
  }
  if (lodash.isArray(_keysMerchandisingPrioritySeat) && lodash.indexOf(_keysMerchandisingPrioritySeat, itinerary.ItineraryId) != -1) {
      mapMerchandising(res.citypairs, 'Priority seat');
  }
  if (lodash.isArray(_keysMerchandisingPrioritySeat) && lodash.indexOf(_keysMerchandisingPrioritySeat, itinerary.ItineraryId) != -1) {
      mapMerchandising(res.citypairs, 'Lounge');
  }

  return res;
};

var getFlightBookingRq = function(id, params) {
  var req = getBaseRq(id);

  // Check input date
  var d_birth = sails.moment(params.DateOfBirth);
  if(!d_birth.isValid()) {
    return new Error('Invalid date format: '+params.DateOfBirth+' Must be MM/DD/YYYY');
  }

  req.BookItineraryRequest = {
    ItineraryId: params.itineraryId,
    PaxDetails: {
      PaxType: params.PaxType,
      FirstName: params.FirstName,
      LastName: params.LastName,
      Gender: params.Gender,
      DateOfBirth: d_birth.format('MM/DD/YYYY')
    },
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
};

var getCancelPnrRq = function(id, params) {
  var req = getBaseRq(id);

  req.CancelPNRRequest = {
    RecordLocator: params.PNR
  };
  return req;
};

var getFareRulesRq = function (id, params) {
  var req = getBaseRq(id);

  req.FareRulesRequest = {
    ItineraryId: params.id
  };
  return req;
};

module.exports = {

  flightSearch: function(guid, params, callback) {
    var _api_name = "flightSearch";
    sails.log.info('Mondee '+_api_name+' API call started');

    memcache.init(function(){});
    utils.timeLog('mondee');

    var wsdlUrl = getWsdlUrl(_api_name);
    sails.log.info('SOAP: Trying to connect to ' + wsdlUrl);
    soap.createClient(wsdlUrl, {endpoint: getEndPointUrl(_api_name)}, function(err, client) {

      if (err) {
        sails.log.error("SOAP: An error occurs:\n" + err);
        return callback( err, [] );
      } else {
        var req = getFlightSearchRq(guid, params.searchParams);

        return client.FlightSearch(req, function(err, result, raw, soapHeader) {
          if (utils.timeLogGet('mondee') > 7000) {
            params.session.time_log.push(util.format('Mondee took %ss to respond', (utils.timeLogGet('mondee')/1000).toFixed(1)));
          }
          sails.log.info('Mondee '+_api_name+' request time: %s, request=%s, response=%s', utils.timeLogGetHr('mondee'), JSON.stringify(req), raw);
          var resArr = [];
          if (err || ('TPErrorList' in result && result.TPErrorList) || !result.FlightSearchResponse) {
              if (!err) {
                err = (result.TPErrorList && result.TPErrorList.TPError.errorText
                      && result.TPErrorList.TPError.errorText != 'No Results Found') ? result.TPErrorList.TPError.errorText : null;
              }
            if (err) sails.log.error(err);
            return callback( err, [] );
          } else {
            if (result.FlightSearchResponse.FlightItinerary) {
              utils.timeLog('mondee_prepare_result');

              // Merchandising Fake keys Issue #39
              var itineraryIds = lodash.map(result.FlightSearchResponse.FlightItinerary, 'ItineraryId');
              _keysMerchandisingWiFi = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 50 / 100) );
              _keysMerchandising1bagfree = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 75 / 100) );
              _keysMerchandisingPrioritySeat = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 25 / 100) );

              async.map(result.FlightSearchResponse.FlightItinerary, function (itinerary, doneCb) {
                var mappedItinerary = mapItinerary(itinerary);
                resArr.push( mappedItinerary );

                return doneCb(null);
              }, function (err) {
                if ( err ) {
                  sails.log.error( err );
                }
                sails.log.info('Mondee: Map result data (%d itineraries) to our structure time: %s', resArr.length, utils.timeLogGetHr('mondee_prepare_result'));
                return callback( null, resArr );
              });
            } else {
              return callback( 'No Results Found', [] );
            }
          }
        });
      }
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

    var _api_name = "flightBooking";
    sails.log.info('Mondee '+_api_name+' API call started');
    utils.timeLog('mondee');

    var wsdlUrl = getWsdlUrl(_api_name);
    sails.log.info('SOAP: Trying to connect to ' + wsdlUrl);

    soap.createClient(wsdlUrl, {endpoint: getEndPointUrl(_api_name)}, function(err, client) {

      if (err) {
        sails.log.error("SOAP: An error occurs:\n" + err);
        return callback(err, {});
      }
      else {
        var req = getFlightBookingRq(guid, params);
        sails.log.info("flightBooking request:", util.inspect(req, {showHidden: true, depth: null}));
        if(req instanceof Error) {
          return callback(req, {});
        }

        return client.BookItinerary(req, function(err, result, raw, soapHeader) {

          if (utils.timeLogGet('mondee') > 7000) {
            params.session.time_log.push(util.format('Mondee took %ss to respond', (utils.timeLogGet('mondee')/1000).toFixed(1)));
          }
          sails.log.info('Mondee '+_api_name+' request time: %s, request=%s, response=%s', utils.timeLogGetHr('mondee'), JSON.stringify(req), raw);

          if (err || ('TPErrorList' in result && result.TPErrorList) || (typeof result.BookItineraryResponse != "object") || lodash.isEmpty(result.BookItineraryResponse)) {
            if (!err) {
              err = (result.TPErrorList && result.TPErrorList.TPError.errorText) ? result.TPErrorList.TPError.errorText : 'Unable to flightBooking';
            }
            sails.log.error(err);
            return callback(err, {});
          }
          else {
            return callback(null, result.BookItineraryResponse);
          }
        });
      }
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

    var _api_name = "cancelPnr";
    sails.log.info('Mondee '+_api_name+' API call started');
    utils.timeLog('mondee');

    var wsdlUrl = getWsdlUrl(_api_name);
    sails.log.info('SOAP: Trying to connect to ' + wsdlUrl);

    soap.createClient(wsdlUrl, {endpoint: getEndPointUrl(_api_name)}, function(err, client) {

      if (err) {
        sails.log.error("SOAP: An error occurs:\n" + err);
        return callback(err, {});
      }
      else {
        var req = getCancelPnrRq(guid, params);

        return client.CancelPNR(req, function(err, result, raw, soapHeader) {

          if (utils.timeLogGet('mondee') > 7000) {
            params.session.time_log.push(util.format('Mondee took %ss to respond', (utils.timeLogGet('mondee')/1000).toFixed(1)));
          }
          sails.log.info('Mondee '+_api_name+' request time: %s, raw=%s', utils.timeLogGetHr('mondee'), raw);

          if (err || ('TPErrorList' in result && result.TPErrorList) || (typeof result.CancelPNRResponse != "object") || lodash.isEmpty(result.CancelPNRResponse)) {
            if (!err) {
              err = (result.TPErrorList && result.TPErrorList.TPError.errorText) ? result.TPErrorList.TPError.errorText : 'Unable to cancelPnr';
            }
            sails.log.error(err);
            return callback(err, {});
          }
          else {
            return callback(null, result.CancelPNRResponse);
          }
        });
      }
    });
  },

  getFareRules: function (guid, params, callback) {
    var _api_name = "fareRules";
    sails.log.info('Mondee '+_api_name+' API call started');
    utils.timeLog('mondee_FareRules');

    var wsdlUrl = getWsdlUrl(_api_name);
    sails.log.info('SOAP: Trying to connect to ' + wsdlUrl);

    soap.createClient(wsdlUrl, {endpoint: getEndPointUrl(_api_name)}, function(err, client) {

      if (err) {
        sails.log.error("SOAP: An error occurs:\n" + err);
        return callback(err, {});
      }
      else {
        var req = getFareRulesRq(guid, params);
        sails.log.info("FareRules request:", util.inspect(req, {showHidden: true, depth: null}));
        if(req instanceof Error) {
          return callback(req, {});
        }

        return client.FareRules(req, function(err, result, raw, soapHeader) {
          sails.log.info('Mondee '+_api_name+' request time: %s, request=%s, response=%s', utils.timeLogGetHr('mondee_FareRules'), JSON.stringify(req), raw);
          if (err || ('TPErrorList' in result && result.TPErrorList) || (typeof result.FareRulesResponse != "object") || lodash.isEmpty(result.FareRulesResponse)) {
            if (!err) {
              err = (result.TPErrorList && result.TPErrorList.TPError.errorText) ? result.TPErrorList.TPError.errorText : 'Unable To Get Fare Rules';
            }
            sails.log.error(err);
            return callback(err, null);
          }
          else {
            return callback(null, result.FareRulesResponse);
          }
        });
      }
    });
  }
};
