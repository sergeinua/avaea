/**
 * Prediction configuration
 *
 * This is the configuration for your tilePrediction.js and itineraryPrediction.js setup and where you
 * define the default values you want your application to employ.
 *
 */

module.exports.prediction = {

  // default value for Tiles Prediction
  tiles: {
    alpha: 0.2,
  },

  /// default value for Itineraries Prediction
  itineraries: {
    alpha: 0.2,
    rankMin : 0.001,
    rankMax : 1
  },
}
