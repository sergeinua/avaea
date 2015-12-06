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

  recalculate: function (user, guid, tile) {
    this.get(user, guid, tile, function (data) {
      this.save(user, guid, tile, {
        tile_position : (data.result.tile_position * ( 1 - tilePrediction.alpha ) + data.result.counter * tilePrediction.alpha),
        confidence    : (data.result.confidence * ( 1 - tilePrediction.alpha ) + tilePrediction.alpha),
        counter       : (data.result.counter + 1)
      });
    });
  },

  get: function (user, guid, tile, cb) {
    tPrediction.find({user: user, uuid: guid, tile_name: tile}, function (err, info) {
      if (err) {
        return cb(this.default);
      }
      return cb(info);
    });
  },

  save: function (user, guid, tile, data) {
      tPrediction.update({user : user, uuid : guid, tile_name : tile}, data).exec(function (err, record) {
      if (err || !record.id) {
        tPrediction.create(
          {
            user      : user,
            uuid      : guid,
            tile_name : tile,
            result    : data
          },
          function(err, record) {
            if (err) {
              sails.log.error(err);
            }
        });
      }
    });
  }
}
