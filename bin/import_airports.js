#!/usr/bin/nodejs

var fs   = require('fs');
var csv  = require('csv-parser');

// Parse argv for source data file and log level
var argv = require('minimist')(process.argv.slice(2));
if( (argv._.length==0) || argv.hasOwnProperty('help') ) {
    console.log(
	    "This script is to compile information about airports from several publicly accessible sources and print out a\n"+
	    "bunch of INSERT INTO airports() values(...); statements that you can feed into the database.\n\n"+
	    "USAGE: %s [--loglevel=loglevel] [--datfile=datfile] [pax1.csv pax2.csv...]\n\n"+
	    "\t--loglevel - defines verbosity. For production of the SQL INSERT statements needs to be set to 0 or left default\n"+
	    "\t--datfile  - URL to grab the basic airport information from. Defaults to airports data from opeflights github project\n"+
	    "\tpaxN.csv   - a set of .csv files containing information about airport passenger traffic (PAX). Normally you first\n"+
	    "\t             need to produce these files using bin/get_airport_pax_data.sh script and pass all those files on command\n"+
  	    "\t             line to this script. There should be at least one file like that\n\n"+
	    "Keep in mind that one of the things that the script is doing is converting the geolocations of the airports into their\n"+
	    "states and countries. For that we use Google getcoding API that allows us only so many calls per day. Normally one\n"+
	    "successful run of this script uses so much of geocoding quota that you cannot run it again for the next 24 hours.\n",
	    process.argv[1]);
    process.exit(0);
}
argv.datfile  = argv.hasOwnProperty('datfile') ? argv.datfile : 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
argv.loglevel = argv.hasOwnProperty('loglevel') ? Number(argv.loglevel) : 0;

// Fields in the dat file
const datFile_headers = ['id','name','city','country','iata_3code','icao_4code','latitude','longitude','altitude','timezone','dst','tz'];

// Function for read and parse data file as csv
const readDatfile = function( callback ) {
    if ( argv.loglevel > 0 ) {
        console.log("Reading %s", argv.datfile);
    }
    const request   = require('request');
    const datStream = csv({
        separator: ',',
        quote: '"',
        newline: '\n',
        headers: datFile_headers 
    });
    const airports = {};
    request(argv.datfile).pipe(datStream).on('data', function(data) {
        if ( data.iata_3code ) {
            switch ( data.iata_3code ) {
                case 'NID':
                    // Skip some airports
                    return;
                default:
                    // Need to do this or kdTree will do wrong sorting
                    data.longitude = Number(data.longitude);
                    data.latitude = Number(data.latitude);
                    // Add it
                    airports[data.iata_3code.toUpperCase()] = data;
            }
        }
    }).on('end', function() {
        callback(null, airports);
    });
};

var limit = require("simple-rate-limiter");
var limitedRequest = limit(require("request")).to(10).per(1000);
const getGoogleApiData = function(data, cb) {
    if (data.country == 'United States') {
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
            data.latitude + ',' + data.longitude +
            '&key=AIzaSyASMByFEx-M1HAtPIRchtC7YxmD5_Cc-VU';

        return limitedRequest(url, function(error, response, google_data) {
            var jdata = JSON.parse(google_data);
            if (!error && jdata.results && jdata.results[0]) {
                for ( var i = 0; i < jdata.results[0].address_components.length; i++ ) {
                    var addr = jdata.results[0].address_components[i];
                    if (addr.types[0] == 'administrative_area_level_1') {
                        var result = {
                            'state': addr.long_name,
                            'state_short': addr.short_name
                        };
                        return cb(null, result, data);
                    }
                }
                return cb(null, {}, data);
            } else {
                if ( argv.loglevel > 0 ) {
                    console.log('Error:', error, 'Data:', data);
                }
                return cb(error, {}, data);
            }
        });
    } else {
        return cb(null, {}, data);
    }
};

const getReadCsvfile = function( csvfile_name ) {
    // The .csv files with information about airport passenger traffic are gotten from http://www.anna.aero/databases/
    //
    // Another option for figuring out which airports take and do not take passenger traffic is information about
    // "airport enplanements". This information is publicly available at
    // http://www.faa.gov/airports/planning_capacity/passenger_allcargo_stats/passenger/media/cy14-commercial-service-enplanements.xlsx
    // The good news that it has enplanement information for about 500 US airports, compare this with http://www.anna.aero/databases/
    // which has passenger information about 93 US airports out of 1457 total airports in USA. The bad news is that FAA information
    // does not give any information about not USA airports. To support "enplanements" information we will have to create another column in
    // the database.
    //
    // One other way to get airport passenger information is scraping pages like http://www.transtats.bts.gov/airports.asp?Airport=PWM
    return function( callback ) {
        if ( argv.loglevel > 0 ) {
            console.log("Reading %s", csvfile_name);
        }
        var csvStream = csv({
            separator: ',',
            quite: '"',
            newline: '\n',
            headers: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
        });
        var get_hash_index_by_value = function( h, v ) {
            for ( k in h ) {
                if ( h[k] == v ) {
                    return k;
                }
            } 
        };
        const result = {};
        var   code_ndx = undefined;
        var   pax_ndx  = undefined;
        fs.createReadStream(csvfile_name).pipe(csvStream).on('data', function(data) {
            if ( code_ndx == undefined && pax_ndx == undefined ) {
                code_ndx = get_hash_index_by_value(data, "Code");
                pax_ndx  = get_hash_index_by_value(data, "Pax 2014");
            }
            else {
                result[data[code_ndx].toUpperCase()] = data[pax_ndx];
            }
        }).on('end', function() {
            callback(null, {'csvfile_name': csvfile_name, 'pax': result});
        });
    };
};

