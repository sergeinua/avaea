
var qpromice = require('q');

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
    status_eticket   : { type: 'integer'},
    id_pub           : { type: 'text', index: true}, // index is important: to prevent lower(id_pub) usage by waterline
    eticket_number   : { type: 'string'},
  },

  saveBooking: function (user, booking_res, itinerary_res, req_params) {
    var qdefer = qpromice.defer();

    if (typeof booking_res != 'object') {
      sails.log.error('saveBooking: got unexpected type of booking_res='+(typeof booking_res)+'; user='+user.id);
    }
    if (typeof itinerary_res != 'object') {
      sails.log.error('saveBooking: got unexpected type of itinerary_res='+(typeof itinerary_res)+'; user='+user.id);
    }
    var _dbFields = {
      user_id          : user.id,
      pnr              : typeof booking_res == 'object' ? booking_res.PNR : null,
      reference_number : typeof booking_res == 'object' ? booking_res.ReferenceNumber : null,
      itinerary_id     : typeof itinerary_res == 'object' ? itinerary_res.id : null,
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
