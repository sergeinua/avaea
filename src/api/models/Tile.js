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
    sails.log.info('Using default bucketization algorithm');

    if (!itineraries) {
      return callback(itineraries, [], params);
    }
    var tileArr = _.clone(this.tiles, true);

    // sails.log.error(JSON.stringify(itineraries));

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
      var priceStep = (itineraries.priceRange.maxPrice - itineraries.priceRange.minPrice) / 4;
      var durationStep = (itineraries.durationRange.maxDuration - itineraries.durationRange.minDuration) / 4;
      var priceNameArr = [];
      priceNameArr[0] = itineraries.priceRange.minPrice;
      var current = itineraries.priceRange.minPrice + priceStep;

      tileArr['Price'].filters.push({
        title: '$' + parseInt(priceNameArr[0]) + '<span class="visible-xs-inline">+</span> <span class="hidden-xs" style="color:gray"> &ndash; $'+parseInt(priceNameArr[0] + priceStep)+'</span>',
        id: 'price_tile_0',
        count : 0
      });

      for (var i = 1; i < 4; i++) {
        priceNameArr[i] = current;
        current = current + priceStep;

        tileArr['Price'].filters.push({
          title: '$' + parseInt(priceNameArr[i])+'<span class="visible-xs-inline">+</span> <span class="hidden-xs" style="color:gray"> &ndash; $'+parseInt(priceNameArr[i] + priceStep)+'</span>',
          id: 'price_tile_' + i,
          count : 0
        });

      }

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
      var durationNameArr = [];
      durationNameArr[0] = Math.floor(itineraries.durationRange.minDuration/60)*60;
      durationStep = roundTo30mins(durationStep);
      current = durationNameArr[0] + durationStep;

      tileArr['Duration'].filters.push({
        title: parseInt(durationNameArr[0]/60) + formatMinutes(parseInt(durationNameArr[0]%60)) + ' &ndash; '
          + Math.round((durationNameArr[0] + durationStep)/60) + formatMinutes(Math.round((durationNameArr[0] + durationStep)%60)),
        id: 'duration_tile_0',
        count : 0
      });

      for (i = 1; i < 3; i++) {
        durationNameArr[i] = current;
        current = current + durationStep;

        tileArr['Duration'].filters.push({
          title: Math.round(durationNameArr[i]/60) + formatMinutes(Math.round(durationNameArr[i]%60)) + ' &ndash; '
            + Math.round((durationNameArr[i] + durationStep)/60) + formatMinutes(Math.round((durationNameArr[i] + durationStep)%60)),
          id: 'duration_tile_' + i,
          count : 0
        });

      }
      durationNameArr[3] = current;

      tileArr['Duration'].filters.push({
        title: Math.round(durationNameArr[3]/60) + formatMinutes(Math.round(durationNameArr[3]%60)) + ' &ndash; '
          + Math.round(roundTo30mins(itineraries.durationRange.maxDuration)/60) + formatMinutes(Math.round(roundTo30mins(itineraries.durationRange.maxDuration)%60)),
        id: 'duration_tile_' + i,
        count : 0
      });

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
            return item.citypairs[0].to.quarter;
          });
          break;
        case 'departure_tile':
          sails.log.info('Ordered by Departure');
          itineraries = _.sortBy(itineraries, function (item) {
            return item.citypairs[0].from.quarter;
          });
          break;
        case 'destination_departure_tile':
          sails.log.info('Ordered by Destination Departure');
          itineraries = _.sortBy(itineraries, function (item) {
            var lastElement = item.citypairs.length - 1;
            return item.citypairs[lastElement].from.quarter;
          });
          break;
        case 'source_arrival_tile':
          sails.log.info('Ordered by Source Arrival');
          itineraries = _.sortBy(itineraries, function (item) {
            var lastElement = item.citypairs.length - 1;
            return item.citypairs[lastElement].to.quarter;
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

        if (itinerary.citypairs[0].from.quarter) {
          index = _.findIndex(tileArr['Departure'].filters, {title:timeArr[itinerary.citypairs[0].from.quarter - 1]});
          if ( index === -1 ) {
            tileArr['Departure'].filters.push({
              title: timeArr[itinerary.citypairs[0].from.quarter - 1],
              id:'departure_tile_' + itinerary.citypairs[0].from.quarter,
              count : 1
            });
            filterClass = filterClass + ' ' + 'departure_tile_' + itinerary.citypairs[0].from.quarter;
          } else {
            tileArr['Departure'].filters[index].count++;
            filterClass = filterClass + ' ' + tileArr['Departure'].filters[index].id;
          }
        }

        if (itinerary.citypairs[0].to.quarter) {
          index = _.findIndex(tileArr['Arrival'].filters, {title:timeArr[itinerary.citypairs[0].to.quarter - 1]});
          if ( index === -1 ) {
            tileArr['Arrival'].filters.push({
              title: timeArr[itinerary.citypairs[0].to.quarter - 1],
              id:'arrival_tile_' + itinerary.citypairs[0].to.quarter,
              count : 1
            });
            filterClass = filterClass + ' ' + 'arrival_tile_' + itinerary.citypairs[0].to.quarter;
          } else {
            tileArr['Arrival'].filters[index].count++;
            filterClass = filterClass + ' ' + tileArr['Arrival'].filters[index].id;
          }
        }

        if (params.returnDate) {
          var lastElement = itinerary.citypairs.length - 1;
          if (itinerary.citypairs[lastElement].from.quarter) {
            index = _.findIndex(tileArr['destinationDeparture'].filters, {title: timeArr[itinerary.citypairs[lastElement].from.quarter - 1]});
            if (index === -1) {
              tileArr['destinationDeparture'].filters.push({
                title: timeArr[itinerary.citypairs[lastElement].from.quarter - 1],
                id: 'destination_departure_tile_' + itinerary.citypairs[lastElement].from.quarter,
                count: 1
              });
              filterClass = filterClass + ' ' + 'destination_departure_tile_' + itinerary.citypairs[lastElement].from.quarter;
            } else {
              tileArr['destinationDeparture'].filters[index].count++;
              filterClass = filterClass + ' ' + tileArr['destinationDeparture'].filters[index].id;
            }
          }

          if (itinerary.citypairs[lastElement].to.quarter) {
            index = _.findIndex(tileArr['sourceArrival'].filters, {title: timeArr[itinerary.citypairs[lastElement].to.quarter - 1]});
            if (index === -1) {
              tileArr['sourceArrival'].filters.push({
                title: timeArr[itinerary.citypairs[lastElement].to.quarter - 1],
                id: 'source_arrival_tile_' + itinerary.citypairs[lastElement].to.quarter,
                count: 1
              });
              filterClass = filterClass + ' ' + 'source_arrival_tile_' + itinerary.citypairs[lastElement].to.quarter;
            } else {
              tileArr['sourceArrival'].filters[index].count++;
              filterClass = filterClass + ' ' + tileArr['sourceArrival'].filters[index].id;
            }
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
  },
  //function for alternative bucketization algorithm DEMO-42
  getTilesDataAlternative: function (itineraries, params, callback) {
    sails.log.info('Using alternative bucketization algorithm');
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
    var tileArr = null;
    if (!_.isEmpty(this.tiles)) { // quick fix in case db response is too long @todo refactor this with promises?
      tileArr = _.clone(this.tiles, true);
    } else {
      tileArr = _.clone(this.default_tiles, true);
    }
    var N = Math.floor(itineraries.length / 4);
    var index = null;
    var filterClass = '';
    var timeArr = [
      '12m &ndash; 6am',
      '6am &ndash; 12n',
      '12n &ndash; 6pm',
      '6pm &ndash; 12m'
    ];
    var tmp = {}; //this object using for temporary data
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
      tmp.itinerariesDestinationDeparture = _.clone(itineraries, true);
      tmp.itinerariesDestinationDeparture = _.sortBy(tmp.itinerariesDestinationDeparture, function (item) {
        var lastElement = item.citypairs.length - 1;
        return item.citypairs[lastElement].from.minutes;
      });
      tmp.lastElement = 0;

      tmp.uniqDestinationDeparture = _.uniq(tmp.itinerariesDestinationDeparture, function(item) {
        var lastElement = item.citypairs.length -1;
        return item.citypairs[lastElement].from.minutes;
      });

      if (tmp.uniqDestinationDeparture.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < tmp.uniqDestinationDeparture.length ; counter++) {
          tmp.lastElement = tmp.uniqDestinationDeparture[ counter ].citypairs.length -1;
          destinationDepartureNameArr[counter] = tmp.uniqDestinationDeparture[ counter ].citypairs[tmp.lastElement].from.minutes;
        }

        for (var i = 0; i < tmp.uniqDestinationDeparture.length; i++) {
          tileArr['destinationDeparture'].filters.push({
            title: convertToHours(destinationDepartureNameArr[i]),
            id: 'destination_departure_tile_' + i,
            count : 0
          });
        }
      } else if (tmp.uniqDestinationDeparture.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        tmp.destinationDepartureNameArrTmp = [];
        for (var counter = 0; counter < tmp.uniqDestinationDeparture.length ; counter++) {
          tmp.lastElement = tmp.uniqDestinationDeparture[ counter ].citypairs.length -1;
          if (counter%2 == 0) {
            destinationDepartureNameArr.push( tmp.uniqDestinationDeparture[ counter ].citypairs[tmp.lastElement].from.minutes );
          }
          tmp.destinationDepartureNameArrTmp[counter] = tmp.uniqDestinationDeparture[ counter ].citypairs[tmp.lastElement].from.minutes;
        }

        for (var i = 0, counter = 0; i < tmp.uniqDestinationDeparture.length; i+=2, counter++) {
          tileArr['destinationDeparture'].filters.push({
            title: convertToHours(tmp.destinationDepartureNameArrTmp[i]) + ((tmp.destinationDepartureNameArrTmp[i+1])?', ' + convertToHours(tmp.destinationDepartureNameArrTmp[i+1]):''),
            id: 'destination_departure_tile_' + counter,
            count : 0
          });
        }
      } else {
        for (var counter = 0; counter < 4 ; counter++) {
          tmp.lastElement = tmp.itinerariesDestinationDeparture[ counter * N ].citypairs.length -1;
          destinationDepartureNameArr[counter] = tmp.itinerariesDestinationDeparture[ counter * N ].citypairs[tmp.lastElement].from.minutes;
        }
        destinationDepartureNameArr = _.uniq(destinationDepartureNameArr);
        for (var i = 0; i < destinationDepartureNameArr.length - 1; i++) {
          tileArr['destinationDeparture'].filters.push({
            title: convertToHours(destinationDepartureNameArr[i]) + ' &ndash; ' + convertToHours(destinationDepartureNameArr[i+1]),
            id: 'destination_departure_tile_' + i,
            count : 0
          });
        }

        tmp.lastElement = tmp.itinerariesDestinationDeparture[tmp.itinerariesDestinationDeparture.length - 1].citypairs.length -1;
        tmp.lastDestinationDeparture = tmp.itinerariesDestinationDeparture[tmp.itinerariesDestinationDeparture.length - 1].citypairs[tmp.lastElement].from.minutes;
        tileArr['destinationDeparture'].filters.push({
          title: convertToHours(destinationDepartureNameArr[destinationDepartureNameArr.length - 1]) + ' &ndash; ' + convertToHours(tmp.lastDestinationDeparture),
          id: 'destination_departure_tile_' + (destinationDepartureNameArr.length - 1),
          count : 0
        });
      }
      delete tmp.itinerariesDestinationDeparture;
      delete tmp.lastDestinationDeparture;
      delete tmp.uniqDestinationDeparture;

      // prepare sourceArrival tile
      var sourceArrivalNameArr = [];
      tmp.itinerariesSourceArrival = _.clone(itineraries, true);
      tmp.itinerariesSourceArrival = _.sortBy(tmp.itinerariesSourceArrival, function (item) {
        var lastElement = item.citypairs.length - 1;
        return item.citypairs[lastElement].to.minutes;
      });

      tmp.uniqSourceArrival = _.uniq(tmp.itinerariesSourceArrival, function(item) {
        var lastElement = item.citypairs.length -1;
        return convertToHours(item.citypairs[lastElement].to.minutes);
      });

      if (tmp.uniqSourceArrival.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < tmp.uniqSourceArrival.length ; counter++) {
          tmp.lastElement = tmp.uniqSourceArrival[ counter ].citypairs.length -1;
          sourceArrivalNameArr[counter] = tmp.uniqSourceArrival[ counter ].citypairs[tmp.lastElement].to.minutes;
        }

        for (var i = 0; i < sourceArrivalNameArr.length; i++) {
          tileArr['sourceArrival'].filters.push({
            title: convertToHours(sourceArrivalNameArr[i]),
            id: 'source_arrival_tile_' + i,
            count : 0
          });
        }
      } else if (tmp.uniqSourceArrival.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        tmp.sourceArrivalNameArrTmp = [];
        for (var counter = 0; counter < tmp.uniqSourceArrival.length ; counter++) {
          tmp.lastElement = tmp.uniqSourceArrival[ counter ].citypairs.length -1;
          if (counter%2 == 0) {
            sourceArrivalNameArr.push( tmp.uniqSourceArrival[ counter ].citypairs[tmp.lastElement].to.minutes );
          }
          tmp.sourceArrivalNameArrTmp[counter] = tmp.uniqSourceArrival[ counter ].citypairs[tmp.lastElement].to.minutes;
        }

        for (var i = 0, counter = 0; i < tmp.uniqSourceArrival.length; i+=2, counter++) {
          tileArr['sourceArrival'].filters.push({
            title: convertToHours(tmp.sourceArrivalNameArrTmp[i]) + ((tmp.sourceArrivalNameArrTmp[i+1])?', ' + convertToHours(tmp.sourceArrivalNameArrTmp[i+1]):''),
            id: 'source_arrival_tile_' + counter,
            count : 0
          });
        }
      } else {
        for (var counter = 0; counter < 4 ; counter++) {
          tmp.lastElement = tmp.itinerariesSourceArrival[ counter * N ].citypairs.length -1;
          sourceArrivalNameArr[counter] = tmp.itinerariesSourceArrival[ counter * N ].citypairs[tmp.lastElement].to.minutes;
        }

        sourceArrivalNameArr = _.uniq(sourceArrivalNameArr);

        for (var i = 0; i < sourceArrivalNameArr.length - 1; i++) {
          tileArr['sourceArrival'].filters.push({
            title: convertToHours(sourceArrivalNameArr[i]) + ' &ndash; ' + convertToHours(sourceArrivalNameArr[i+1]),
            id: 'source_arrival_tile_' + i,
            count : 0
          });
        }

        tmp.lastElement = tmp.itinerariesSourceArrival[tmp.itinerariesSourceArrival.length - 1].citypairs.length -1;
        tmp.lastSourceArrival = tmp.itinerariesSourceArrival[tmp.itinerariesSourceArrival.length - 1].citypairs[tmp.lastElement].to.minutes;
        tileArr['sourceArrival'].filters.push({
          title: convertToHours(sourceArrivalNameArr[sourceArrivalNameArr.length - 1]) + ' &ndash; ' + convertToHours(tmp.lastSourceArrival),
          id: 'source_arrival_tile_' + (sourceArrivalNameArr.length - 1),
          count : 0
        });
      }
      delete tmp.itinerariesSourceArrival;
      delete tmp.lastSourceArrival;
      delete tmp.uniqSourceArrival;

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
        } else if (false) { // Scenario 2 : Prune and rank without mixing departure buckets
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
    if (itineraries) {

      Tile.itineraryPredictedRank['rankMin'] = Math.round(Tile.itineraryPredictedRank['rankMin'] * itineraries.length);
      Tile.itineraryPredictedRank['rankMax'] = Math.round(Tile.itineraryPredictedRank['rankMax'] * itineraries.length);
      sails.log.info('Tile itinerary predicted rank (multiplied by '+itineraries.length+'):');
      sails.log.info(Tile.itineraryPredictedRank);
      var currentNum = 1; // itinerary number ( starts with 1 )
      // prepare Price tile
      var priceNameArr = [];

      tmp.itinerariesPrice = _.clone(itineraries, true);
      tmp.itinerariesPrice = _.sortBy(tmp.itinerariesPrice, function(item) {
        return Math.floor(item.price);
      });

      tmp.uniqPrice = _.uniq(tmp.itinerariesPrice, function(item) {
        return Math.floor(item.price );
      });

      if (tmp.uniqPrice.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < tmp.uniqPrice.length ; counter++) {
          priceNameArr[counter] = Math.floor(tmp.uniqPrice[ counter ].price );
        }

        for (var i = 0; i < priceNameArr.length; i++) {
          tileArr['Price'].filters.push({
            title: '$' + sourceArrivalNameArr[i],
            id: 'price_tile_' + i,
            count : 0
          });
        }
      } else if (tmp.uniqPrice.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        tmp.priceNameArrTmp = [];
        for (var counter = 0; counter < tmp.uniqPrice.length ; counter++) {
          if (counter%2 == 0) {
            priceNameArr.push( Math.floor(tmp.uniqPrice[ counter ].price) );
          }
          tmp.priceNameArrTmp[counter] = Math.floor(tmp.uniqPrice[ counter ].price);
        }

        for (var i = 0, counter = 0; i < tmp.uniqPrice.length; i+=2, counter++) {
          tileArr['Price'].filters.push({
            title: '$' + (tmp.priceNameArrTmp[i]) + ((tmp.priceNameArrTmp[i+1])?', $' + (tmp.priceNameArrTmp[i+1]):''),
            id: 'price_tile_' + counter,
            count : 0
          });
        }
      } else {
        for (var counter = 0; counter < 4 ; counter++) {
          priceNameArr[counter] = Math.floor(tmp.itinerariesPrice[ counter * N ].price);
        }

        priceNameArr = _.uniq(priceNameArr);

        for (var i = 0; i < priceNameArr.length - 1; i++) {
          tileArr['Price'].filters.push({
            title: '$' + parseInt(priceNameArr[i])+'<span class="visible-xs-inline">+</span> <span class="hidden-xs" style="color:gray"> &ndash; $'+parseInt(priceNameArr[i+1])+'</span>',
            id: 'price_tile_' + i,
            count : 0
          });

        }
        tileArr['Price'].filters.push({
          title: '$' + parseInt(priceNameArr[priceNameArr.length - 1])+'<span class="visible-xs-inline">+</span> <span class="hidden-xs" style="color:gray"> &ndash; $'+parseInt(tmp.itinerariesPrice[tmp.itinerariesPrice.length - 1].price + 1)+'</span>',
          id: 'price_tile_' + (priceNameArr.length - 1),
          count : 0
        });
      }
      delete tmp.itinerariesPrice;
      delete tmp.uniqPrice;
      delete tmp.priceNameArrTmp;

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
      tmp.itinerariesDuration = _.clone(itineraries, true);
      tmp.itinerariesDuration = _.sortBy(tmp.itinerariesDuration, 'durationMinutes');

      var durationNameArr = [];

      tmp.uniqDuration = _.uniq(tmp.itinerariesDuration, function(item) {
        return roundTo30mins( item.durationMinutes );
      });

      if (tmp.uniqDuration.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < tmp.uniqDuration.length ; counter++) {
          durationNameArr[counter] = roundTo30mins(tmp.uniqDuration[ counter ].durationMinutes );
        }

        for (var i = 0; i < durationNameArr.length; i++) {
          tileArr['Duration'].filters.push({
            title:  parseInt(durationNameArr[i]/60) + formatMinutes(parseInt(durationNameArr[i]%60)),
            id: 'duration_tile_' + i,
            count : 0
          });
        }
      } else if (tmp.uniqDuration.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        tmp.durationNameArrTmp = [];
        for (var counter = 0; counter < tmp.uniqDuration.length ; counter++) {
          if (counter%2 == 0) {
            durationNameArr.push( roundTo30mins(tmp.uniqDuration[ counter ].durationMinutes ) );
          }
          tmp.durationNameArrTmp[counter] = roundTo30mins(tmp.uniqDuration[ counter ].durationMinutes );
        }

        for (var i = 0, counter = 0; i < tmp.uniqDuration.length; i+=2, counter++) {
          tileArr['Duration'].filters.push({
            title: parseInt(tmp.durationNameArrTmp[i]/60) + formatMinutes(parseInt(tmp.durationNameArrTmp[i]%60))
            + ((tmp.durationNameArrTmp[i+1])?', ' + (parseInt(tmp.durationNameArrTmp[i+1]/60) + formatMinutes(parseInt(tmp.durationNameArrTmp[i+1]%60))):''),
            id: 'duration_tile_' + counter,
            count : 0
          });
        }
      } else {

        for (var counter = 0; counter < 4 ; counter++) {
          durationNameArr[counter] = Math.floor(tmp.itinerariesDuration[ counter * N ].durationMinutes);
        }
        durationNameArr = _.uniq(durationNameArr);
        for (var i = 0; i < durationNameArr.length - 1; i++) {
          tileArr['Duration'].filters.push({
            title: parseInt(durationNameArr[i]/60) + formatMinutes(parseInt(durationNameArr[i]%60)) + ' &ndash; '
            + Math.round((durationNameArr[i+1])/60) + formatMinutes(Math.round((durationNameArr[i+1])%60)),
            id: 'duration_tile_' + i,
            count : 0
          });
        }

        tmp.lastDuration = tmp.itinerariesDuration[tmp.itinerariesDuration.length - 1].durationMinutes;
        tileArr['Duration'].filters.push({
          title: parseInt(durationNameArr[durationNameArr.length - 1]/60) + formatMinutes(parseInt(durationNameArr[durationNameArr.length - 1]%60)) + ' &ndash; '
          + Math.round((tmp.lastDuration)/60) + formatMinutes(Math.round((tmp.lastDuration)%60)),
          id: 'duration_tile_' + (durationNameArr.length - 1),
          count : 0
        });
      }
      delete tmp.itinerariesDuration;
      delete tmp.lastDuration;
      delete tmp.uniqDuration;

      // prepare Departure tile
      var departureNameArr = [];
      tmp.itinerariesDeparture = _.clone(itineraries, true);
      tmp.itinerariesDeparture = _.sortBy(tmp.itinerariesDeparture,  function (item) {
        return item.citypairs[0].from.minutes;
      });

      tmp.uniqDeparture = _.uniq(tmp.itinerariesDeparture, function(item) {
        return item.citypairs[0].from.minutes;
      });

      if (tmp.uniqDeparture.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < tmp.uniqDeparture.length ; counter++) {
          departureNameArr[counter] = tmp.uniqDeparture[ counter ].citypairs[0].from.minutes;
        }

        for (var i = 0; i < departureNameArr.length; i++) {
          tileArr['Departure'].filters.push({
            title: convertToHours(departureNameArr[i]),
            id: 'departure_tile_' + i,
            count : 0
          });
        }
      } else if (tmp.uniqDeparture.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        tmp.departureNameArrTmp = [];
        for (var counter = 0; counter < tmp.uniqDeparture.length ; counter++) {
          if (counter%2 == 0) {
            departureNameArr.push( tmp.uniqDeparture[ counter ].citypairs[0].from.minutes );
          }
          tmp.departureNameArrTmp[counter] = tmp.uniqDeparture[ counter ].citypairs[0].from.minutes;
        }

        for (var i = 0, counter = 0; i < tmp.uniqDeparture.length; i+=2, counter++) {
          tileArr['Departure'].filters.push({
            title: convertToHours(tmp.departureNameArrTmp[i]) + ((tmp.departureNameArrTmp[i+1])?', ' + convertToHours(tmp.departureNameArrTmp[i+1]):''),
            id: 'departure_tile_' + counter,
            count : 0
          });
        }
      } else {
        for (var counter = 0; counter < 4 ; counter++) {
          departureNameArr[counter] = tmp.itinerariesDeparture[ counter * N ].citypairs[0].from.minutes;
        }
        departureNameArr = _.uniq(departureNameArr);

        for (var i = 0; i < departureNameArr.length - 1; i++) {
          tileArr['Departure'].filters.push({
            title: convertToHours(departureNameArr[i]) + ' &ndash; ' + convertToHours(departureNameArr[i+1]),
            id: 'departure_tile_' + i,
            count : 0
          });
        }

        tmp.lastDeparture = tmp.itinerariesDeparture[tmp.itinerariesDeparture.length - 1].citypairs[0].from.minutes;
        tileArr['Departure'].filters.push({
          title: convertToHours(departureNameArr[departureNameArr.length - 1]) + ' &ndash; ' + convertToHours(tmp.lastDeparture),
          id: 'departure_tile_' + (departureNameArr.length - 1),
          count : 0
        });
      }
      delete tmp.itinerariesDeparture;
      delete tmp.lastDeparture;
      delete tmp.uniqDeparture;

      // prepare Arrival tile
      var arrivalNameArr = [];
      tmp.itinerariesArrival = _.clone(itineraries, true);
      tmp.itinerariesArrival = _.sortBy(tmp.itinerariesArrival, function (item) {
        return item.citypairs[0].to.minutes;
      });

      tmp.uniqArrival = _.uniq(tmp.itinerariesArrival, function(item) {
        return item.citypairs[0].to.minutes;
      });

      if (tmp.uniqArrival.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < tmp.uniqArrival.length ; counter++) {
          arrivalNameArr[counter] = tmp.uniqArrival[ counter ].citypairs[0].to.minutes;
        }

        for (var i = 0; i < arrivalNameArr.length; i++) {
          tileArr['Arrival'].filters.push({
            title: convertToHours(arrivalNameArr[i]),
            id: 'arrival_tile_' + i,
            count : 0
          });
        }
      } else if (tmp.uniqArrival.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        tmp.arrivalNameArrTmp = [];
        for (var counter = 0; counter < tmp.uniqArrival.length ; counter++) {
          if (counter%2 == 0) {
            arrivalNameArr.push( tmp.uniqArrival[ counter ].citypairs[0].to.minutes );
          }
          tmp.arrivalNameArrTmp[counter] = tmp.uniqArrival[ counter ].citypairs[0].to.minutes;
        }

        for (var i = 0, counter = 0; i < tmp.uniqArrival.length; i+=2, counter++) {
          tileArr['Arrival'].filters.push({
            title: convertToHours(tmp.arrivalNameArrTmp[i]) + ((tmp.arrivalNameArrTmp[i+1])?', ' + convertToHours(tmp.arrivalNameArrTmp[i+1]):''),
            id: 'arrival_tile_' + counter,
            count : 0
          });
        }
      } else {

        for (var counter = 0; counter < 4 ; counter++) {
          arrivalNameArr[counter] = tmp.itinerariesArrival[ counter * N ].citypairs[0].to.minutes;
        }
        arrivalNameArr = _.uniq(arrivalNameArr);

        for (var i = 0; i < arrivalNameArr.length - 1; i++) {
          tileArr['Arrival'].filters.push({
            title: convertToHours(arrivalNameArr[i]) + ' &ndash; ' + convertToHours(arrivalNameArr[i+1]),
            id: 'arrival_tile_' + i,
            count : 0
          });
        }
        tmp.lastArrival = tmp.itinerariesArrival[tmp.itinerariesArrival.length - 1].citypairs[0].to.minutes;
        tileArr['Arrival'].filters.push({
          title: convertToHours(arrivalNameArr[arrivalNameArr.length - 1]) + ' &ndash; ' + convertToHours(tmp.lastArrival),
          id: 'arrival_tile_' + (arrivalNameArr.length - 1),
          count : 0
        });
      }
      delete tmp.itinerariesArrival;
      delete tmp.lastArrival;
      delete tmp.uniqArrival;

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
