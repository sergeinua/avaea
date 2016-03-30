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

  passport: {
    google: {
    name: 'Google',
    protocol: 'oauth2',
    strategy: require('passport-google-oauth').OAuth2Strategy,
    options: {
      clientID: '353849264959-s6n15fmj0s094hs95b46s5osuikm2agi.apps.googleusercontent.com',
      clientSecret: 'wURGldrAW0CS1kS8PX1QJi1m',
      prompt: 'select_account',
      scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.profile.emails.read']
    }
  }
  },

  models: {
    connection: 'dockerPostgresqlServer'
  },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  port: 8080,
  proxyHost: 'http://abo.test.com',
  proxyPort: process.env.PROXY_PORT,
  //proxyPort: 80,
  explicitHost: 'abo',

  remoteSocket: 'http://test.com',

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
    searchProvider: 'mondee' // 'mystifly'
  },

  hookTimeout: 60000

};
