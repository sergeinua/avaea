/**
 * Profile.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    user             : { model: 'User', required: true },
    firstName        : { type: 'alpha' },
    middleName       : { type: 'string' },
    lastName         : { type: 'alpha' },
    gender           : {
      type: 'string', enum: ['M', 'F']
    },
    birthday         : { type: 'date' },
    pax_type         : {
      type: 'string', enum: ['ADT', 'CHD', 'INF']
    },
    address          : { type: 'string' },
    notifyContact    : { type: 'json' },
    travelWith       : { type: 'json' },
    milesPrograms    : { type: 'json' },
    loungeMembership : { type: 'json' },
    employer         : { type: 'json' },
    ethnicity        : {
      type: 'string',
      enum:
        [
          'European',
          'Mexican',
          'Latin American',
          'Eastern European',
          'South East Asian (India, Pakistan, Bangladesh)',
          'Chinese',
          'Asian',
          'African',
          'South Pacific'
        ]
    },
    showTiles         : { type: 'boolean'},
    preferredAirlines : { type: 'json' },
    city              : { type: 'string' },
    state             : { type: 'string' },
    country_code      : { type: 'string' },
    zip_code          : { type: 'string' }
  },

  attr_gender: {
    M: "Male",
    F: "Female"
  },
  attr_pax_type : {
    ADT: "Adult",
    CHD: "Child",
    INF: "Infant"
  },

  findOneByUserId: function (id) {
    return this.findOne({user:id});
  },

  make: function (form, user) {
    var jsonStruct = form;
    jsonStruct.user = user.id;

    jsonStruct.notifyContact = {
      name: form['notifyContact.name'],
      phone: form['notifyContact.phone']
    };

    jsonStruct.travelWith = [];
    jsonStruct.milesPrograms = [];
    jsonStruct.loungeMembership = [];
    jsonStruct.preferredAirlines = [];

    jsonStruct.employer = {
      companyName: form["employer.companyName"],
      address: form["employer.address"],
      phone: form["employer.phone"],
      position: form["employer.position"],
      salary: form["employer.salary"],
      income: form["employer.income"]
    };

    jsonStruct.showTiles = form['showTiles'];

      if (form['travelWith.firstName']) {
        for (var i = 0; i < form['travelWith.firstName'].length; i++) {
          jsonStruct.travelWith.push({
            firstName: form['travelWith.firstName'][i],
            lastName: form['travelWith.lastName'][i],
            gender: form['travelWith.gender'][i],
            DateOfBirth: form['travelWith.DateOfBirth'][i]
          });
        }
      } else {
        jsonStruct.travelWith.push({
          firstName: '',
          lastName: '',
          gender: '',
          DateOfBirth: ''
        });
      }
      for (var i = 0; i < form['milesPrograms.airlineName'].length; i++) {
        jsonStruct.milesPrograms.push({
          airlineName:    form['milesPrograms.airlineName'][i],
          accountNumber:  form['milesPrograms.accountNumber'][i],
          flierMiles:     form['milesPrograms.flierMiles'][i],
          expirationDate: form['milesPrograms.expirationDate'][i]
        });
      }
      for (var i = 0; i < form['loungeMembership.airlineName'].length; i++) {
        jsonStruct.loungeMembership.push({
          airlineName:      form['loungeMembership.airlineName'][i],
          membershipNumber: form['loungeMembership.membershipNumber'][i],
          expirationDate:   form['loungeMembership.expirationDate'][i]
        });
      }

      for (var i = 0; i < form['preferredAirlines.travelType'].length; i++) {
        jsonStruct.preferredAirlines.push({
          travelType: form['preferredAirlines.travelType'][i],
          airlineName: form['preferredAirlines.airlineName'][i]
        });
      }

      return jsonStruct;
  }
};
