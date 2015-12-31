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
    connection: 'productionPostgresqlServer'
  },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  port: 8080,
  proxyHost: 'http://ec2-52-24-104-220.us-west-2.compute.amazonaws.com/',

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  // log: {
  //   level: "silent"
  // }
  session: {
    host: '127.0.0.1',
    user: 'avaea',
    password: 'a1v2a3e4a5',
    database: 'avaea'
  },

  flightapis: {
    searchProvider: 'mondee', // 'mystifly'
    mondee: {
      baseEndPoint: 'http://api.trippro.com/api/v2',
      clientId: 'CFP1017'
    }
  }

};
