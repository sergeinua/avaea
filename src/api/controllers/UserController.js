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
  login: function (req, res) {
    return res.json({
      todo: 'index() is not implemented yet!'
    });
  },

  /**
   * `UserController.profile()`
   */
  profile: function (req, res) {
    return res.view('user/profile', {
      user: res.user
    });
  },

  /**
   * `UserController.profile()`
   */
  update: function (req, res) {
    var profileFields = Profile.make(req.body);
    Profile.create(profileFields, function(err, record) {
      sails.log(err);
      sails.log(record);
    });
    res.redirect('/profile');
  },
};

