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

  connection: {
    postgresql: {
      adapter: 'sails-postgresql',
      host: 'postgres',
      user: 'avaea',
      password: 'a1v2a3e4a5',
      database: 'avaea'
    }
  },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  port: 8000,
  proxyHost: 'http://test.com',
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
    searchProvider: ['mondee', 'farelogix'/*, 'mystifly'*/],
    mondee: {
      baseEndPoint: 'http://nginx:23457/api/v2'/*, // 'http://sandbox.trippro.com/api/v2',
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

  memcacheConf: {
    host: 'cache',
    port: '11211',
    exptime: 60*30 // 30 minutes
  },

  segmentio_key: 'xtV7Xew6UQa1scURs186FRazPcgCPcxR',

  recaptcha: {
    public: '6Lcj2g8UAAAAAIIZm_Twxs0oJ2TkYIjQqsaU2hgl',
    private: '6Lcj2g8UAAAAAFdbK61ZTltscXy_W2Uru5paNqVz'
  }

};
