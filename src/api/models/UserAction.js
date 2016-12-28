/* global _ */
/* global sails */
var UserAction = {
  // Enforce model schema in the case of schemaless databases
  schema: true,
  attributes: {
    user       : {
      model: 'User'
    },
    actionType : { type: 'string' },
    logInfo    : { type: 'json' },
    anonymous_id : { type: 'string' }
  },

  saveAction: function (user, actionType, data, callback) {
    let anonymous_id = '';

    if (user != parseInt(user)) {
      anonymous_id = user;
    }
    async.parallel({user: (doneCb) => {
      // this is hook for auto tests
      if (!user && sails.config.environment =='test') {
        var uFields = {
          username: 'test',
          email: 'test@avaea.com',
          is_whitelist: 1
        };
        User.findOrCreate(uFields).exec((err, row) => {
          return doneCb(err, row);
        });
      } else {
        return doneCb(null, user);
      }
    }}, (err, results) => {
      var uaFields = {
        user       : results.user,
        actionType : actionType,
        logInfo    : data
      };
      if (anonymous_id) {
        uaFields.anonymous_id = anonymous_id;
        uaFields.user = null;
      }
      this.create(uaFields, function(err, record) {
        if (err) {
          sails.log.error(err);
        }
        callback && callback();
      });
    });
  }

};

module.exports = UserAction;
