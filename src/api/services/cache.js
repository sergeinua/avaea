/* global sails */
module.exports = {

  client: null,

  init: function (cb) {
    if (!sails.config.globals.cacheStore) {
      sails.config.globals.cacheStore = 'memcached';
    }
    if (this.client) {
      return cb();
    }
    this.client = sails.services[sails.config.globals.cacheStore];
    this.client.init(cb);
  },

  store: function (key, value) {
    this.init(function () {
      this.client.store(key, value);
    });
  },

  //Get may take a single key, or an array of keys.
  get: function (key, callback) {
    this.init(function () {
      cache.client.get(key, callback);
    });
  }
};
