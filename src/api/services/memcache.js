/* global sails */
module.exports = {

  client: null,

  init: function () {
    if (!sails.config.connections.memcacheConf.exptime) {
      sails.config.connections.memcacheConf.exptime = 0;
    }
    if (this.client) {
      return this.client;
    }
    var mc = require('mc');
    this.client = new mc.Client(
      sails.config.connections.memcacheConf.host
      + ':' + sails.config.connections.memcacheConf.port
    );
    this.client.connect(function() {
      sails.log.info("Connected to the memcache on host '"
        + sails.config.connections.memcacheConf.host + "' on port "
        + sails.config.connections.memcacheConf.port + "!");
    });
  },

  store: function (key, value, callback) {
    this.init();
    this.client.add( key, JSON.stringify(value), { flags: 0, exptime: sails.config.connections.memcacheConf.exptime}, function(err, status) {
      if (!err) { 
        // sails.log.info( 'Key ' + key + ' saved' );
      } else {
        sails.log.error( 'Key ' + key + ' can\'t be saved!' );
        sails.log.error( err );
      }
    });
  },

  //Get may take a single key, or an array of keys.
  get: function (key, callback) {
    this.init();
    this.client.get( key, function(err, response) {
      if (!err) {
        return callback(response[key]);
      } else {
        sails.log.error('Key ' + key + ' is not found!');
      }
    });
  }
}