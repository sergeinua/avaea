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
      } else {
        return res.view('user/profile', {
          title:'Update profile',
          user: req.user,
          Profile: found
        });
      }
    });
  },

  /**
   * `UserController.profile()`
   */
  update: function (req, res) {
    var profileFields = Profile.make(req.body, req.user);
    sails.log.info(profileFields);
    Profile.update({user:req.user.id}, profileFields).exec(function (err, record) {
      if (err || _.isEmpty(record)) {
        Profile.create(profileFields, function(err, record) {
          if (err) {
            sails.log.error(err);
          }
        });
      }
    });
    res.redirect('/profile');
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
          if (!found) {
              sails.log.error('User not found', JSON.stringify(req.user));
          } else {
              var ind =  _.findIndex(found.milesPrograms, {"airlineName": req.param('airlineName')});
              if (ind != -1) {
                  var _res = found.milesPrograms[ind];
                  found.milesPrograms[ind] = _.merge(found.milesPrograms[ind], {
                      airlineName:      _res.airlineName,
                      accountNumber:    req.param('accountNumber') || _res.accountNumber || '',
                      flierMiles:       req.param('flierMiles') || _res.flierMiles || '',
                      expirationDate:   req.param('expirationDate') || _res.expirationDate || ''
                  });

              } else {
                  found.milesPrograms.push({
                      airlineName:      req.param('airlineName'),
                      accountNumber:    req.param('accountNumber') || '',
                      flierMiles:       req.param('flierMiles') || '',
                      expirationDate:   req.param('expirationDate') || ''
                  });
              }

              Profile.update({user:req.user.id}, found).exec(function (err, record) {
                  if (err) {
                      return res.json({error: err});
                  }
                  return res.json({'success': true});
              });
          }
      });
  }
};
