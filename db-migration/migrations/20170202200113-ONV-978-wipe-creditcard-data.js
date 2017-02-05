var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  var data = [
    'BEGIN;',
    "UPDATE booking set req_params = req_params::jsonb - 'CVV' where req_params->'CVV' is not null ;",
    "UPDATE booking set req_params = req_params::jsonb - 'CardNumber' where req_params->'CardNumber' is not null ;",
    "UPDATE booking set req_params = req_params::jsonb - 'ExpiryDate' where req_params->'ExpiryDate' is not null ;",
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
