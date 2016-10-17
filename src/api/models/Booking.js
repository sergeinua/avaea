
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
    req_params       : { type: 'json' }
  },

  saveBooking: function (user, booking_res, itinerary_res, req_params) {
    var qdefer = qpromice.defer();
    var _dbFields = {
      user_id          : user,
      pnr              : booking_res.PNR,
      reference_number : booking_res.ReferenceNumber,
      itinerary_id     : itinerary_res.itinerary_id,
      itinerary_data   : itinerary_res.itinerary_data,
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
