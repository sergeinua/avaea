/* global memcache */
/* global async */
/* global sails */
module.exports = {
  flightSearch: function(guid, params, callback) {

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
      var hours = Math.floor(minutes/60);
      var minutes = Math.round((minutes/60 - hours)*60);
      if (hours) {
        res.push(hours + 'h');
      }
      if (minutes) {
        res.push(minutes+'m');
      }
      return res.join(' ');
    };

    var soap = require('soap');
    var wsdl = 'http://sandbox.trippro.com/api/v2/flightSearch?wsdl';
    sails.log.info('Trying to send request to Mondee');
    soap.createClient(wsdl, function(err, client) {
      if (err) {
        sails.log.error(err);
        return callback([]);
      } else {
        // minimum requirements for search request
        var args = {
          'common:TPContext': {
            attributes: {
              'xmlns:common': 'http://trippro.com/webservices/common/v2'
            },
            'common:clientId': 'CFS1017',
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
                    duration: pair.Duration.toLowerCase(),
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
                        sails.moment(
                          sails.moment(flight.DepartureDateTime)
                        ).diff(
                          pair.FlightSegment[j-1].ArrivalDateTime
                        )
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
                      duration: flight.Duration.toLowerCase(),
                      bookingClass: flight.BookingClass,
                      cabinClass: flight.CabinClass,
                      airline: flight.MarketingAirlineName,
                      noOfStops: flight.NoOfStops,
                      stopsDuration: '',
                      stopsDurationMinutes: 0,
                      stops: []
                    };
                    if (flight.IntermediateStops) {
                      for (var k = 0; k < flight.IntermediateStops.length; k++) {
                        var stop = flight.IntermediateStops[k];
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
                          duration: stop.stopDuration.toLowerCase(),
                          durationMinutes: durationToMinutes(stop.stopDuration)
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
// if (minDuration == 0 ) {sails.log.warn(mapped)}
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
                // sails.log.info(guid);
                mondee.cacheSearch(guid);
                // sails.log.info(resArr.durationRange);
                return callback( resArr );
              });
            }
          }
        });
      }
    });
  },
  searchResultKeys: [],
  cache: function (value) {
    var id = 'itinerary_' + value.id.replace(/\W+/g, '_');
    sails.log.info(id);
    this.searchResultKeys.push(id);
    // sails.log.info(this);
    memcache.store(id, value);
  },
  cacheSearch: function (searchId) {
    var id = 'search_' + searchId.replace(/\W+/g, '_');
    sails.log.info(id + ' saved items: ' + this.searchResultKeys.length);
    memcache.store(id, this.searchResultKeys);
    this.searchResultKeys = [];
  }
};
