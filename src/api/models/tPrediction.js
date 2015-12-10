module.exports = {
  attributes: {
    user :      { model : 'User' },
    uuid :      { type: 'string' },
    tile_name : { type: 'string' },
    result :    { type: 'json' },
  },
  getUserTiles: function (user, uuid) {
    this.find({user: user, uuid: uuid}).exec(function (err, rows) {
      var tiles = Tile.getTiles();
      if (!err && !_.isEmpty(rows)) {
        _.map(tiles, function (item) {
          var i = _.findIndex(rows, {tile_name: item.name});
          if (i !== -1) {
            item.order = rows[i].result.tile_position;
          }
          return item;
        });
      } else {
        sails.log.error('didnt find tiles prediction for uuid: ['+uuid + '] userId #'+user);
      }
      return tiles;
    });
  }
}