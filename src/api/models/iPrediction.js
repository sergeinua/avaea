/* global _ */
/* global iPrediction */
/* global sails */
/* global itineraryPrediction */
module.exports = {
  attributes: {
    user          : { model : 'User' },
    uuid          : { type: 'string' },
    search_params : { type: 'json' },
    type          : { type: 'string' }, // global, local
    prediction    : { type: 'json' },   // {rankMin, rankMax}
  },
  getUserItinerariesRank: function (user, uuid, type, cb) {
    this.findOne({user: user, uuid: uuid, type: type}).exec(function (err, row) {
      var predicted_rank = JSON.parse(JSON.stringify(itineraryPrediction.default_predicted_rank));
      if (!err && !_.isEmpty(row)) {
        predicted_rank = JSON.parse(JSON.stringify(row.prediction));
      } else {
        sails.log.error('didnt find itineraries '+type+' rank prediction for uuid: [' + uuid + '] userId #'+user);
      }
      return cb(predicted_rank);
    });
  },
  getUserRank: function (user, params) {
    iPrediction.findOne({user: user, uuid: params.CabinClass + '_' + params.DepartureLocationCode + '_' + params.ArrivalLocationCode, type: 'local'}).exec(function (err, row) {
      if (!err && !_.isEmpty(row)) {
        Tile.itineraryPredictedRank = JSON.parse(JSON.stringify(row.prediction));
      } else {
        sails.log.error('didn\'t find local rank ['+user+']['+params.CabinClass + '_' + params.DepartureLocationCode + '_' + params.ArrivalLocationCode+']');
        iPrediction.findOne({
          user: user,
          uuid: params.CabinClass,
          type: 'global'
        }).exec(function (err, row) {
          if (!err && !_.isEmpty(row)) {
            Tile.itineraryPredictedRank = JSON.parse(JSON.stringify(row.prediction));
          } else {
            sails.log.error('didn\'t find global rank ['+user+']['+params.CabinClass + ']');
            sails.log(itineraryPrediction.default_predicted_rank);
            Tile.itineraryPredictedRank = JSON.parse(JSON.stringify(itineraryPrediction.default_predicted_rank));
          }
        });
      }
    });
  }
}
