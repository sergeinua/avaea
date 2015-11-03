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
      if (err || !record.id) {
        Profile.create(profileFields, function(err, record) {
          if (err) {
            sails.log.error(err);
          }
        });
      }
    });
    res.redirect('/profile');
  },
};
