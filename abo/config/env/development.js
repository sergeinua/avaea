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
    connection: 'etPostgresqlServer'
  },

  log: {
      level: 'verbose',
      timestamp: true
  },

  session: {
    host: '127.0.0.1',
    user: 'avaea',
    password: 'avaea',
    database: 'avaea_db',
    port: 5432
  },

  //port: 8080,
  proxyHost: 'http://dev.abo.avaea.com',
  proxyPort: 80,

  remoteSocket: 'http://avaea.com',

  flightapis: {
    mondee: {
      baseEndPoint: 'http://localhost:23456/api/v2', // 'http://sandbox.trippro.com/api/v2',
      clientId: 'CFS1017'
    },
    searchProvider: /*'mystifly'*/  'mondee'
  }

};
