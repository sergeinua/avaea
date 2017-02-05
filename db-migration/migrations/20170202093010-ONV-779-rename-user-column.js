var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  var data = [
    'BEGIN;',
    'ALTER TABLE useraction RENAME COLUMN "user" TO user_id;',
    'ALTER TABLE tprediction RENAME COLUMN "user" TO user_id;',
    'ALTER TABLE iprediction RENAME COLUMN "user" TO user_id;',
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
    'ALTER TABLE useraction RENAME COLUMN user_id TO "user";',
    'ALTER TABLE tprediction RENAME COLUMN user_id TO "user";',
    'ALTER TABLE iprediction RENAME COLUMN user_id TO "user";',
    'COMMIT;'
  ];
  db.runSql(data.join("\n"), function(err) {
    if (err) return callback(err);
    callback();
  });
};
