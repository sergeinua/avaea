/* global tPrediction */
/* global tilePrediction */
/* global sails */
module.exports = {
  alpha : 0.2,
  default: {
    tile_position : 0,
    confidence    : 0,
    counter       : 0
  },

  recalculate: function (user, tile) {
    tilePrediction.getPrev(user, tile, function (data) {
      tilePrediction.save(user, tile, {
        tile_position : (data.result.tile_position * ( 1 - tilePrediction.alpha ) + data.result.counter * tilePrediction.alpha),
        confidence    : (data.result.confidence * ( 1 - tilePrediction.alpha ) + tilePrediction.alpha),
        counter       : (data.result.counter + 1)
      });
    });
  },

  getPrev: function (user, tile, cb) {
    tPrediction.findOne({user: user, tile_name: tile}).exec(function (err, info) {
      if (err || !info.id) {
        return cb({
          user      : user,
          tile_name : tile,
          result    : tilePrediction.default
        });
      } else {
        return cb(info);
      }
    });
  },

  save: function (user, tile, data) {
      tPrediction.update({user : user, tile_name : tile}, {result:data}).exec(function (err, record) {
      if (err || !record.id) {
        tPrediction.create(
          {
            user      : user,
            tile_name : tile,
            result    : data
          },
          function(err, record) {
            if (err) {
              sails.log.error(err);
            } else {
              UserAction.saveAction(user, 'tile_prediction', {tile_name : tile, data : data});
            }
        });
      } else {
        UserAction.saveAction(user, 'tile_prediction', {tile_name : tile, data : data});
      }
    });
  }
}
