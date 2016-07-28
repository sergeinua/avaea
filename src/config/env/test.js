/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  models: {
    connection: 'testMemoryDb'
  },

  log: {
      level: 'error',
      timestamp: false
  },

  session: false,

  flightapis: {
    mondee: {
      baseEndPoint: 'http://localhost:23456/api/v2'/*, // 'http://sandbox.trippro.com/api/v2',
      clientId: 'CFS1017' // CFS login is not actual, CFP login is now used for both PROD and STAGE Mondee API*/
    },
    searchProvider: ['mondee'/*, 'mystifly'*/]
  },

  policies: {
    '*' : true
  },
  hookTimeout: 40000
};
