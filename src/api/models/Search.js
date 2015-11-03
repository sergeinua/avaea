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
      ];
  }
};

