/* global Profile */
/* global sails */
var qpromice = require('q');

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var makeProfileData = function (req, dataRec) {
  var qdefer = qpromice.defer();
  var profile_fields = {};

  if (dataRec) {
    // Assign fields for the view
    for (var prop in dataRec) {
      if (!dataRec.hasOwnProperty(prop)) {
        continue;
      }
      if (!dataRec[prop] || (typeof dataRec[prop] == 'string' && dataRec[prop].trim() == "")) {
        profile_fields[prop] = '';
      } else {
        profile_fields[prop] = dataRec[prop];
      }
    }
    if (typeof profile_fields.birthday == 'object') {
      profile_fields.birthday = sails.moment(profile_fields.birthday).format('YYYY-MM-DD');
    }
    if (profile_fields.birthday) {
      var years = sails.moment().diff(profile_fields.birthday, 'years');
      profile_fields.pax_type = (years >= 12 ? 'ADT' : (years > 2 ? 'CHD' : 'INF'));
    }
  }

  qdefer.resolve({
    profileFields: profile_fields,
    profileStructure: {
      'personal_info.gender': Profile.attr_gender
    },
    preferredAirlinesStructure: {
      travel_type: Profile.attr_travel_type
    }
  });

  return qdefer.promise;
};

module.exports = {

  /**
   * `UserController.profile()`
   */
  profile: function (req, res) {
    //FIXME this is temporary fix. Must be removed after abo sockets auth refactoring (src/config/policies.js:33)
    if (!req.session.authenticated || !req.user) {
      makeProfileData(req, {}).then(function (resData) {
        return res.ok(resData);
      });
    } else {
      //end of temp fix

      var user_out = {
        id: req.user.id,
        email: req.user.email,
      };

      Profile.findOneByUserId(req.user.id).exec(function findOneCB(err, found) {
        if (err) {
          sails.log.error(err);
          return res.ok({user: user_out, error: true});
        }

        makeProfileData(req, found).then(function (resData) {
          return res.ok(resData);
        });
      });
    }
  },

  /**
   * `UserController.profile()`
   */
  update: function (req, res) {
    //FIXME this is temporary fix. Must be removed after abo sockets auth refactoring (src/config/policies.js:33)
    if (!req.session.authenticated || !req.user) {
      return res.redirect('/login');
    }
    //end of temp fix

    var user_out = {
      id: req.user.id,
      email: req.user.email,
    };

    Profile.make(req.body, req.user, function(profileFields) {

      Profile.update({user:req.user.id}, profileFields).exec(function (err, record) {
        if (err) {
          sails.log.error(err);
          return res.ok({user: user_out, error: true});
        }
        else if (_.isEmpty(record)) {
          Profile.create(profileFields).exec(function(err, record) {
            if (err) {
              sails.log.error(err);
              return res.ok({user: user_out, error: true});
            }
            else {
              makeProfileData(req, record).then(function (resData) {
                return res.ok(resData);
              });
            }

          });
        }
        else {
          var _user = req.user;
          _user.profileFields = profileFields;
          segmentio.identify(req.user.id, _user);

          makeProfileData(req, record[0]).then(function (resData) {
            return res.ok(resData);
          });
        }
      });

    });

  },

  /**
   * remove fieldset from user profile
   * user/removeFieldSet
   * @param req
   * @param res
   */
  removeFieldSet: function (req, res) {
    //FIXME this is temporary fix. Must be removed after abo sockets auth refactoring (src/config/policies.js:33)
    if (!req.session.authenticated || !req.user) {
      return res.redirect('/login');
    }
    //end of temp fix

    Profile.findOneByUserId(req.user.id).exec(function (err, found) {

      if (!found) {

        sails.log.error('User not found', JSON.stringify(req.user));
        return res.json({error: 'User not found'});

      } else {

        var fieldset = req.param('fieldset'), iterator = req.param('iterator');

        if (found[fieldset] && found[fieldset][iterator]) {

          found[fieldset].splice(iterator, 1);
          Profile.update({user:req.user.id}, found).exec(function (err, record) {
            if (err) {
              return res.json({error: err});
            }
            return res.json({'success': true});
          });

        } else {

          sails.log.error('Fieldset "' + fieldset + '" not found', JSON.stringify(found));
          return res.json({error: 'Fieldset not found'});

        }

      }

    });
  }
};
