/* global UserAction */
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
    UserAction.saveAction(req.user, 'order_itineraries', req.allParams());
    return res.json(req.allParams());
  },

  on_tile_choice: function (req, res) {
    var uuid = 'default';
    if (!_.isEmpty(req.session.search)) {
      uuid = req.session.search;
    }
    //( tile )
    tilePrediction.recalculate(req.user.id, uuid, req.param('tileName', 'default'));
    UserAction.saveAction(req.user, 'on_tile_choice', req.allParams());
    return res.json(req.allParams());
  },

  on_itinerary_purchase: function (req, res) {
    //( itinerary )
    UserAction.saveAction(req.user, 'on_itinerary_purchase', req.allParams());
    return res.json(req.allParams());
  },

};
