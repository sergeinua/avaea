/**
* Profile.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var qpromice = require('q');

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
    'Domestic Short Haul Trips': 'Domestic Short Haul Trips',
    'Domestic Long Haul Flights': 'Domestic Long Haul Flights',
    'International Flights': 'International Flights'
  },

  findOneByUserId: function (id) {
    return this.findOne({user:id});
  },

  findOneByCriteria: function (criteria) {
    var qdefer = qpromice.defer();

    this.findOne(criteria).exec(function (err, record) {
      if (err) {
        sails.log.error(err);
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

            var jsonStruct = {}, storedShowTiles;
            storedShowTiles = found ? found.personal_info.show_tiles : true;
            jsonStruct.user = found ? found.user : user;
            if (form['birthday']) {
              var years = sails.moment().diff(form['birthday'], 'years');
              form['pax_type'] = (years >= 12 ? 'ADT' : (years > 2 ? 'CHD' : 'INF'));
            }

            jsonStruct.personal_info = {
              first_name: form['first_name'],
              middle_name: form['middle_name'],
              last_name: form['last_name'],
              gender: form['gender'],
              birthday: form['birthday'],
              pax_type: form['pax_type'],
              address: {
                street: form['street'],
                city: form['city'],
                state: form['state'],
                country_code: form['country_code'],
                zip_code: form['zip_code']
              },
              show_tiles: storedShowTiles
            };

            jsonStruct.notify_contact = {
              name: form['notify_contact.name'],
              phone: form['notify_contact.phone']
            };
            jsonStruct.miles_programs = [];
            jsonStruct.lounge_membership = [];
            jsonStruct.preferred_airlines = [];

            if (form['miles_programs.airline_name']) {
              for (var i = 0; i < form['miles_programs.airline_name'].length; i++) {
                jsonStruct.miles_programs.push({
                  airline_name: form['miles_programs.airline_name'][i],
                  account_number: form['miles_programs.account_number'][i],
                  flier_miles: form['miles_programs.flier_miles'][i],
                  expiration_date: form['miles_programs.expiration_date'][i]
                });
              }
            } else {
              sails.log.warn('Got miles_programs.airline_name with type=' + (typeof form['miles_programs.airline_name']));
            }

            if (form['lounge_membership.airline_name']) {
              for (var i = 0; i < form['lounge_membership.airline_name'].length; i++) {
                jsonStruct.lounge_membership.push({
                  airline_name: form['lounge_membership.airline_name'][i],
                  membership_number: form['lounge_membership.membership_number'][i],
                  expiration_date: form['lounge_membership.expiration_date'][i]
                });
              }
            } else {
              sails.log.warn('Got lounge_membership.airline_name with type=' + (typeof form['lounge_membership.airline_name']));
            }

            if (form['preferred_airlines.travel_type'] && form['preferred_airlines.airline_name']) {
              for (var i = 0; i < form['preferred_airlines.travel_type'].length; i++) {
                jsonStruct.preferred_airlines.push({
                  travel_type: form['preferred_airlines.travel_type'][i],
                  airline_name: form['preferred_airlines.airline_name'][i]
                });
              }
            } else {
              sails.log.warn('Got preferred_airlines.travel_type with type=' + (typeof form['preferred_airlines.travel_type']) +
                '; preferred_airlines.airline_name type=' + (typeof form['preferred_airlines.airline_name']));
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
