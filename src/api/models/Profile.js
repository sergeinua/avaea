/**
* Profile.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    firstName        : { type: 'string' },
    middleName       : { type: 'string' },
    lastName         : { type: 'string' },
    address          : { type: 'string' },
    notifyContact    : { type: 'json' },
    travelWith       : { type: 'json' },
    milesPrograms    : { type: 'json' },
    loungeMembership : { type: 'json' },
    employer         : { type: 'json' },
    ethnicity        : { type: 'json'
                            // [
                            //     'European',
                            //     'Mexican',
                            //     'Latin American',
                            //     'Eastern European',
                            //     'South East Asian (India, Pakistan, Bangladesh)',
                            //     'Chinese',
                            //     'Asian',
                            //     'African',
                            //     'South Pacific'
                            // ]
                       },
    preferredAirlines : { type: 'json' },
    preferredClass    : { type: 'json' },
    preferredSeat     : { type: 'string' 
                            // [
                            //     'Window',
                            //     'Aisle',
                            //     'Exit Row'
                            // ]
                        }
  }
};

