
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
  from: '"Customer Support" <support@avea.com>',
  replyTo: '"Customer Support" <support@avea.com>',
  tpl_ticket_confirm: "ticket-confirmation",
};