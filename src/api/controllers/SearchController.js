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
    sails.log(res.user);
    return res.view('search/index', {
      user: res.user
    });
  },


  /**
   * `SearchController.result()`
   */
  result: function (req, res) {
    return  res.view('search/result', {
      guid: this.getCurentSearchGuid(),
      searchParams: req.allParams(),
      searchResult: sails.models.Search.getResult(req.allParams())
    });
  }
};

