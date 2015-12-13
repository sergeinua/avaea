/* global ItineraryPrediction */
module.exports = {
  attributes: {
    user          : { model : 'User' },
    uuid          : { type: 'string' },
    search_params : { type: 'json' },
    type          : { type: 'string' }, // global, local
    prediction    : { type: 'json' },// {rankMin, rankMax}
  },
  getUserItinerariesRank: function (user, uuid, type, cb) {
    this.findOne({user: user, uuid: uuid, type: type}).exec(function (err, row) {
      var predicted_rank = ItineraryPrediction.default_predicted_rank;
      if (!err && !_.isEmpty(row)) {
        predicted_rank = row.prediction;
      } else {
        sails.log.error('didnt find itineraries rank prediction for uuid: [' + uuid + '] userId #'+user);
      }
      return cb(predicted_rank);
    });
  }
}