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

  getCurentSearchGuid:function () {
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
    return res.view('search/index', {
      title:'Search for flights',
      user: req.user,
      defaultParams: params,
      errors: error
    });
  },

  /**
   * `SearchController.result()`
   */
  result: function (req, res) {
    var
      params = {
        DepartureLocationCode: req.param('originAirport').toUpperCase(),
        ArrivalLocationCode: req.param('destinationAirport').toUpperCase(),
        CabinClass: req.param('preferedClass').toUpperCase(),
        returnDate: ''
      },
      title = 'Search result for ' + params.DepartureLocationCode + '&rarr;' + params.ArrivalLocationCode,
      depDate = new Date();

    if (!isNaN(Date.parse(req.param('departureDate')))) {
      depDate = new Date(req.param('departureDate'));
    }
    params.DepartureTime = sails.moment(depDate).format('DD/MM/YYYY');
    if (!isNaN(Date.parse(req.param('returnDate')))) {
      var retDate = new Date(req.param('returnDate'));
      params.returnDate = sails.moment(retDate).format('DD/MM/YYYY');
    }

    Search.getResult(this.getCurentSearchGuid(), params, function ( found ) {
      sails.log('found itineraries ' + found.length);
      Tile.getTilesData(found, params, function (itineraries, tiles, params) {
        var serviceClass = {
          E:'Economy',
          P:'Premium',
          B:'Business',
          F:'First'
        };
        return  res.view('search/result', {
          title: title,
          tiles: tiles,
          searchParams: {
            DepartureTime: sails.moment(depDate).format('MM/DD/YYYY'),
            returnDate: (retDate)?sails.moment(retDate).format('MM/DD/YYYY'):'',
            CabinClass: serviceClass[params.CabinClass]
          },
          searchResult: itineraries
        });
      })
    });
  }
};
