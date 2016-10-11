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
    //FIXME this is temporary fix. Must be removed after abo sockets auth refactoring (src/config/policies.js:33)
    if (!req.session.authenticated || !req.user) {
      return res.redirect('/login');
    }
    //end of temp fix

    return res.ok(
      {
        title:'Create profile',
        user: req.user
      },
      'user/create'
    );
  },

  /**
   * `UserController.profile()`
   */
  profile: function (req, res) {
    //FIXME this is temporary fix. Must be removed after abo sockets auth refactoring (src/config/policies.js:33)
    if (!req.session.authenticated || !req.user) {
      return res.redirect('/login');
    }
    //end of temp fix

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
        if(typeof profile_fields.birthday == 'object')
          profile_fields.birthday = sails.moment(profile_fields.birthday).format('YYYY-MM-DD');

        return res.ok(
          {
            title:'Update profile',
            user: req.user,
            profile_fields: profile_fields
          },
          'user/profile'
        );
      }
    });
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

    Profile.make(req.body, req.user, function(profileFields) {

      Profile.update({user:req.user.id}, profileFields).exec(function (err, record) {
        if (err || _.isEmpty(record)) {
          Profile.create(profileFields).exec(function(err, record) {
            if (err) {
              sails.log.error(err);
            }
            res.redirect('/profile');

          });
        } else {
          var _user = req.user;
          _user.profileFields = profileFields;
          segmentio.identify(req.user.id, _user);
          res.redirect('/profile');
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
