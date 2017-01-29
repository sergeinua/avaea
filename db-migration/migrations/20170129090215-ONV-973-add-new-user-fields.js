var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;


exports.up = function(db, callback) {
  var data = [
    'BEGIN;',
    'ALTER TABLE "user" ADD COLUMN anonymous_id text,',
    ' ADD COLUMN landing_page text;',
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
    'ALTER TABLE "user" DROP COLUMN anonymous_id,',
    ' DROP COLUMN landing_page;',
    'COMMIT;'
  ];
  db.runSql(data.join("\n"), function(err) {
    if (err) return callback(err);
    callback();
  });
};