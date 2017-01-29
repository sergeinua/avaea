/* global sails */
module.exports = {

  client: null,

  init: function (cb) {
    if (!sails.config.connections.redisConf.exptime) {
      sails.config.connections.redisConf.exptime = 0;
    }
    if (this.client) {
      return cb();
    }
    let redis = require('redis');
    this.client = new redis.createClient(
      sails.config.connections.redisConf.port,
      sails.config.connections.redisConf.host,
      {
        prefix : sails.config.connections.redisConf.prefix
      }
    );
    sails.log.info('Connected to redis');

    return cb();
  },

  store: function (key, value) {
    this.init(() => {
      this.client.setex( key, sails.config.connections.redisConf.exptime, JSON.stringify(value), function(err, status) {
        if (err) {
          sails.log.error( 'Key ' + key + ' can\'t be saved!' );
          sails.log.error( err );
        }
      });
    });
  },

  //Get may take a single key, or an array of keys.
  get: function (key, callback) {
    this.init(() => {
      this.client.get( key, function(err, response) {
        if (!err) {
          return callback(null, response);
        } else {
          sails.log.error(err);
          let error = 'Key ' + key + ' is not found!';
          sails.log.error(error);
          return callback(error, false);
        }
      });
    });
  },

  getByArrayKeys: function (keys, callback) {
    this.init(() => {
      this.client.mget( keys, function(err, response) {
        if (!err) {
          return callback(null, response);
        } else {
          sails.log.error(err);
          return callback(error, false);
        }
      });
    });
  }
};
