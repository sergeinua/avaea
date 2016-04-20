/* global Profile */
/* global sails */
/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {


  /**
   * `UserController.login()`
   */
  create: function (req, res) {
    return res.view('user/create', {
      title:'Create profile',
      user: req.user
    });
  },

  /**
   * `UserController.profile()`
   */
  profile: function (req, res) {
    Profile.findOneByUserId(req.user.id).exec(function findOneCB(err, found) {
      if (!found) {
        res.redirect('create');
      }
      else {
        // Assign fields for the view
        var profile_fields = {};
        for(var prop in found) {
          if(!found.hasOwnProperty(prop))
            continue;
          if(typeof found[prop] == 'undefined' || found[prop] === null || (typeof found[prop] == 'string' && found[prop].trim()==""))
            profile_fields[prop] = '';
          else
            profile_fields[prop] = found[prop];
        }

        return res.view('user/profile', {
          title:'Update profile',
          user: req.user,
          profile_fields: profile_fields
        });
      }
    });
  },

  /**
   * `UserController.profile()`
   */
  update: function (req, res) {
    var profileFields = Profile.make(req.body, req.user);

    Profile.update({user:req.user.id}, profileFields).exec(function (err, record) {
      if (err || _.isEmpty(record)) {
        Profile.create(profileFields).exec(function(err, record) {
          if (err) {
            sails.log.error(err);
          }
          res.redirect('/profile');

        });
      } else {
        res.redirect('/profile');
      }
    });

  },

    /**
     * Checked Airlines Frequent Flier Miles Programs for user
     * user/checkAFFMP
     * @param req
     * @param res
     */
  checkAFFMP: function (req, res) {
    Profile.findOneByUserId(req.user.id).exec(function (err, found) {
      if (!found) {
        sails.log.error('User not found', JSON.stringify(req.user));
        return res.json({'checked': false});
      } else {
          var _res =  _.find(found.milesPrograms, {"airlineName": req.param('airlineName')});
          if (_res) {
              return res.json({'checked': true});
          }
          return res.json({'checked': false});
      }
    });
  },

    /**
     * Save Airlines Frequent Flier Miles Programs
     * user/addMilesPrograms
     * @param req
     * @param res
     */
  addMilesPrograms: function (req, res) {
      Profile.findOneByUserId(req.user.id).exec(function (err, found) {
        var airlineName   = req.param('airlineName'),
            accountNumber = req.param('accountNumber') || '',
            flierMiles    = req.param('flierMiles') || '',
            expirationDate= req.param('expirationDate') || '';
        if (!airlineName) {
          return res.json({error: 'Not valid params.'});
        }

        var milesPrograms = {
          airlineName:      airlineName,
          accountNumber:    accountNumber,
          flierMiles:       flierMiles,
          expirationDate:   expirationDate
        };

        if (!found) {
          var data = {
            user: req.user.id,
            milesPrograms: [milesPrograms]
          };
          Profile.create(data, function (err, record) {
            if (err) {
              sails.log.error('Error Create Profile', JSON.stringify(err), JSON.stringify(req.user));
              return res.json({error: err});
            }
            return res.json({'success': true});
          });
        } else {
          var ind =  _.findIndex(found.milesPrograms, {"airlineName": req.param('airlineName')});
          if (ind != -1) {
            var _res = found.milesPrograms[ind];
            _.merge(found.milesPrograms[ind], {
                airlineName:      airlineName,
                accountNumber:    accountNumber || _res.accountNumber || '',
                flierMiles:       flierMiles || _res.flierMiles || '',
                expirationDate:   expirationDate || _res.expirationDate || ''
            });

          } else {
            found.milesPrograms.push(milesPrograms);
          }

          Profile.update({user:req.user.id}, found).exec(function (err, record) {
            if (err) {
              return res.json({error: err});
            }
            return res.json({'success': true});
          });
        }
      });
  },

  /**
   * remove fieldset from user profile
   * user/removeFieldSet
   * @param req
   * @param res
   */
  removeFieldSet: function (req, res) {
    Profile.findOneByUserId(req.user.id).exec(function (err, found) {

      if (!found) {

        sails.log.error('User not found', JSON.stringify(req.user));

      } else {

        var fieldset = req.param('fieldset'), iterator = req.param('iterator');
        if (found[fieldset][iterator]) {

          found[fieldset].splice(iterator, 1);
          Profile.update({user:req.user.id}, found).exec(function (err, record) {
            if (err) {
              return res.json({error: err});
            }
            return res.json({'success': true});
          });

        }

      }

    });
  }
};
