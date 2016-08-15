var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  var data = [
    'BEGIN;',
    'ALTER TABLE airports ADD COLUMN alternative_name text;',
    'UPDATE airports SET "alternative_name" = \'Peking\' WHERE "iata_3code" = \'BJS\';',
    'UPDATE airports SET "alternative_name" = \'Canton\' WHERE "iata_3code" = \'CAN\';',
    'UPDATE airports SET "alternative_name" = \'Leningrad\' WHERE "iata_3code" = \'LED\';',
    'UPDATE airports SET "alternative_name" = \'Chisinau\' WHERE "iata_3code" = \'KIV\';',
    'UPDATE airports SET "alternative_name" = \'Kyiv\' WHERE "iata_3code" = \'KBP\';',
    'UPDATE airports SET "alternative_name" = \'Kharkiv, Kharkov\' WHERE "iata_3code" = \'HRK\';',
    'UPDATE airports SET "alternative_name" = \'DC\' WHERE "iata_3code" = \'WAS\';',
    'UPDATE airports SET "alternative_name" = \'LA\' WHERE "iata_3code" = \'LAX\';',
    'UPDATE airports SET "alternative_name" = \'NOLA\' WHERE "iata_3code" = \'MSY\';',
    'UPDATE airports SET "alternative_name" = \'Vegas\' WHERE "iata_3code" = \'LAS\';',
    'UPDATE airports SET "alternative_name" = \'Big Apple\' WHERE "iata_3code" = \'NYC\';',
    'UPDATE airports SET "alternative_name" = \'Big Pineapple\' WHERE "iata_3code" = \'HNL\';',
    'UPDATE airports SET "alternative_name" = \'San Fran\' WHERE "iata_3code" = \'SFO\';',
    'UPDATE airports SET "alternative_name" = \'Silicon Valley\' WHERE "iata_3code" = \'SJC\';',
    'UPDATE airports SET "alternative_name" = \'Silicon Hills\' WHERE "iata_3code" = \'AUS\';',
    'UPDATE airports SET "alternative_name" = \'Windy City\' WHERE "iata_3code" = \'CHI\';',
    'UPDATE airports SET "alternative_name" = \'Space City\' WHERE "iata_3code" = \'IAH\';',
    'UPDATE airports SET "alternative_name" = \'Motor City\' WHERE "iata_3code" = \'DTW\';',
    'UPDATE airports SET "alternative_name" = \'Twin Cities\' WHERE "iata_3code" = \'MSP\';',
    'UPDATE airports SET "alternative_name" = \'Calcutta, Fort William\' WHERE "city" = \'Kolkata\';',
    'UPDATE airports SET "alternative_name" = \'Bengaluru\' WHERE "city" = \'Bangalore\';',
    'UPDATE airports SET "alternative_name" = \'Chennai\' WHERE "city" = \'Madras\';',
    'UPDATE airports SET "alternative_name" = \'Mumba, Boa Baia, Bombay\' WHERE "city" = \'Mumbai\';',
    'UPDATE airports SET "alternative_name" = \'Mangaluru\' WHERE "city" = \'Mangalore\';',
    'UPDATE airports SET "alternative_name" = \'Mysuru\' WHERE "city" = \'Mysore\';',
    'UPDATE airports SET "alternative_name" = \'Kanhiyapur, Cawnpore\' WHERE "city" = \'Kanpur\';',
    'UPDATE airports SET "alternative_name" = \'Vadodra\' WHERE "city" = \'Baroda\';',
    'UPDATE airports SET "alternative_name" = \'Poona\' WHERE "city" = \'Pune\';',
    'UPDATE airports SET "alternative_name" = \'Qila Rai Pithora, Siri, Tughluqabad, Jahanpanah, Kotla Firoz Shah, Purana Qila, Shahjahanabad\' WHERE "city" = \'Delhi\';',
    'UPDATE airports SET "alternative_name" = \'Thiruvananthapuram\' WHERE "city" = \'Trivandrum\';',
    'UPDATE airports SET "alternative_name" = \'Cochin\' WHERE "city" = \'Kochi\';',
    'UPDATE airports SET "alternative_name" = \'Kozhikode\' WHERE "city" = \'Calicut\';',
    'UPDATE airports SET "alternative_name" = \'Lakshmanpuri, Lakhanpur, Lakhnau\' WHERE "city" = \'Lucknow\';',
    'UPDATE airports SET "alternative_name" = \'Thirusirappalli, Trichinopoly, Trichy\' WHERE "city" = \'Tiruchirappalli\';',
    'UPDATE airports SET "alternative_name" = \'Jeypore\' WHERE "city" = \'Jaipur\';',
    'UPDATE airports SET "alternative_name" = \'Belagavi\' WHERE "city" = \'Belgaum\';',
    'UPDATE airports SET "alternative_name" = \'Hubballi\' WHERE "city" = \'Hubli\';',
    'UPDATE airports SET "alternative_name" = \'Banaras\' WHERE "city" = \'Varanasi\';',
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
    'ALTER TABLE airports DROP COLUMN alternative_name;',
    'COMMIT;'
  ];
  db.runSql(data.join("\n"), function(err) {
    if (err) return callback(err);
    callback();
  });
};
