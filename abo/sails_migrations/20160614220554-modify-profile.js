var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var async = require('async');

exports.up = function(db, callback) {

    db.createTable('profile_new', {
      user               : { type: "integer", required: true},
      personal_info      : { type: 'json' },
      notify_contact     : { type: 'json' },
      travel_with        : { type: 'json' },
      miles_programs     : { type: 'json' },
      lounge_membership  : { type: 'json' },
      employer           : { type: 'json' },
      preferred_airlines : { type: 'json' }
    }, getAllProfiles);

    function getAllProfiles(err) {
      if (err) { callback(err); return; }
      db.runSql('select * from profile', workWithProfiles);
    }

    function workWithProfiles(err, result) {
      console.log('Profile. found records: ', result.rows.length);

      var _row, keys, values, jsonStruct = {};

      for (var i = 0; i < result.rows.length; i++) {
        _row = result.rows[i];

        jsonStruct.user = _row.user;
        jsonStruct.personal_info = {
          "first_name"  : _row['firstName'],
          "middle_name" : _row['middleName'],
          "last_name"   : _row['lastName'],
          "gender"      : _row['gender'],
          "ethnicity"   : _row['ethnicity'],
          "birthday"    : _row['birthday'],
          "pax_type"    : _row['pax_type'],
          "address"     : {
            "street"        : _row['address'],
            "city"          : _row['city'],
            "state"         : _row['state'],
            "country_code"  : _row['country_code'],
            "zip_code"      : _row['zip_code']
          },
          "show_tiles"  : _row['showTiles']
        };
        jsonStruct.notify_contact = _row.notifyContact;
        jsonStruct.employer = _row.employer;
        jsonStruct.travel_with = _row.travelWith;
        jsonStruct.miles_programs = _row.milesPrograms;
        jsonStruct.lounge_membership = _row.loungeMembership;
        jsonStruct.preferred_airlines = _row.preferredAirlines;

        keys = Object.keys(jsonStruct);
        values = [];

        keys.forEach(function(item, idx){
          values.push(jsonStruct[item])
        });

        console.log('Profile. data for insert: ', keys, values);
        db.insert('profile_new', keys, values, function(err) {
          if (err) { callback(err); return; }
        });
      }

      cleanTables();

    }

    function cleanTables() {
      db.runSql('alter table profile rename to profile_bkp', function(err) {

        if (err) { callback(err); return; }
        db.runSql('alter table profile_new rename to profile', function(err) {

          if (err) { callback(err); return; }
          db.runSql('drop table profile_bkp', function(err) {
            if (err) { callback(err); return; }

            callback();
          })

        })

      });
    }

};

exports.down = function(db, callback) {
  db.dropTable('profile_new', callback);
};
