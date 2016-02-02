/* global memcache */
/* global async */
/* global sails */

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
      DepartureTime: params.DepartureTime,
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

    res.path.push(flight.DepartureLocationCode);
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
    // push last node of path
    if (j == flights.length - 1) {
      res.path.push(flight.ArrivalLocationCode);
    }
  }
  return res;
};

var mapCitypairs = function(citypairs) {
  var res = {
    durationMinutes: 0,
    citypairs: []
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
        quarter: Math.floor(parseInt(sails.moment(from.DepartureDateTime).format('H'))/6)+1
      },
      to: {
        code: to.ArrivalLocationCode,
        date: sails.moment(to.ArrivalDateTime).format('YYYY-MM-DD'),
        time: sails.moment(to.ArrivalDateTime).format('hh:mma').slice(0, -1),
        quarter: Math.floor(parseInt(sails.moment(to.ArrivalDateTime).format('H'))/6)+1
      },
      duration: utils.minutesToDuration(utils.durationToMinutes(pair.Duration)),
      durationMinutes: utils.durationToMinutes(pair.Duration),
      noOfStops: pair.NoOfStops,
      stopsDurationMinutes: 0,
      stopsDuration: '',
      stopsCodes: [],
      stops: [],
      path: [],
      flights: []
    };
    res.durationMinutes += mappedPair.durationMinutes;

    var mFlights = mapFlights(pair.FlightSegment);
    mappedPair.flights = mFlights.flights;
    mappedPair.path = mFlights.path;
    mappedPair.stops = mFlights.stops;
    mappedPair.noOfStops = mFlights.stops.length;
    mappedPair.stopsCodes = mFlights.stopsCodes;
    mappedPair.stopsDurationMinutes = mFlights.stopsDurationMinutes;
    mappedPair.stopsDuration = utils.minutesToDuration(mappedPair.stopsDurationMinutes);

    res.citypairs.push( mappedPair );
  }
  return res;
};

// Merchandising Fake keys Issue #39
var _keysMerchandisingWiFi, _keysMerchandising1bagfree, _keysMerchandisingPrioritySeat;
var mapMerchandising = function (citypairs, val) {
    var _cityPairKey = ((citypairs.length > 1) ? _.random(0, citypairs.length - 1) : 0),
        _flightKey = ((citypairs[_cityPairKey].flights.length > 1) ? _.random(0, citypairs[_cityPairKey].flights.length - 1) : 0);

    citypairs[_cityPairKey].flights[_flightKey].merchandising.push(val);
};

var mapItinerary = function(itinerary) {
  var res = {
    id: itinerary.ItineraryId,
    service: 'mondee',
    price: (parseFloat(itinerary.Fares[0].BaseFare) + parseFloat(itinerary.Fares[0].Taxes) - 30).toFixed(2),
    currency: itinerary.Fares[0].CurrencyCode,
    duration: '',
    durationMinutes: 0,
    citypairs: []
  };

  var mCitypairs = mapCitypairs(itinerary.Citypairs);
  res.citypairs = mCitypairs.citypairs;
  res.durationMinutes = mCitypairs.durationMinutes;
  res.duration = utils.minutesToDuration(res.durationMinutes);

  // Merchandising Fake data Issue #39
  if (_.isArray(_keysMerchandisingWiFi) && _.indexOf(_keysMerchandisingWiFi, itinerary.ItineraryId) != -1) {
      mapMerchandising(res.citypairs, 'WiFi');
  }
  if (_.isArray(_keysMerchandising1bagfree) && _.indexOf(_keysMerchandising1bagfree, itinerary.ItineraryId) != -1) {
      mapMerchandising(res.citypairs, '1st bag free');
  }
  if (_.isArray(_keysMerchandisingPrioritySeat) && _.indexOf(_keysMerchandisingPrioritySeat, itinerary.ItineraryId) != -1) {
      mapMerchandising(res.citypairs, 'Priority Seat');
  }

  return res;
};

