
module.exports.email = {

  smtp: {
    /** Case with remote smtp */
    service: 'gmail',
    secure: true, // use SSL
    auth: {
      user: 'ext.staff@gmail.com',
      pass: 'october#5'
    },

    /** Case with local smtp */
    // host: 'localhost',
    // port: 25,
    // secure: false, // use SSL

    // Remains from the sails-hook-email. Is not use now
    // testMode: false,
    // ssl: true,
    // from: 'support@avea.com',
  },

  // Default "from" field
  from: '"Support Staff" <support@avea.com>',
  tpl_ticket_confirm: "ticket-confirmation",

  test_itin: {itinerary_data: {
    "id": "f30b178f-ff6b-468e-a235-c525d7f9481e",
    "service": "mondee",
    "price": "854.94",
    "currency": "USD",
    "duration": "1d 1&#189;h",
    "durationMinutes": 1520,
    "citypairs": [
      {
        "direction": "Depart",
        "from": {
          "code": "SFO",
          "date": "2016-10-01",
          "time": "10:40p",
          "quarter": 4,
          "airlineCode": "AC",
          "airline": "Air Canada",
          "minutes": 1360
        },
        "to": {
          "code": "LHR",
          "date": "2016-10-02",
          "time": "09:00p",
          "quarter": 4,
          "minutes": 1260
        },
        "duration": "14h 20m",
        "durationMinutes": 860,
        "noOfStops": 1,
        "stopsDurationMinutes": 148,
        "stopsDuration": "2h 28m",
        "stopsCodes": [
          "YYZ"
        ],
        "stops": [
          {
            "code": "YYZ",
            "begin": {
              "date": "2016-10-02",
              "time": "06:37a"
            },
            "end": {
              "date": "2016-10-02",
              "time": "09:05a"
            },
            "duration": "2h 28m",
            "durationMinutes": 148
          }
        ],
        "path": [
          "SFO",
          "YYZ",
          "LHR"
        ],
        "flights": [
          {
            "number": 754,
            "abbrNumber": "AC754",
            "from": {
              "code": "SFO",
              "date": "2016-10-01",
              "time": "10:40p"
            },
            "to": {
              "code": "YYZ",
              "date": "2016-10-02",
              "time": "06:37a"
            },
            "duration": "4h 57m",
            "durationMinutes": 297,
            "bookingClass": "K",
            "cabinClass": "E",
            "airline": "Air Canada",
            "airlineCode": "AC",
            "noOfStops": 0,
            "stopsDuration": "",
            "stopsDurationMinutes": 0,
            "stops": [ ],
            "merchandising": [
              "WiFi"
            ]
          },
          {
            "number": 868,
            "abbrNumber": "AC868",
            "from": {
              "code": "YYZ",
              "date": "2016-10-02",
              "time": "09:05a"
            },
            "to": {
              "code": "LHR",
              "date": "2016-10-02",
              "time": "09:00p"
            },
            "duration": "6h 55m",
            "durationMinutes": 415,
            "bookingClass": "K",
            "cabinClass": "E",
            "airline": "Air Canada",
            "airlineCode": "AC",
            "noOfStops": 0,
            "stopsDuration": "",
            "stopsDurationMinutes": 0,
            "stops": [ ],
            "merchandising": [
              "1st bag free"
            ]
          }
        ]
      },
      {
        "direction": "Return",
        "from": {
          "code": "LHR",
          "date": "2016-10-14",
          "time": "02:10p",
          "quarter": 3,
          "airlineCode": "SN",
          "airline": "Brussels Airlines",
          "minutes": 850
        },
        "to": {
          "code": "SFO",
          "date": "2016-10-14",
          "time": "05:10p",
          "quarter": 3,
          "minutes": 1030
        },
        "duration": "11h",
        "durationMinutes": 660,
        "noOfStops": 0,
        "stopsDurationMinutes": 0,
        "stopsDuration": "",
        "stopsCodes": [ ],
        "stops": [ ],
        "path": [
          "LHR",
          "SFO"
        ],
        "flights": [
          {
            "number": 9101,
            "abbrNumber": "SN9101",
            "from": {
              "code": "LHR",
              "date": "2016-10-14",
              "time": "02:10p"
            },
            "to": {
              "code": "SFO",
              "date": "2016-10-14",
              "time": "05:10p"
            },
            "duration": "11h",
            "durationMinutes": 660,
            "bookingClass": "K",
            "cabinClass": "E",
            "airline": "Brussels Airlines",
            "airlineCode": "SN",
            "noOfStops": 0,
            "stopsDuration": "",
            "stopsDurationMinutes": 0,
            "stops": [ ],
            "merchandising": [ ]
          }
        ]
      }
    ],
    "searchId": "search_101ad61c_75b2_4f84_9a48_576dca6a6077_mondee"

  }},
  test_booking_res: {PNR: 1234, ReferenceNumber: 5678}
};