// Run process..
require('async').parallel(
    [readDatfile].concat(argv._.map(function(a) { return getReadCsvfile(a); })),
    function( err, result ) {
        const util = require('util');
        const formatSqlString = function( s ) {
            if ( !s || s == '\\N' ) {
                return 'null';
            }
            var r = s.replace(/[\0\n\r\b\t\\'\x1a]/g, function (s) {
                switch (s) {
                case "\0":
                    return "\\0";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\b":
                    return "\\b";
                case "\t":
                    return "\\t";
                case "\x1a":
                    return "\\Z";
                case "'":
                    return "''";
                default:
                    return "\\" + s;
                }
            });
            return (r != s) ? util.format("E'%s'", r) : util.format("'%s'", r);
        };
        var airports_pax = {};
        for ( var ndx=1; ndx<result.length; ndx++ ) {
            for ( k in result[ndx].pax ) {
                if ( result[ndx].pax[k] > 0 ) {
                    airports_pax[k] = {
                        'csvfile_name' : result[ndx].csvfile_name,
                        'pax' : result[ndx].pax[k]
                    }
                }
            }
        }

        var geolib        = require('geolib');
        var _             = require('lodash');
        var airports_data = result[0];
        console.log("BEGIN;\n"+
                    "ALTER TABLE airports RENAME TO airports_old;\n"+
                    "CREATE TABLE airports (\n"+
                    "  id        int primary key,\n"+
                    "  name     varchar,\n"+
                    "  city     varchar,\n"+
                    "  country    varchar,\n"+
                    "  iata_3code    varchar(5),\n"+
                    "  icao_4code    varchar(5),\n"+
                    "  latitude    float,\n"+
                    "  longitude    float,\n"+
                    "  altitude    float,\n"+
                    "  timezone    float,\n"+
                    "  dst        varchar(2),\n"+
                    "  tz        varchar,\n"+
                    "  state     varchar,\n"+
                    "  state_short     varchar,\n"+
                    "  pax          float,\n"+
                    "  neighbors varchar\n"+
                    ");\n"+
                    "CREATE INDEX ON airports ((lower(iata_3code)));"
                    );

        // For neighbours calculation, see https://www.npmjs.com/package/kd.tree
        var kdTree = require('kd.tree');
        // Make source data for kd-tree as array of airports objects
        var neighbors_array = [];
        for ( var iata_3code in airports_data ) {
            // Do not include local airports into neighbors
            if ( airports_pax.hasOwnProperty(iata_3code) ) {
                neighbors_array.push(airports_data[iata_3code]);
            }
        }
        var neighbors_kdtree = new kdTree.createKdTree(neighbors_array, function( a, b ) {
            return geolib.getDistance(a, b);
            }, ['latitude','longitude']);

        for ( var iata_3code in airports_data ) {
            var data = _.clone(airports_data[iata_3code], true);

            data.pax = airports_pax.hasOwnProperty(iata_3code) ? airports_pax[iata_3code].pax : 0;
	    
            data.neighbors = neighbors_kdtree.nearest(data, 11).sort(function (a, b) {
                return a[1] - b[1];
            }).filter(function (dd) {
                // Exclude the airport itself as its nearest neighbors
                return dd[0].iata_3code != iata_3code;
            }).map(function (dd) {
                // Map the remainder into a data structure
                return {'iata_3code': dd[0].iata_3code, 'distance': dd[1]};
            });

	    switch( iata_3code ) {
	    case 'TLL':
	    case 'ZQN':
		// see http://prntscr.com/bafap0
		var tmp = data.city;
		data.city = data.name;
		data.name = tmp;
		break;
	    case 'MOW':
		data.name = 'All Airports';
		data.pax  = 77355917;
		break;
	    case 'BKA':
		// see https://en.wikipedia.org/wiki/Bykovo_Airport
		data.pax = 15412;
		break;
	    case 'PWM':
		// see https://en.wikipedia.org/wiki/Portland_International_Jetport
		data.pax = 1667734; 
		break;
	    }

            var done = false;
            getGoogleApiData(data, function (error, apiResult, data) {
                data.state = apiResult.state || '';
                data.state_short = apiResult.state_short || '';
                console.log("INSERT INTO airports(%s,state,state_short,pax,neighbors) VALUES(%d,%s,%s,%s,%s,%s,%d,%d,%d,%d,%s,%s,%s,%s,%d,%s);",
                            datFile_headers.join(","),
                            data.id,
                            formatSqlString(data.name),
                            formatSqlString(data.city),
                            formatSqlString(data.country),
                            formatSqlString(data.iata_3code),
                            formatSqlString(data.icao_4code),
                            data.latitude,
                            data.longitude,
                            data.altitude,
                            data.timezone,
                            formatSqlString(data.dst),
                            formatSqlString(data.tz),
                            formatSqlString(data.state),
                            formatSqlString(data.state_short),
                            data.pax,
                            formatSqlString(JSON.stringify(data.neighbors))
			   );
		
                done = true;
                return data;
            });
            require('deasync').loopWhile(function() {return !done;});
        }
        console.log(
            "DROP TABLE airports_old;\n"+
            "COMMIT;"
        );
    }
);
