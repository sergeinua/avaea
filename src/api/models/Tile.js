/* global Tile */
/* global itineraryPrediction */
/* global _ */
/* global sails */
/* global async */
var util = require('util');
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
      order: 101,
      filters: [
      ]
    },
    destinationDeparture: {
      name: 'Departure',
      id: 'destination_departure_tile',
      order: 100,
      filters: [
      ]
    },
    Arrival: {
      name: 'Arrival',
      id: 'arrival_tile',
      order: 99,
      filters: [
      ]
    },
    Departure: {
      name: 'Departure',
      id: 'departure_tile',
      order: 98,
      filters: [
      ]
    },
    Airline: {
      name: 'Airline',
      id: 'airline_tile',
      order: 97,
      filters: [
      ]
    },
    Duration: {
      name: 'Duration',
      id: 'duration_tile',
      order: 96,
      filters: [
      ]
    },
    Price: {
      name: 'Price',
      id: 'price_tile',
      order: 95,
      filters: [
      ]
    },
    Merchandising: { // Merchandising Fake data Issue #39
      name: 'Merchandising',
      id: 'merchandising_tile',
      order: 99,
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
          title: 'Priority seat',
          id: 'merchandising_tile_priority_seat',
          count: 0
        }
      ]
    }
  },
  getTilesData: function (itineraries, params, callback) {
    sails.log.info('Using default bucketization algorithm');

    if (!itineraries) {
      sails.log.info('Itineraries not found');
      return callback(null, itineraries, []);
    }
    var tileArr = _.clone(this.tiles, true);

    // sails.log.error(JSON.stringify(itineraries));

    var index = null;
    var filterClass = '';
    var timeArr = [
      '12m&ndash;6a',
      '6a&ndash;12n',
      '12n&ndash;6p',
      '6p&ndash;12m'
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
      /* Smart Ranking {{{ */
      utils.timeLog('smart_ranking');
      if (false) {
        sails.log.info('Scenario 5 : Prune in 4D, rank in 4D, append the pruned-out ones at the end');
        cicstanford.compute_departure_times_in_minutes(itineraries);
        cicstanford.determine_airline(itineraries);
        var temp_pruned_in_4D = cicstanford.prune_itineraries_in_4D(itineraries);
        var temp_ranked_in_4D = cicstanford.rank_itineraries_in_4D(temp_pruned_in_4D, tileArr['Price'].order, tileArr['Duration'].order, tileArr['Departure'].order, tileArr['Airline'].order);
        // append the default zero smartRank
        for (var i = 0; i < itineraries.length; i++) {
          itineraries[i].smartRank = 0;
        }
        // extract all the itinerary IDs into a separate array
        var ID = itineraries.map(function (it) {
          return it.id
        });
        // the itineraries remained after pruning have a non-zero smartRank
        for (var i = 0; i < temp_ranked_in_4D.length; i++) {
          var itin_id = temp_ranked_in_4D[i].id;
          var itin_index = ID.indexOf(itin_id);
          itineraries[itin_index].smartRank = i + 1; // smartRank starts from 1
        }
        // set the smartRank of the other itineraries to be larger than the smartRank of the best ones
        var next_rank = temp_ranked_in_4D.length + 1;
        for (var i = 0; i < itineraries.length; i++) {
          if (itineraries[i].smartRank == 0) {
            itineraries[i].smartRank = next_rank;
            next_rank++;
          }
        }
      } else {
        sails.log.info('Scenario 6 : Sort while emphasizing preferred airlines');
        cicstanford.compute_departure_times_in_minutes(itineraries);
        cicstanford.determine_airline(itineraries);
        var temp_itins = cicstanford.sort_by_preferred_airlines(itineraries,["AA", "DL"]);
        // append the default zero smartRank
        for (var i = 0; i < itineraries.length; i++) {
          itineraries[i].smartRank = 0;
        }
        // extract all the itinerary IDs into a separate array
        var ID = itineraries.map(function (it) {
          return it.id
        });
        // the itineraries in temp_itins are ordered according to a smartRank, copy their ranks to the original itineraries
        for (var i = 0; i < temp_itins.length; i++) {
          var itin_id = temp_itins[i].id;
          var itin_index = ID.indexOf(itin_id);
          itineraries[itin_index].smartRank = i + 1; // smartRank starts from 1
        }
      }
      cicstanford.print_many_itineraries(itineraries);
      sails.log.info('Smart Ranking time: %s', utils.timeLogGetHr('smart_ranking'));
      /* }}} Smart Ranking */
      utils.timeLog('tile_generation');
      var currentNum = 1; // itinerary number ( starts with 1 )
      // prepare Price tile
      var priceStep = (itineraries.priceRange.maxPrice - itineraries.priceRange.minPrice) / 4;
      var durationStep = (itineraries.durationRange.maxDuration - itineraries.durationRange.minDuration) / 4;
      var priceNameArr = [];
      priceNameArr[0] = itineraries.priceRange.minPrice;
      var current = itineraries.priceRange.minPrice + priceStep;

      tileArr['Price'].filters.push({
        title: '$' + parseInt(priceNameArr[0]) + '<span class="visible-xs-inline">+</span> <span class="hidden-xs"> &ndash; $'+parseInt(priceNameArr[0] + priceStep)+'</span>',
        id: 'price_tile_0',
        count : 0
      });

      for (var i = 1; i < 4; i++) {
        priceNameArr[i] = current;
        current = current + priceStep;

        tileArr['Price'].filters.push({
          title: '$' + parseInt(priceNameArr[i])+'<span class="visible-xs-inline">+</span> <span class="hidden-xs"> &ndash; $'+parseInt(priceNameArr[i] + priceStep)+'</span>',
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
          title: Math.round(durationNameArr[i]/60) + formatMinutes(roundTo30mins(durationNameArr[i])%60) + ' &ndash; '
            + Math.round((durationNameArr[i] + durationStep)/60) + formatMinutes(roundTo30mins(durationNameArr[i] + durationStep)%60),
          id: 'duration_tile_' + i,
          count : 0
        });

      }
      durationNameArr[3] = current;

      tileArr['Duration'].filters.push({
        title: Math.round(durationNameArr[3]/60) + formatMinutes(roundTo30mins(durationNameArr[3])%60) + ' &ndash; '
          + Math.round(roundTo30mins(itineraries.durationRange.maxDuration)/60) + formatMinutes(roundTo30mins(itineraries.durationRange.maxDuration)%60),
        id: 'duration_tile_' + i,
        count : 0
      });
      sails.log.info('Tiles Generation time: %s', utils.timeLogGetHr('tile_generation'));

      var orderBy = _.min(tileArr, 'order').id;
      orderBy = 'smart';
      switch (orderBy) {
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
        case 'smart':
        default:
          sails.log.info('Ordered by smartRank');
          itineraries = _.sortBy(itineraries, 'smartRank');
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
          tileArr = [];
        } else {
          tileArr['Airline'].filters = _.sortBy(tileArr['Airline'].filters, 'count').reverse();
          tileArr['Merchandising'].order = -1;
          tileArr = _.sortBy(tileArr, 'order').reverse();
        }
        return callback(err, itineraries, tileArr);
      });
    }
  },

  /**
   * Function for alternative bucketization algorithm DEMO-42
   * @param {Array} itineraries From search result
   * @param {object} params Search params
   * @param {function} callback Invoke on return
   * @returns {*}
   */
  getTilesDataAlternative: function (itineraries, params, callback) {
    sails.log.info('Using alternative bucketization algorithm');
    if (!itineraries) {
      sails.log.info('Itineraries not found');
      return callback(null, itineraries, []);
    }

    var tileArr = null;
    if (!_.isEmpty(this.tiles)) { // quick fix in case db response is too long @todo refactor this with promises?
      tileArr = _.clone(this.tiles, true);
    } else {
      tileArr = _.clone(this.default_tiles, true);
    }

    /* Smart Ranking {{{ */
    utils.timeLog('smart_ranking');
    if (false) {
      sails.log.info('Scenario 5 : Prune in 4D, rank in 4D, append the pruned-out ones at the end');
      cicstanford.compute_departure_times_in_minutes(itineraries);
      cicstanford.determine_airline(itineraries);
      var temp_pruned_in_4D = cicstanford.prune_itineraries_in_4D(itineraries);
      var temp_ranked_in_4D = cicstanford.rank_itineraries_in_4D(temp_pruned_in_4D, tileArr['Price'].order, tileArr['Duration'].order, tileArr['Departure'].order, tileArr['Airline'].order);
      // append the default zero smartRank
      for (var i = 0; i < itineraries.length; i++) {
        itineraries[i].smartRank = 0;
      }
      // extract all the itinerary IDs into a separate array
      var ID = itineraries.map(function (it) {
        return it.id
      });
      // the itineraries remained after pruning have a non-zero smartRank
      for (var i = 0; i < temp_ranked_in_4D.length; i++) {
        var itin_id = temp_ranked_in_4D[i].id;
        var itin_index = ID.indexOf(itin_id);
        itineraries[itin_index].smartRank = i + 1; // smartRank starts from 1
      }
      // set the smartRank of the other itineraries to be larger than the smartRank of the best ones
      var next_rank = temp_ranked_in_4D.length + 1;
      for (var i = 0; i < itineraries.length; i++) {
        if (itineraries[i].smartRank == 0) {
          itineraries[i].smartRank = next_rank;
          next_rank++;
        }
      }
      //DEMO-285 temporary shrink result based on smart rank
      if (!_.isEmpty(params.topSearchOnly) && params.topSearchOnly == 1) {
        sails.log.info('params.topSearchOnly', params.topSearchOnly);
        var tmp = [];
        for (i = 0; i < Math.floor(itineraries.length / 2); i++) {
          tmp.push(itineraries[i]);
        }
        sails.log.info('before DEMO-285', itineraries.length);
        itineraries = tmp;
        sails.log.info('after DEMO-285', itineraries.length);
      }
    } else {
      sails.log.info('Scenario 6 : Sort while emphasizing preferred airlines');
      cicstanford.compute_departure_times_in_minutes(itineraries);
      cicstanford.determine_airline(itineraries);
      var temp_itins = cicstanford.sort_by_preferred_airlines(itineraries,["AA", "DL"]);
      // append the default zero smartRank
      for (var i = 0; i < itineraries.length; i++) {
        itineraries[i].smartRank = 0;
      }
      // extract all the itinerary IDs into a separate array
      var ID = itineraries.map(function (it) {
        return it.id
      });
      // the itineraries in temp_itins are ordered according to a smartRank, copy their ranks to the original itineraries
      for (var i = 0; i < temp_itins.length; i++) {
        var itin_id = temp_itins[i].id;
        var itin_index = ID.indexOf(itin_id);
        itineraries[itin_index].smartRank = i + 1; // smartRank starts from 1
      }

    }
    //cicstanford.print_many_itineraries(itineraries);
    sails.log.info('Smart Ranking time: %s', utils.timeLogGetHr('smart_ranking'));
    /* }}} Smart Ranking */
    utils.timeLog('tile_generation');

    // Max first displayed items in the tile filter
    var N = Math.floor(itineraries.length / 4);
    var index = null;
    var filterClass = '';
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
      // Sort by departure time
      tmp.itinerariesDestinationDeparture = _.sortBy(itineraries, function (item) {
        var lastElement = item.citypairs.length - 1;
        return item.citypairs[lastElement].from.minutes;
      });
      tmp.lastElement = 0;

      // Unify by departure time
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
            title: tileFormatVal.setFilterTitleTime(destinationDepartureNameArr[i], null, 1),
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
            title: tileFormatVal.setFilterTitleTime(tmp.destinationDepartureNameArrTmp[i], tmp.destinationDepartureNameArrTmp[i+1], 2),
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
            title: tileFormatVal.setFilterTitleTime(destinationDepartureNameArr[i], destinationDepartureNameArr[i+1], null),
            id: 'destination_departure_tile_' + i,
            count : 0
          });
        }

        tmp.lastElement = tmp.itinerariesDestinationDeparture[tmp.itinerariesDestinationDeparture.length - 1].citypairs.length -1;
        tmp.lastDestinationDeparture = tmp.itinerariesDestinationDeparture[tmp.itinerariesDestinationDeparture.length - 1].citypairs[tmp.lastElement].from.minutes;
        tileArr['destinationDeparture'].filters.push({
          title: tileFormatVal.setFilterTitleTime(destinationDepartureNameArr[destinationDepartureNameArr.length - 1], tmp.lastDestinationDeparture, null),
          id: 'destination_departure_tile_' + (destinationDepartureNameArr.length - 1),
          count : 0
        });
      }
      delete tmp.itinerariesDestinationDeparture;
      delete tmp.lastDestinationDeparture;
      delete tmp.uniqDestinationDeparture;

      // prepare sourceArrival tile
      var sourceArrivalNameArr = [];
      tmp.itinerariesSourceArrival = _.sortBy(itineraries, function (item) {
        var lastElement = item.citypairs.length - 1;
        return item.citypairs[lastElement].to.minutes;
      });

      tmp.uniqSourceArrival = _.uniq(tmp.itinerariesSourceArrival, function(item) {
        var lastElement = item.citypairs.length -1;
        return tileFormatVal.convertToHours(item.citypairs[lastElement].to.minutes);
      });

      if (tmp.uniqSourceArrival.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < tmp.uniqSourceArrival.length ; counter++) {
          tmp.lastElement = tmp.uniqSourceArrival[ counter ].citypairs.length -1;
          sourceArrivalNameArr[counter] = tmp.uniqSourceArrival[ counter ].citypairs[tmp.lastElement].to.minutes;
        }

        for (var i = 0; i < sourceArrivalNameArr.length; i++) {
          tileArr['sourceArrival'].filters.push({
            title: tileFormatVal.setFilterTitleTime(sourceArrivalNameArr[i], null, 1),
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
            title: tileFormatVal.setFilterTitleTime(tmp.sourceArrivalNameArrTmp[i], tmp.sourceArrivalNameArrTmp[i+1], 2),
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
            title: tileFormatVal.setFilterTitleTime(sourceArrivalNameArr[i], sourceArrivalNameArr[i+1], null),
            id: 'source_arrival_tile_' + i,
            count : 0
          });
        }

        tmp.lastElement = tmp.itinerariesSourceArrival[tmp.itinerariesSourceArrival.length - 1].citypairs.length -1;
        tmp.lastSourceArrival = tmp.itinerariesSourceArrival[tmp.itinerariesSourceArrival.length - 1].citypairs[tmp.lastElement].to.minutes;
        tileArr['sourceArrival'].filters.push({
          title: tileFormatVal.setFilterTitleTime(sourceArrivalNameArr[sourceArrivalNameArr.length - 1], tmp.lastSourceArrival, null),
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
          var itineraries_departing_Q1 = itineraries.filter(function (it) {
            return (it.citypairs[0].from.quarter == 1);
          });  // only keep the ones departing midnight-6am
          var itineraries_departing_Q2 = itineraries.filter(function (it) {
            return (it.citypairs[0].from.quarter == 2);
          });  // only keep the ones departing 6am-noon
          var itineraries_departing_Q3 = itineraries.filter(function (it) {
            return (it.citypairs[0].from.quarter == 3);
          });  // only keep the ones departing noon-6pm
          var itineraries_departing_Q4 = itineraries.filter(function (it) {
            return (it.citypairs[0].from.quarter == 4);
          });  // only keep the ones departing 6pm-midnight
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

    // Generic processing for both trips: round & one way
    if (itineraries) {

      Tile.itineraryPredictedRank['rankMin'] = Math.round(Tile.itineraryPredictedRank['rankMin'] * itineraries.length);
      Tile.itineraryPredictedRank['rankMax'] = Math.round(Tile.itineraryPredictedRank['rankMax'] * itineraries.length);
      sails.log.info('Tile itinerary predicted rank (multiplied by '+itineraries.length+'):', Tile.itineraryPredictedRank);
      var currentNum = 1; // itinerary number ( starts with 1 )
      // prepare Price tile
      var priceNameArr = [];

      tmp.itinerariesPrice = _.sortBy(itineraries, function(item) {
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
            title: tileFormatVal.setFilterTitlePrice(priceNameArr[i], null, 1),
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
            title: tileFormatVal.setFilterTitlePrice(tmp.priceNameArrTmp[i], tmp.priceNameArrTmp[i+1], 2),
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
            title: tileFormatVal.setFilterTitlePrice(priceNameArr[i], priceNameArr[i+1], null),
            id: 'price_tile_' + i,
            count : 0
          });

        }
        tileArr['Price'].filters.push({
          title: tileFormatVal.setFilterTitlePrice(priceNameArr[priceNameArr.length - 1], tmp.itinerariesPrice[tmp.itinerariesPrice.length - 1].price + 1, null),
          id: 'price_tile_' + (priceNameArr.length - 1),
          count : 0
        });
      }
      delete tmp.itinerariesPrice;
      delete tmp.uniqPrice;
      delete tmp.priceNameArrTmp;

      // prepare Duration tile
      tmp.itinerariesDuration = _.sortBy(itineraries, 'durationMinutes');

      var roundTo30mins = function (durationMinutes) {
        var durationMinutesRounded = Math.round(durationMinutes/60)*60;
        if (durationMinutes%60 > 30) {
          durationMinutesRounded += 60;
        } else {
          durationMinutesRounded += 30;
        }
        return durationMinutesRounded;
      };

      var durationNameArr = [];
      var fix_duration = params.flightType == "ROUND_TRIP" ? 2 : 1;

      tmp.uniqDuration = _.uniq(tmp.itinerariesDuration, function(item) {
        return roundTo30mins( item.durationMinutes );
      });

      if (tmp.uniqDuration.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < tmp.uniqDuration.length ; counter++) {
          durationNameArr[counter] = tmp.uniqDuration[ counter ].durationMinutes;
        }

        for (var i = 0; i < durationNameArr.length; i++) {
          tileArr['Duration'].filters.push({
            title:  tileFormatVal.setFilterTitleDuration(durationNameArr[i] / fix_duration, null, 1),
            id: 'duration_tile_' + i,
            count : 0
          });
        }
      } else if (tmp.uniqDuration.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        tmp.durationNameArrTmp = [];
        for (var counter = 0; counter < tmp.uniqDuration.length ; counter++) {
          if (counter%2 == 0) {
            durationNameArr.push( tmp.uniqDuration[ counter ].durationMinutes );
          }
          tmp.durationNameArrTmp[counter] = tmp.uniqDuration[ counter ].durationMinutes;
        }

        for (var i = 0, counter = 0; i < tmp.uniqDuration.length; i+=2, counter++) {
          tileArr['Duration'].filters.push({
            title:  tileFormatVal.setFilterTitleDuration(tmp.durationNameArrTmp[i] / fix_duration, tmp.durationNameArrTmp[i+1] / fix_duration, 2),
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
            title:  tileFormatVal.setFilterTitleDuration(durationNameArr[i] / fix_duration, durationNameArr[i+1] / fix_duration, null),
            id: 'duration_tile_' + i,
            count : 0
          });
        }

        tmp.lastDuration = tmp.itinerariesDuration[tmp.itinerariesDuration.length - 1].durationMinutes;
        tileArr['Duration'].filters.push({
          title:  tileFormatVal.setFilterTitleDuration(durationNameArr[durationNameArr.length - 1] / fix_duration, tmp.lastDuration / fix_duration, null),
          id: 'duration_tile_' + (durationNameArr.length - 1),
          count : 0
        });
      }
      delete tmp.itinerariesDuration;
      delete tmp.lastDuration;
      delete tmp.uniqDuration;

      // prepare Departure tile
      var departureNameArr = [];
      tmp.itinerariesDeparture = _.sortBy(itineraries,  function (item) {
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
            title: tileFormatVal.setFilterTitleTime(departureNameArr[i], null, 1),
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
            title: tileFormatVal.setFilterTitleTime(tmp.departureNameArrTmp[i], tmp.departureNameArrTmp[i+1], 2),
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
            title: tileFormatVal.setFilterTitleTime(departureNameArr[i], departureNameArr[i+1], null),
            id: 'departure_tile_' + i,
            count : 0
          });
        }

        tmp.lastDeparture = tmp.itinerariesDeparture[tmp.itinerariesDeparture.length - 1].citypairs[0].from.minutes;
        tileArr['Departure'].filters.push({
          title: tileFormatVal.setFilterTitleTime(departureNameArr[departureNameArr.length - 1], tmp.lastDeparture, null),
          id: 'departure_tile_' + (departureNameArr.length - 1),
          count : 0
        });
      }
      delete tmp.itinerariesDeparture;
      delete tmp.lastDeparture;
      delete tmp.uniqDeparture;

      // prepare Arrival tile
      var arrivalNameArr = [];
      tmp.itinerariesArrival = _.sortBy(itineraries, function (item) {
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
            title: tileFormatVal.setFilterTitleTime(arrivalNameArr[i], null, 1),
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
            title: tileFormatVal.setFilterTitleTime(tmp.arrivalNameArrTmp[i], tmp.arrivalNameArrTmp[i+1], 2),
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
            title: tileFormatVal.setFilterTitleTime(arrivalNameArr[i], arrivalNameArr[i+1], null),
            id: 'arrival_tile_' + i,
            count : 0
          });
        }
        tmp.lastArrival = tmp.itinerariesArrival[tmp.itinerariesArrival.length - 1].citypairs[0].to.minutes;
        tileArr['Arrival'].filters.push({
          title: tileFormatVal.setFilterTitleTime(arrivalNameArr[arrivalNameArr.length - 1], tmp.lastArrival, null),
          id: 'arrival_tile_' + (arrivalNameArr.length - 1),
          count : 0
        });
      }
      delete tmp.itinerariesArrival;
      delete tmp.lastArrival;
      delete tmp.uniqArrival;

      sails.log.info('Tiles Generation time: %s', utils.timeLogGetHr('tile_generation'));
      var orderBy = _.min(tileArr, 'order').id;
      orderBy = 'price_tile';
      switch (orderBy) {
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
        case 'smart':
        default:
          sails.log.info('Ordered by smartRank');
          itineraries = _.sortBy(itineraries, 'smartRank');
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
        for (var i = 0; i < 1; i++) {
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

        // Flight information popup Fake data Issue #255
        var additionalPrice = 0;
        itinerary.informationTmp = [];
        _.forEach(itinerary.citypairs, function (cityPair) {
          if (cityPair.flights.length) {
            _.forEach(cityPair.flights, function (flight) {
              if (flight.merchandising && flight.merchandising.length) {
                itinerary.informationTmp = _.union(itinerary.informationTmp, flight.merchandising);
              }
            });
          }
        });

        itinerary.informationTmp.push('2000 FF miles');
        var maxPrice = 50;
        var minPrice = 5;
        itinerary.information = [];
        additionalPrice = 0;
        _.forEach(itinerary.informationTmp, function (item) {
          if (item) {
            var infoItem = {};
            infoItem.name = item;
            infoItem.price = Math.floor(Math.random() * (maxPrice - minPrice)) + minPrice;
            additionalPrice += infoItem.price;
            itinerary.information.push(infoItem);
          }
        });
        itinerary.specialprice = parseFloat(itinerary.price) + additionalPrice;
        itinerary.specialprice = itinerary.specialprice.toFixed(2);
        itinerary.additionalPrice = additionalPrice.toFixed(2);
        delete itinerary.informationTmp;


        if (currentNum >= Tile.itineraryPredictedRank['rankMin'] &&  currentNum <= Tile.itineraryPredictedRank['rankMax']) {
          filterClass = filterClass + ' recommended';
        }
        currentNum++;

        itinerary.filterClass = filterClass;
        itinerary.filterArr = filterClass.split(" ");
        return doneCallback(null);
      }, function (err) {
        if ( err ) {
          sails.log.error( err );
          tileArr = [];
        } else {
          tileArr['Airline'].filters = _.sortBy(tileArr['Airline'].filters, 'count').reverse();
          tileArr['Merchandising'].order = 1000;
          //the tiles are ordered in the increasing order of database.tile_position
          tileArr = _.sortBy(tileArr, 'order');
        }
        return callback(err, itineraries, tileArr);
      });
    }
  },

  getTilesDataEmpty: function (itineraries, params, callback) {
    return callback(null, itineraries, []);
  }

};
