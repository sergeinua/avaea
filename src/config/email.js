
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

  // Default "from" field
  from: '"Avaea Customer Support" <support@avea.com>',
  replyTo: '"Avaea Customer Support" <support@avea.com>',
  callTo: '510-249-9333',
  tpl_ticket_confirm: "ticket-confirmation",
};