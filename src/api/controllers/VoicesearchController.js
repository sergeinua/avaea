/**
 * VoicesearchController
 *
 * @description :: Server-side logic for managing voicesearches
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  /**
   * `VoicesearchController.index()`
   */
  index: function (req, res) {
    var params = {
      DepartureLocationCode: _.isEmpty(req.session.DepartureLocationCode) ? '' : req.session.DepartureLocationCode,
      ArrivalLocationCode: _.isEmpty(req.session.ArrivalLocationCode) ? '' : req.session.ArrivalLocationCode,
      CabinClass: _.isEmpty(req.session.CabinClass) ? '' : req.session.CabinClass,
      departureDate: sails.moment().add(3, 'w').format('YYYY-MM-DD'),
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

    return res.ok(
      {
        title         : 'Search flights voice',
        user          : req.user,
        defaultParams : params,
        serviceClass  : Search.serviceClass,
        errors        : error
      },
      'voiceSearch/index'
    );
  },


  /**
   * `VoicesearchController.search()`
   */
  search: function (req, res) {
    return res.json({
      todo: 'search() is not implemented yet!'
    });
  }
};

