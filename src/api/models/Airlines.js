
var fs = require('fs');

var assets_dir = '.tmp/public';
var icons_dir = 'images/airlines';
var sprite_map_file = 'avaea-airlines-sprite.json';

var getSpriteMapFileName = function () {
  return assets_dir +'/'+ icons_dir + '/' + sprite_map_file;
};

module.exports = {

  makeIconSpriteMap: function(cbSpriteMap) {
    async.waterfall([
          function (callback) {
            fs.readFile(getSpriteMapFileName(), {encoding: 'utf-8'}, function (err, data) {
              // Read result from file successfully
              if (!err) {
                callback(null, JSON.parse(data));
              } else {
                callback(null, null);
                sails.log.info('Sprite map for the airlines icons not found, try to make..');
              }
            });
          },

          function (genRes, callback) {
            if (genRes) {
              return callback(null, genRes);
            }

            // Read icons dir and then save sprite map to json file
            fs.readdir(assets_dir +'/'+ icons_dir, function (err, files) {
              if (err) {
                callback(err);
                return;
              }

              var sprite_num = 1;
              var sprite_map = {};

              for (var i = 0; i < files.length; i++) {
                // parse only files with name as iata_2code
                if (/^[a-z0-9]{2}\.png/i.exec(files[i])) {
                  // filename wo ext => sprite_num
                  sprite_map[files[i].replace(/\.[^/.]+$/, "")] = sprite_num++;
                }
              }

              fs.writeFile(getSpriteMapFileName(), JSON.stringify(sprite_map), {mode: 0o644}, (err) => {
                if (err) {
                  sails.log.error(err);
                  callback(err);
                  return;
                }
              });

              sails.log.info('Sprite map for the airlines icons was made successfully');
              callback(null, sprite_map);
            });
          }
        ],

        cbSpriteMap
    );
  }
};