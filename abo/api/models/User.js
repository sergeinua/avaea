/* global _ */
/* global sails */
/* global utils */
/* global segmentio */
/* global UserAction */

let User = {
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
    passports : { collection: 'Passport', via: 'user' },
    searches  : { collection: 'Search', via: 'user' },
    anonymous_id : { type: 'string' },
    landing_page : { type: 'string' }
  },

  saveLandingPage: function (user_id, req) {
    this.findOne({id: user_id}, (err, found_user) => {
      if (err) {
        sails.log.error(err);
      }
      if (!found_user.landing_page) {
        //landing page is empty, trying to save one
        let uaFields = {
          actionType: "new_user",
          anonymous_id: found_user.anonymous_id || utils.getAnonymousUserId(req)
        };
        if (!found_user.anonymous_id) {
          found_user.anonymous_id = utils.getAnonymousUserId(req);
        }
        UserAction.findOne(uaFields, (err, found) => {
          if (!err && found) {
            found_user.landing_page = found.logInfo?found.logInfo.landing_page:req.cookies.landing_page;
            segmentio.track(found_user.id, 'User landing page', {landing_page: found_user.landing_page});
            found_user.save();
          } else if (!err && req.cookies.landing_page) {
            found_user.landing_page = req.cookies.landing_page;
            segmentio.track(found_user.id, 'User landing page', {landing_page: found_user.landing_page});
            found_user.save();
          } else {
            sails.log.error(err);
          }
        });
      } else {
        sails.log.verbose('already have landing page saved: ', found_user.landing_page);
      }
    });
  }
};

module.exports = User;
