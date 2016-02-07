/* global sails */
/**
* Search.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    hash: {
      type: 'string',
      required: true
    },
    params: { type: 'json' },
    result: { type: 'json' },
    user:   { model : 'User' } // who did search
  },

  getCurrentSearchGuid: function () {
    var d = new Date().getTime();
    this.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });

    return this.uuid;
  },
  uuid: '',

  getResult: function (params, callback) {
    var res = {};
    async.map(sails.config.flightapis.searchProvider, (provider, doneCb) => {
      utils.timeLog('search_' + provider);
      var guid = this.getCurrentSearchGuid() + '-' + provider;
      var hash = require('crypto').createHash('md5').update( JSON.stringify(params.searchParams) ).digest("hex");
      // remove all searches updated more than 24 hrs ago
      this.destroy({ updatedAt: { '<': sails.moment().startOf('day').subtract(1, 'days').toDate() } }, (err) => {
        if (err) {
          sails.log.error(err);
        }
        // find or create search with defined parameters for particular user
        this.findOrCreate({user: params.user.id, hash: hash}).exec((err, row) => {
          if (!err) {
            row.params = params.searchParams;
            // run async API search, after done all data should be in memcache
            global[provider].flightSearch(guid, params, function (err) {
              if (err) {
                sails.log.error(err);
              }
              sails.log.info(provider + ' search finished!');
            });
            var time = 0;
            var memcache_id = 'search_' + guid.replace(/\W+/g, '_');
            var done = false;
            // check memcache by interval
            var iId = setInterval(() => {
              time += 1000;
              if (!done) {
                memcache.get(memcache_id, (err, search) => {
                  if (!err && !_.isEmpty(search)) {
                    var searchData = JSON.parse(search);
                    memcache.get(searchData.itineraryKeys, function (err, itineraries) {
                      if (!err && !_.isEmpty(itineraries)) {
                        var itins = [];
                        _.each(itineraries, function (itinerary) {
                          itinerary = JSON.parse(itinerary);
                          itins.push(itinerary);
                        });
                        row.result = {
                          priceRange: searchData.ranges.priceRange,
                          durationRange: searchData.ranges.durationRange,
                          result: itins
                        };
                        row.save();

                        itins.guid = guid;
                        itins.priceRange = searchData.ranges.priceRange;
                        itins.durationRange = searchData.ranges.durationRange;

                        clearInterval(iId);
                        done = true;
                        sails.log.info('Get from API');
                        return callback(null, itins);
                      }
                    });
                  }
                });

                if (time > 10000 && row.result) { // if no data in memcache over 10s get result from DB
                  clearInterval(iId);
                  done = true;
                  sails.log.info('Get from DB');
                  var itins = row.result.result;
                  itins.guid = guid;
                  itins.priceRange = row.result.priceRange;
                  itins.durationRange = row.result.durationRange;
                  return callback(null, itins);
                } else if (time > 30000) { // if no data in DB and API doesn't respond over 30s then stop searching
                  clearInterval(iId);
                  done = true;
                  var error = provider + ' API does not respond over 30s';
                  sails.log.error(error);
                  return callback(error, []);
                }
              }
            }, 1000);
          } else {
            sails.log.error(err);
          }
        });
      });
      return doneCb(null);
    });
    return;
  }
};

