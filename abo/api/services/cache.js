/* global sails */
module.exports = {

  client: null,

  init: function (cb) {
    if (!sails.config.globals.cacheStore) {
      sails.config.globals.cacheStore = 'memcache';
    }
    if (this.client) {
      return cb();
    }
    this.client = sails.services[sails.config.globals.cacheStore];
    this.client.init(cb);
  },

  store: function (key, value) {
    this.init(() => {
      this.client.store(key, value);
    });
  },

  //Get may take a single key, or an array of keys.
  get: function (key, callback) {
    this.init(() => {
      this.client.get(key, callback);
    });
  },

  getByArrayKeys: function (key, callback) {
    this.init(() => {
      this.client.getByArrayKeys(key, callback);
    });
  }
};
