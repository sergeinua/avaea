/* global UserAction */
/* global tilePrediction */
/**
 * PredictionController
 *
 * @description :: Server-side logic for managing and collect prediction data
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  order_tiles: function (req, res) {
    let userId = utils.getUser(req);

    //( array_of_tiles )
    UserAction.saveAction(userId, 'order_tiles', req.allParams(), function () {
      User.publishCreate(userId);
    });
    return res.json(req.allParams());
  },

  order_itineraries: function (req, res) {
    let userId = utils.getUser(req);
    //( array_of_itineraries )
    UserAction.saveAction(userId, 'search', req.allParams(), function () {
      User.publishCreate(userId);
    });
    return res.json(req.allParams());
  },

  on_tile_choice: function (req, res) {
    var uuid = 'default';
    var search_params = {};
    if (_.isString(req.session.search_params_hash)) {
      uuid = req.session.search_params_hash;
      search_params = req.session.search_params_raw;
    }
    //check action
    var data = req.allParams();

    var recalculateTiles = false;
    if (!_.isEmpty(data)) {
      if (data.recalculate == 'true') {
        recalculateTiles = true;
      }
    }
    let userId = utils.getUser(req);
    //( tile )
    if (recalculateTiles) {
      tilePrediction.recalculate(
        userId,
        uuid,
        search_params,
        req.param('tileName', 'default'),
        req.param('sample')
      );
    }
    UserAction.saveAction(userId, 'on_tile_choice', req.allParams(), function () {
      User.publishCreate(userId);
    });
    return res.json(req.allParams());
  },

  on_itinerary_purchase: function (req, res) {
    //( itinerary )
    var data = req.allParams();

    if (!_.isEmpty(data) && data.action == 'itinerary_expanded') {
      var cacheId = 'itinerary_' + data.itinerary.id.replace(/\W+/g, '_');

      var logData = {};
      cache.get(cacheId, function(err, result) {
        if (!err && result) {
          var logData = {
            action    : 'itinerary_expanded',
            itinerary : JSON.parse(result)
          };

          logData.itinerary.price = parseFloat(logData.itinerary.price);
          logData.itinerary.fare = parseFloat(logData.itinerary.fare);

          let userId = utils.getUser(req);
          UserAction.saveAction(userId, 'on_itinerary_purchase', logData, function () {
            User.publishCreate(userId);
          });
        } else {
          onvoya.log.error('Something wrong. Can not find itinerary');
        }
      });
    }
    return res.json(req.allParams());
  }

};
