/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  models: {
    connection: 'dockerPostgresqlServer'
  },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  port: 8000,
  proxyHost: 'http://test.com',
  //proxyPort: 80,
  proxyPort: process.env.PROXY_PORT,
  explicitHost: 'avaea',

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  log: {
    level: 'verbose',
    timestamp: true
  },

  session: {
    host: 'postgres',
    user: 'avaea',
    password: 'a1v2a3e4a5',
    database: 'avaea'
  },

  flightapis: {
    mondee: {
      baseEndPoint: 'http://nginx:23457/api/v2', // 'http://sandbox.trippro.com/api/v2',
      clientId: 'CFP1017'
    },
    searchProvider: ['mondee'/*, 'mystifly'*/]
  },

  hookTimeout: 120000,

  memcacheConf: {
    host: 'cache',
    port: '11211',
    exptime: 60*30 // 30 minutes
  },



};
