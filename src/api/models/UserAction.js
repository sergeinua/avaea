/* global _ */
/* global sails */
var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,
  attributes: {
    user       : {
      model: 'User',
      required: true
    },
    actionType : { type: 'string' },
    logInfo    : { type: 'json' },
  },

  saveAction: function (user, actionType, data) {
    var uaFields = {
      user       : user,
      actionType : actionType,
      logInfo    : data
    };
    UserAction.create(uaFields, function(err, record) {
      if (err) {
        sails.log.error(err);
      }
    });
  }

};

module.exports = User;
