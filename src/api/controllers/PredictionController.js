/**
 * PredictionController
 *
 * @description :: Server-side logic for managing and collect prediction data
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  order_tiles: function (req, res) {
    //( array_of_tiles )
    return res.json(req.allParams());
  },

  order_itineraries: function (req, res) {
    //( array_of_itineraries )
    return res.json(req.allParams());
  },

  on_tile_choice: function (req, res) {
    //( tile )
    return res.json(req.allParams());
  },

  on_itinerary_purchase: function (req, res) {
    //( itinerary )
    return res.json(req.allParams());
  }
};
