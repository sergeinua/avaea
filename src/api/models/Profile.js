/**
* Profile.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    firstName        : { type: 'alpha' },
    middleName       : { type: 'string' },
    lastName         : { type: 'alpha' },
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
    preferredAirlines : { type: 'json' },
    preferredClass    : { type: 'json' },
    preferredSeat     : {
      type: 'string',
      enum:
        [
          'Window',
          'Aisle',
          'Exit Row'
        ]
    }
  },

  getById: function (id) {
    return this.findOneById(id);
  },

  make: function (form) {
      var jsonStruct = form;
      jsonStruct.notifyContact = {
        name:  form['notifyContact.name'],
        phone: form['notifyContact.phone']
      };
      jsonStruct.travelWith = [];
      jsonStruct.milesPrograms = [];
      jsonStruct.loungeMembership = [];
      jsonStruct.employer = {
        companyName: form["employer.companyName"],
        address:     form["employer.address"],
        phone:       form["employer.phone"],
        position:    form["employer.position"],
        salary:      form["employer.salary"],
        income:      form["employer.income"]
      };
      jsonStruct.preferredAirlines = [];
      jsonStruct.preferredClass = {
        domesticPersonal:      form["preferredClass.domesticPersonal"],
        domesticBusiness:      form["preferredClass.domesticBusiness"],
        internationalPersonal: form["preferredClass.internationalPersonal"],
        internationalBusiness: form["preferredClass.internationalBusiness"]
      };

      for (var i = 0; i < form['travelWith.firstName'].length; i++) {
        jsonStruct.travelWith.push({
          firstName:   form['travelWith.firstName'][i],
          lastName:    form['travelWith.lastName'][i],
          gender:      form['travelWith.gender'][i],
          DateOfBirth: form['travelWith.DateOfBirth'][i]
        });
      }
      for (var i = 0; i < form['milesPrograms.airlineName'].length; i++) {
        jsonStruct.milesPrograms.push({
          airlineName:   form['milesPrograms.airlineName'][i],
          accountNumber: form['milesPrograms.accountNumber'][i]
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
          travelType:  form['preferredAirlines.travelType'][i],
          airlineName: form['preferredAirlines.airlineName'][i]
        });
      }
      return jsonStruct;
  }
};
