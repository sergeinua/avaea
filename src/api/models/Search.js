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

    var soap = require('soap');
    var wsdl = 'http://sandbox.trippro.com/api/v2/flightSearch?wsdl';

    soap.createClient(wsdl, function(err, client) {
      if (err) {
        console.log(err);
        return callback([]);
      } else {
        // minimum requirements for search request
        var args = {
          'common:TPContext': {
            attributes: {
              'xmlns:common': 'http://trippro.com/webservices/common/v2'
            },
            'common:clientId': 'CFS1017',
            'common:messageId': guid
          },
          FlightSearchRequest: {
            OriginDestination: [{
              DepartureLocationCode: params.DepartureLocationCode,
              DepartureTime: params.DepartureTime,
              ArrivalLocationCode: params.ArrivalLocationCode
            }]
          }
        };
        // add return OriginDestination if we have return date
        if (params.returnDate) {
          args.FlightSearchRequest.OriginDestination.push({
              DepartureLocationCode: params.ArrivalLocationCode,
              DepartureTime: params.returnDate,
              ArrivalLocationCode: params.DepartureLocationCode
            });
        }
        // set the same CabinClass for all OriginDestination elements
        if (['E','B','F','P'].indexOf(params.CabinClass) != -1) {
          args.FlightSearchRequest.OriginDestination.forEach(function(val) {
            val.CabinClass = params.CabinClass;
          });
        }
        return client.FlightSearch(args, function(err, result, raw, soapHeader) {
          var res = [];
          if (err) {
            console.log(err);
          } else {
            res = result.FlightSearchResponse.FlightItinerary || res;
          }
          return callback(res);
        });
      }
    });
  }/*,

  getResult: function (params) {
    return [ // dummy data
      {itinerary: {
        originAirport: 'SGN',
        destinationAirport:'SFO',
        stops: 0,
        departureTime: '2:25am',
        arrivalTime: '2:30pm',
        flightTime: '12h 05m',
        stopTime: [],
        carier: 'China Eastern airlines',
        price: '820',
        currency: 'USD',
        ticketType: 'Economy',
        planeType: 'Airbus A320',
        merchandising: [
          'Free WiFi',
          'In seat video',
          'In seat audio',
          '+20kg luggage free',
          'Priority boarding'
        ]
      }},
      {itinerary: {
        originAirport: 'SGN',
        destinationAirport:'SFO',
        stops: 1,
        departureTime: '2:25am',
        arrivalTime: '2:30pm',
        flightTime: '12h 05m',
        stopTime: [],
        carier: 'China Eastern airlines',
        price: '820',
        currency: 'USD',
        ticketType: 'Economy',
        planeType: 'Airbus A320'
      }},
      {itinerary: {
        originAirport: 'SGN',
        destinationAirport:'SFO',
        stops: 0,
        departureTime: '2:25am',
        arrivalTime: '2:30pm',
        flightTime: '12h 05m',
        stopTime: [],
        carier: 'China Eastern airlines',
        price: '820',
        currency: 'USD',
        ticketType: 'Economy',
        planeType: 'Airbus A320',
        merchandising: [
          'Free WiFi',
          'In seat video',
          'In seat audio',
          '+20kg luggage free',
          'Priority boarding'
        ]
      }},
      {itinerary: {
        originAirport: 'SGN',
        destinationAirport:'SFO',
        stops: 0,
        departureTime: '2:25am',
        arrivalTime: '2:30pm',
        flightTime: '12h 05m',
        stopTime: [],
        carier: 'Virgin America',
        price: '850',
        currency: 'USD',
        ticketType: 'Economy',
        planeType: 'Airbus A320',
        merchandising: [
          'Free WiFi',
          'In seat video',
          'In seat audio',
          '+20kg luggage free',
          'Priority boarding'
        ]
      }},
      {itinerary: {
        originAirport: 'SGN',
        destinationAirport:'SFO',
        stops: 2,
        departureTime: '2:25am',
        arrivalTime: '2:30pm',
        flightTime: '12h 05m',
        stopTime: [],
        carier: 'China Eastern airlines',
        price: '1020',
        currency: 'USD',
        ticketType: 'Economy',
        planeType: 'Airbus A320'
      }},
      {itinerary: {
        originAirport: 'SGN',
        destinationAirport:'SFO',
        stops: 0,
        departureTime: '2:25am',
        arrivalTime: '2:30pm',
        flightTime: '12h 05m',
        stopTime: [],
        carier: 'Virgin America',
        price: '1820',
        currency: 'USD',
        ticketType: 'Economy',
        planeType: 'Airbus A320',
        merchandising: [
          'Free WiFi',
          'In seat video',
          'In seat audio',
          '+20kg luggage free',
          'Priority boarding'
        ]
      }},
    ];
  }*/
};

