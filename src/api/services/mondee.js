/* global async */
/* global sails */
module.exports = {
  flightSearch: function(guid, params, callback) {

    var durationToMinutes = function(duration) {
      var durationArr = /(\d+)[hH] (\d+)[mM]/.exec(duration);
      var res = 0;
      if (durationArr) {
        res = parseInt(durationArr[1])*60 + parseInt(durationArr[2]);
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
                    from: {
                        code: from.DepartureLocationCode,
                        date: sails.moment(from.DepartureDateTime).format('YYYY-MM-DD'),
                        time: sails.moment(from.DepartureDateTime).format('hh:mma'),
                        quarter: Math.floor(parseInt(sails.moment(from.DepartureDateTime).format('H'))/6)+1
                    },
                    to: {
                      code: to.ArrivalLocationCode,
                      date: sails.moment(to.ArrivalDateTime).format('YYYY-MM-DD'),
                      time: sails.moment(to.ArrivalDateTime).format('hh:mma'),
                      quarter: Math.floor(parseInt(sails.moment(to.ArrivalDateTime).format('H'))/6)+1
                    },
                    duration: pair.Duration.toLowerCase(),
                    durationMinutes: durationToMinutes(pair.Duration),
                    noOfStops: pair.NoOfStops,
                    stopsDuration: '',
                    stopsDurationMinutes: 0,
                    stops: [],
                    path: '',
                    flights: []
                  };
                  mapped.durationMinutes += mappedPair.durationMinutes;

                  var pathArr = [];
                  var destination = '';
                  for (var j=0; j < pair.FlightSegment.length; j++) {
                    var segment = pair.FlightSegment[j];

                    if (j>0) {
                      // fill the citypair stops
                      var cpStopDuration = sails.moment.duration(
                        sails.moment(
                          sails.moment(segment.DepartureDateTime)
                        ).diff(
                          pair.FlightSegment[j-1].ArrivalDateTime
                        )
                      ).asMinutes();
                      mappedPair.stops.push({
                        code: segment.DepartureLocationCode,
                        begin: {
                          date: sails.moment(pair.FlightSegment[j-1].ArrivalDateTime).format('YYYY-MM-DD'),
                          time: sails.moment(pair.FlightSegment[j-1].ArrivalDateTime).format('hh:mma')
                        },
                        end: {
                          date: sails.moment(segment.DepartureDateTime).format('YYYY-MM-DD'),
                          time: sails.moment(segment.DepartureDateTime).format('hh:mma')
                        },
                        duration: minutesToDuration(cpStopDuration),
                        durationMinutes: cpStopDuration
                      });
                      mappedPair.stopsDurationMinutes += cpStopDuration;
                    }

                    pathArr.push(segment.DepartureLocationCode);
                    destination = segment.ArrivalLocationCode;
                    var mappedSegment = {
                      number: segment.FlightNumber,
                      abbrNumber: segment.MarketingAirline.toUpperCase() + segment.FlightNumber,
                      from: {
                        code: segment.DepartureLocationCode,
                        date: sails.moment(segment.DepartureDateTime).format('YYYY-MM-DD'),
                        time: sails.moment(segment.DepartureDateTime).format('hh:mma')
                      },
                      to: {
                        code: segment.ArrivalLocationCode,
                        date: sails.moment(segment.ArrivalDateTime).format('YYYY-MM-DD'),
                        time: sails.moment(segment.ArrivalDateTime).format('hh:mma')
                      },
                      duration: segment.Duration.toLowerCase(),
                      bookingClass: segment.BookingClass,
                      cabinClass: segment.CabinClass,
                      airline: segment.MarketingAirlineName,
                      noOfStops: segment.NoOfStops,
                      stopsDuration: '',
                      stopsDurationMinutes: 0,
                      stops: []
                    };
                    if (segment.IntermediateStops) {
                      for (var k = 0; k < segment.IntermediateStops.length; k++) {
                        var stop = segment.IntermediateStops[k];
                        var mappedStop = {
                          code: stop.locationCode,
                          begin: {
                            date: sails.moment(stop.arrivalDate).format('YYYY-MM-DD'),
                            time: sails.moment(stop.arrivalDate).format('hh:mma')
                          },
                          end: {
                            date: sails.moment(stop.departureDate).format('YYYY-MM-DD'),
                            time: sails.moment(stop.departureDate).format('hh:mma')
                          },
                          duration: stop.stopDuration.toLowerCase(),
                          durationMinutes: durationToMinutes(stop.stopDuration)
                        };
                        mappedSegment.stopsDurationMinutes += mappedStop.durationMinutes;
                        mappedSegment.stops.push( mappedStop );
                      }
                      mappedSegment.stopsDuration = minutesToDuration(mappedSegment.stopsDurationMinutes);
                      mappedPair.stopsDurationMinutes += mappedSegment.stopsDurationMinutes;
                    }
                    mappedPair.flights.push( mappedSegment );
                  }
                  mappedPair.stopsDuration = minutesToDuration(mappedPair.stopsDurationMinutes);

                  /*if (pathArr.length > 1) {*/
                    pathArr.push(destination);
                    mappedPair.path = pathArr.join('&rarr;')
                  /*}*/

                  mapped.citypairs.push( mappedPair );
                }
                mapped.duration = minutesToDuration(mapped.durationMinutes);

                if (minPrice === undefined || minPrice > parseFloat(mapped.price)) {
                  minPrice = parseFloat(mapped.price);
                }

                if (maxPrice === undefined || maxPrice < parseFloat(mapped.price)) {
                  maxPrice = parseFloat(mapped.price);
                }

                if (minDuration === undefined || minDuration > mapped.durationMinutes) {
                  minDuration = mapped.durationMinutes;
                }
                if (maxDuration === undefined || maxDuration < mapped.durationMinutes) {
                  maxDuration = mapped.durationMinutes;
                }

                resArr.push( mapped );
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
                // sails.log.info(resArr.priceRange);
                // sails.log.info(resArr.durationRange);
                return callback( resArr );
              });
            }
          }
        });
      }
    });
  }
};
