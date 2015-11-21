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

  getTiles: function () {
    return {
      Price: {
        name: 'Price',
        id: 'price_tile',
        order: 1,
        filters: [
        ]
      },
      Departure: {
        name: 'Departure',
        id: 'departure_tile',
        order: 2,
        filters: [
        ]
      },
      Arrival: {
        name: 'Arrival',
        id: 'arrival_tile',
        order: 3,
        filters: [
        ]
      },
      Airline: {
        name: 'Airline',
        id: 'airline_tile',
        order: 4,
        filters: [
        ]
      },
      // Merchandising: {
      //   name: 'Merchandising',
      //   id: 'merchandising_tile',
      //   order: 5,
      //   filters: [
      //     {title:'Free WiFi',     id: 'merchandising_tile_1'},
      //     {title:'In seat video', id: 'merchandising_tile_2'},
      //     {title:'In seat audio', id: 'merchandising_tile_3'},
      //     {title:'10kg luggage',  id: 'merchandising_tile_4'}
      //   ]
      // },
      Duration: {
        name: 'Duration',
        id: 'duration_tile',
        order: 6,
        filters: [
        ]
      }
    }
  },

  getTilesData: function (itineraries, params, callback) {
    var tileArr = this.getTiles();
    var index = null;
    var filterClass = '';
    var timeArr = [
      '0-6am',
      '6am-12pm',
      '12pm-6pm',
      '6pm-12am'
    ];

    if (itineraries) {
      sails.log.info(itineraries.length);
      sails.log.info(itineraries.priceRange);
      sails.log.info(itineraries.durationRange);

      // prepare Price tile
      var priceStep = (itineraries.priceRange.maxPrice - itineraries.priceRange.minPrice) / 4;
      var durationStep = (itineraries.durationRange.maxDuration - itineraries.durationRange.minDuration) / 4;
      var priceNameArr = [];
      priceNameArr[0] = itineraries.priceRange.minPrice;
      var current = itineraries.priceRange.minPrice + priceStep;

      tileArr['Price'].filters.push({
        title: '$' + parseFloat(priceNameArr[0]).toFixed(2) + '-$' + parseFloat(priceNameArr[0] + priceStep).toFixed(2),
        id: 'price_tile_0',
        count : 1
      });

      for (var i = 1; i < 3; i++) {
        priceNameArr[i] = current;
        current = current + priceStep;

        tileArr['Price'].filters.push({
          title: '$' + parseFloat(priceNameArr[i]).toFixed(2) + '-$' + parseFloat(priceNameArr[i] + priceStep).toFixed(2),
          id: 'price_tile_' + i,
          count : 1
        });

      }
      priceNameArr[3] = itineraries.priceRange.maxPrice;

      tileArr['Price'].filters.push({
        title: '$' + parseFloat(priceNameArr[2] + priceStep).toFixed(2) + '-$' + parseFloat(priceNameArr[3]).toFixed(2),
        id: 'price_tile_3',
        count : 1
      });

      // prepare Duration tile
      var durationNameArr = [];
      durationNameArr[0] = itineraries.durationRange.minDuration;
      current = itineraries.durationRange.minDuration + durationStep;

      tileArr['Duration'].filters.push({
        title: parseInt(durationNameArr[0]/60)+'h ' + parseInt(durationNameArr[0]%60) + 'm-'
          + parseInt((durationNameArr[0] + durationStep)/60)+'h ' + parseInt((durationNameArr[0] + durationStep)%60) + 'm',
        id: 'duration_tile_0',
        count : 1
      });

      for (var i = 1; i < 3; i++) {
        durationNameArr[i] = current;
        current = current + durationStep;

        tileArr['Duration'].filters.push({
          title: parseInt(durationNameArr[i]/60)+'h ' + parseInt(durationNameArr[i]%60) + 'm-'
            + parseInt((durationNameArr[i] + durationStep)/60)+'h ' + parseInt((durationNameArr[i] + durationStep)%60) + 'm',
          id: 'duration_tile_' + i,
          count : 1
        });

      }
      durationNameArr[3] = itineraries.durationRange.maxDuration;

      tileArr['Duration'].filters.push({
        title: parseInt((durationNameArr[2] + durationStep)/60)+'h ' + parseInt((durationNameArr[3] + durationStep)%60) + 'm-'
            + parseInt(durationNameArr[3]/60)+'h ' + parseInt(durationNameArr[3]%60) + 'm',
        id: 'duration_tile_3',
        count : 1
      });

      async.map(itineraries, function (itinerary, doneCallback) {
        if (itinerary.price) {
          var i = 0;
          while(itinerary.price >= priceNameArr[i+1]) {
            i++;
          }

          tileArr['Price'].filters[i].count++;
          filterClass = tileArr['Price'].filters[i].id;
        }

        if (itinerary.duration) {
          i = 0;
          while(itinerary.duration >= durationNameArr[i+1]) {
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
            filterClass = filterClass + ' ' + tileArr['Arrival'].filters[index].id;;
          }
        }

        for (var i=0; i < itinerary.citypairs.length; i++) {
          for (var k = 0; k < itinerary.citypairs[i].flights.length; k++) {
            var flight = itinerary.citypairs[i].flights[k];
            if (flight.airline) {
              index = _.findIndex(tileArr['Airline'].filters, {title:flight.airline});
              if ( index === -1 ) {
                tileArr['Airline'].filters.push({
                  title: flight.airline,
                  id: 'airline_tile_' + flight.airline.split(' ').join('_'),
                  count : 1
                });
                filterClass = filterClass + ' ' + 'airline_tile_' + flight.airline.split(' ').join('_');
              } else {
                tileArr['Airline'].filters[index].count++;
                filterClass = filterClass + ' ' + tileArr['Airline'].filters[index].id;;
              }
            }
          }
        }

        itinerary.filterClass = filterClass;
        return doneCallback(null);
      }, function (err) {
        if ( err ) {
          sails.log.error( err );
        } else {
          // tileArr['Price'].filters = _.first(tileArr['Price'].filters, 4);
          // tileArr['Duration'].filters = _.first(tileArr['Duration'].filters, 4);
          tileArr['Airline'].filters = _.first(tileArr['Airline'].filters, 4);

          return callback(itineraries, tileArr, params);
        }
      });
    }
  }
};
