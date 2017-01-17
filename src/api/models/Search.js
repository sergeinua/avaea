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

  validateSearchParams: function (searchParams) {
    var _Error = false;
    var searchApiMaxDays = sails.config.flightapis.searchApiMaxDays;

    var departureDate = searchParams.departureDate;
    var moment_dp = sails.moment(searchParams.departureDate, "DD/MM/YYYY");
    var returnDate = searchParams.returnDate;
    var moment_rp = sails.moment(searchParams.returnDate, "DD/MM/YYYY");

    var moment_now = sails.moment();
    // Check depart date
    if (moment_dp &&
        (
          moment_dp.isBefore(moment_now, 'day') ||
          moment_dp.diff(moment_now, 'days') >= searchApiMaxDays - 1
        )
    ) {
      _Error = 'Error.Search.Validation.departureDate.MaxDays';
    }

    // Check return date
    if (searchParams.flightType == 'round_trip') {
      if (moment_rp && moment_rp.diff(moment_now, 'days') >= searchApiMaxDays - 1) {
        _Error = 'Error.Search.Validation.returnDate.MaxDays';
      }
    }

    if (!searchParams.departureDate) {
      _Error = 'Error.Search.Validation.departureDate.Empty';
    }

    // Check existence of the return date for the round trip
    if (searchParams.flightType == 'round_trip') {
      if (!searchParams.returnDate) {
        _Error = 'Error.Search.Validation.returnDate.Empty';
      }

      if (moment_dp && moment_rp && moment_rp.isBefore(moment_dp, 'day')) {
        _Error = 'Error.Search.Validation.returnDate.Before';
      }
    }

    // Check airports selection
    if (!searchParams.DepartureLocationCode.trim()) {
      _Error = 'Error.Search.Validation.DepartureLocationCode.Empty';
    }
    if (!searchParams.ArrivalLocationCode.trim()) {
      _Error = 'Error.Search.Validation.ArrivalLocationCode.Empty';
    }
    if (searchParams.DepartureLocationCode == searchParams.ArrivalLocationCode) {
      _Error = 'Error.Search.Validation.LocationCode.Same';
    }

    if (!searchParams.passengers) {
      _Error = 'Error.Search.Validation.Passengers.Empty';
    }

    if (!searchParams.CabinClass || !Search.serviceClass[searchParams.CabinClass]) {
      _Error = 'Error.Search.Validation.CabinClass.Empty';
    }
    return _Error;
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
    var guid = this.getCurrentSearchGuid();
    memcache.init(function(){});

    var errors = [];
    async.map(sails.config.flightapis.searchProvider, (provider, doneCb) => {
      utils.timeLog('search_' + provider);
      var done = false;
      setTimeout(() => {
        if (!done) {
          done = true;
          errors.push(provider + ' API does not respond over 30s');
          return doneCb(null, []);
        }
      }, 30000);
      // run async API search
      global[provider].flightSearch(guid, params, (err, result) => {
        sails.log.info(provider + ' search finished!');
        if (err) {
          errors.push(err);
          result = [];
        }
        if (!done) {
          done = true;
          return doneCb(null, result);
        }
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
            //DEMO-850 Stop showing AA flights
            var isAA = false;
            itin.citypairs.map(function(pair) {
              pair.flights.map(function(flight) {
                isAA = isAA || (flight.airlineCode == "AA");
              });
            });
            // save itinerary with lowest price in filter
            if (!isAA && (!_filteredItins[itin.key] || (_filteredItins[itin.key].price > itin.price))) {
              _filteredItins[itin.key] = itin;
              // var _prevCabin='', _cur_itin=null;
              // itin.citypairs.forEach(function (_cityPair) {
              //   _cityPair.flights.forEach(function (_curFlight) {
              //     if (_prevCabin && _prevCabin != _curFlight.cabinClass) {
              //       _cur_itin = itin;
              //       // sails.log.warn('_cabin', itin.citypairs[0].flights[0].cabinClass);
              //     }
              //     _prevCabin = _curFlight.cabinClass;
              //   });
              // });
              // if (_cur_itin) {
              //   sails.log.warn('_prov_itin', require('util').inspect(_cur_itin, {showHidden: true, depth: null}));
              // }
            }
          });
        });
        var resArr = [];
        var row = {};
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

        row.result = {
          priceRange: resArr.priceRange,
          durationRange: resArr.durationRange,
          result: resArr
        };
        row.params = params;

        sails.log.info('Get search data from API');

        this.cache(guid, row);

        resArr.guid = guid;
        return callback(null, resArr);
      } else {
        sails.log.error(err);
        var result = [];

        result.guid = guid;
        result.priceRange = { minPrice: 0, maxPrice: 0 };
        result.durationRange = { minPrice: 0, maxPrice: 0 };
        return callback(err, result);
      }
    });
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
  },

  getRefundType: function (params, callback) {
    var guid = this.getCurrentSearchGuid();
    var done = false;
    var res = '';
    var errorResult = (error, text) => {
      var errors = {
        'timeout': 'APIs does not respond over 30s',
        'api': text || 'Undefined API error',
        'not_found': 'Cancelations were not found in Fare Rules'
      };
      sails.log.error(errors[error]);
      return callback(errors[error], res);
    };
    // if no data in DB and APIs doesn't respond over 30 sec then stop searching
    setTimeout(() => {
      if (!done) {
        done = true;
        return errorResult('timeout');
      }
    }, 30000);

    if (params.service && _.indexOf(sails.config.flightapis.searchProvider, params.service) != -1) {
      utils.timeLog('getRefundType_' + params.service);
      // run async API search
      global[params.service].fareRules(guid, params, (err, result) => {
        sails.log.info(params.service + ' get Fare Rules finished!');
        if (err) {
          if (!done) {
            done = true;
            return errorResult('api', err);
          } else {
            sails.log.error(err);
          }
        } else {
          if (result.SubSection && result.SubSection.Text) {
            var m = result.SubSection.Text.match(/\s*CANCELLATIONS\s+([\s\S]*?)\.\s+/);
            if (m && m[1]) {
              var _part = m[1].replace(/\r?\n+/g, '').replace(/\s+/g, ' ').trim();
              if (!_part) {
                return errorResult('not_found');
              }
              res = _part;
            }
          }
          if (!done) {
            done = true;
            return callback(null, res);
          }
        }
      });
    }
  }
};

