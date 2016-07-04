var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var async = require('async');
var fs = require('fs');
var path = require('path');

exports.up = function(db, callback) {

  // just for safe trainings :)
  //  callback();
  //return;

    db.createTable('profile_new', {
      user               : {type: 'integer', notNull: true },
      personal_info      : { type: 'json' },
      notify_contact     : { type: 'json' },
      travel_with        : { type: 'json' },
      miles_programs     : { type: 'json' },
      lounge_membership  : { type: 'json' },
      employer           : { type: 'json' },
      preferred_airlines : { type: 'json' },
      id                 : { type: 'integer', notNull: true, autoIncrement: true, primaryKey: true},
      createdAt          : { type: 'timestamp with time zone'},
      updatedAt          : { type: 'timestamp with time zone'}
    }, getAllProfiles);

    function getAllProfiles(err) {
      if (err) { callback(err); return; }
      db.runSql("select to_char(birthday, 'YYYY-MM-DD') as char_date, * from profile", workWithProfiles);
    }

    function workWithProfiles(err, result) {
      console.log('Profile. found records: ', result.rows.length);

      var _row, keys, values, jsonStruct = {};

      for (var i = 0; i < result.rows.length; i++) {
        _row = result.rows[i];

        console.log(_row);

        jsonStruct.user = _row.user;
        jsonStruct.personal_info = {
          "first_name": _row['firstName'] || '',
          "middle_name": _row['middleName'] || '',
          "last_name": _row['lastName'] || '',
          "gender": _row['gender'] || '',
          "ethnicity": _row['ethnicity'] || '',
          "birthday": _row['char_date'] || '',
          "pax_type": _row['pax_type'] || '',
          "address": {
            "street": _row['address'] || '',
            "city": _row['city'] || '',
            "state": _row['state'] || '',
            "country_code": _row['country_code'] || '',
            "zip_code": _row['zip_code'] || ''
          },
          "show_tiles": _row['showTiles'] || false
        };

        jsonStruct.notify_contact = _row.notifyContact || {};

        jsonStruct.employer = {};
        if (Object.keys(_row.employer || {}).length) {
          jsonStruct.employer = JSON.parse(JSON.stringify(_row.employer).replace('companyName', 'company_name'))
        }

        jsonStruct.travel_with = JSON.parse(JSON.stringify(_row.travelWith || [])
            .replace(/firstName/g, 'first_name')
            .replace(/lastName/g, 'last_name')
            .replace(/DateOfBirth/g, 'date_of_birth'));

        jsonStruct.miles_programs = JSON.parse(JSON.stringify(_row.milesPrograms || [])
            .replace(/airlineName/g, 'airline_name')
            .replace(/accountNumber/g, 'account_number')
            .replace(/flierMiles/g, 'flier_miles')
            .replace(/expirationDate/g, 'expiration_date'));

        jsonStruct.lounge_membership = JSON.parse(JSON.stringify(_row.loungeMembership || [])
            .replace(/airlineName/g, 'airline_name')
            .replace(/membershipNumber/g, 'membership_number')
            .replace(/expirationDate/g, 'expiration_date'));

        jsonStruct.preferred_airlines = JSON.parse(JSON.stringify(_row.preferredAirlines || [])
            .replace(/travelType/g, 'travel_type')
            .replace(/airlineName/g, 'airline_name'));

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

  var dropTable = 'drop table profile cascade;';

  var restoreTable =
    'CREATE TABLE profile  (\
      "user" integer,\
      "firstName" text,\
      "middleName" text,\
      "lastName" text,\
      gender text,\
      birthday date,\
      pax_type text,\
      address text,\
      "notifyContact" json,\
      "travelWith" json,\
      "milesPrograms" json,\
      "loungeMembership" json,\
      employer json,\
      ethnicity text,\
      "showTiles" boolean,\
      "preferredAirlines" json,\
      city text,\
      state text,\
      country_code text,\
      zip_code text,\
      id serial NOT NULL,\
      "createdAt" timestamp with time zone,\
      "updatedAt" timestamp with time zone,\
      CONSTRAINT profile_pkey PRIMARY KEY (id)\
    )\
    WITH (\
        OIDS=FALSE\
    );\
    ALTER TABLE profile\
    OWNER TO avaea;';


  db.runSql(dropTable, function(err) {
    if (err) return callback(err);

    db.runSql(restoreTable, function(err) {
      if (err) return callback(err);

      var filePath = path.join(__dirname + '/sqls/19700101000006-profile-up.sql');
      fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        if (err) return callback(err);
        console.log('received data: ' + data);

        db.runSql(data, function(err) {
          if (err) return callback(err);
          callback();
        });
      });


    });

  });

};
