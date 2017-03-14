/* global sails */
let lodash = require('lodash');
/**
* Search.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/


module.exports = {
  requestDateFormat: 'DD/MM/YYYY',
  dateFormat: 'YYYY-MM-DD',

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
    F:'First Class'
  },

  getDefault: function (req) {
    if (_.isEmpty(req.session)) {
      req.session = {};
    }

    const today = sails.moment(Date.now()).startOf('day');
    let useSessionDate = false;
    let departureDate = sails.moment().add(2, 'w');
    let returnDate = sails.moment().add((14 + 10), 'd');

    let sessionDate;
    if (!_.isEmpty(req.session.departureDate) &&
      (sessionDate = sails.moment(req.session.departureDate)).isValid() &&
      sessionDate.diff(today) >= 0
    ) {
      departureDate = sessionDate;
      useSessionDate = true;
    }

    if (useSessionDate &&
      !_.isEmpty(req.session.returnDate) &&
      (sessionDate = sails.moment(req.session.returnDate)).isValid() &&
      sessionDate.diff(today) >= 0
    ) {
      returnDate = sessionDate;
    }

    let tmpDefaultPassengers = {
      adult: 1,
      senior: 0,
      child: 0,
      lapInfant: 0,
      seatInfant: 0
    };

    return {
      DepartureLocationCode     : !_.isString(req.session.DepartureLocationCode) ? '' : req.session.DepartureLocationCode,
      ArrivalLocationCode       : !_.isString(req.session.ArrivalLocationCode) ? '' : req.session.ArrivalLocationCode,
      DepartureLocationCodeCity : !_.isString(req.session.DepartureLocationCodeCity) ? '' : req.session.DepartureLocationCodeCity,
      ArrivalLocationCodeCity   : !_.isString(req.session.ArrivalLocationCodeCity) ? '' : req.session.ArrivalLocationCodeCity,
      CabinClass                : !_.isString(req.session.CabinClass) ? 'E' : req.session.CabinClass,
      departureDate             : departureDate.format(this.dateFormat),
      returnDate                : returnDate.format(this.dateFormat),
      passengers                : !_.isEmpty(req.session.passengers) && _.isObject(req.session.passengers) ? req.session.passengers : tmpDefaultPassengers,
      flightType                : !_.isString(req.session.flightType) ? 'round_trip' : req.session.flightType.toLowerCase()
    };
  },

  mutateDateToRequestFormat: function(date, currentFormat) {
    let tmpDate;
    return date && (tmpDate = sails.moment(date, (currentFormat || this.dateFormat))).isValid() ?
      tmpDate.format(this.requestDateFormat) : '';
  },

  validateSearchParams: function (searchParams) {
    let _Error = false;
    let searchApiMaxDays = sails.config.flightapis.searchApiMaxDays;
    let moment_dp = sails.moment(searchParams.departureDate, this.dateFormat, true);
    let moment_rp = sails.moment(searchParams.returnDate, this.dateFormat, true);
    let moment_now = sails.moment();
    let _adults = parseInt(searchParams.passengers.adult) + parseInt(searchParams.passengers.senior),
        _infants = parseInt(searchParams.passengers.seatInfant) + parseInt(searchParams.passengers.lapInfant),
        _children = parseInt(searchParams.passengers.child);

    // Check depart date
    if (moment_dp.isValid() &&
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

    if (!searchParams.departureDate || !moment_dp.isValid()) {
      _Error = 'Error.Search.Validation.departureDate.Empty';
    }

    // Check existence of the return date for the round trip
    if (searchParams.flightType == 'round_trip') {
      if (!searchParams.returnDate || !moment_rp.isValid()) {
        _Error = 'Error.Search.Validation.returnDate.Empty';
      }

      if (moment_dp && moment_rp && moment_rp.isBefore(moment_dp, 'day')) {
        _Error = 'Error.Search.Validation.returnDate.Before';
      }
    }

    // Check airports selection
    if (!searchParams.DepartureLocationCode || (searchParams.DepartureLocationCode && !searchParams.DepartureLocationCode.trim())) {
      _Error = 'Error.Search.Validation.DepartureLocationCode.Empty';
    }

    if (!searchParams.ArrivalLocationCode || (searchParams.ArrivalLocationCode && !searchParams.ArrivalLocationCode.trim())) {
      _Error = 'Error.Search.Validation.ArrivalLocationCode.Empty';
    }

    if (searchParams.DepartureLocationCode == searchParams.ArrivalLocationCode) {
      _Error = 'Error.Search.Validation.LocationCode.Same';
    }

    if (searchParams.passengers) {
      if (!(_adults > 0 || (_children > 0 && _infants == 0))) {
        _Error = 'Error.Search.Validation.Passengers.Empty';
      }

      if (((_adults + _children) < 1) || ((_adults + _children + _infants) > 4)) {
        _Error = 'Error.Search.Validation.Passengers.OutOfRange';
      }
    } else {
      _Error = 'Error.Search.Validation.Passengers.Empty';
    }

    if (!searchParams.CabinClass || !Search.serviceClass[searchParams.CabinClass]) {
      _Error = 'Error.Search.Validation.CabinClass.Empty';
    }
    return _Error;
  },

  getCurrentSearchGuid: function () {
    let d = new Date().getTime();
    this.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });

    return this.uuid;
  },
  uuid: '',

  //cache results functionality
  cache: function(searchId, row) {
    let searchResultKeys = [];
    searchId = 'search_' + searchId.replace(/\W+/g, '_');
    async.map(row.result.result, (itinerary, doneCb) => {
      let id = 'itinerary_' + itinerary.id.replace(/\W+/g, '_');
      itinerary.searchId = searchId;
      searchResultKeys.push(id);
      cache.store(id, itinerary);
      return doneCb(null);
    }, (err) => {
      let searchData = {
        ranges: {
          priceRange: row.result.priceRange,
          durationRange: row.result.durationRange
        },
        searchParams: row.params,
        itineraryKeys: searchResultKeys
      };
      cache.store(searchId, searchData);
    });
  },


  getProviders: function (params, cb) {
    let providers = _.clone(sails.config.flightapis.searchProvider, true);

    //check farelogix
    let isCanada = 0,
      isUSA = false;

    Airports.find({
      where: {
        or : [
          {iata_3code: params.searchParams.DepartureLocationCode},
          {iata_3code: params.searchParams.ArrivalLocationCode}
        ]
      }
    }).exec((err, result) => {
      if (err) {
        onvoya.log.error(err);
      } else {
        result.map(function(item) {
          if (item.country == 'Canada') {
            isCanada++;
          }
          isUSA = isUSA || (item.country == 'United States');
        });
        if ( isCanada == 2 || (isCanada == 1 && isUSA) ) {
          onvoya.log.info('CA<->US or CA<->CA flight: using [farelogix]');
        } else {
          onvoya.log.info('Need to remove [farelogix]');
          _.remove(providers, function(item) {
            return item == 'farelogix';
          });
        }
      }
      return cb(providers);
    });
  },

  getResult: function (params, callback) {
    let guid = this.getCurrentSearchGuid();
    cache.init(function(){});

    let errors = [];

    this.getProviders(params, (providers) => {
      async.map(providers, (provider, doneCb) => {
        utils.timeLog('search_' + provider);
        let done = false;
        setTimeout(() => {
          if (!done) {
            done = true;
            errors.push(provider + ' API does not respond over 30s');
            return doneCb(null, []);
          }
        }, 30000);
        // run async API search
        global[provider].flightSearch(guid, params, (err, result) => {
          onvoya.log.info(provider + ' search finished!');
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
          if (errors.length == providers.length) {
            // if all APIs return error then stop processing
            err = errors.join("\n");
          } else {
            // show errors in log but continue processing if at least one API works correctly
            onvoya.log.error("Some errors have occurred on search:\n%s", errors.join("\n"));
          }
        }
        if (!err) {
          //de-dup logic
          let _filteredItins = {};
          results.forEach((provItins) => {
            provItins.forEach((itin) => {
              // DEMO-850 and DEMO-1185
              let should_hide_the_fare  = false;
	      let hidded_airlines_codes = ['AA','AF','DL','EK','KL','VS'];
              itin.citypairs.map(function(pair) {
                pair.flights.map(function(flight) {
                  should_hide_the_fare = should_hide_the_fare || hidded_airlines_codes.includes(flight.airlineCode);
                });
              });
              // save itinerary with lowest price in filter
              if (!should_hide_the_fare && (!_filteredItins[itin.key] || (_filteredItins[itin.key].price > itin.price))) {
                _filteredItins[itin.key] = itin;
              }
            });
          });
          // if no itineraries and at least one api has errors then return these errors
          if (lodash.isEmpty(_filteredItins) && errors.length) {
            return callback(errors.join("\n"), []);
          }

          let resArr = [];
          let row = {};
          let minDuration, maxDuration, minPrice, maxPrice;
          for (let key in _filteredItins) {

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

          onvoya.log.info('Get search data from API');

          this.cache(guid, row);

          resArr.guid = guid;
          return callback(null, resArr);
        } else {
          onvoya.log.error(err);
          let result = [];

          result.guid = guid;
          result.priceRange = { minPrice: 0, maxPrice: 0 };
          result.durationRange = { minPrice: 0, maxPrice: 0 };
          return callback(err, result);
        }
      });

    });

  },

  getStatistics: function (itineraries) {
    let airportsStatistic = [];
    itineraries.forEach(function (item) {
      if (!item.citypairs) return;
      item.citypairs.forEach(function (_it) {
        if (_.isArray(_it.path) && _it.path.length) {
          _it.path.forEach(function (path) {
            let indxCode = _.findIndex(airportsStatistic, {code: path});
            if (indxCode == -1) {
              airportsStatistic.push({code: path, count: 1});
            } else {
              airportsStatistic[indxCode].count++;
            }
          });
        }
      });
    });

    let searchServicesData = {},
      searchServices = _.uniq(_.map(itineraries, function (item) {
        return item.service;
      }));

    if (searchServices.length) {
      searchServicesData = _.map(searchServices, function (item) {
        let _tmpFilter = _.filter(itineraries, {service: item}) || [];
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
    let guid = this.getCurrentSearchGuid();
    let done = false;
    let res = '';
    let errorResult = (error, text) => {
      let errors = {
        'timeout': 'APIs does not respond over 30s',
        'api': text || 'Undefined API error',
        'not_found': 'Cancelations were not found in Fare Rules'
      };
      onvoya.log.error(errors[error]);
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
        onvoya.log.info(params.service + ' get Fare Rules finished!');
        if (err) {
          if (!done) {
            done = true;
            return errorResult('api', err);
          } else {
            onvoya.log.error(err);
          }
        } else {
          if (result.SubSection && result.SubSection.Text) {
            let m = result.SubSection.Text.match(/\s*CANCELLATIONS\s+([\s\S]*?)\.\s+/);
            if (m && m[1]) {
              let _part = m[1].replace(/\r?\n+/g, '').replace(/\s+/g, ' ').trim();
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

