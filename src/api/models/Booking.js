
var qpromice = require('q');
let uuid = require('uuid');

module.exports = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    user_id          : { model : 'User' },
    pnr              : { type: 'string' },
    reference_number : { type: 'string' },
    itinerary_id     : { type: 'string' },
    itinerary_data   : { type: 'json' },
    req_params       : { type: 'json' },
    status_eticket   : {
      type: 'integer',
      defaultsTo: 1,
      required: true
    },
    id_pub           : {
      type: 'string',
      defaultsTo: () => {return uuid.v4()},
      required: true,
      uuidv4: true,
      index: true
    },
    eticket_number   : { type: 'string'},
  },
  migrate: 'safe',

  saveBooking: function (user, booking_res, itinerary_res, req_params) {
    let qdefer = qpromice.defer();

    if (typeof booking_res != 'object') {
      sails.log.error('saveBooking: got unexpected type of booking_res='+(typeof booking_res)+'; user='+user.id);
    }
    if (typeof itinerary_res != 'object') {
      sails.log.error('saveBooking: got unexpected type of itinerary_res='+(typeof itinerary_res)+'; user='+user.id);
    }
    let _dbFields = { // fields sequence must be equal to sequence of the db req
      user_id          : user.id,
      pnr              : typeof booking_res == 'object' && booking_res ? booking_res.PNR : null,
      reference_number : typeof booking_res == 'object' && booking_res ? booking_res.ReferenceNumber : null,
      itinerary_id     : typeof itinerary_res == 'object' && itinerary_res ? itinerary_res.id : null,
      itinerary_data   : typeof itinerary_res == 'object' ? itinerary_res : null,
      req_params       : req_params
    };

    Booking.create(_dbFields, function(err, record) {
      if (err) {
        sails.log.error(err);
        qdefer.reject(err);
      } else {
        qdefer.resolve(record);
      }
    });

    return qdefer.promise;
  }

};
