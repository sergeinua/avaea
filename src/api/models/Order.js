var Order = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    id: {
      type: 'integer',
      unique: true,
      primaryKey: true,
      autoPK: true
    },
    orderData: {
      type: 'json'
    },
    user: {
      model: 'User',
      required: true
    },
  },

  CardType: {
    VI : 'VISA',
    CA : 'Master Card',
    AX : 'American Express',
    DS : 'Discover'
  },

  getById: function (id) {
    return {
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
        '+20kg luggage free',
        'Priority boarding'
      ]
    }
  }
};

module.exports = Order;
