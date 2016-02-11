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

            var done = false;

            // if no data in memcache over 10 sec get result from DB
            setTimeout(() => {
              if (!done && row.result) {
                done = true;
                sails.log.info('Get search data from DB');
                var itins = row.result.result;
                itins.guid = guid;
                itins.priceRange = row.result.priceRange;
                itins.durationRange = row.result.durationRange;
                return callback(null, itins);
              }
            }, 10000);

            // if no data in DB and API doesn't respond over 30 sec then stop searching
            setTimeout(() => {
              if (!done) {
                done = true;
                var error = provider + ' API does not respond over 30s';
                sails.log.error(error);
                return callback(error, []);
              }
            }, 30000);

            // run async API search
            global[provider].flightSearch(guid, params, function (err) {
              if (err) {
                sails.log.error(err);
              }
              sails.log.info(provider + ' search finished!');

              // get search data from memcache
              var memcache_id = 'search_' + guid.replace(/\W+/g, '_');
              memcache.get(memcache_id, (err, search) => {
                if (!err && !_.isEmpty(search)) {
                  var searchData = JSON.parse(search);
                  memcache.get(searchData.itineraryKeys, function (err, itineraries) {
                    if (!err && !_.isEmpty(itineraries)) {
                      var itins = [];
                      _.each(itineraries, function (itinerary) {
                        itins.push(JSON.parse(itinerary));
                      });
                      // store API search data in DB
                      row.result = {
                        priceRange: searchData.ranges.priceRange,
                        durationRange: searchData.ranges.durationRange,
                        result: itins
                      };
                      row.save();

                      if (!done) {
                        itins.guid = guid;
                        itins.priceRange = searchData.ranges.priceRange;
                        itins.durationRange = searchData.ranges.durationRange;

                        done = true;
                        sails.log.info('Get from API');
                        return callback(null, itins);
                      }
                    }
                  });
                }
              });
            });
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

