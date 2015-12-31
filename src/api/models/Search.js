/* global sails */
/**
* Search.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    uuid: {
      type: 'string',
      primaryKey: true,
      unique: true,
      required: true
    },
    originAirport :      { type: 'string' },
    destinationAirport : { type: 'string' },
    departureDate :      { type: 'date' },
    returnDate :         { type: 'date' },
    result :             { type: 'json' },
    user :               { model : 'User' } // who did search
  },

  getResult: function (guid, params, callback) {
    return global[sails.config.flightapis.searchProvider].flightSearch(guid, params, callback);
  }
};

