var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    id: {
      type: 'integer',
      unique: true,
      primaryKey: true,
      autoPK: true
    },
    username  : { type: 'string', unique: true },
    email     : { type: 'email',  unique: true , email: true},
    passports : { collection: 'Passport', via: 'user' }
  }
};

module.exports = User;
