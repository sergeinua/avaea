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
    var
      params = {
        DepartureLocationCode: req.param('originAirport').toUpperCase(),
        ArrivalLocationCode: req.param('destinationAirport').toUpperCase(),
        CabinClass: req.param('preferedClass').toUpperCase(),
        returnDate: ''
      },
      title = 'Search result for ' + params.DepartureLocationCode + '&rarr;' + params.ArrivalLocationCode,
      depDate = new Date();

    if (!isNaN(Date.parse(req.
      param('departureDate')))) {
      depDate = new Date(req.param('departureDate'));
    }
    params.DepartureTime = sails.moment(depDate).format('DD/MM/YYYY');

    if (!isNaN(Date.parse(req.param('returnDate')))) {
      var retDate = new Date(req.param('returnDate'));
      params.returnDate = sails.moment(retDate).format('DD/MM/YYYY');
    }

    //
    //req.param('returnDate')
    Search.getResult(this.getCurentSearchGuid(), params, found => {
      return  res.view('search/result_mondee', {
        title: title,
        searchParams: params,
        searchResult: found
      });
    });
  }
};

