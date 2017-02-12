/**
* Profile.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var qpromice = require('q');
var _ = require('lodash');

// Config for fields checking and future validation
var confFields = {
  personal_info: {
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    birthday: "",
    pax_type: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country_code: "",
      zip_code: ""
    },
  },
  notify_contact: {
    name: "",
    phone: ""
  },
  preferred_airlines: {
    travel_type: "",
    airline_name: ""
  },
  miles_programs: {
    program_name: "",
    account_number: "",
    tier: ""
  },
  lounge_membership: {
    airline_name: "",
    membership_number: "",
    expiration_date: ""
  }
};

module.exports = {

  attributes: {
    user               : { model: 'User', required: true },
    personal_info      : { type: 'json' },
    notify_contact     : { type: 'json' },
    travel_with        : { type: 'json' },
    miles_programs     : { type: 'json' },
    lounge_membership  : { type: 'json' },
    employer           : { type: 'json' },
    preferred_airlines : { type: 'json' }
  },

  attr_gender: {
    M: "Male",
    F: "Female"
  },

  attr_travel_type: {
    'All Flights': 'All Flights',
    'Domestic': 'Domestic',
    'International': 'International'
  },

  findOneByUserId: function (id) {
    return this.findOne({user:id});
  },

  getUserMilesProgramsByUserId: function (id) {
    var qdefer = qpromice.defer();
    this.findOne({user:id}).exec(function (err, record) {
      if (err) {
        onvoya.log.error(err);
        qdefer.reject(err);
      } else if (record) {
        qdefer.resolve(record.miles_programs);
      } else {
        qdefer.reject('User has no profile');
      }
    });
    return qdefer.promise;
  },

  findOneByCriteria: function (criteria) {
    var qdefer = qpromice.defer();

    this.findOne(criteria).exec(function (err, record) {
      if (err) {
        onvoya.log.error(err);
        qdefer.reject(err);
      } else {
        qdefer.resolve(record);
      }
    });

    return qdefer.promise;
  },

  make: function (form, user, callback) {

    async.series([
      (_cb) => {

        this.findOneByUserId(user.id).exec(function (error, found) {

          if (!error) {

            // Result skeleton
            var jsonStruct = _.cloneDeep(confFields);
            jsonStruct.preferred_airlines = [];
            jsonStruct.miles_programs = [];
            jsonStruct.lounge_membership = [];
            jsonStruct.user = found ? found.user : user.id;

            // Parse personal info panel
            if (_.isArray(form.personal)) {
              for (var ii=0; ii < form.personal.length; ii++) {
                if (typeof form.personal[ii].id != 'string') {
                  continue;
                }
                var field = form.personal[ii].id.split('.');

                // root field
                if (!_.isObjectLike(confFields[field[0]])) {
                  continue;
                }

                if (_.isObjectLike(confFields[field[0]][field[1]])) {
                  if (typeof confFields[field[0]][field[1]][field[2]] != 'undefined' && form.personal[ii].data) {
                    jsonStruct[field[0]][field[1]][field[2]] = form.personal[ii].data;
                  }
                }
                else if (typeof confFields[field[0]][field[1]] != 'undefined' && form.personal[ii].data) {
                  jsonStruct[field[0]][field[1]] = form.personal[ii].data;
                }
              }
            }
            // Calculate some personal fields
            if (jsonStruct.personal_info.birthday) {
              var years = sails.moment().diff(jsonStruct.personal_info.birthday, 'years');
              jsonStruct.personal_info.pax_type = (years >= 12 ? 'ADT' : (years > 2 ? 'CHD' : 'INF'));
            }
            jsonStruct.personal_info.show_tiles = (found && found.personal_info) ? Boolean(found.personal_info.show_tiles) : true;

            // Parse Emergency Contact panel
            if (_.isArray(form.notifyContact)) {
              for (var ii=0; ii < form.notifyContact.length; ii++) {
                if (typeof form.notifyContact[ii].id != 'string') {
                  continue;
                }
                var field = form.notifyContact[ii].id.split('.');

                // root field
                if (!_.isObjectLike(confFields[field[0]])) {
                  continue;
                }

                if (_.isObjectLike(confFields[field[0]][field[1]])) {
                  if (typeof confFields[field[0]][field[1]][field[2]] != 'undefined' && form.notifyContact[ii].data) {
                    jsonStruct[field[0]][field[1]][field[2]] = form.notifyContact[ii].data;
                  }
                }
                else if (typeof confFields[field[0]][field[1]] != 'undefined' && form.notifyContact[ii].data) {
                  jsonStruct[field[0]][field[1]] = form.notifyContact[ii].data;
                }
              }
            }

            // Parse airlines programs panel
            if (_.isArray(form.preferredAirlines)) {
              for (var ii=0; ii < form.preferredAirlines.length; ii++) {

                // root field
                var root_field_name = form.preferredAirlines[ii].id;
                if (!_.isObjectLike(confFields[root_field_name])) {
                  continue;
                }
                if (!_.isArray(form.preferredAirlines[ii].data)) {
                  continue;
                }

                for (var jj=0; jj < form.preferredAirlines[ii].data.length; jj++) {
                  if (!_.isObjectLike(form.preferredAirlines[ii].data[jj])) {
                    continue;
                  }
                  jsonStruct[root_field_name][jj] = _.cloneDeep(confFields[root_field_name]);

                  for (var prop in form.preferredAirlines[ii].data[jj]) {
                    if (!form.preferredAirlines[ii].data[jj].hasOwnProperty(prop)) {
                      continue;
                    }
                    if (typeof confFields[root_field_name][prop] != 'undefined' && form.preferredAirlines[ii].data[jj][prop]) {
                      jsonStruct[root_field_name][jj][prop] = form.preferredAirlines[ii].data[jj][prop];
                    }
                  }
                }
              }
            }

            // Parse FFM programs panel
            if (_.isArray(form.programs)) {
              for (var ii=0; ii < form.programs.length; ii++) {

                // root field
                var root_field_name = form.programs[ii].id;
                if (!_.isObjectLike(confFields[root_field_name])) {
                  continue;
                }
                if (!_.isArray(form.programs[ii].data)) {
                  continue;
                }

                for (var jj=0; jj < form.programs[ii].data.length; jj++) {
                  if (!_.isObjectLike(form.programs[ii].data[jj])) {
                    continue;
                  }
                  jsonStruct[root_field_name][jj] = _.cloneDeep(confFields[root_field_name]);

                  for (var prop in form.programs[ii].data[jj]) {
                    if (!form.programs[ii].data[jj].hasOwnProperty(prop)) {
                      continue;
                    }
                    if (typeof confFields[root_field_name][prop] != 'undefined' && form.programs[ii].data[jj][prop]) {
                      jsonStruct[root_field_name][jj][prop] = form.programs[ii].data[jj][prop];
                    }
                  }
                }
              }
            }

            return _cb(jsonStruct);

          } else {
            return _cb(error);
          }

        });

      }
    ], function(result) {
      return callback(result);
    });

  }
};
