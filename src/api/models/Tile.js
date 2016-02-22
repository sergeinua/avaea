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

      var uniqDestinationDeparture = _.uniq(itinerariesDestinationDeparture, function(item) {
           var lastElement = item.citypairs.length -1;
           return item.citypairs[lastElement].from.minutes;
        }
      );

      if (uniqDestinationDeparture.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < uniqDestinationDeparture.length ; counter++) {
          lastElement = uniqDestinationDeparture[ counter ].citypairs.length -1;
          destinationDepartureNameArr[counter] = uniqDestinationDeparture[ counter ].citypairs[lastElement].from.minutes;
        }

        for (var i = 0; i < 4; i++) {
          tileArr['destinationDeparture'].filters.push({
          title: convertToHours(destinationDepartureNameArr[i]),
            id: 'destination_departure_tile_' + i,
            count : 0
          });
        }
      } else if (uniqDestinationDeparture.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        var destinationDepartureNameArrTmp = [];
        for (var counter = 0; counter < uniqDestinationDeparture.length ; counter++) {
          lastElement = uniqDestinationDeparture[ counter ].citypairs.length -1;
          if (counter%2 == 0) {
            destinationDepartureNameArr.push( uniqDestinationDeparture[ counter ].citypairs[lastElement].from.minutes );
          }
          destinationDepartureNameArrTmp[counter] = uniqDestinationDeparture[ counter ].citypairs[lastElement].from.minutes;
        }

        for (var i = 0, counter = 0; i < uniqDestinationDeparture.length; i+=2, counter++) {
          tileArr['destinationDeparture'].filters.push({
          title: convertToHours(destinationDepartureNameArrTmp[i]) + ((destinationDepartureNameArrTmp[i+1])?', ' + convertToHours(destinationDepartureNameArrTmp[i+1]):''),
            id: 'destination_departure_tile_' + counter,
            count : 0
          });
        }
      } else {
        for (var counter = 0; counter < 4 ; counter++) {
          lastElement = itinerariesDestinationDeparture[ counter * N ].citypairs.length -1;
          destinationDepartureNameArr[counter] = itinerariesDestinationDeparture[ counter * N ].citypairs[lastElement].from.minutes;
        }
        destinationDepartureNameArr = _.uniq(destinationDepartureNameArr);
        for (var i = 0; i < destinationDepartureNameArr.length - 1; i++) {
          tileArr['destinationDeparture'].filters.push({
          title: convertToHours(destinationDepartureNameArr[i]) + ' &ndash; ' + convertToHours(destinationDepartureNameArr[i+1]),
            id: 'destination_departure_tile_' + i,
            count : 0
          });
        }

        lastElement = itinerariesDestinationDeparture[itinerariesDestinationDeparture.length - 1].citypairs.length -1;
        var lastDestinationDeparture = itinerariesDestinationDeparture[itinerariesDestinationDeparture.length - 1].citypairs[lastElement].from.minutes;
        tileArr['destinationDeparture'].filters.push({
          title: convertToHours(destinationDepartureNameArr[destinationDepartureNameArr.length - 1]) + ' &ndash; ' + convertToHours(lastDestinationDeparture),
          id: 'destination_departure_tile_' + (destinationDepartureNameArr.length - 1),
          count : 0
        });
      }
      delete itinerariesDestinationDeparture;
      delete lastDestinationDeparture;
      delete uniqDestinationDeparture;

      // prepare sourceArrival tile
      var sourceArrivalNameArr = [];
      var itinerariesSourceArrival = _.clone(itineraries, true);
      itinerariesSourceArrival = _.sortBy(itinerariesSourceArrival, function (item) {
        var lastElement = item.citypairs.length - 1;
        return item.citypairs[lastElement].to.minutes;
      });

      var uniqSourceArrival = _.uniq(itinerariesSourceArrival, function(item) {
           var lastElement = item.citypairs.length -1;
           return item.citypairs[lastElement].to.minutes;
        }
      );

      if (uniqSourceArrival.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < uniqSourceArrival.length ; counter++) {
          lastElement = uniqSourceArrival[ counter ].citypairs.length -1;
          sourceArrivalNameArr[counter] = uniqSourceArrival[ counter ].citypairs[lastElement].to.minutes;
        }

        for (var i = 0; i < sourceArrivalNameArr.length - 1; i++) {
          tileArr['sourceArrival'].filters.push({
          title: convertToHours(sourceArrivalNameArr[i]),
            id: 'source_arrival_tile_' + i,
            count : 0
          });
        }
      } else if (uniqSourceArrival.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        var sourceArrivalNameArrTmp = [];
        for (var counter = 0; counter < uniqSourceArrival.length ; counter++) {
          lastElement = uniqSourceArrival[ counter ].citypairs.length -1;
          if (counter%2 == 0) {
            sourceArrivalNameArr.push( uniqSourceArrival[ counter ].citypairs[lastElement].to.minutes );
          }
          sourceArrivalNameArrTmp[counter] = uniqSourceArrival[ counter ].citypairs[lastElement].to.minutes;
        }

        for (var i = 0, counter = 0; i < uniqSourceArrival.length; i+=2, counter++) {
          tileArr['sourceArrival'].filters.push({
          title: convertToHours(sourceArrivalNameArrTmp[i]) + ((sourceArrivalNameArrTmp[i+1])?', ' + convertToHours(sourceArrivalNameArrTmp[i+1]):''),
            id: 'source_arrival_tile_' + counter,
            count : 0
          });
        }
      } else {
        for (var counter = 0; counter < 4 ; counter++) {
          lastElement = itinerariesSourceArrival[ counter * N ].citypairs.length -1;
          sourceArrivalNameArr[counter] = itinerariesSourceArrival[ counter * N ].citypairs[lastElement].to.minutes;
        }

        sourceArrivalNameArr = _.uniq(sourceArrivalNameArr);

        for (var i = 0; i < sourceArrivalNameArr.length - 1; i++) {
          tileArr['sourceArrival'].filters.push({
          title: convertToHours(sourceArrivalNameArr[i]) + ' &ndash; ' + convertToHours(sourceArrivalNameArr[i+1]),
            id: 'source_arrival_tile_' + i,
            count : 0
          });
        }

        lastElement = itinerariesSourceArrival[itinerariesSourceArrival.length - 1].citypairs.length -1;
        var lastSourceArrival = itinerariesSourceArrival[itinerariesSourceArrival.length - 1].citypairs[lastElement].to.minutes;
        tileArr['sourceArrival'].filters.push({
          title: convertToHours(sourceArrivalNameArr[sourceArrivalNameArr.length - 1]) + ' &ndash; ' + convertToHours(lastSourceArrival),
          id: 'source_arrival_tile_' + (sourceArrivalNameArr.length - 1),
          count : 0
        });
      }
      delete itinerariesSourceArrival;
      delete lastSourceArrival;
      delete uniqSourceArrival;

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

      var uniqPrice = _.uniq(itinerariesPrice, function(item) {
           return Math.floor(item.price );
        }
      );

      if (uniqPrice.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < uniqPrice.length ; counter++) {
          priceNameArr[counter] = Math.floor(uniqPrice[ counter ].price );
        }

        for (var i = 0; i < priceNameArr.length; i++) {
          tileArr['Price'].filters.push({
          title: '$' + sourceArrivalNameArr[i],
            id: 'price_tile_' + i,
            count : 0
          });
        }
      } else if (uniqPrice.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        var priceNameArrTmp = [];
        for (var counter = 0; counter < uniqPrice.length ; counter++) {
          if (counter%2 == 0) {
            priceNameArr.push( Math.floor(uniqPrice[ counter ].price) );
          }
          priceNameArrTmp[counter] = Math.floor(uniqPrice[ counter ].price);
        }

        for (var i = 0, counter = 0; i < uniqPrice.length; i+=2, counter++) {
          tileArr['Price'].filters.push({
          title: '$' + (priceNameArrTmp[i]) + ((priceNameArrTmp[i+1])?', $' + (priceNameArrTmp[i+1]):''),
            id: 'price_tile_' + counter,
            count : 0
          });
        }
      } else {
        for (var counter = 0; counter < 4 ; counter++) {
          priceNameArr[counter] = Math.floor(itinerariesPrice[ counter * N ].price);
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
          title: '$' + parseInt(priceNameArr[priceNameArr.length - 1])+'<span class="visible-xs-inline">+</span> <span class="hidden-xs" style="color:gray"> &ndash; $'+parseInt(itinerariesPrice[itinerariesPrice.length - 1].price + 1)+'</span>',
          id: 'price_tile_' + (priceNameArr.length - 1),
          count : 0
        });
      }
      delete itinerariesPrice;
      delete uniqPrice;

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

      var uniqDuration = _.uniq(itinerariesDuration, function(item) {
           return roundTo30mins( item.durationMinutes );
        }
      );

      if (uniqDuration.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < uniqDuration.length ; counter++) {
          durationNameArr[counter] = roundTo30mins(uniqDuration[ counter ].durationMinutes );
        }

        for (var i = 0; i < durationNameArr.length; i++) {
          tileArr['Duration'].filters.push({
          title:  parseInt(durationNameArr[i]/60) + formatMinutes(parseInt(durationNameArr[i]%60)),
            id: 'duration_tile_' + i,
            count : 0
          });
        }
      } else if (uniqDuration.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        var durationNameArrTmp = [];
        for (var counter = 0; counter < uniqDuration.length ; counter++) {
          if (counter%2 == 0) {
            durationNameArr.push( roundTo30mins(uniqDuration[ counter ].durationMinutes ) );
          }
          durationNameArrTmp[counter] = roundTo30mins(uniqDuration[ counter ].durationMinutes );
        }

        for (var i = 0, counter = 0; i < uniqDuration.length; i+=2, counter++) {
          tileArr['Duration'].filters.push({
          title: parseInt(durationNameArrTmp[i]/60) + formatMinutes(parseInt(durationNameArrTmp[i]%60))
            + ((durationNameArrTmp[i+1])?', ' + (parseInt(durationNameArrTmp[i+1]/60) + formatMinutes(parseInt(durationNameArrTmp[i+1]%60))):''),
            id: 'duration_tile_' + counter,
            count : 0
          });
        }
      } else {

        for (var counter = 0; counter < 4 ; counter++) {
          durationNameArr[counter] = Math.floor(itinerariesDuration[ counter * N ].durationMinutes);
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

        var lastDuration = itinerariesDuration[itinerariesDuration.length - 1].durationMinutes;
        tileArr['Duration'].filters.push({
          title: parseInt(durationNameArr[durationNameArr.length - 1]/60) + formatMinutes(parseInt(durationNameArr[durationNameArr.length - 1]%60)) + ' &ndash; '
            + Math.round((lastDuration)/60) + formatMinutes(Math.round((lastDuration)%60)),
          id: 'duration_tile_' + (durationNameArr.length - 1),
          count : 0
        });
      }
      delete itinerariesDuration;
      delete lastDuration;
      delete uniqDuration;

      // prepare Departure tile
      var departureNameArr = [];
      var itinerariesDeparture = _.clone(itineraries, true);
      itinerariesDeparture = _.sortBy(itinerariesDeparture,  function (item) {
                               return item.citypairs[0].from.minutes;
                             });

      var uniqDeparture = _.uniq(itinerariesDeparture, function(item) {
           return item.citypairs[0].from.minutes;
        }
      );

      if (uniqDeparture.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < uniqDeparture.length ; counter++) {
          departureNameArr[counter] = uniqDeparture[ counter ].citypairs[0].from.minutes;
        }

        for (var i = 0; i < 4; i++) {
          tileArr['Departure'].filters.push({
          title: convertToHours(departureNameArr[i]),
            id: 'departure_tile_' + i,
            count : 0
          });
        }
      } else if (uniqDeparture.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        var departureNameArrTmp = [];
        for (var counter = 0; counter < uniqDeparture.length ; counter++) {
          if (counter%2 == 0) {
            departureNameArr.push( uniqDeparture[ counter ].citypairs[0].from.minutes );
          }
          departureNameArrTmp[counter] = uniqDeparture[ counter ].citypairs[0].from.minutes;
        }

        for (var i = 0, counter = 0; i < uniqDeparture.length; i+=2, counter++) {
          tileArr['Departure'].filters.push({
          title: convertToHours(departureNameArrTmp[i]) + ((departureNameArrTmp[i+1])?', ' + convertToHours(departureNameArrTmp[i+1]):''),
            id: 'departure_tile_' + counter,
            count : 0
          });
        }
      } else {
        for (var counter = 0; counter < 4 ; counter++) {
          departureNameArr[counter] = itinerariesDeparture[ counter * N ].citypairs[0].from.minutes;
        }
        departureNameArr = _.uniq(departureNameArr);

        for (var i = 0; i < departureNameArr.length - 1; i++) {
          tileArr['Departure'].filters.push({
          title: convertToHours(departureNameArr[i]) + ' &ndash; ' + convertToHours(departureNameArr[i+1]),
            id: 'departure_tile_' + i,
            count : 0
          });
        }

        var lastDeparture = itinerariesDeparture[itinerariesDeparture.length - 1].citypairs[0].from.minutes;
        tileArr['Departure'].filters.push({
          title: convertToHours(departureNameArr[departureNameArr.length - 1]) + ' &ndash; ' + convertToHours(lastDeparture),
          id: 'departure_tile_' + (departureNameArr.length - 1),
          count : 0
        });
      }
      delete itinerariesDeparture;
      delete lastDeparture;
      delete uniqDeparture;

      // prepare Arrival tile
      var arrivalNameArr = [];
      var itinerariesArrival = _.clone(itineraries, true);
      itinerariesArrival = _.sortBy(itinerariesArrival, function (item) {
                               return item.citypairs[0].to.minutes;
                             });

      var uniqArrival = _.uniq(itinerariesArrival, function(item) {
            return item.citypairs[0].to.minutes;
        }
      );

      if (uniqArrival.length <= 4) { //  Igor Markov: When the number of different values does not exceed max possible num buckets, each value gets its own bucket
        for (var counter = 0; counter < uniqArrival.length ; counter++) {
          arrivalNameArr[counter] = uniqArrival[ counter ].citypairs[0].to.minutes;
        }

        for (var i = 0; i < 4; i++) {
          tileArr['Arrival'].filters.push({
          title: convertToHours(arrivalNameArr[i]),
            id: 'arrival_tile_' + i,
            count : 0
          });
        }
      } else if (uniqArrival.length <= 8) { //  Igor Markov: When the number of different values is less than twice the number of buckets, we can pack up to two values per bucket
        var arrivalNameArrTmp = [];
        for (var counter = 0; counter < uniqArrival.length ; counter++) {
          if (counter%2 == 0) {
            arrivalNameArr.push( uniqArrival[ counter ].citypairs[0].to.minutes );
          }
          arrivalNameArrTmp[counter] = uniqArrival[ counter ].citypairs[0].to.minutes;
        }

        for (var i = 0, counter = 0; i < uniqArrival.length; i+=2, counter++) {
          tileArr['Arrival'].filters.push({
          title: convertToHours(arrivalNameArrTmp[i]) + ((arrivalNameArrTmp[i+1])?', ' + convertToHours(arrivalNameArrTmp[i+1]):''),
            id: 'arrival_tile_' + counter,
            count : 0
          });
        }
      } else {

        for (var counter = 0; counter < 4 ; counter++) {
          arrivalNameArr[counter] = itinerariesArrival[ counter * N ].citypairs[0].to.minutes;
        }
        arrivalNameArr = _.uniq(arrivalNameArr);

        for (var i = 0; i < arrivalNameArr.length - 1; i++) {
          tileArr['Arrival'].filters.push({
          title: convertToHours(arrivalNameArr[i]) + ' &ndash; ' + convertToHours(arrivalNameArr[i+1]),
            id: 'arrival_tile_' + i,
            count : 0
          });
        }
        var lastArrival = itinerariesArrival[itinerariesArrival.length - 1].citypairs[0].to.minutes;
        tileArr['Arrival'].filters.push({
          title: convertToHours(arrivalNameArr[arrivalNameArr.length - 1]) + ' &ndash; ' + convertToHours(lastArrival),
          id: 'arrival_tile_' + (arrivalNameArr.length - 1),
          count : 0
        });
      }
      delete itinerariesArrival;
      delete lastArrival;
      delete uniqArrival;

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
