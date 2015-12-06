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


var durationToMinutes = function(duration) {
  var durationArr = /((\d+)[dD]\s*)?((\d+)[hH]\s*)?((\d+)[mM])?/.exec(duration);
  var res = 0;
  if (durationArr) {
    if (durationArr[2]) {
      res += parseInt(durationArr[2])*24*60;
    }
    if (durationArr[4]) {
      res += parseInt(durationArr[4])*60;
    }
    if (durationArr[6]) {
      res += parseInt(durationArr[6]);
    }
  }
  return res;
};

var minutesToDuration = function(minutes) {
  var res = [];
  var days = Math.floor(minutes/60/24);
  var hours = Math.floor((minutes - days*60*24)/60);
  var minutes = Math.floor(minutes - hours*60 - days*60*24);
  if (days) {
    res.push(days + 'd');
  }
  if (hours) {
    res.push(hours + 'h');
  }
  if (minutes) {
    res.push(minutes + 'm');
  }
  return res.join(' ');
};

module.exports = {
  flightSearch: function(guid, params, callback) {
    memcache.init();

    var soap = require('soap');
    var wsdl = sails.config.flightapis.mondee.baseEndPoint + '/flightSearch?wsdl';
    sails.log.info('SOAP: Trying to connect to ' + wsdl);
    soap.createClient(wsdl, function(err, client) {
      if (err) {
        sails.log.error(err);
        return callback([]);
      } else {
        // minimum requirements for search request
        var args = {
          'common:TPContext': {
            attributes: {
              'xmlns:common': sails.config.flightapis.mondee.commonNamespace
            },
            'common:clientId': sails.config.flightapis.mondee.clientId,
            'common:messageId': guid
          },
          FlightSearchRequest: {
            OriginDestination: [{
              DepartureLocationCode: params.DepartureLocationCode,
              DepartureTime: params.DepartureTime,
              ArrivalLocationCode: params.ArrivalLocationCode
            }]
          }
        };
        // add return OriginDestination if we have return date
        if (params.returnDate) {
          args.FlightSearchRequest.OriginDestination.push({
            DepartureLocationCode: params.ArrivalLocationCode,
            DepartureTime: params.returnDate,
            ArrivalLocationCode: params.DepartureLocationCode
          });
        }
        // set the same CabinClass for all OriginDestination elements
        if (['E','B','F','P'].indexOf(params.CabinClass) != -1) {
          args.FlightSearchRequest.OriginDestination.forEach(function(val) {
            val.CabinClass = params.CabinClass;
          });
        }
        return client.FlightSearch(args, function(err, result, raw, soapHeader) {
          var res = [];
          if (err) {
            sails.log.error(err);
          } else {
            if (result.FlightSearchResponse.FlightItinerary) {
              var minDuration, maxDuration, minPrice, maxPrice;
              var resArr = [];
              async.map(result.FlightSearchResponse.FlightItinerary, function (itinerary, doneCallback) {
                var mapped = {
                  id: itinerary.ItineraryId,
                  service: 'mondee',
                  price: (parseFloat(itinerary.Fares[0].BaseFare) + parseFloat(itinerary.Fares[0].Taxes)).toFixed(2),
                  currency: itinerary.Fares[0].CurrencyCode,
                  duration: '',
                  durationMinutes: 0,
                  citypairs: []
                };

                for (var i=0; i < itinerary.Citypairs.length; i++) {
                  var currentDurationArr = [];
                  var pair = itinerary.Citypairs[i];
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
                    duration: minutesToDuration(durationToMinutes(pair.Duration)),
                    durationMinutes: durationToMinutes(pair.Duration),
                    noOfStops: pair.NoOfStops,
                    stopsDuration: '',
                    stopsDurationMinutes: 0,
                    stopsCodes: [],
                    stops: [],
                    path: [],
                    flights: []
                  };
                  mapped.durationMinutes += mappedPair.durationMinutes;

                  var pathArr = [];
                  var destination = '';
                  for (var j=0; j < pair.FlightSegment.length; j++) {
                    var flight = pair.FlightSegment[j];

                    if (j>0) {
                      // fill the citypair stops
                      var cpStopDuration = sails.moment.duration(
                        sails.moment(flight.DepartureDateTime).diff(pair.FlightSegment[j-1].ArrivalDateTime)
                      ).asMinutes();
                      mappedPair.stopsCodes.push(flight.DepartureLocationCode);
                      mappedPair.stops.push({
                        code: flight.DepartureLocationCode,
                        begin: {
                          date: sails.moment(pair.FlightSegment[j-1].ArrivalDateTime).format('YYYY-MM-DD'),
                          time: sails.moment(pair.FlightSegment[j-1].ArrivalDateTime).format('hh:mma').slice(0, -1)
                        },
                        end: {
                          date: sails.moment(flight.DepartureDateTime).format('YYYY-MM-DD'),
                          time: sails.moment(flight.DepartureDateTime).format('hh:mma').slice(0, -1)
                        },
                        duration: minutesToDuration(cpStopDuration),
                        durationMinutes: cpStopDuration
                      });
                      mappedPair.stopsDurationMinutes += cpStopDuration;
                    }

                    mappedPair.path.push(flight.DepartureLocationCode);
                    destination = flight.ArrivalLocationCode;
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
                      duration: minutesToDuration(durationToMinutes(flight.Duration)),
                      durationMinutes: durationToMinutes(flight.Duration),
                      bookingClass: flight.BookingClass,
                      cabinClass: flight.CabinClass,
                      airline: flight.MarketingAirlineName,
                      noOfStops: flight.NoOfStops,
                      stopsDuration: '',
                      stopsDurationMinutes: 0,
                      stops: []
                    };
                    if (flight.IntermediateStops) {
                      mappedFlight.noOfStops = flight.IntermediateStops.length
                      for (var k = 0; k < flight.IntermediateStops.length; k++) {
                        var stop = flight.IntermediateStops[k];
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
                          duration: minutesToDuration(cpStopDuration),
                          durationMinutes: cpStopDuration
                        };
                        mappedFlight.stopsDurationMinutes += mappedStop.durationMinutes;
                        mappedFlight.stops.push( mappedStop );
                      }
                      mappedFlight.stopsDuration = minutesToDuration(mappedFlight.stopsDurationMinutes);
                      mappedPair.stopsDurationMinutes += mappedFlight.stopsDurationMinutes;
                    }
                    mappedPair.flights.push( mappedFlight );
                  }
                  mappedPair.stopsDuration = minutesToDuration(mappedPair.stopsDurationMinutes);

                  mappedPair.path.push(destination);

                  mapped.citypairs.push( mappedPair );
                }
                mapped.duration = minutesToDuration(mapped.durationMinutes);

                if (minPrice === undefined || minPrice > parseFloat(mapped.price)) {
                  minPrice = Math.floor(parseFloat(mapped.price));
                }

                if (maxPrice === undefined || maxPrice < parseFloat(mapped.price)) {
                  maxPrice = Math.ceil(parseFloat(mapped.price));
                }

                if (minDuration === undefined || minDuration > mapped.durationMinutes) {
                  minDuration = mapped.durationMinutes;
                }
                if (maxDuration === undefined || maxDuration < mapped.durationMinutes) {
                  maxDuration = mapped.durationMinutes;
                }

                resArr.push( mapped );
                mondee.cache(mapped);
                return doneCallback(null);
              }, function (err) {
                if ( err ) {
                  sails.log.error( err );
                }
                resArr.priceRange = {
                  minPrice: minPrice,
                  maxPrice: maxPrice
                };
                resArr.durationRange = {
                  minDuration: minDuration,
                  maxDuration: maxDuration
                };
                mondee.cacheSearch(guid);
                return callback( resArr );
              });
            }
          }
        });
      }
    });
  },

  //cache results functionality
  searchResultKeys: [],
  cache: function (value) {
    var id = 'itinerary_' + value.id.replace(/\W+/g, '_');
    this.searchResultKeys.push(id);
    memcache.store(id, value);
  },
  cacheSearch: function (searchId) {
    var id = 'search_' + searchId.replace(/\W+/g, '_');
    memcache.store(id, this.searchResultKeys);
    this.searchResultKeys = [];
  }
};
