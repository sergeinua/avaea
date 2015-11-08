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
  guid: '403f731c03626c964da0dd6979348d5b',

  getCurentSearchGuid:function () {
    return this.guid;
  },

  /**
   * `SearchController.index()`
   */
  index: function (req, res) {
    return res.view('search/index', {
      title:'Search for flights',
      user: req.user
    });
  },


  /**
   * `SearchController.result()`
   */
  result: function (req, res) {
    async.waterfall([
      function (callback) {
        var itineraries = Search.getResult(req.allParams());
        callback(null, itineraries);
      },
      function (itineraries, callback) {
        sails.log.info(itineraries.length);
        var tiles = Tile.getTilesData(itineraries);
        sails.log.info(tiles);
        callback(null, itineraries, tiles);
      }
    ], function (err, itineraries, tiles) {
      sails.log(tiles);
      return  res.view('search/result', {
        title:'Search result for SGN&rarr;SFO',
        // guid: this.getCurentSearchGuid(),
        searchParams: req.allParams(),
        user: req.user,
        tiles: tiles,
        searchResult: itineraries
      });
    });
  }
};

