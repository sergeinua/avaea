/* global sails */
module.exports = {

  client: null,

  init: function (cb) {
    if (!sails.config.connections.memcacheConf.exptime) {
      sails.config.connections.memcacheConf.exptime = 0;
    }
    if (this.client) {
      return cb();
    }
    var mc = require('mc');
    this.client = new mc.Client(
      sails.config.connections.memcacheConf.host
      + ':' + sails.config.connections.memcacheConf.port
    );
    this.client.connect(function () {
      onvoya.log.info('Connected to memcache');
      return cb();
    });
  },

  store: function (key, value) {
    this.init(function () {
      memcache.client.set( key, JSON.stringify(value), { flags: 0, exptime: sails.config.connections.memcacheConf.exptime}, function(err, status) {
        if (err && err.type != 'NOT_STORED') {
          onvoya.log.error( 'Key ' + key + ' can\'t be saved!' );
          onvoya.log.error( err );
        }
      });
    });
  },

  //Get may take a single key, or an array of keys.
  get: function (key, callback) {
    this.init(function() {
      memcache.client.get( key, function(err, response) {
        // onvoya.log.info(Object.keys(response).length);
        if (!err) {
          if ( Object.keys(response).length > 1 ) {
            return callback(null, response);
          }
          return callback(null, response[key]);
        } else {
          onvoya.log.error(err);
          var error = 'Key ' + key + ' is not found!';
          onvoya.log.error(error);
          return callback(error, false);
        }
      });
    });
  },

  getByArrayKeys: function (key, callback) {
    this.get(key, callback);
  }
};
