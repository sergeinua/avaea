/* global Tile */
/* global _ */
/* global iPrediction */
/* global sails */
/* global itineraryPrediction */
module.exports = {
  attributes: {
    user_id       : { model : 'User' },
    uuid          : { type: 'string' },
    search_params : { type: 'json' },
    type          : { type: 'string' }, // global, local
    prediction    : { type: 'json' },   // {rankMin, rankMax}
  },
  getUserItinerariesRank: function (userId, uuid, type, cb) {
    this.findOne({user_id: userId, uuid: uuid, type: type}).exec(function (err, row) {
      var predicted_rank = _.clone(itineraryPrediction.default_predicted_rank);
      if (!err && !_.isEmpty(row)) {
        predicted_rank = _.clone(row.prediction);
      } else {
        onvoya.log.info('didnt find itineraries '+type+' rank prediction for uuid: [' + uuid + '] userId #'+userId);
      }
      return cb(predicted_rank);
    });
  },
  getUserRank: function (userId, params) {
    iPrediction.findOne({user_id: userId, uuid: params.CabinClass + '_' + params.DepartureLocationCode + '_' + params.ArrivalLocationCode, type: 'local'}).exec(function (err, row) {
      if (!err && !_.isEmpty(row)) {
        Tile.itineraryPredictedRank = _.clone(row.prediction);
      } else {
        onvoya.log.info('didn\'t find local rank ['+userId+']['+params.CabinClass + '_' + params.DepartureLocationCode + '_' + params.ArrivalLocationCode+']');
        iPrediction.findOne({
          user_id: userId,
          uuid: params.CabinClass,
          type: 'global'
        }).exec(function (err, row) {
          if (!err && !_.isEmpty(row)) {
            Tile.itineraryPredictedRank = _.clone(row.prediction);
          } else {
            onvoya.log.info('didn\'t find global rank ['+userId+']['+params.CabinClass + ']');
            onvoya.log.info(itineraryPrediction.default_predicted_rank);
            Tile.itineraryPredictedRank = _.clone(itineraryPrediction.default_predicted_rank);
          }
        });
      }
    });
  }
}
