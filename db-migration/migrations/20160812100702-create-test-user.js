var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  var data = [
    'BEGIN;',
      'INSERT INTO "user" (username, email, is_whitelist) VALUES (\'testing\', \'testing@avaea.com\', \'1\');',
      'INSERT INTO profile ("user") SELECT id FROM "user" WHERE username =\'testing\';',
      'INSERT INTO passport (protocol, "accessToken", provider, "user") SELECT \'bearer\', \'af54f2426b1a9957f5f7cb79537a959e\', \'bearer\', id FROM "user" WHERE username =\'testing\';',
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
      'DELETE FROM passport WHERE "user" = (SELECT id FROM "user" WHERE username =\'testing\');',
      'DELETE FROM profile WHERE "user" = (SELECT id FROM "user" WHERE username =\'testing\');',
      'DELETE FROM "user" WHERE username =\'testing\';',
    'COMMIT;'
  ];
  db.runSql(data.join("\n"), function(err) {
    if (err) return callback(err);
    callback();
  });

  callback();
};
