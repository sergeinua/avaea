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
 // proxyHost: 'http://abo.avaea.com',
 proxyHost: 'http://abo.onvoya.com',
 // proxyPort: 80,
  proxyPort: 8080,
  explicitHost: '0.0.0.0',

  remoteSocket: 'https://www.avaea.com',

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
  hookTimeout: 60000

};
