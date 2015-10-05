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
    return res.json({
      user: {
         data:"user data will be here"
      }
    });
  },


  /**
   * `SearchController.result()`
   */
  result: function (req, res) {
    return res.json({
      guid: this.getCurentSearchGuid(),
      result:[
        {itinerary: 'itinerary data #1'},
        {itinerary: 'itinerary data #2'},
        {itinerary: 'itinerary data #3'},
        {itinerary: 'itinerary data #4'},
      ]
    });
  }
};

