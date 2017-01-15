var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  var data = [
    'BEGIN;',
    'ALTER TABLE useraction ADD COLUMN anonymous_id text;',
    'COMMIT;'
  ];
  db.runSql(data.join("\n"), function(err) {
    if (err) return callback(err);
    callback();
  });
};

exports.down = function(db, callback) {
  var data = [
    'BEGIN;',
    'ALTER TABLE useraction DROP COLUMN anonymous_id;',
    'COMMIT;'
  ];
  db.runSql(data.join("\n"), function(err) {
    if (err) return callback(err);
    callback();
  });
};
