var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  var data = [
    'BEGIN;',
    'UPDATE useraction SET "actionType" = \'voice_search\' WHERE "actionType" = \'voice_search_success\' OR "actionType" = \'voice_search_failed\';',
    'UPDATE useraction SET "actionType" = \'search\' WHERE "actionType" = \'order_itineraries\';',
    'COMMIT;'
  ];
  db.runSql(data.join("\n"), function(err) {
    if (err) return callback(err);
    callback();
  });
};

exports.down = function(db, callback) {
  callback();
};
