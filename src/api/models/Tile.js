/* global Tile */
/* global itineraryPrediction */
/* global _ */
/* global sails */
/* global async */
/**
* Tile.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var cicstanford = require('../services/functions_to_release');
module.exports = {

  attributes: {
    name:           { type: 'string' },
    items_per_tile: { type: 'integer' },
    default_items:  { type: 'json' },
    default_order:  { type: 'integer', autoPk: true }
  },
  itineraryPredictedRank: itineraryPrediction.default_predicted_rank,

  setTiles: function (tiles) {
    this.tiles = tiles;
  },

  getTiles: function () {
    return this.tiles;
  },
  tiles: {},
  default_tiles: {
      sourceArrival: {
        name: 'Arrival',
        id: 'source_arrival_tile',
        order: 0,
        filters: [
        ]
      },
      destinationDeparture: {
        name: 'Departure',
        id: 'destination_departure_tile',
        order: 0,
        filters: [
        ]
      },
      Arrival: {
        name: 'Arrival',
        id: 'arrival_tile',
        order: 0,
        filters: [
        ]
      },
      Departure: {
        name: 'Departure',
        id: 'departure_tile',
        order: 0,
        filters: [
        ]
      },
      Airline: {
        name: 'Airline',
        id: 'airline_tile',
        order: 0,
        filters: [
        ]
      },
      Duration: {
        name: 'Duration',
        id: 'duration_tile',
        order: 0,
        filters: [
        ]
      },
      Price: {
        name: 'Price',
        id: 'price_tile',
        order: 0,
        filters: [
        ]
      },
      Merchandising: { // Merchandising Fake data Issue #39
          name: 'Merchandising',
          id: 'merchandising_tile',
          order: 0,
          filters: [
              {
                  title: 'WiFi',
                  id: 'merchandising_tile_wifi',
                  count: 0
              },
              {
                  title: '1st bag free',
                  id: 'merchandising_tile_1st_bag_free',
                  count: 0
              },
              {
                  title: 'Priority Seat',
                  id: 'merchandising_tile_priority_seat',
                  count: 0
              }
          ]
      }
    },

  getTilesData: function (itineraries, params, callback) {

    if (!itineraries) {
      return callback(itineraries, [], params);
    }

    var convertToHours = function (minutes) {
      var hours = Math.round(minutes/60);
      if (hours == 0 || hours == 24) {
        return 12 + 'm';
      } else if (hours < 12) {
        return hours + 'am';
      } else if (hours == 12) {
        return hours + 'n';
      } else if (hours > 12) {
        hours -= 12;
        return hours + 'pm';
      }
    };
    var tileArr = _.clone(this.tiles, true);
    var N = Math.floor(itineraries.length / 4);
    var index = null;
    var filterClass = '';
    var timeArr = [
      '12m &ndash; 6am',
      '6am &ndash; 12n',
      '12n &ndash; 6pm',
      '6pm &ndash; 12m'
    ];

    var systemData = {};
    systemData.priceRange = _.clone(itineraries.priceRange, true);
    systemData.durationRange = _.clone(itineraries.durationRange, true);

    if (params.returnDate) { // round trip
      tileArr['Departure'].name = params.DepartureLocationCode + ' Departure';
      tileArr['Arrival'].name = params.ArrivalLocationCode + ' Arrival';

      tileArr['destinationDeparture'].name = params.ArrivalLocationCode + ' Departure';
      tileArr['sourceArrival'].name = params.DepartureLocationCode + ' Arrival';

      // prepare destinationDeparture tile
      var destinationDepartureNameArr = [];
      var itinerariesDestinationDeparture = _.clone(itineraries, true);
      itinerariesDestinationDeparture = _.sortBy(itinerariesDestinationDeparture, function (item) {
        var lastElement = item.citypairs.length - 1;
        return item.citypairs[lastElement].from.minutes;
      });
      var lastElement = 0;
      for (var counter = 0; counter < 4 ; counter++) {
        lastElement = itinerariesDestinationDeparture[ counter * N ].citypairs.length -1;
        destinationDepartureNameArr[counter] = itinerariesDestinationDeparture[ counter * N ].citypairs[lastElement].from.minutes;
      }

      for (var i = 0; i < 3; i++) {
        tileArr['destinationDeparture'].filters.push({
        title: convertToHours(destinationDepartureNameArr[i]) + ' &ndash; ' + convertToHours(destinationDepartureNameArr[i+1]),
          id: 'destination_departure_tile_' + i,
          count : 0
        });
      }

      lastElement = itinerariesDestinationDeparture[itinerariesDestinationDeparture.length - 1].citypairs.length -1;
      var lastDestinationDeparture = itinerariesDestinationDeparture[itinerariesDestinationDeparture.length - 1].citypairs[lastElement].from.minutes;
      tileArr['destinationDeparture'].filters.push({
        title: convertToHours(destinationDepartureNameArr[3]) + ' &ndash; ' + convertToHours(lastDestinationDeparture),
        id: 'destination_departure_tile_3',
        count : 0
      });
      delete itinerariesDestinationDeparture;
      delete lastDestinationDeparture;

      // prepare sourceArrival tile
      var sourceArrivalNameArr = [];
      var itinerariesSourceArrival = _.clone(itineraries, true);
      itinerariesSourceArrival = _.sortBy(itinerariesSourceArrival, function (item) {
        var lastElement = item.citypairs.length - 1;
        return item.citypairs[lastElement].to.minutes;
      });
      for (var counter = 0; counter < 4 ; counter++) {
        lastElement = itinerariesSourceArrival[ counter * N ].citypairs.length -1;
        sourceArrivalNameArr[counter] = itinerariesSourceArrival[ counter * N ].citypairs[lastElement].to.minutes;
      }

      for (var i = 0; i < 3; i++) {
        tileArr['sourceArrival'].filters.push({
        title: convertToHours(sourceArrivalNameArr[i]) + ' &ndash; ' + convertToHours(sourceArrivalNameArr[i+1]),
          id: 'source_arrival_tile_' + i,
          count : 0
        });
      }

      lastElement = itinerariesSourceArrival[itinerariesSourceArrival.length - 1].citypairs.length -1;
      var lastSourceArrival = itinerariesSourceArrival[itinerariesSourceArrival.length - 1].citypairs[lastElement].to.minutes;
      tileArr['sourceArrival'].filters.push({
        title: convertToHours(sourceArrivalNameArr[3]) + ' &ndash; ' + convertToHours(lastSourceArrival),
        id: 'source_arrival_tile_3',
        count : 0
      });
      delete itinerariesSourceArrival;
      delete lastSourceArrival;

    } else { // one way trip
      delete tileArr['destinationDeparture'];
      delete tileArr['sourceArrival'];

    if (false) { // Pruning itineraries experiment
      if (false) { // Scenario 1 : Prune and rank all together
        // Note: this is a very aggressive pruning.  It keeps only 3-5 itineraries.  In extreme cases it can only keep a single itinerary.
        sails.log.info('Scenario 1 : Prune and rank all together');
        var pruned = cicstanford.prune_itineraries(itineraries);
        sails.log.info('Pruned itineraries to ', pruned.length);
        var ranked = cicstanford.rank_itineraries(pruned, tileArr['Price'].order, tileArr['Duration'].order);
        itineraries = ranked;
      } else if (false) { // Scenario 2 : Prune and rank without mixing departure buckets ////////////////
        // Note: this is a less agressive pruning.  It would keep itineraries from diverse departure times.  It should keep 8-20 itineraries.
        sails.log.info('Scenario 2 : Prune and rank without mixing departure buckets');
        var itineraries_departing_Q1 = itineraries.filter( function(it){return(it.citypairs[0].from.quarter==1);} );  // only keep the ones departing midnight-6am
        var itineraries_departing_Q2 = itineraries.filter( function(it){return(it.citypairs[0].from.quarter==2);} );  // only keep the ones departing 6am-noon
        var itineraries_departing_Q3 = itineraries.filter( function(it){return(it.citypairs[0].from.quarter==3);} );  // only keep the ones departing noon-6pm
        var itineraries_departing_Q4 = itineraries.filter( function(it){return(it.citypairs[0].from.quarter==4);} );  // only keep the ones departing 6pm-midnight
        var pruned_departing_Q1 = cicstanford.prune_itineraries(itineraries_departing_Q1);
        var pruned_departing_Q2 = cicstanford.prune_itineraries(itineraries_departing_Q2);
        var pruned_departing_Q3 = cicstanford.prune_itineraries(itineraries_departing_Q3);
        var pruned_departing_Q4 = cicstanford.prune_itineraries(itineraries_departing_Q4);
        var pruned_departing_Q1234 = pruned_departing_Q1.concat(pruned_departing_Q2, pruned_departing_Q3, pruned_departing_Q4); // group them all together
        var ranked_departing_Q1234 = cicstanford.rank_itineraries(pruned_departing_Q1234, tileArr['Price'].order, tileArr['Duration'].order); // rank them all together
        itineraries = ranked_departing_Q1234;
        sails.log.info('Pruned itineraries to ', ranked_departing_Q1234.length);
      }
      itineraries.priceRange = systemData.priceRange;
      itineraries.durationRange = systemData.durationRange;
    }

    }
    Tile.itineraryPredictedRank['rankMin'] = Math.round(Tile.itineraryPredictedRank['rankMin'] * itineraries.length);
    Tile.itineraryPredictedRank['rankMax'] = Math.round(Tile.itineraryPredictedRank['rankMax'] * itineraries.length);
    sails.log.info('Tile itinerary predicted rank (multiplied by '+itineraries.length+'):');
    sails.log.info(Tile.itineraryPredictedRank);
    if (itineraries) {

      var currentNum = 1; // itinerary number ( starts with 1 )
      // prepare Price tile
      var priceNameArr = [];

      var itinerariesPrice = _.clone(itineraries, true);
      itinerariesPrice = _.sortBy(itinerariesPrice, function(item) {
          return Math.floor(item.price);
      });

      for (var counter = 0; counter < 4 ; counter++) {
        priceNameArr[counter] = Math.floor(itinerariesPrice[ counter * N ].price);
      }

      for (var i = 0; i < 3; i++) {

        tileArr['Price'].filters.push({
          title: '$' + parseInt(priceNameArr[i])+'<span class="visible-xs-inline">+</span> <span class="hidden-xs" style="color:gray"> &ndash; $'+parseInt(priceNameArr[i+1])+'</span>',
          id: 'price_tile_' + i,
          count : 0
        });

      }
      tileArr['Price'].filters.push({
        title: '$' + parseInt(priceNameArr[3])+'<span class="visible-xs-inline">+</span> <span class="hidden-xs" style="color:gray"> &ndash; $'+parseInt(itinerariesPrice[itinerariesPrice.length - 1].price + 1)+'</span>',
        id: 'price_tile_3',
        count : 0
      });
      delete itinerariesPrice;

      var roundTo30mins = function (durationMinutes) {
        var durationMinutesRounded = Math.round(durationMinutes/60)*60;
        if (durationMinutes%60 > 30) {
          durationMinutesRounded += 60;
        } else {
          durationMinutesRounded += 30;
        }
        return durationMinutesRounded;
      };
      var formatMinutes = function (time) {
        if (time) {
          return '&#189;h';
        }
        return 'h';
      };
      // prepare Duration tile
      var itinerariesDuration = _.clone(itineraries, true);
      itinerariesDuration = _.sortBy(itinerariesDuration, 'durationMinutes');


      var durationNameArr = [];

      for (var counter = 0; counter < 4 ; counter++) {
        durationNameArr[counter] = Math.floor(itinerariesDuration[ counter * N ].durationMinutes);
      }

      for (var i = 0; i < 3; i++) {
        tileArr['Duration'].filters.push({
        title: parseInt(durationNameArr[i]/60) + formatMinutes(parseInt(durationNameArr[i]%60)) + ' &ndash; '
          + Math.round((durationNameArr[i+1])/60) + formatMinutes(Math.round((durationNameArr[i+1])%60)),
          id: 'duration_tile_' + i,
          count : 0
        });
      }

      var lastDuration = itinerariesDuration[itinerariesDuration.length - 1].durationMinutes;
      tileArr['Duration'].filters.push({
        title: parseInt(durationNameArr[3]/60) + formatMinutes(parseInt(durationNameArr[3]%60)) + ' &ndash; '
          + Math.round((lastDuration)/60) + formatMinutes(Math.round((lastDuration)%60)),
        id: 'duration_tile_3',
        count : 0
      });
      delete itinerariesDuration;
      delete lastDuration;

      // prepare Departure tile
      var departureNameArr = [];
      var itinerariesDeparture = _.clone(itineraries, true);
      itinerariesDeparture = _.sortBy(itinerariesDeparture,  function (item) {
                               return item.citypairs[0].from.minutes;
                             });

      for (var counter = 0; counter < 4 ; counter++) {
        departureNameArr[counter] = itinerariesDeparture[ counter * N ].citypairs[0].from.minutes;
      }

      for (var i = 0; i < 3; i++) {
        tileArr['Departure'].filters.push({
        title: convertToHours(departureNameArr[i]) + ' &ndash; ' + convertToHours(departureNameArr[i+1]),
          id: 'departure_tile_' + i,
          count : 0
        });
      }

      var lastDeparture = itinerariesDeparture[itinerariesDeparture.length - 1].citypairs[0].from.minutes;
      tileArr['Departure'].filters.push({
        title: convertToHours(departureNameArr[3]) + ' &ndash; ' + convertToHours(lastDeparture),
        id: 'departure_tile_3',
        count : 0
      });
      delete itinerariesDeparture;
      delete lastDeparture;

      // prepare Arrival tile
      var arrivalNameArr = [];
      var itinerariesArrival = _.clone(itineraries, true);
      itinerariesArrival = _.sortBy(itinerariesArrival, function (item) {
                               return item.citypairs[0].to.minutes;
                             });

      for (var counter = 0; counter < 4 ; counter++) {
        arrivalNameArr[counter] = itinerariesArrival[ counter * N ].citypairs[0].to.minutes;
      }

      for (var i = 0; i < 3; i++) {
        tileArr['Arrival'].filters.push({
        title: convertToHours(arrivalNameArr[i]) + ' &ndash; ' + convertToHours(arrivalNameArr[i+1]),
          id: 'arrival_tile_' + i,
          count : 0
        });
      }

      var lastArrival = itinerariesArrival[itinerariesArrival.length - 1].citypairs[0].to.minutes;
      tileArr['Arrival'].filters.push({
        title: convertToHours(arrivalNameArr[3]) + ' &ndash; ' + convertToHours(lastArrival),
        id: 'arrival_tile_3',
        count : 0
      });
      delete itinerariesArrival;
      delete lastArrival;



      var maxOrderTile = _.max(tileArr, 'order');
      switch (maxOrderTile.id) {
          case 'duration_tile':
              sails.log.info('Ordered by Duration');
              itineraries = _.sortBy(itineraries, 'durationMinutes');
              break;
          case 'price_tile':
              sails.log.info('Ordered by Price');
              itineraries = _.sortBy(itineraries, 'price');
              break;
          case 'airline_tile':
              sails.log.info('Ordered by Airline');
              itineraries = _.sortBy(itineraries, function (item) {
                return item.citypairs[0].flights[0].airline;
              });
              break;
          case 'arrival_tile':
              sails.log.info('Ordered by Arrival');
              itineraries = _.sortBy(itineraries, function (item) {
                return item.citypairs[0].to.minutes;
              });
              break;
          case 'departure_tile':
              sails.log.info('Ordered by Departure');
              itineraries = _.sortBy(itineraries, function (item) {
                return item.citypairs[0].from.minutes;
              });
              break;
          case 'destination_departure_tile':
              sails.log.info('Ordered by Destination Departure');
              itineraries = _.sortBy(itineraries, function (item) {
                var lastElement = item.citypairs.length - 1;
                return item.citypairs[lastElement].from.minutes;
              });
              break;
          case 'source_arrival_tile':
              sails.log.info('Ordered by Source Arrival');
              itineraries = _.sortBy(itineraries, function (item) {
                var lastElement = item.citypairs.length - 1;
                return item.citypairs[lastElement].to.minutes;
              });
              break;
          default:
              sails.log.info('Ordered by Price');
              itineraries = _.sortBy(itineraries, 'price');
      }

      async.map(itineraries, function (itinerary, doneCallback) {
        if (itinerary.price) {
          var i = 0;
          while(itinerary.price >= priceNameArr[i+1]) {
            i++;
          }

          tileArr['Price'].filters[i].count++;
          filterClass = tileArr['Price'].filters[i].id;
        }

        if (itinerary.durationMinutes) {
          i = 0;
          while(itinerary.durationMinutes >= durationNameArr[i+1]) {
            i++;
          }
          tileArr['Duration'].filters[i].count++;
          filterClass = filterClass + ' ' + tileArr['Duration'].filters[i].id;
        }

        if (itinerary.citypairs[0].from.minutes) {
          i = 0;
          while(itinerary.citypairs[0].from.minutes >= departureNameArr[i+1]) {
            i++;
          }
          tileArr['Departure'].filters[i].count++;
          filterClass = filterClass + ' ' + tileArr['Departure'].filters[i].id;
        }

        if (itinerary.citypairs[0].to.minutes) {
          i = 0;
          while(itinerary.citypairs[0].to.minutes >= arrivalNameArr[i+1]) {
            i++;
          }
          tileArr['Arrival'].filters[i].count++;
          filterClass = filterClass + ' ' + tileArr['Arrival'].filters[i].id;
        }

        if (params.returnDate) {
          var lastElement = itinerary.citypairs.length - 1;
          if (itinerary.citypairs[lastElement].from.minutes) {
            i = 0;
            while(itinerary.citypairs[lastElement].from.minutes >= destinationDepartureNameArr[i+1]) {
              i++;
            }
            tileArr['destinationDeparture'].filters[i].count++;
            filterClass = filterClass + ' ' + tileArr['destinationDeparture'].filters[i].id;
          }

          if (itinerary.citypairs[lastElement].to.minutes) {
            i = 0;
            while(itinerary.citypairs[lastElement].to.minutes >= sourceArrivalNameArr[i+1]) {
              i++;
            }
            tileArr['sourceArrival'].filters[i].count++;
            filterClass = filterClass + ' ' + tileArr['sourceArrival'].filters[i].id;
          }
        }
        //for (var i=0; i < itinerary.citypairs.length; i++) {
        //  for (var k = 0; k < itinerary.citypairs[i].flights.length; k++) {
        for (var i=0; i < 1; i++) {
          for (var k = 0; k < 1; k++) {
            var flight = itinerary.citypairs[i].flights[k];
            if (flight.airline) {
              index = _.findIndex(tileArr['Airline'].filters, {title:flight.airline});
              if ( index === -1 ) {
                tileArr['Airline'].filters.push({
                  title: flight.airline,
                  id: 'airline_tile_' + flight.airline.replace(/\W+/g, '_'),
                  count : 1
                });
                filterClass = filterClass + ' ' + 'airline_tile_' + flight.airline.replace(/\W+/g, '_');
              } else {
                tileArr['Airline'].filters[index].count++;
                filterClass = filterClass + ' ' + tileArr['Airline'].filters[index].id;
              }
            }
          }
        }

        // Merchandising Fake data Issue #39
        _.forEach(itinerary.citypairs, function (cityPair) {
            if (cityPair.flights.length) {
                _.forEach(cityPair.flights, function (flight) {
                    if (flight.merchandising && flight.merchandising.length) {
                        _.forEach(flight.merchandising, function (item) {
                            if (item) {
                                index = _.findIndex(tileArr['Merchandising'].filters, {id: 'merchandising_tile_' + item.toLowerCase().replace(/\W+/g, '_')});
                                if (index != -1) {
                                    tileArr['Merchandising'].filters[index].count++;
                                    filterClass = filterClass + ' ' + tileArr['Merchandising'].filters[index].id;
                                }
                            }
                        });
                    }
                });
            }
        });

        if (currentNum >= Tile.itineraryPredictedRank['rankMin'] &&  currentNum <= Tile.itineraryPredictedRank['rankMax']) {
          filterClass = filterClass + ' recommended';
        }
        currentNum++;

        itinerary.filterClass = filterClass;
        return doneCallback(null);
      }, function (err) {
        if ( err ) {
          sails.log.error( err );
        } else {
          tileArr['Airline'].filters = _.sortBy(tileArr['Airline'].filters, 'count').reverse();
          tileArr['Merchandising'].order = -1;
          return callback(itineraries, _.sortBy(tileArr, 'order').reverse(), params);
        }
      });
    }
  }
};
