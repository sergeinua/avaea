/* global sails */
/* global Tile */
/* global _ */
module.exports = {
  attributes: {
    user          : { model: 'User' },
    uuid          : { type: 'string' },
    search_params : { type: 'json' },
    tile_name     : { type: 'string' },
    result        : { type: 'json' }
  },
  getUserTiles: function (user, uuid) {
    this.find({user: user, uuid: uuid}).exec(function (err, rows) {
      var tiles = _.clone(Tile.default_tiles, true);
      if (!err && !_.isEmpty(rows)) {
        _.map(tiles, function (item) {
          var i = _.findIndex(rows, {tile_name: item.id});
          if (i !== -1) {
            item.order = rows[i].result.tile_position;
          }
          return item;
        });
      } else {
        sails.log.error('didnt find tiles prediction for uuid: ['+uuid+'] userId #'+user);
      }
      Tile.tiles = tiles;
    });
  },
  adminTiles: [],
  getUserTilesCb: function (user, uuid, cb) {
    this.find({user: user, uuid: uuid}).exec(function (err, rows) {
      var tiles = _.clone(Tile.default_tiles, true);
      if (!err && !_.isEmpty(rows)) {
        var newtiles = _.map(tiles, function (item) {
          var r = {};
          var i = _.findIndex(rows, {tile_name: item.id});
          if (i !== -1) {
            item.order = rows[i].result.tile_position;
            item.count = rows[i].result.counter;
          }
            r[item.id] = item.order;
          return r;
        });

        var result = {};
        result[uuid] = newtiles;
        return cb(null, result);
      } else {
        sails.log.error('did not find tiles prediction for uuid: ['+uuid+'] userId #'+user);

        var newtiles = _.map(Tile.default_tiles, function (item) {
          var r = {};
          r[item.id] = item.order;
          return r;
        });
        var result = {};
        result[uuid] = newtiles;

        return cb(null, result);
      }
    });
  }
};
