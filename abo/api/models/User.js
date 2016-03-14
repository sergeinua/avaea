/* global _ */
/* global sails */
var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,
  attributes: {
    username  : { type: 'string', unique: true },
    email     : { type: 'email',  unique: true },
    is_whitelist : {
      type: 'integer',
      required: true,
      defaultsTo: 0,
      enum: [0, 1] // access to whitelist: 1=enable; 0=disable
    },
    passports : { collection: 'Passport', via: 'user' }
  }
};

module.exports = User;
