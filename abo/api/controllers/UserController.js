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
    var _user_id = req.params.user_id;

    Profile.findOneByUserId(_user_id).exec(function findOneCB(err, found) {
      if (err) {
        sails.log.error(err);
      }

      if (!found) {
        res.redirect((selectedAirline ? '/' + selectedAirline : '') + '/create/' + _user_id);
      } else {

        if (!found.employer) {

          found.employer = {
            company_name: '',
            address:     '',
            phone:       '',
            position:    '',
            salary:      '',
            income:      ''
          }

        }

        if (!found.travel_with) {
          found.travel_with = [{
            first_name: '',
            last_name: '',
            gender: '',
            date_of_birth: ''
          }];
        }

        // Assign fields for the view
        var profile_fields = {};
        for(var prop in found) {
          if (!found.hasOwnProperty(prop)) {
            continue;
          }
          if (typeof found[prop] == 'undefined' || found[prop] === null || (typeof found[prop] == 'string' && found[prop].trim()=="")) {
            profile_fields[prop] = '';
          } else {
            profile_fields[prop] = found[prop];
          }
        }
        if (typeof profile_fields.birthday == 'object') {
          profile_fields.birthday = sails.moment(profile_fields.birthday).format('YYYY-MM-DD');
        }
        if (profile_fields.birthday) {
          var years = sails.moment().diff(profile_fields.birthday, 'years');
          profile_fields.pax_type = (years >= 12 ? 'ADT' : (years > 2 ? 'CHD' : 'INF'));
        }

        return res.view('user/profile', {
          selectedAirline: selectedAirline,
          title:'Update profile',
          selectedUser: _user_id,
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
    var profileFields = Profile.make(req.body, {id: +req.params.user_id});

    if (!profileFields.personal_info.show_tiles) {
      profileFields.personal_info.show_tiles = false;
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
