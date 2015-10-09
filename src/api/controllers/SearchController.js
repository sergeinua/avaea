/**
 * SearchController
 *
 * @description :: Server-side logic for managing searches
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  guid: '403f731c03626c964da0dd6979348d5b',

  getCurentSearchGuid:function () {
    return this.guid;
  },

  /**
   * `SearchController.index()`
   */
  index: function (req, res) {
    return res.view('search/index', {
      user: res.user
    });
  },


  /**
   * `SearchController.result()`
   */
  result: function (req, res) {
    return  res.view('search/result', {
      guid: this.getCurentSearchGuid(),
      searchParams: req.allParams(),
      searchResult:[
        {itinerary: {
          originAirport: 'SGN',
          destinationAirport:'SFO',
          stops: 0,
          departureTime: '2:25am',
          arrivalTime: '2:30pm',
          flightTime: '12h 05m',
          stopTime: [],
          carier: 'China Istern airlines',
          price: '820',
          currency: 'USD',
          ticketType: 'Economy',
          planeType: 'Airbus A320',
          merchandising: [
            'Free WiFi',
            'In seat video',
            'In seat video',
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
          carier: 'China Istern airlines',
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
          carier: 'China Istern airlines',
          price: '820',
          currency: 'USD',
          ticketType: 'Economy',
          planeType: 'Airbus A320',
          merchandising: [
            'Free WiFi',
            'In seat video',
            'In seat video',
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
            'In seat video',
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
          carier: 'China Istern airlines',
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
            'In seat video',
            '+20kg luggage free',
            'Priority boarding'
          ]
        }},
      ]
    });
  }
};

