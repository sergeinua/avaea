/* global _ */
/* global sails */
var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,
  types: {
    allowedEmail: function (email) {
      var whiteList = [
        "constfilin@gmail.com",
        "v.mustafin@gmail.com",
        "eugene.tokarev@gmail.com"
      ];
      if (_.indexOf(whiteList, email)) {
        return true;
      }
      if ( /^.+?@avaea.com$/.exec(email) ) {
        return true;
      } else {
        return false;
      }
    }
  },
  attributes: {
    username  : { type: 'string', unique: true },
    email     : { type: 'email',  unique: true, allowedEmail: true },
    passports : { collection: 'Passport', via: 'user' },
    searches  : { collection: 'Search', via: 'user' }
  }
};

module.exports = User;
