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
    this.saveAction(req, 'order_tiles');
    return res.json(req.allParams());
  },

  order_itineraries: function (req, res) {
    //( array_of_itineraries )
    this.saveAction(req, 'order_itineraries');
    return res.json(req.allParams());
  },

  on_tile_choice: function (req, res) {
    //( tile )
    this.saveAction(req, 'on_tile_choice');
    return res.json(req.allParams());
  },

  on_itinerary_purchase: function (req, res) {
    //( itinerary )
    this.saveAction(req, 'on_itinerary_purchase');
    return res.json(req.allParams());
  },

  saveAction: function (req, actionType) {
    var uaFields = {
      user       : req.user,
      actionType : actionType,
      logInfo    : req.allParams()
    };
    UserAction.create(uaFields, function(err, record) {
      if (err) {
        sails.log.error(err);
      }
    });
  }
};
