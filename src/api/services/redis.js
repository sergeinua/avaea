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
    var redis = require('redis');
    this.client = new redis.createClient(
      sails.config.connections.redisConf.port,
      sails.config.connections.redisConf.host,
      {
        prefix : sails.config.connections.redisConf.prefix
      }
    );
    // this.client.connect(function () {
    //   sails.log.info('Connected to memcache');
    return cb();
    // });
  },

  store: function (key, value) {
    this.init(function () {
      redis.client.setex( key, sails.config.connections.redisConf.exptime, JSON.stringify(value), function(err, status) {
        if (err && err.type != 'NOT_STORED') {
          sails.log.error( 'Key ' + key + ' can\'t be saved!' );
          sails.log.error( err );
        }
      });
    });
  },

  //Get may take a single key, or an array of keys.
  get: function (key, callback) {
    this.init(function() {
      redis.client.get( key, function(err, response) {
        // sails.log.info(Object.keys(response).length);
        if (!err) {
          if ( Object.keys(response).length > 1 ) {
            return callback(null, response);
          }
          return callback(null, response[key]);
        } else {
          sails.log.error(err);
          var error = 'Key ' + key + ' is not found!';
          sails.log.error(error);
          return callback(error, false);
        }
      });
    });
  }
};
