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
      Price:         [],
      Departure:     [],
      Arrival:       [],
      Airline:       [],
      Merchandising: [],
      Duration:      []
    }
  },

  getTilesData: function (itineraries) {
    var tileArr = this.getTiles();
    var index = null;
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
        } else { // for debug/log
          // sails.log.info(tileArr);
        }
      });
    }
  }
};

