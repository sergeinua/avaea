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
// for tests
      // Test: {
      //   name: 'Test name',
      //   id: 'test_name_tile',
      //   filters: [
      //     'test 1',
      //     'test 2',
      //     'test 3',
      //   ]
      // },
      Price: {
        name: 'Price',
        id: 'price_tile',
        filters: [
          {title:'$100-$200', id: 'price_tile_1'},
          {title:'$200-$300', id: 'price_tile_2'},
          {title:'$300-$400', id: 'price_tile_3'},
          {title:'$400-$600', id: 'price_tile_4'}
        ]
      },
      Departure: {
        name: 'Departure',
        id: 'departure_tile',
        filters: [
          {title:'0-6am',    id: 'departure_tile_1'},
          {title:'6am-12pm', id: 'departure_tile_2'},
          {title:'12pm-8pm', id: 'departure_tile_3'},
          {title:'8pm-0',    id: 'departure_tile_4'}
        ]
      },
      Arrival: {
        name: 'Arrival',
        id: 'arrival_tile',
        filters: [
          {title:'0-6am',    id: 'arrival_tile_1'},
          {title:'6am-12pm', id: 'arrival_tile_2'},
          {title:'12pm-8pm', id: 'arrival_tile_3'},
          {title:'8pm-0',    id: 'arrival_tile_4'}
        ]
      },
      Airline: {
        name: 'Airline',
        id: 'airline_tile',
        filters: [
          {title:'China Eastern',  id: 'airline_tile_1'},
          {title:'Virgin America', id: 'airline_tile_2'},
          {title:'Tiara Air',      id: 'airline_tile_3'},
          {title:'Fly BVI',        id: 'airline_tile_4'}
        ]
      },
      Merchandising: {
        name: 'Merchandising',
        id: 'merchandising_tile',
        filters: [
          {title:'Free WiFi',     id: 'merchandising_tile_1'},
          {title:'In seat video', id: 'merchandising_tile_2'},
          {title:'In seat audio', id: 'merchandising_tile_3'},
          {title:'10kg luggage',  id: 'merchandising_tile_4'}
        ]
      },
      Duration: {
        name: 'Duration',
        id: 'duration_tile',
        filters: [
          {title:'3h-6h',   id: 'duration_tile_1'},
          {title:'6h-10h',  id: 'duration_tile_2'},
          {title:'10h-12h', id: 'duration_tile_3'},
          {title:'12h-14h', id: 'duration_tile_4'}
        ]
      }
    }
  },

  getTilesData: function (itineraries, params, callback) {
    var tileArr = this.getTiles();
    var index = null;
    /*/
    if (itineraries) {
      sails.log.info(itineraries.length);
      async.map(itineraries, function (itinerary, doneCallback) {
        if (itinerary.itinerary.price) {
          index = _.findIndex(tileArr['Price'], {name:itinerary.itinerary.price});
          if ( index === -1 ) {
            tileArr['Price'].push({name: itinerary.itinerary.price, count : 1});
          } else {
            tileArr['Price'][index].count++;
          }
        }

        if (itinerary.itinerary.departureTime) {

          index = _.findIndex(tileArr['Departure'], {name:itinerary.itinerary.departureTime});
          if ( index === -1 ) {
            tileArr['Departure'].push({name: itinerary.itinerary.departureTime, count : 1});
          } else {
            tileArr['Departure'][index].count++;
          }
        }
        if (itinerary.itinerary.arrivalTime) {

          index = _.findIndex(tileArr['Arrival'], {name:itinerary.itinerary.arrivalTime});
          if ( index === -1 ) {
            tileArr['Arrival'].push({name: itinerary.itinerary.arrivalTime, count : 1});
          } else {
            tileArr['Arrival'][index].count++;
          }
        }
        if (itinerary.itinerary.carier) {

          index = _.findIndex(tileArr['Airline'], {name:itinerary.itinerary.carier});
          if ( index === -1 ) {
            tileArr['Airline'].push({name: itinerary.itinerary.carier, count : 1});
          } else {
            tileArr['Airline'][index].count++;
          }
        }
        if (itinerary.itinerary.merchandising) {
          //todo when we will have real data
        }
        if (itinerary.itinerary.flightTime) {

          index = _.findIndex(tileArr['Duration'], {name:itinerary.itinerary.flightTime});
          if ( index === -1 ) {
            tileArr['Duration'].push({name: itinerary.itinerary.flightTime, count : 1});
          } else {
            tileArr['Duration'][index].count++;
          }
        }
        return doneCallback(null);
      }, function (err) {
        if ( err ) {
          sails.log.error( err );
        } else {
          return callback(itineraries, tileArr, params);
          // for debug/log
          // sails.log.info(tileArr);
        }
      });
    }
    /*/
    if (itineraries) {
      sails.log.info(itineraries.length);
      var counter = 0;
      async.map(itineraries, function (itinerary, doneCallback) {
        var fare = itinerary.Fares[0];
        if (counter/2 == 0) {
          fare.filterClass = 'airline_tile_2 duration_tile_2';
        } else {
          fare.filterClass = 'price_tile_3 departure_tile_3';
        }
        counter++;
        return doneCallback(null);
      }, function (err) {
        if ( err ) {
          sails.log.error( err );
        } else {
          return callback(itineraries, tileArr, params);
          // sails.log.info(tileArr);
        }
      });
    }
    // return callback(itineraries, tileArr, params);
    //*/
  }
};
