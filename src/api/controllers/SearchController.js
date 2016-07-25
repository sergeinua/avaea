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
          if(_.isEmpty(params.DepartureLocationCode))
            return callback(null, '');

          Airports.findOne({iata_3code: params.DepartureLocationCode})
            .exec(function (err, result) {
              if (err) {
                return callback(err);
              }

              callback(null, result);
            });
        },
        arriv_city: function(callback) {
          if(_.isEmpty(params.ArrivalLocationCode))
            return callback(null, '');

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
        if(!err)
        {
          params.departCity = results.depart_city.city;
          params.arrivCity = results.arriv_city.city;
        }

        return res.view('search/index', {
          title         : 'Search for flights',
          user          : req.user,
          defaultParams : params,
          serviceClass  : Search.serviceClass,
          errors        : error,
          head_title    : 'Search for flights with Avaea Agent'
        });
      }
    );
  },

  /**
   * `SearchController.result()`
   */
  result: function (req, res) {
    utils.timeLog('search result');
    var savedParams = {};
    res.locals.searchId = null;
    if (req.param('s')) {
      res.locals.searchId = req.param('s');
      var atob = require('atob');
      try {
        var savedParamsTmp = JSON.parse(atob(req.param('s')));
        var savedParams = {};
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
      depDate = new Date(savedParams.departureDate);
    } else {
      if (!isNaN(Date.parse(req.param('departureDate')))) {
        depDate = new Date(req.param('departureDate'));
      }
    }
    params.searchParams.departureDate = sails.moment(depDate).format('DD/MM/YYYY');
    req.session.departureDate = sails.moment(depDate).format('YYYY-MM-DD');
    if (!_.isEmpty(savedParams.returnDate) && !isNaN(Date.parse(savedParams.returnDate))) {
      var retDate = new Date(savedParams.returnDate);
      params.searchParams.returnDate = sails.moment(retDate).format('DD/MM/YYYY');
      req.session.returnDate = sails.moment(retDate).format('YYYY-MM-DD');
    } else {
      if (!isNaN(Date.parse(req.param('returnDate')))) {
        var retDate = new Date(req.param('returnDate'));
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

      var serviceClass = Search.serviceClass;

      if (!itineraries.length) {
        return  res.view('search/result', {
          user: req.user,
          title: title,
          tiles: {},
          searchParams: {
            DepartureLocationCode: params.searchParams.DepartureLocationCode,
            ArrivalLocationCode: params.searchParams.ArrivalLocationCode,
            departureDate: sails.moment(depDate).format('DD MMM'),
            returnDate: (retDate)?sails.moment(retDate).format('DD MMM'):'',
            CabinClass: serviceClass[params.searchParams.CabinClass] + ((params.searchParams.CabinClass == 'F')?' class':''),
            passengers: params.searchParams.passengers,
            topSearchOnly: params.searchParams.topSearchOnly,
            flightType: params.searchParams.flightType
          },
          searchResult: []
        });
      }
      var algorithm = sails.config.globals.bucketizationFunction;

      if (_.isEmpty(algorithm) || typeof Tile[algorithm] != 'function') {
        algorithm = 'getTilesData';
      }

      if (!req.session.showTiles) {
        algorithm = 'getTilesDataEmpty';
      }
      Tile[algorithm](itineraries, params.searchParams, function (itineraries, tiles, params) {
        UserAction.saveAction(req.user, 'order_tiles', tiles);
        var itinerariesData = _.merge({
          searchUuid    : itineraries.guid,
          searchParams  : params,
          countAll      : itineraries.length
        }, Search.getStatistics(itineraries));
        UserAction.saveAction(req.user, 'order_itineraries', itinerariesData, function () {
          User.publishCreate(req.user);
        });
        sails.log.info('Search result processing total time: %s', utils.timeLogGetHr('search result'));
        //sails.log.info('_debug_tiles:', util.inspect(tiles, {showHidden: true, depth: null}));

        utils.timeLog('sprite_map');
        Airlines.makeIconSpriteMap(function (err, iconSpriteMap) {
          if (err) {
            sails.log.error(err);
            iconSpriteMap = {};
          }

          // Define max filter items
          var max_filter_items = 0;
          for(var key in tiles) {
            var cur_tile_items=0;
            tiles[key].filters.forEach( function (filter) {
              if (parseInt(filter.count) > 0) {
                cur_tile_items++;
              }
            });
            max_filter_items = cur_tile_items > max_filter_items ? cur_tile_items : max_filter_items;
          }
          sails.log.info('Icon Sprite Map time: %s', utils.timeLogGetHr('smart_ranking'));

          return  res.view('search/result', {
            user: req.user,
            title: title,
            tiles: tiles,
            max_filter_items: max_filter_items,
            searchParams: {
              DepartureLocationCode: params.DepartureLocationCode,
              ArrivalLocationCode: params.ArrivalLocationCode,
              departureDate: sails.moment(depDate).format('DD MMM'),
              returnDate: (retDate)?sails.moment(retDate).format('DD MMM'):'',
              CabinClass: serviceClass[params.CabinClass]+ ((params.CabinClass == 'F')?' class':''),
              passengers: params.passengers,
              flightType: params.flightType
            },
            searchResult: itineraries,
            timelog: req.session.time_log.join('<br/>'),
            head_title: 'Flights from '
            + params.DepartureLocationCode
            + ' to '+params.ArrivalLocationCode
            + sails.moment(depDate).format(" on DD MMM 'YY")
            + (retDate?' and back on '+sails.moment(retDate).format("DD MMM 'YY"):''),
            iconSpriteMap: iconSpriteMap
          });
        });
      });
    });
  }
};
