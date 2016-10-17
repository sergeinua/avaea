/**
 * Airports.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      required: true
    },
    name:       { type: 'string' },
    city:       { type: 'string' },
    country:    { type: 'string' },
    iata_3code: { type: 'string' },
    icao_4code: { type: 'string' },
    latitude:   { type: 'float' },
    longitude:  { type: 'float' },
    altitude:   { type: 'float' },
    timezone:   { type: 'integer' },
    dst:        { type: 'string' },
    tz:         { type: 'string' },
    state:      { type: 'string' },
    state_short: { type: 'string' },
    pax:        { type: 'float' },
    neighbors:  { type: 'string' },
    alternative_name: { type: 'string' }
  },
  tableName: 'airports',

  ALL_AIRPORTS_NAME: 'All Airports' // Generic airport name in DB

};

