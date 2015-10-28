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
      user: res.user
    });
  },

  /**
   * `UserController.profile()`
   */
  profile: function (req, res) {
    var id = 1; //for tests
    Profile.getById(id).exec(function findOneCB(err, found) {
      console.log(req.user);
      if (!found) {
        console.log('!!!!!!!!!!!!!!');
        res.redirect('create');
        // found = Profile.create({
        //   firstName:  "First Name",
        //   middleName: "Middle Name",
        //   lastName:   "Last Name"
        // }).exec(function(err, record) {
        //   return res.view('user/profile', {
        //     title:'Update profile',
        //     user: res.user,
        //     Profile: found
        //   });
        // });
      } else {
        console.log(found);
          return res.view('user/profile', {
            title:'Update profile',
            user: res.user,
            Profile: found
          });
        }
    });
  },

  /**
   * `UserController.profile()`
   */
  update: function (req, res) {
    var profileFields = Profile.make(req.body);
    Profile.update({id:1}, profileFields).exec(function (err, record) {
      Profile.create(profileFields, function(err, record) {
        sails.log(err);
        sails.log(record);
      });
    });
    res.redirect('/profile');
  },
};
