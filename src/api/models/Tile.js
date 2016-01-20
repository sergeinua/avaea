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
          {
            title : '12m &ndash; 6am',
            id    : 'source_arrival_tile_1',
            count : 0
          },
          {
            title : '6am &ndash; 12n',
            id    : 'source_arrival_tile_2',
            count : 0
          },
          {
            title : '12n &ndash; 6pm',
            id    : 'source_arrival_tile_3',
            count : 0
          },
          {
            title : '6pm &ndash; 12m',
            id    : 'source_arrival_tile_4',
            count : 0
          }
        ]
      },
      destinationDeparture: {
        name: 'Departure',
        id: 'destination_departure_tile',
        order: 0,
        filters: [
          {
            title : '12m &ndash; 6am',
            id    : 'destination_departure_tile_1',
            count : 0
          },
          {
            title : '6am &ndash; 12n',
            id    : 'destination_departure_tile_2',
            count : 0
          },
          {
            title : '12n &ndash; 6pm',
            id    : 'destination_departure_tile_3',
            count : 0
          },
          {
            title : '6pm &ndash; 12m',
            id    : 'destination_departure_tile_4',
            count : 0
          }
        ]
      },
      Arrival: {
        name: 'Arrival',
        id: 'arrival_tile',
        order: 0,
        filters: [
          {
            title : '12m &ndash; 6am',
            id    : 'arrival_tile_1',
            count : 0
          },
          {
            title : '6am &ndash; 12n',
            id    : 'arrival_tile_2',
            count : 0
          },
          {
            title : '12n &ndash; 6pm',
            id    : 'arrival_tile_3',
            count : 0
          },
          {
            title : '6pm &ndash; 12m',
            id    : 'arrival_tile_4',
            count : 0
          }
        ]
      },
      Departure: {
        name: 'Departure',
        id: 'departure_tile',
        order: 0,
        filters: [
          {
            title : '12m &ndash; 6am',
            id    : 'departure_tile_1',
            count : 0
          },
          {
            title : '6am &ndash; 12n',
            id    : 'departure_tile_2',
            count : 0
          },
          {
            title : '12n &ndash; 6pm',
            id    : 'departure_tile_3',
            count : 0
          },
          {
            title : '6pm &ndash; 12m',
            id    : 'departure_tile_4',
            count : 0
          }
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
      }
    },

  getTilesData: function (itineraries, params, callback) {

    if (!itineraries) {
      return callback(itineraries, [], params);
    }
    var tileArr = _.clone(this.tiles, true);

    var index = null;
    var filterClass = '';
    var timeArr = [
      '12m &ndash; 6am',
      '6am &ndash; 12n',
      '12n &ndash; 6pm',
      '6pm &ndash; 12m'
    ];

    if (params.returnDate) {
      tileArr['Departure'].name = params.DepartureLocationCode + ' Departure';
      tileArr['Arrival'].name = params.ArrivalLocationCode + ' Arrival';

      tileArr['destinationDeparture'].name = params.ArrivalLocationCode + ' Departure';
      tileArr['sourceArrival'].name = params.DepartureLocationCode + ' Arrival';
    } else {
      delete tileArr['destinationDeparture'];
      delete tileArr['sourceArrival'];
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
      if (maxOrderTile.name == 'Duration') {
        itineraries = _.sortBy(itineraries, 'durationMinutes');
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
                  title: flight.airline, // Issue #43 show only what fits
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
          return callback(itineraries, _.sortBy(tileArr, 'order').reverse(), params);
        }
      });
    }
  }
};
