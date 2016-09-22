
module.exports.email = {

  smtp: {
    /** Case with remote smtp */
    service: 'gmail',
    secure: true, // use SSL
    auth: {
      user: 'testing@avaea.com',
      pass: 'B4GMrcBjSGfXtcB'
    },

    /** Case with local smtp */
    // host: 'localhost',
    // port: 25,
    // secure: false, // use SSL
  },

  // Default "from" field
  from: '"Support Staff" <support@avea.com>',
  tpl_ticket_confirm: "ticket-confirmation",
};