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
  proxyHost: 'https://www.onvoya.com',
  proxyPort: 80,
  explicitHost: '0.0.0.0',

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  log: {
    level: 'verbose',
    timestamp: false
  },

  session:{
  adapter: 'redis',
  host: 'rediscache.5suwap.0001.usw2.cache.amazonaws.com',
  port: 6379,
  ttl: 600,
  db: 0,
  pass: '',
  prefix: 'sess:'
},
  connections: {
    productionPostgresqlServer: {
      adapter: 'sails-postgresql',
      host: 'db1',
      user: 'avaea',
      password: 'a1v2a3e4a5',
      database: 'avaea'
    },
  redisConf: {
    host: 'rediscache.5suwap.0001.usw2.cache.amazonaws.com',
    port: 6379,
    ttl: 600,
    db: 0,
    pass: '',
    prefix: 'cache:',
    exptime: 60*30 // 30 minutes
  },

},
  hookTimeout: 60000,
  segmentio_key: 'oFl2tXWI9epbfKgbTEvJsuBDfdE1h1Q2',

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

