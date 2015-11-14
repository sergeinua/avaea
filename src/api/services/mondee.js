module.exports = {
  flightSearch: function(guid, params, callback) {

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
              var resArr = [];
              async.map(result.FlightSearchResponse.FlightItinerary, function (itinerary, doneCallback) {
                var mapped = {
                  price: (parseFloat(itinerary.Fares[0].BaseFare) + parseFloat(itinerary.Fares[0].Taxes)).toFixed(2),
                  currency: itinerary.Fares[0].CurrencyCode,
                  citypairs: []
                };
                for (var i=0; i < itinerary.Citypairs.length; i++) {
                  var pair = itinerary.Citypairs[i];
                  var from = pair.FlightSegment[0];
                  var to = pair.FlightSegment[pair.FlightSegment.length-1];
                  var mappedPair = {
                    from: {
                        code: from.DepartureLocationCode,
                        date: sails.moment(from.DepartureDateTime).format('YYYY-MM-DD'),
                        time: sails.moment(from.DepartureDateTime).format('hh:mma')
                    },
                    to: {
                      code: to.ArrivalLocationCode,
                      date: sails.moment(to.ArrivalDateTime).format('YYYY-MM-DD'),
                      time: sails.moment(to.ArrivalDateTime).format('hh:mma')
                    },
                    duration: pair.Duration,
                    noOfStops: pair.NoOfStops,
                    stopsDuration: 0,
                    flights: []
                  };
                  var stopsDuration = 0;
                  for (var j=0; j < pair.FlightSegment.length; j++) {
                    var segment = pair.FlightSegment[j];
                    var mappedSegment = {
                      number: segment.FlightNumber,
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
                      duration: sails.moment.duration(segment.Duration).humanize(),
                      bookingClass: segment.BookingClass,
                      cabinClass: segment.CabinClass,
                      airline: segment.MarketingAirlineName,
                      noOfStops: segment.NoOfStops,
                      stopsDuration: 0,
                      stops: [],
                    };
                    if (segment.IntermediateStops) {
                      var fStopsDuration = 0;
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
                          duration: stop.stopDuration
                        };
                        mappedSegment.stops.push( mappedStop );
                      }
                    }
                    mappedPair.flights.push( mappedSegment );
                  }
                  mapped.citypairs.push( mappedPair );
                }
                resArr.push( mapped );
                return doneCallback(null);
              }, function (err) {
                if ( err ) {
                  sails.log.error( err );
                }
                return callback( resArr );
              });
            }
          }
        });
      }
    });
  }
};
