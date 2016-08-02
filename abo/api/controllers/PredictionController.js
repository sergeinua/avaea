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
    //( array_of_tiles )
    UserAction.saveAction(req.user, 'order_tiles', req.allParams());
    return res.json(req.allParams());
  },

  order_itineraries: function (req, res) {
    //( array_of_itineraries )
    UserAction.saveAction(req.user, 'search', req.allParams());
    return res.json(req.allParams());
  },

  on_tile_choice: function (req, res) {
    var uuid = 'default';
    var search_params = {};
    if (!_.isEmpty(req.session.search_params_hash)) {
      uuid = req.session.search_params_hash;
      search_params = req.session.search_params_raw;
    }
    //check action
    var data = req.allParams();
    var recalculateTiles = true;
    if (data) {
        if (data.action == 'filter_remove') {
            recalculateTiles = false;
        }
    }
    //( tile )
    if (recalculateTiles) {
      tilePrediction.recalculate(req.user.id, uuid, search_params, req.param('tileName', 'default'));
    }
    UserAction.saveAction(req.user, 'on_tile_choice', req.allParams());
    return res.json(req.allParams());
  },

  on_itinerary_purchase: function (req, res) {
    //( itinerary )
    var data = req.allParams();

    if (!_.isEmpty(data) && data.action == 'itinerary_expanded') {
      var cacheId = 'itinerary_' + data.itinerary.id.replace(/\W+/g, '_');

      var logData = {};
      memcache.get(cacheId, function(err, result) {
        if (!err && result) {
          var logData = {
            action    : 'itinerary_expanded',
            itinerary : JSON.parse(result)
          };

          UserAction.saveAction(req.user, 'on_itinerary_purchase', logData);
        } else {
          sails.log.error('Something wrong. Can not find itinerary');
        }
      });
    }
    return res.json(req.allParams());
  }

};
