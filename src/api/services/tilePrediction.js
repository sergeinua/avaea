/* global UserAction */
/* global tPrediction */
/* global tilePrediction */
/* global sails */
module.exports = {
  alpha : sails.config.prediction.tiles.alpha,
  default: {
    tile_position : sails.config.prediction.tiles.default.tile_position,
    confidence    : sails.config.prediction.tiles.default.confidence,
    counter       : sails.config.prediction.tiles.default.counter
  },

  recalculate: function (user, uuid, params, tile) {
    tilePrediction.getPrev(user, uuid, tile, function (data) {
      tilePrediction.save(user, uuid, params, tile, {
        tile_position : (data.result.tile_position * ( 1 - tilePrediction.alpha ) + data.result.counter * tilePrediction.alpha),
        confidence    : (data.result.confidence * ( 1 - tilePrediction.alpha ) + tilePrediction.alpha),
        counter       : (data.result.counter + 1)
      });
    });
  },

  getPrev: function (user, uuid, tile, cb) {
    tPrediction.findOne({user: user, uuid: uuid, tile_name: tile}).exec(function (err, info) {
      if (err || _.isEmpty(info)) {
        return cb({
          user      : user,
          uuid      : uuid,
          tile_name : tile,
          result    : _.clone(tilePrediction.default, true)
        });
      } else {
        return cb(info);
      }
    });
  },

  save: function (user, uuid, params, tile, data) {
      tPrediction.update({user : user, uuid: uuid, tile_name : tile}, {search_params: params, result:data}).exec(function (err, record) {
      if (err || _.isEmpty(record)) {
        tPrediction.create(
          {
            user          : user,
            uuid          : uuid,
            search_params : params,
            tile_name     : tile,
            result        : data
          },
          function(err, record) {
            if (err) {
              sails.log.error(err);
            } else {
              UserAction.saveAction(user, 'tile_prediction', {uuid: uuid, tile_name: tile, data: data});
            }
        });
      } else {
        UserAction.saveAction(user, 'tile_prediction', {uuid: uuid, tile_name: tile, data: data});
      }
    });
  }
};
