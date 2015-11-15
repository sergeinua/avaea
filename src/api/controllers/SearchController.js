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
    return res.view('search/index', {
      title:'Search for flights',
      user: req.user
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

    Search.getResult(this.getCurentSearchGuid(), params, found => {
      Tile.getTilesData(found, params, function (itineraries, tiles, params) {
        sails.log.info(itineraries[0]);
        sails.log.info(itineraries[0].flights);

        return  res.view('search/result', {
          title: title,
          tiles: tiles,
          searchParams: params,
          searchResult: itineraries
        });
      })
    });
  }
};
