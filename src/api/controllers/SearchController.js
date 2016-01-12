/* global _ */
/* global tPrediction */
/* global iPrediction */
/* global UserAction */
/* global Search */
/* global async */
/* global Tile */
/* global sails */
/**
 * SearchController
 *
 * @description :: Server-side logic for managing searches
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  guid: '',

  getCurrentSearchGuid: function () {
    var d = new Date().getTime();
    this.guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });

    return this.guid;
  },

  /**
   * `SearchController.index()`
   */
  index: function (req, res) {

    this.guid = '';
    var params = {
        DepartureLocationCode: '',
        ArrivalLocationCode: '',
        CabinClass: '',
        departureDate: sails.moment().add(2, 'w').format('YYYY-MM-DD'),
        returnDate: ''
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
        DepartureLocationCode: req.param('originAirport').toUpperCase(),
        ArrivalLocationCode: req.param('destinationAirport').toUpperCase(),
        CabinClass: req.param('preferedClass').toUpperCase(),
        returnDate: ''
      },
      depDate = new Date();

    if (!isNaN(Date.parse(req.param('departureDate')))) {
      depDate = new Date(req.param('departureDate'));
    }
    params.DepartureTime = sails.moment(depDate).format('DD/MM/YYYY');
    if (!isNaN(Date.parse(req.param('returnDate')))) {
      var retDate = new Date(req.param('returnDate'));
      params.returnDate = sails.moment(retDate).format('DD/MM/YYYY');
    }
    title = params.DepartureLocationCode + (params.returnDate?'&#8644;':'&rarr;') + params.ArrivalLocationCode,
    iPrediction.getUserRank(req.user.id, params);

    var md5 = require("blueimp-md5").md5;
    req.session.search_params_hash = md5(params.DepartureLocationCode+params.ArrivalLocationCode+params.CabinClass);
    req.session.search_params_raw  = params;

    Tile.tiles = _.clone(Tile.default_tiles, true);
    tPrediction.getUserTiles(req.user.id, req.session.search_params_hash);

    Search.getResult(this.getCurrentSearchGuid(), params, function ( err, found ) {
      sails.log.info('Found itineraries: %d', found.length);

      var serviceClass = {
        E:'Economy',
        P:'Premium',
        B:'Business',
        F:'First'
      };

      if (!found.length) {
        return  res.view('search/result', {
          user: req.user,
          title: title,
          tiles: {},
          searchParams: {
            DepartureTime: sails.moment(depDate).format('MM/DD/YYYY'),
            returnDate: (retDate)?sails.moment(retDate).format('MM/DD/YYYY'):'',
            CabinClass: serviceClass[params.CabinClass]
          },
          searchResult: []
        });
      }
      Tile.getTilesData(found, params, function (itineraries, tiles, params) {

        UserAction.saveAction(req.user, 'order_tiles', tiles);
        var itinerariesData = {
          searchUuid   : itineraries.guid,
          searchParams : params,
          count        : itineraries.length
        };
        UserAction.saveAction(req.user, 'order_itineraries', itinerariesData);
        sails.log.info('Search result processing total time: %s', utils.timeLogGet('search result'));

        var timelog = '';
        if (utils.timeLogGet('mystifly') > 7000) {
          timelog = 'Mystifly took ' + (utils.timeLogGet('mystifly')/1000).toFixed(1) + 's to respond';
        }
        if (utils.timeLogGet('mondee') > 7000) {
          timelog += (timelog?'<br/>':'') + 'Mondee took ' + (utils.timeLogGet('mondee')/1000).toFixed(1) + 's to respond';
        }
        return  res.view('search/result', {
          user: req.user,
          title: title,
          tiles: tiles,
          searchParams: {
            DepartureTime: sails.moment(depDate).format('MM/DD/YYYY'),
            returnDate: (retDate)?sails.moment(retDate).format('MM/DD/YYYY'):'',
            CabinClass: serviceClass[params.CabinClass]
          },
          searchResult: itineraries,
          timelog: timelog
        });
      })
    });
  }
};
