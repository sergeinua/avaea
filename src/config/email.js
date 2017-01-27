
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
  // Set to non-empty value by command line env variable sails_email__worker_eticket for one instance only. Example:
  // sails_email__worker_eticket=1 sails lift
  worker_eticket: false,

  // Default "from" field
  from: '"OnVoya Customer Support" <support@onvoya.com>',
  replyTo: '"OnVoya Customer Support" <support@onvoya.com>',
  callTo: '510-249-9333',
  tpl_ticket_confirm: "ticket-confirmation",
  tpl_profile_create: "profile-create"
};
