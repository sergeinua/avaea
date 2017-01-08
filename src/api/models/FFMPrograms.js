var qpromice = require('q');
/**
 * FFMPrograms.js
 *
 * @description :: table to store detailed information about all supported frequent flyer programs from 30k.
 * @docs        :: http://www.30k.com/30k-api/milefy-api/programs/
 */

module.exports = {
  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      required: true
    },
    program_code: { type: 'string' },
    program_name: { type: 'string' },
    help_url: { type: 'string' },
    web_site_url: { type: 'string' },
    signup_url: { type: 'string' },
    alliance: { type: 'string' },
    miles_type_configuration: { type: 'json' },
    tiers_configuration: { type: 'json' },
    airlines: { type: 'json' }
  },
  tableName: 'ffm_programs',

  /**
   * Return promise this miles or []
   * @param userId || undefined
   *
   * @return promise  //Always successfully
   */
  getMilesProgramsByUserId: function (userId) {
    let qdefer = qpromice.defer();
    let emptyMilesProgramsValue = [];
    if (userId == undefined) {
      qdefer.resolve(emptyMilesProgramsValue);
    } else {
      Profile.getUserMilesProgramsByUserId(req.user.id)
        .then(function (milesProgram) {
          qdefer.resolve(milesProgram);
        })
        .catch(function (error) {
          qdefer.resolve(emptyMilesProgramsValue);
        });
    }
    return qdefer.promise;
  }
};
