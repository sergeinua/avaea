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

  connection: {
    memcacheConf: {
      host: 'localhost',
      port: '11211',
      exptime: 60*30 // 30 minutes
    },
    etPostgresqlServer: {
      adapter: 'sails-postgresql',
      host: '127.0.0.1',
      user: 'avaea',
      password: 'avaea',
      database: 'avaea_db'
    }
  },
  models: {
    connection: 'etPostgresqlServer'
  },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  port: 80,
  proxyHost: 'http://stage.avaea.com/',
  proxyPort: 80,
  explicitHost: 'localhost',

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  log: {
    level: 'verbose',
    timestamp: true
  },

  session: {
    adapter: 'sails-pg-session',
    host: '127.0.0.1',
    user: 'avaea',
    password: 'avaea',
    database: 'avaea_db',
    port: 5432
  },

  globals: {
    cacheStore: 'memcache'
  },

  flightapis: {
    searchProvider: ['mondee', 'farelogix', 'cheapoair'/*, 'mystifly'*/],
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

  cron: {
    readEticket: {schedule: '*/20 * * * * *'}
  }
};
