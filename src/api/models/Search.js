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

  serviceClass : {
    E:'Economy',
    P:'Premium',
    B:'Business',
    F:'First'
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

  //cache results functionality
  cache: function(searchId, row) {
    var searchResultKeys = [];
    var searchId = 'search_' + searchId.replace(/\W+/g, '_');
    async.map(row.result.result, (itinerary, doneCb) => {
      var id = 'itinerary_' + itinerary.id.replace(/\W+/g, '_');
      itinerary.searchId = searchId;
      searchResultKeys.push(id);
      memcache.store(id, itinerary);
      return doneCb(null);
    }, (err) => {
      var searchData = {
        ranges: {
          priceRange: row.result.priceRange,
          durationRange: row.result.durationRange
        },
        searchParams: row.params,
        itineraryKeys: searchResultKeys
      };
      memcache.store(searchId, searchData);
    });
  },

  getResult: function (params, callback) {
    var res = {};
    var guid = this.getCurrentSearchGuid();
    var hash = require('crypto').createHash('md5').update( JSON.stringify(params.searchParams) ).digest("hex");
    // remove all searches updated more than 24 hrs ago
    utils.timeLog('db_clean');
    this.destroy({ updatedAt: { '<': sails.moment().startOf('day').subtract(1, 'days').toDate() } }, (err) => {
      sails.log.info('remove all searches updated more than 24 hrs ago time: %s', utils.timeLogGetHr('db_clean'));
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
            if (!done && row.result && row.result.result && row.result.result.length) {
              done = true;
              sails.log.info('Get search data from DB');

              this.cache(guid, row);

              var itins = row.result.result;
              itins.guid = guid;
              itins.priceRange = row.result.priceRange;
              itins.durationRange = row.result.durationRange;
              return callback(null, itins);
            }
          }, 15000);

          var errorResult = (error) => {
            sails.log.error(error);
            // store empty search data in DB
            var result = [];
            row.result = {
              priceRange:    { minPrice: 0, maxPrice: 0 },
              durationRange: { minPrice: 0, maxPrice: 0 },
              result:        result
            };
            row.save();

            this.cache(guid, row);

            result.guid = guid;
            result.priceRange = row.result.priceRange;
            result.durationRange = row.result.durationRange;
            return callback(error, result);
          };
          // if no data in DB and APIs doesn't respond over 30 sec then stop searching
          setTimeout(() => {
            if (!done) {
              done = true;
              return errorResult('APIs does not respond over 30s');
            }
          }, 30000);

          var errors = [];
          async.map(sails.config.flightapis.searchProvider, (provider, doneCb) => {
            utils.timeLog('search_' + provider);
            // run async API search
            global[provider].flightSearch(guid, params, (err, result) => {
              sails.log.info(provider + ' search finished!');
              if (err) {
                errors.push(err);
                result = [];
              }
              return doneCb(null, result);
            });
          }, (err, results) => {
            if (errors.length) {
              if (errors.length == sails.config.flightapis.searchProvider.length) {
                // if all APIs return error then stop processing
                err = errors.join("\n");
              } else {
                // show errors in log but continue processing if at least one API works correctly
                sails.log.error("Some errors have occurred on search:\n%s", errors.join("\n"));
              }
            }
            if (!err) {
              //de-dup logic
              var _filteredItins = {};
              results.forEach((provItins) => {
                provItins.forEach((itin) => {
                  // save itinerary with lowest price in filter
                  if (!_filteredItins[itin.key] || (_filteredItins[itin.key].price > itin.price)) {
                    _filteredItins[itin.key] = itin;
                  }
                });
              });
              var resArr = [];
              var minDuration, maxDuration, minPrice, maxPrice;
              for(var key in _filteredItins) {

                if (minPrice === undefined || minPrice > parseFloat(_filteredItins[key].price)) {
                  minPrice = Math.floor(parseFloat(_filteredItins[key].price));
                }

                if (maxPrice === undefined || maxPrice < parseFloat(_filteredItins[key].price)) {
                  maxPrice = Math.ceil(parseFloat(_filteredItins[key].price));
                }

                if (minDuration === undefined || minDuration > _filteredItins[key].durationMinutes) {
                  minDuration = _filteredItins[key].durationMinutes;
                }
                if (maxDuration === undefined || maxDuration < _filteredItins[key].durationMinutes) {
                  maxDuration = _filteredItins[key].durationMinutes;
                }
                resArr.push(_filteredItins[key]);
              }
              _filteredItins = undefined; // clearing filtered hash that's no longer needed
              resArr.priceRange = {
                minPrice: minPrice || 0,
                maxPrice: maxPrice || 0
              };
              resArr.durationRange = {
                minDuration: minDuration || 0,
                maxDuration: maxDuration || 0
              };

              // store API search data in DB even if it's empty
              utils.timeLog('db_save');
              row.result = {
                priceRange: resArr.priceRange,
                durationRange: resArr.durationRange,
                result: resArr
              };
              this.saveResult(row);
              if (!done) {
                done = true;
                sails.log.info('Get search data from API');

                this.cache(guid, row);

                resArr.guid = guid;
                return callback(null, resArr);
              }
            } else {
              if (!done) {
                done = true;
                return errorResult(err);
              } else {
                sails.log.error(err);
              }
            }
          });
        } else {
          sails.log.error(err);
        }
      });
    });
  },

  saveResult: function (data) {
    utils.timeLog('raw_db_save');
    this.query(
      'UPDATE ' + this.tableName + ' SET params = $1, result = $2 WHERE id = $3',
      [data.params, data.result, data.id],
      function(err) {
        if (err) {
          sails.log.error(err);
        } else {
          sails.log.info('store API search data in DB (raw query) time: %s', utils.timeLogGetHr('raw_db_save'));
        }
      }
    );
  },

  /**
   * Used in the booking as temporary link for last result of the flights search
   * @returns {string}
   */
  getHeadContent: function(searchId) {
    return '<div class="back-history" style="display: inline-block;" onclick="window.location.href=\'/result?s='+searchId+'\'">Back</div>';
  },

  getStatistics: function (itineraries) {
    var airportsStatistic = [];
    itineraries.forEach(function (item) {
      if (!item.citypairs) return;
      item.citypairs.forEach(function (_it) {
        if (_.isArray(_it.path) && _it.path.length) {
          _it.path.forEach(function (path) {
            var indxCode = _.findIndex(airportsStatistic, {code: path});
            if (indxCode == -1) {
              airportsStatistic.push({code: path, count: 1});
            } else {
              airportsStatistic[indxCode].count++;
            }
          });
        }
      });
    });

    var searchServicesData = {},
      searchServices = _.uniq(_.map(itineraries, function (item) {
        return item.service;
      }));

    if (searchServices.length) {
      searchServicesData = _.map(searchServices, function (item) {
        var _tmpFilter = _.filter(itineraries, {service: item}) || [];
        return {
          name: item,
          count: _tmpFilter.length,
          time: utils.timeLogGet(item),
          timeStr: utils.timeLogGetHr(item)
        };
      });
    }

    return {
      searchInfoByProviders : searchServicesData,
      searchInfoAirports   : (airportsStatistic.length ? _.sortBy(airportsStatistic, 'count').reverse() : [])
    };
  }
};

