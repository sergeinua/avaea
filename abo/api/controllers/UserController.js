/* global User */
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
    var self = this;
    return res.view('user/create', {
      selectedAirline: self._setAirlineCode(req),
      title:'Create profile',
      selectedUser: req.params.user_id,
      user: req.user
    });
  },

  /**
   * `UserController.profile()`
   */
  profile: function (req, res) {

    var selectedAirline = this._setAirlineCode(req);

    Profile.findOneByUserId(req.params.user_id).exec(function findOneCB(err, found) {

      if (!found) {

        res.redirect((selectedAirline ? '/' + selectedAirline : '') + '/create/' + req.params.user_id);

      } else {

        if (!found.employer) {

          found.employer = {
            companyName: '',
            address:     '',
            phone:       '',
            position:    '',
            salary:      '',
            income:      ''
          }

        }

        if (!found.travelWith) {
          found.travelWith = [{
            firstName: '',
            lastName: '',
            gender: '',
            DateOfBirth: ''
          }];
        }

        return res.view('user/profile', {
          selectedAirline: selectedAirline,
          title:'Update profile',
          selectedUser: req.params.user_id,
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
    var profileFields = Profile.make(req.body, {id: +req.params.user_id});

    if (!profileFields.showTiles) {
      profileFields.showTiles = false;
    }

    var selectedAirline = this._setAirlineCode(req);

    User.findOne({id: req.params.user_id}).exec(function findOneCB(err, found) {
      Profile.update({user:req.params.user_id}, profileFields).exec(function (err, record) {
        if (err || _.isEmpty(record)) {
          Profile.create(profileFields).exec(function(err, record) {
            if (err) {
              sails.log.error(err);
            }
            res.redirect((selectedAirline ? '/' + selectedAirline : '') + '/profile/' + req.params.user_id);
          });
        } else {
          res.redirect((selectedAirline ? '/' + selectedAirline : '') + '/profile/' + req.params.user_id);
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
    Profile.findOneByUserId(req.user.id).exec(function (err, found) {

      if (!found) {

        sails.log.error('User not found', JSON.stringify(req.user));

      } else {

        var fieldset = req.param('fieldset'), iterator = req.param('iterator');
        if (found[fieldset][iterator]) {

          found[fieldset].splice(iterator, 1);
          Profile.update({user: req.user.id}, found).exec(function (err, record) {
            if (err) {
              return res.json({error: err});
            }
            return res.json({'success': true});
          });

        }

      }

    })
  },

  _setAirlineCode: function(req) {
    var selectedAirline = '';

    if (req.params.selectedAirline && req.params.selectedAirline.length == 2) {
      selectedAirline = req.params.selectedAirline.toUpperCase();
    }

    if (selectedAirline) {
      console.log('selectedAirline in params: ' + selectedAirline);
    }

    return selectedAirline;
  }
};
