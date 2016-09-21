
module.exports.email = {

  smtp: {
    /** Case with remote smtp */
    service: 'gmail',
    secure: true, // use SSL
    auth: {
      user: 'ext.staff@gmail.com',
      pass: 'october#5'
    },

    /** Case with local smtp */
    // host: 'localhost',
    // port: 25,
    // secure: false, // use SSL

    // Remains from the sails-hook-email. Is not use now
    // testMode: false,
    // ssl: true,
    // from: 'support@avea.com',
  },

  // Default "from" field
  from: '"Support Staff" <support@avea.com>',
  tpl_ticket_confirm: "ticket-confirmation",
};