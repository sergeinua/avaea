var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username  : { type: 'string', unique: true },
    email     : { type: 'email',  unique: true /*, regex: '/.+?@avaea.com$/'*/ },
    passports : { collection: 'Passport', via: 'user' },
    searches  : { collection: 'Search', via: 'user' }
  }
};

module.exports = User;
