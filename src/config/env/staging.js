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
    stagePostgresqlServer: {
      adapter: 'sails-postgresql',
      host: '127.0.0.1',
      user: 'avaea',
      password: 'a1v2a3e4a5',
      database: 'avaea'
    }
  },
  models: {
    connection: 'stagePostgresqlServer'
  },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  port: 8000,
  proxyHost: 'http://stage.avaea.com',
  proxyPort: 80,
  explicitHost: 'localhost',

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  log: {
    level: 'verbose',
    timestamp: true
  },

  flightapis: {
    searchProvider: ['mondee', 'farelogix', 'cheapoair'/*, 'mystifly'*/],
    mondee: {
      baseEndPoint: 'http://sandbox.trippro.com/api/v2',
      // clientId: 'CFS1017' temporary disabled bc of error from mondee "Please Provide Valid ClientId"
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

  hookTimeout: 90000,
  segmentio_key: 'dTKBLO5w1lHx5o9HPLIwTQCzomWJOUN5',

  recaptcha: {
    public: '6Lcj2g8UAAAAAIIZm_Twxs0oJ2TkYIjQqsaU2hgl',
    private: '6Lcj2g8UAAAAAFdbK61ZTltscXy_W2Uru5paNqVz'
  }

};
