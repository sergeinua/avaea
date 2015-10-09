/**
 * HomepageController
 *
 * @description :: Server-side logic for managing homepages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  order: function (req, res) {
    return res.view('order', {
        user: res.user,
        order:[
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

        }}
        ]
    });
  }
};

