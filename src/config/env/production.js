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

  port: 8000,
  proxyHost: 'https://www.avaea.com',
  proxyPort: 80,
  explicitHost: '0.0.0.0',

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  log: {
    level: 'verbose',
    timestamp: true
  },

  session: {
    host: 'db1',
    user: 'avaea',
    password: 'a1v2a3e4a5',
    database: 'avaea'
  },
  connections: {
    memcacheConf: {
    host: 'cache1.5suwap.cfg.usw2.cache.amazonaws.com',
    port: '11211',
    exptime: 60*30 // 30 minutes
  },
},
  hookTimeout: 60000,
  segmentio_key: 'oFl2tXWI9epbfKgbTEvJsuBDfdE1h1Q2',

  recaptcha: {
    public: '6Lcj2g8UAAAAAIIZm_Twxs0oJ2TkYIjQqsaU2hgl',
    private: '6Lcj2g8UAAAAAFdbK61ZTltscXy_W2Uru5paNqVz'
  },
  flightapis: {
    searchProvider: ['mondee', 'farelogix'/*, 'mystifly'*/]
  },
  ffmapis: {
    milefy: {
      url:      'https://liveapi.30k.com/',
      login:    'avaea',
      password: '11c235eba9b7'
    },
    wallet: {
      url:      'https://walletapi.30k.com/',
      login:    'avaea',
      password: '11c235eba9b7'
    }
  },
  recaptcha: {
    public: '6LfyCREUAAAAAADwXPedDrDDZkjPDtyD2LGFgNC2',
    private: '6LfyCREUAAAAAI8z2-sRHTfbq8un61iX-DB6Uahk'
  }
};

