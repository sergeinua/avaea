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

  saveAction: function (userId, actionType, data, callback) {
    let anonymous_id = '';

    if (userId != parseInt(userId)) {
      anonymous_id = userId;
    }
    async.parallel({user: (doneCb) => {
      // this is hook for auto tests
      if (!userId && sails.config.environment =='test') {
        var uFields = {
          username: 'test',
          email: 'test@onvoya.com',
          is_whitelist: 1
        };
        User.findOrCreate(uFields).exec((err, row) => {
          return doneCb(err, row);
        });
      } else {
        return doneCb(null, userId);
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
          onvoya.log.error(err);
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
              onvoya.log.error(err);
            }
            onvoya.log.verbose('landing_page is saved', record);
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
