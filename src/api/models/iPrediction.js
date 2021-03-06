/* global Tile */
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
      var predicted_rank = _.clone(itineraryPrediction.default_predicted_rank);
      if (!err && !_.isEmpty(row)) {
        predicted_rank = _.clone(row.prediction);
      } else {
        sails.log.info('didnt find itineraries '+type+' rank prediction for uuid: [' + uuid + '] userId #'+user);
      }
      return cb(predicted_rank);
    });
  },
  getUserRank: function (user, params) {
    iPrediction.findOne({user: user, uuid: params.CabinClass + '_' + params.DepartureLocationCode + '_' + params.ArrivalLocationCode, type: 'local'}).exec(function (err, row) {
      if (!err && !_.isEmpty(row)) {
        Tile.itineraryPredictedRank = _.clone(row.prediction);
      } else {
        sails.log.info('didn\'t find local rank ['+user+']['+params.CabinClass + '_' + params.DepartureLocationCode + '_' + params.ArrivalLocationCode+']');
        iPrediction.findOne({
          user: user,
          uuid: params.CabinClass,
          type: 'global'
        }).exec(function (err, row) {
          if (!err && !_.isEmpty(row)) {
            Tile.itineraryPredictedRank = _.clone(row.prediction);
          } else {
            sails.log.info('didn\'t find global rank ['+user+']['+params.CabinClass + ']');
            sails.log.info(itineraryPrediction.default_predicted_rank);
            Tile.itineraryPredictedRank = _.clone(itineraryPrediction.default_predicted_rank);
          }
        });
      }
    });
  }
}
