/**
 * Profile.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

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

  findOneByUserId: function (id) {
    var profile = this.findOne({user:id});

    if(typeof profile !== 'undefined'){
      if(typeof profile.employer === 'undefined'){
        profile.employer = {
          company_name: '',
          address: '',
          phone: '',
          position: '',
          salary: '',
          income: ''
        };
      }
      if(typeof profile.travel_with === 'undefined'){
        profile.travel_with = [{
          first_name: '',
          last_name: '',
          gender: '',
          date_of_birth: ''
        }];
      }
    }
    return profile;
  },

  make: function (form, user) {
    var jsonStruct = form;
    jsonStruct.user = user.id;

    if (form['birthday']) {
      var years = sails.moment().diff(form['birthday'], 'years');
      form['pax_type'] = (years >= 12 ? 'ADT' : (years > 2 ? 'CHD' : 'INF'));
    }

    jsonStruct.personal_info = {
      first_name  : form['first_name'],
      middle_name : form['middle_name'],
      last_name   : form['last_name'],
      gender      : form['gender'],
      birthday    : form['birthday'],
      pax_type    : form['pax_type'],
      phone       : form['phone'],
      address     : {
        street        : form['street'],
        city          : form['city'],
        state         : form['state'],
        country_code  : form['country_code'],
        zip_code      : form['zip_code']
      },
      show_tiles  : form['show_tiles']
    };
    jsonStruct.notify_contact = {
      name: form['notify_contact.name'],
      phone: form['notify_contact.phone']
    };
    jsonStruct.travel_with = [];
    jsonStruct.miles_programs = [];
    jsonStruct.lounge_membership = [];
    jsonStruct.preferred_airlines = [];
    jsonStruct.employer = {
      company_name: form["employer.company_name"],
      address: form["employer.address"],
      phone: form["employer.phone"],
      position: form["employer.position"],
      salary: form["employer.salary"],
      income: form["employer.income"]
    };

    if (form['travel_with.first_name']) {
      for (var i = 0; i < form['travel_with.first_name'].length; i++) {
        jsonStruct.travel_with.push({
          first_name: form['travel_with.first_name'][i],
          last_name: form['travel_with.last_name'][i],
          gender: form['travel_with.gender'][i],
          date_of_birth: form['travel_with.date_of_birth'][i]
        });
      }
    } else {
      jsonStruct.travel_with.push({
        first_name: '',
        last_name: '',
        gender: '',
        date_of_birth: ''
      });
    }

    if (form['miles_programs.program_name']) {
      for (var i = 0; i < form['miles_programs.program_name'].length; i++) {
        jsonStruct.miles_programs.push({
          program_name: form['miles_programs.program_name'][i] || '',
          tier: form['miles_programs.tier'][i] || '',
          account_number: form['miles_programs.account_number'][i] || ''
        });
      }
    } else {
      sails.log.warn('Got miles_programs.program_name with type=' + (typeof form['miles_programs.program_name']));
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

    return jsonStruct;
  },
};
