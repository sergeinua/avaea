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
  }
};

module.exports = User;
