
module.exports.email = {

  smtp: {
    /** Case with remote smtp */
    service: 'gmail',
    secure: true, // use SSL
    auth: {
      user: 'confirmation@onvoya.com',
      pass: 'B4GMrcBjSGfXtcB'
    },

    /** Case with local smtp */
    // host: 'localhost',
    // port: 25,
    // secure: false, // use SSL
  },

  // Default "from" field
  from: '"Onvoya Customer Support" <support@onvoya.com>',
  replyTo: '"Onvoya Customer Support" <support@onvoya.com>',
  callTo: '510-249-9333',
  tpl_ticket_confirm: "ticket-confirmation",
  tpl_profile_create: "profile-create"
};