//var soap = require('soap');

module.exports = {
  flightSearch: function(guid, params, callback) {
    sails.log.info('Mondee API call started');

    memcache.init(function(){});
    utils.timeLog('mondee');

    var wsdlUrl = getWsdlUrl('flightSearch');
    sails.log.info('SOAP: Trying to connect to ' + wsdlUrl);
    soap.createClient(wsdlUrl, {endpoint: getEndPointUrl('flightSearch')}, function(err, client) {

      if (err) {
        sails.log.error("SOAP: An error occurs:\n" + err);
        return callback(err, []);
      } else {
        var req = getFlightSearchRq(guid, params);

        return client.FlightSearch(req, function(err, result, raw, soapHeader) {
          sails.log.info('Mondee FlightSearch request time: %s', utils.timeLogGetHr('mondee'));
          var resArr = [];
          if (err || ('TPErrorList' in result && result.TPErrorList) || !result.FlightSearchResponse) {
              if (!err) {
                  err = (result.TPErrorList && result.TPErrorList.errorText) ? result.TPErrorList.errorText : 'No Results Found';
              }
            sails.log.error(err);
            return callback(err, resArr);
          } else {
            if (result.FlightSearchResponse.FlightItinerary) {
              var minDuration, maxDuration, minPrice, maxPrice;

              // Merchandising Fake keys Issue #39
              var itineraryIds = _.map(result.FlightSearchResponse.FlightItinerary, 'ItineraryId');
              _keysMerchandisingWiFi = _.sample( _.shuffle(itineraryIds), Math.round(itineraryIds.length * 50 / 100) );
              _keysMerchandising1bagfree = _.sample( _.shuffle(itineraryIds), Math.round(itineraryIds.length * 75 / 100) );
              _keysMerchandisingPrioritySeat = _.sample( _.shuffle(itineraryIds), Math.round(itineraryIds.length * 25 / 100) );

              async.map(result.FlightSearchResponse.FlightItinerary, function (itinerary, doneCb) {
                var mappedItinerary = mapItinerary(itinerary);
                resArr.push( mappedItinerary );
                mondee.cache(mappedItinerary, guid);

                if (minPrice === undefined || minPrice > parseFloat(mappedItinerary.price)) {
                  minPrice = Math.floor(parseFloat(mappedItinerary.price));
                }

                if (maxPrice === undefined || maxPrice < parseFloat(mappedItinerary.price)) {
                  maxPrice = Math.ceil(parseFloat(mappedItinerary.price));
                }

                if (minDuration === undefined || minDuration > mappedItinerary.durationMinutes) {
                  minDuration = mappedItinerary.durationMinutes;
                }
                if (maxDuration === undefined || maxDuration < mappedItinerary.durationMinutes) {
                  maxDuration = mappedItinerary.durationMinutes;
                }

                return doneCb(null);
              }, function (err) {
                if ( err ) {
                  sails.log.error( err );
                }
                resArr.guid = guid;
                resArr.priceRange = {
                  minPrice: minPrice,
                  maxPrice: maxPrice
                };
                resArr.durationRange = {
                  minDuration: minDuration,
                  maxDuration: maxDuration
                };
                mondee.cacheSearch(guid, params);
                return callback( null, resArr );
              });
            }
          }
        });
      }
    });
  },

  //cache results functionality
  searchResultKeys: [],
  cache: function (value, searchId) {
    var id = 'itinerary_' + value.id.replace(/\W+/g, '_');
    value.searchId = 'search_' + searchId.replace(/\W+/g, '_');
    mondee.searchResultKeys.push(id);
    memcache.store(id, value);
  },
  cacheSearch: function (searchId, params) {
    var id = 'search_' + searchId.replace(/\W+/g, '_');
    memcache.store(id, {
      searchParams  : params,
      itineraryKeys : mondee.searchResultKeys
    });
    mondee.searchResultKeys = [];
  }
};
