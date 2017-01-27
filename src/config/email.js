
module.exports.email = {

  smtp: {
    /** Case with remote smtp */
    service: 'gmail',
    secure: true, // use SSL
    auth: {
      user: 'confirmation@avaea.com',
      pass: 'B4GMrcBjSGfXtcB'
    },

    /** Case with local smtp */
    // host: 'localhost',
    // port: 25,
    // secure: false, // use SSL
  },
  // Set this value by command line env variable sails_email__instance_name as UNIQUE value. Example:
  // sails_email__instance_name=host1_1 sails lift
  instance_name: null,

  // Default "from" field
  from: '"OnVoya Customer Support" <support@onvoya.com>',
  replyTo: '"OnVoya Customer Support" <support@onvoya.com>',
  callTo: '510-249-9333',
  tpl_ticket_confirm: "ticket-confirmation",
  tpl_profile_create: "profile-create"
};
