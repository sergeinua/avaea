/**
 * Localhost development environment settings
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
  connections: {
    localhostPostgresqlServer: {
      adapter: 'sails-postgresql',
      host: '127.0.0.1',
      user: 'avaea',
      password: 'avaea',
      database: 'avaea'
    },

  },
  models: {
    connection: 'localhostPostgresqlServer'
  },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  proxyHost: 'http://localhost',
  proxyPort: 1337,
  port: 1337,
  explicitHost: 'localhost',

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  log: {
    level: 'verbose',
    timestamp: true,
    colorOutput: true
  },

  session: {
    adapter: 'sails-pg-session',
    host: '127.0.0.1',
    user: 'avaea',
    password: 'avaea',
    database: 'avaea',
    port: 5432
  },

  globals: {
    cacheStore: 'memcache'
  },

  flightapis: {
    searchProvider: ['mondee'/*, 'farelogix'*//*, 'mystifly'*/],
    mondee: {
      baseEndPoint: 'http://localhost:23456/api/v2'/*, // 'http://sandbox.trippro.com/api/v2',
      clientId: 'CFS1017' // CFS login is not actual, CFP login is now used for both PROD and STAGE Mondee API*/
    },
    farelogix: {
      post_options: {
        host: 'stg.farelogix.com',
        path: '/xmlts/sandboxdm'
      },
      tc: {
        iden: {
          u: "FLXtest",
          p: "dLKx6Xne",
          pseudocity: "AEO2",
          agtpwd: "3l912O8X$p",
          agy: "05600044"
        },
        trace: 'xmlava001'
      }
    }
  },

  hookTimeout: 120000,
  segmentio_key: 'xtV7Xew6UQa1scURs186FRazPcgCPcxR',

  recaptcha: {
    public: '6Lcj2g8UAAAAAIIZm_Twxs0oJ2TkYIjQqsaU2hgl',
    private: '6Lcj2g8UAAAAAFdbK61ZTltscXy_W2Uru5paNqVz'
  },
  //test account set up to http://localhost:1337
  passport: {
    google: {
      name: 'Google',
      protocol: 'oauth2',
      strategy: require('passport-google-oauth').OAuth2Strategy,
      options: {
        clientID: '964565280166-e77at51l90hu9a4q41kmbhdc1tbnnlmd.apps.googleusercontent.com',
        clientSecret: 'C4oFObpXseTuTZdHbEE97wLV',
        prompt: 'select_account',
        scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.profile.emails.read']
      }
    }
  },
  cron: false
};
