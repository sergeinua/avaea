/* global _ */
/* global sails */
var UserAction = {
  // Enforce model schema in the case of schemaless databases
  schema: true,
  attributes: {
    user_id    : {
      model: 'User'
    },
    actionType : { type: 'string' },
    logInfo    : { type: 'json' },
    anonymous_id : { type: 'string' }
  },

  saveAction: function (user_id, actionType, data, callback) {
    let anonymous_id = '';

    if (user_id != parseInt(user_id)) {
      anonymous_id = user_id;
    }
    async.parallel({user: (doneCb) => {
      // this is hook for auto tests
      if (!user_id && sails.config.environment =='test') {
        var uFields = {
          username: 'test',
          email: 'test@onvoya.com',
          is_whitelist: 1
        };
        User.findOrCreate(uFields).exec((err, row) => {
          return doneCb(err, row);
        });
      } else {
        return doneCb(null, user_id);
      }
    }}, (err, results) => {
      var uaFields = {
        user_id    : results.user,
        actionType : actionType,
        logInfo    : data
      };
      if (anonymous_id) {
        uaFields.anonymous_id = anonymous_id;
        uaFields.user_id = null;
      }
      this.create(uaFields, function(err, record) {
        if (err) {
          sails.log.error(err);
        }
        callback && callback();
      });
    });
  },

  saveFirstVisit: function (req, res) {
    let anonymous_id = utils.getAnonymousUserId(req);

    if (anonymous_id) {
      let uaFields = {
        actionType: "new_user",
        anonymous_id: anonymous_id
      };
      this.findOne(uaFields, (err, found) => {
        if (!found && !err) {
          uaFields.logInfo = {
            landing_page: req.cookies.landing_page || req.url
          };
          this.create(uaFields, (err, record) => {
            if (err) {
              sails.log.error(err);
            }
            sails.log.verbose('landing_page is saved', record);
            // res.clearCookie('landing_page');
          });
        }
      });
    } else {
      //don't have anonymous_id => must be first/incognito visit, saving landing page to cookies
      res.cookie('landing_page', req.url);
    }
  },
};

module.exports = UserAction;
