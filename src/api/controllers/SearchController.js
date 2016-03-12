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

// TODO: this tmp function should be replaced with real smart ranking
var tmpSmartRank = function(itins, callback) {
  async.map(itins, function(itin, doneCb) {
    itin.smartRank = _.random(0, 10, false);
    return doneCb(null, itin);
  }, function(err, itins) {
    return callback(err, itins);
  });
  return;
};

module.exports = {

  /**
   * `SearchController.index()`
   */
  index: function (req, res) {

    var params = {
      DepartureLocationCode: _.isEmpty(req.session.DepartureLocationCode) ? '' : req.session.DepartureLocationCode,
      ArrivalLocationCode: _.isEmpty(req.session.ArrivalLocationCode) ? '' : req.session.ArrivalLocationCode,
      CabinClass: _.isEmpty(req.session.CabinClass) ? '' : req.session.CabinClass,
      departureDate: _.isEmpty(req.session.departureDate) ? sails.moment().add(3, 'w').format('YYYY-MM-DD') : req.session.departureDate,
      returnDate: _.isEmpty(req.session.returnDate) ? '' : req.session.returnDate
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

    return res.view('search/index', {
      title         : 'Search for flights',
      user          : req.user,
      defaultParams : params,
      serviceClass  : Search.serviceClass,
      errors        : error
    });
  },

  /**
   * `SearchController.result()`
   */
  result: function (req, res) {
    utils.timeLog('search result');
    var
      params = {
        user: req.user,
        session: req.session,
        searchParams: {
          DepartureLocationCode: req.param('originAirport').trim().toUpperCase(),
          ArrivalLocationCode: req.param('destinationAirport').trim().toUpperCase(),
          CabinClass: req.param('preferedClass').toUpperCase(),
          returnDate: ''
        }
      },
      depDate = new Date();

    if (!isNaN(Date.parse(req.param('departureDate')))) {
      depDate = new Date(req.param('departureDate'));
    }
    params.searchParams.departureDate = sails.moment(depDate).format('DD/MM/YYYY');
    req.session.departureDate = sails.moment(depDate).format('YYYY-MM-DD');
    if (!isNaN(Date.parse(req.param('returnDate')))) {
      var retDate = new Date(req.param('returnDate'));
      params.searchParams.returnDate = sails.moment(retDate).format('DD/MM/YYYY');
      req.session.returnDate = sails.moment(retDate).format('YYYY-MM-DD');
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

    Tile.tiles = _.clone(Tile.default_tiles, true);
    tPrediction.getUserTiles(req.user.id, req.session.search_params_hash);

    Search.getResult(params, function ( err, itineraries ) {
      sails.log.info('Found itineraries: %d', itineraries.length);

      var serviceClass = Search.serviceClass;

      if (!itineraries.length) {
        return  res.view('search/result', {
          user: req.user,
          title: title,
          tiles: {},
          searchParams: {
            departureDate: sails.moment(depDate).format('MM/DD/YYYY'),
            returnDate: (retDate)?sails.moment(retDate).format('MM/DD/YYYY'):'',
            CabinClass: serviceClass[params.searchParams.CabinClass]
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

      // TODO: this tmp function should be replaced with real smart ranking
      tmpSmartRank(itineraries, function(err, itineraries) {
        Tile[algorithm](itineraries, params.searchParams, function (itineraries, tiles, params) {
          UserAction.saveAction(req.user, 'order_tiles', tiles);
          var itinerariesData = {
            searchUuid   : itineraries.guid,
            searchParams : params,
            count        : itineraries.length
          };
          UserAction.saveAction(req.user, 'order_itineraries', itinerariesData);
          sails.log.info('Search result processing total time: %s', utils.timeLogGetHr('search result'));
          //sails.log.info('_debug_tiles:', util.inspect(tiles, {showHidden: true, depth: null}));

          return  res.view('search/result', {
            user: req.user,
            title: title,
            tiles: tiles,
            searchParams: {
              departureDate: sails.moment(depDate).format('MM/DD/YYYY'),
              returnDate: (retDate)?sails.moment(retDate).format('MM/DD/YYYY'):'',
              CabinClass: serviceClass[params.CabinClass]
            },
            searchResult: itineraries,
            timelog: req.session.time_log.join('<br/>')
          });
        });
      });
    });
  }
};
