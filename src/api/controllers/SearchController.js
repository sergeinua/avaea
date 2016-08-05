/* global _ */
/* global tPrediction */
/* global iPrediction */
/* global UserAction */
/* global Search */
/* global async */
/* global Tile */
/* global sails */
var util = require('util');
/**
 * SearchController
 *
 * @description :: Server-side logic for managing searches
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  /**
   * `SearchController.index()`
   */
  index: function (req, res) {

    if (_.isEmpty(req.session)) {
      req.session = {};
    }
    var tmpDefaultDepDate = sails.moment().add(2, 'w');
    var tmpDefaultRetDate = sails.moment().add(4, 'w');
    var nextFirstDateMonth = sails.moment().add(1, 'M').startOf('month');

    if (nextFirstDateMonth.diff(tmpDefaultDepDate, 'days') > tmpDefaultRetDate.diff(nextFirstDateMonth, 'days')) {
      tmpDefaultRetDate = sails.moment(tmpDefaultDepDate.format('YYYY-MM-DD'), 'YYYY-MM-DD');
      tmpDefaultRetDate = tmpDefaultRetDate.endOf('month');
    } else {
      tmpDefaultDepDate = sails.moment(tmpDefaultRetDate.format('YYYY-MM-DD'), 'YYYY-MM-DD');
      tmpDefaultDepDate = tmpDefaultDepDate.startOf('month');
    }

    var params = {
      DepartureLocationCode: _.isEmpty(req.session.DepartureLocationCode) ? '' : req.session.DepartureLocationCode,
      ArrivalLocationCode: _.isEmpty(req.session.ArrivalLocationCode) ? '' : req.session.ArrivalLocationCode,
      CabinClass: _.isEmpty(req.session.CabinClass) ? '' : req.session.CabinClass,
      departureDate: _.isEmpty(req.session.departureDate) ? tmpDefaultDepDate.format('YYYY-MM-DD') : req.session.departureDate,
      returnDate: _.isEmpty(req.session.returnDate) ? tmpDefaultRetDate.format('YYYY-MM-DD') : req.session.returnDate,
      passengers: _.isEmpty(req.session.passengers) ? '' : req.session.passengers,
      flightType: _.isEmpty(req.session.flightType) ? '' : req.session.flightType
    };
    var error;
    if (!_.isEmpty(req.session.flash)) {
      error = [req.session.flash];
      req.session.flash = '';
    }

    if (!_.isEmpty(req.session.tiles)) {
      sails.log.info('New Default tile prediction set');
      Tile.setTiles(null);
      req.session.tiles = null;
    }

    // Fetch City names by location codes and put to the template
    async.parallel({
        depart_city: function(callback) {
          if (_.isEmpty(params.DepartureLocationCode)) {
            return callback(null, '');
          }

          Airports.findOne({iata_3code: params.DepartureLocationCode})
            .exec(function (err, result) {
              if (err) {
                return callback(err);
              }

              callback(null, result);
            });
        },
        arriv_city: function(callback) {
          if (_.isEmpty(params.ArrivalLocationCode)) {
            return callback(null, '');
          }

          Airports.findOne({iata_3code: params.ArrivalLocationCode})
            .exec(function (err, result) {
              if (err) {
                return callback(err);
              }

              callback(null, result);
            });
        }
      },
      // Final callback
      function(err, results) {
        if (!err) {
          params.departCity = results.depart_city.city;
          params.arrivCity = results.arriv_city.city;
        }

        return res.ok(
          {
            title         : 'Search for flights',
            user          : req.user,
            defaultParams : params,
            serviceClass  : Search.serviceClass,
            errors        : error,
            head_title    : 'Search for flights with Avaea Agent'
          },
          'search/index'
        );
      }
    );
  },

  /**
   * `SearchController.result()`
   */
  result: function (req, res) {
    utils.timeLog('search_result');
    var savedParams = {};
    res.locals.searchId = null;
    if (req.param('s')) {
      try {
        res.locals.searchId = req.param('s');
        var atob = require('atob');
        var savedParamsTmp = JSON.parse(atob(req.param('s')));
        _.forEach(savedParamsTmp, function (param) {
          savedParams[param.name] = param.value.trim().toUpperCase();
        });
      } catch (e) {
        sails.log.info('Unable restore search parameters from encoded string');
      }
    }
    var
      params = {
        user: req.user,
        session: req.session,
        searchParams: {
          DepartureLocationCode: !_.isEmpty(savedParams.originAirport)?savedParams.originAirport:req.param('originAirport').trim().toUpperCase(),
          ArrivalLocationCode: !_.isEmpty(savedParams.destinationAirport)?savedParams.destinationAirport:req.param('destinationAirport').trim().toUpperCase(),
          CabinClass: !_.isEmpty(savedParams.preferedClass)?savedParams.preferedClass:req.param('preferedClass').toUpperCase(),
          passengers: !_.isEmpty(savedParams.passengers)?savedParams.passengers:req.param('passengers', 1),
          topSearchOnly: !_.isEmpty(savedParams.topSearchOnly)?savedParams.topSearchOnly:req.param('topSearchOnly', 0),
          flightType: !_.isEmpty(savedParams.flightType)?savedParams.flightType:req.param('passengers', 'round_trip').trim().toLowerCase(),
          returnDate: '',
          voiceSearchQuery:  req.param('voiceSearchQuery', '').trim()
        }
      },
      depDate = new Date();

    if (!_.isEmpty(savedParams.departureDate) && !isNaN(Date.parse(savedParams.departureDate))) {
      depDate = sails.moment(savedParams.departureDate, 'YYYY-MM-DD').toDate();
    } else {
      if (!isNaN(Date.parse(req.param('departureDate')))) {
        depDate = sails.moment(req.param('departureDate'), 'YYYY-MM-DD').toDate();
      }
    }
    params.searchParams.departureDate = sails.moment(depDate).format('DD/MM/YYYY');
    req.session.departureDate = sails.moment(depDate).format('YYYY-MM-DD');
    if (!_.isEmpty(savedParams.returnDate) && !isNaN(Date.parse(savedParams.returnDate))) {
      var retDate = sails.moment(savedParams.returnDate, 'YYYY-MM-DD').toDate();
      params.searchParams.returnDate = sails.moment(retDate).format('DD/MM/YYYY');
      req.session.returnDate = sails.moment(retDate).format('YYYY-MM-DD');
    } else {
      if (!isNaN(Date.parse(req.param('returnDate')))) {
        var retDate = sails.moment(req.param('returnDate'), 'YYYY-MM-DD').toDate();
        params.searchParams.returnDate = sails.moment(retDate).format('DD/MM/YYYY');
        req.session.returnDate = sails.moment(retDate).format('YYYY-MM-DD');
      }
    }
    title = params.searchParams.DepartureLocationCode +' '+(params.searchParams.returnDate?'&#8644;':'&rarr;')+' '+ params.searchParams.ArrivalLocationCode;
    iPrediction.getUserRank(req.user.id, params.searchParams);

//    var md5 = require("blueimp-md5").md5;
//    req.session.search_params_hash = md5(params.DepartureLocationCode+params.ArrivalLocationCode+params.CabinClass);
    req.session.search_params_hash = params.searchParams.CabinClass;
    req.session.search_params_raw  = params.searchParams;
    req.session.time_log = [];
    // Remember as previous user request for search/index view
    req.session.DepartureLocationCode = params.searchParams.DepartureLocationCode;
    req.session.ArrivalLocationCode = params.searchParams.ArrivalLocationCode;
    req.session.CabinClass = params.searchParams.CabinClass;
    req.session.passengers = params.searchParams.passengers;
    req.session.flightType = params.searchParams.flightType;

    Tile.tiles = _.clone(Tile.default_tiles, true);
    // tPrediction.getUserTiles(req.user.id, req.session.search_params_hash);

    Search.getResult(params, function ( err, itineraries ) {
      sails.log.info('Found itineraries: %d', itineraries.length);

      utils.timeLog('sprite_map'); // start sprite_map timer
      utils.timeLog('tiles_data'); // start tiles_data timer
      async.parallel({
        departure: (doneCb) => {
          Airports.findOne({iata_3code: params.searchParams.DepartureLocationCode}).exec((_err, _row) => {
            if (_err) {
              sails.log.error(_err);
              // non-empty error will cause that the main callback is immediately called with the value of the error
              // but we want to be sure that all tasks are done before the main callback is called therefore set it to null here
              _err = null;
            }
            return doneCb(_err, _row);
          });
        },
        arrival: (doneCb) => {
          Airports.findOne({iata_3code: params.searchParams.ArrivalLocationCode}).exec((_err, _row) => {
            if (_err) {
              sails.log.error(_err);
              // non-empty error will cause that the main callback is immediately called with the value of the error
              // but we want to be sure that all tasks are done before the main callback is called therefore set it to null here
              _err = null;
            }
            return doneCb(_err, _row);
          });
        },
        iconSpriteMap: (doneCb) => {
          if (!itineraries.length) {
            sails.log.info('Icon Sprite Map time: %s', utils.timeLogGetHr('sprite_map'));
            return doneCb(null, {});
          }
          Airlines.makeIconSpriteMap(function (_err, _iconSpriteMap) {
            if (_err) {
              sails.log.error(_err);
              // non-empty error will cause that the main callback is immediately called with the value of the error
              // but we want to be sure that all tasks are done before the main callback is called therefore set it to null here
              _err = null;
              _iconSpriteMap = {};
            }
            sails.log.info('Icon Sprite Map time: %s', utils.timeLogGetHr('sprite_map'));
            return doneCb(_err, _iconSpriteMap);
          });
        },
        tiles: (doneCb) => {
          if (!itineraries.length) {
            sails.log.info('Tiles time: %s', utils.timeLogGetHr('tiles_data'));
            return doneCb(null, []);
          }
          var algorithm = sails.config.globals.bucketizationFunction;

          if (_.isEmpty(algorithm) || typeof Tile[algorithm] != 'function') {
            algorithm = 'getTilesData';
          }

          if (!req.session.showTiles) {
            algorithm = 'getTilesDataEmpty';
          }
          Tile[algorithm](itineraries, params.searchParams, function (_err, _itineraries, _tiles) {
            if (_err) {
              sails.log.error(_err);
              // non-empty error will cause that the main callback is immediately called with the value of the error
              // but we want to be sure that all tasks are done before the main callback is called therefore set it to null here
              _err = null;
              _tiles = [];
            } else {
              itineraries = _itineraries;
              UserAction.saveAction(req.user, 'order_tiles', _tiles);
            }
            sails.log.info('Tiles time: %s', utils.timeLogGetHr('tiles_data'));
            return doneCb(_err, _tiles);
          });
        }
      }, (err, result) => {
        if (err) {
          // something went wrong in our parallel tasks therefore log this error and set default values of result
          sails.log.error(err);
          result.departure = result.departure || {};
          result.arrival = result.arrival || {};
          result.iconSpriteMap = result.iconSpriteMap || {};
          result.tiles = result.tiles || [];
        }
        // Define max filter items
        var max_filter_items = 0;
        for (var key in result.tiles) {
          var cur_tile_items = 0;
          result.tiles[key].filters.forEach(function (filter) {
            if (parseInt(filter.count) > 0) {
              cur_tile_items++;
            }
          });
          max_filter_items = cur_tile_items > max_filter_items ? cur_tile_items : max_filter_items;
        }

        var itinerariesData = _.merge({
          searchUuid    : itineraries.guid,
          searchParams  : params.searchParams,
          countAll      : itineraries.length,
          timeWorkStr   : utils.timeLogGetHr('search_result'),
          timeWork      : utils.timeLogGet('search_result'),
          error         : err
        }, Search.getStatistics(itineraries));
        UserAction.saveAction(req.user, 'search', itinerariesData, function () {
          User.publishCreate(req.user);
        });
        sails.log.info('Search result processing total time: %s', utils.timeLogGetHr('search_result'));

        return res.ok({
          user: req.user,
          title: title,
          tiles: result.tiles,
          max_filter_items: max_filter_items,
          searchParams: {
            DepartureLocationCode: params.searchParams.DepartureLocationCode,
            ArrivalLocationCode: params.searchParams.ArrivalLocationCode,
            departureDate: sails.moment(depDate).format('DD MMM'),
            returnDate: (retDate) ? sails.moment(retDate).format('DD MMM') : '',
            CabinClass: Search.serviceClass[params.searchParams.CabinClass] + ((params.searchParams.CabinClass == 'F') ? ' class' : ''),
            passengers: params.searchParams.passengers,
            topSearchOnly: params.searchParams.topSearchOnly,
            flightType: params.searchParams.flightType
          },
          searchResult: itineraries,
          timelog: req.session.time_log.join('<br/>'),
          head_title: 'Flights from '
          + params.searchParams.DepartureLocationCode
          + ' to ' + params.searchParams.ArrivalLocationCode
          + sails.moment(depDate).format(" on DD MMM 'YY")
          + (retDate ? ' and back on ' + sails.moment(retDate).format("DD MMM 'YY") : ''),
          iconSpriteMap: result.iconSpriteMap,
          departure: result.departure,
          arrival: result.arrival
        }, 'search/result');
      });
    });
  }
};
