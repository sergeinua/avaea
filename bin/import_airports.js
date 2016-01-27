#!/usr/bin/nodejs

var fs   = require('fs');
var csv  = require('csv-parser');

var argv = require('minimist')(process.argv.slice(2));
argv.datfile  = argv.hasOwnProperty('datfile') ? argv.datfile : 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
argv.loglevel = argv.hasOwnProperty('loglevel') ? Number(argv.loglevel) : 0;

const datFile_headers = ['id','name','city','country','iata_3code','icao_4code','latitude','longitude','altitude','timezone','dst','tz'];
const readDatfile = function( callback ) {
    if( argv.loglevel>0 )
        console.log("Reading %s",argv.datfile);
    const request   = require('request');
    const datStream = csv({
        separator: ',',
        quote: '"',
        newline: '\n',
        headers: datFile_headers 
    });
    const airports = {};
    request(argv.datfile).pipe(datStream).on('data',function(data) {
        if( data.iata_3code ) {
            // Need to do this or kdTree will do wrong sorting
            data.longitude = Number(data.longitude);
            data.latitude = Number(data.latitude);
            // Add it 
            airports[data.iata_3code.toUpperCase()] = data;
        }
    }).on('end',function() {
        callback(null,airports);
    });
};
const getReadCsvfile = function( csvfile_name ) {
    return function( callback ) {
        if( argv.loglevel>0 ) 
            console.log("Reading %s",csvfile_name);
        var csvStream = csv({
            separator: ',',
            quite: '"',
            newline: '\n',
            headers: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
        });
        var get_hash_index_by_value = function( h, v ) {
            for( k in h ) {
                if( h[k]==v ) 
                    return k; 
            } 
        }
        const result = {};
        var   code_ndx = undefined;
        var   pax_ndx  = undefined;
        fs.createReadStream(csvfile_name).pipe(csvStream).on('data',function(data) {
            if( code_ndx==undefined && pax_ndx==undefined ) {
                code_ndx = get_hash_index_by_value(data,"Code");
                pax_ndx  = get_hash_index_by_value(data,"Pax 2014");
            }
            else {
                result[data[code_ndx].toUpperCase()] = data[pax_ndx];
            }
        }).on('end',function() {
            callback(null,{'csvfile_name': csvfile_name, 'pax': result});
        });
    };
};
require('async').parallel(
    [readDatfile].concat(argv._.map(function(a) { return getReadCsvfile(a); })),
    function( err, result ) {
        const util = require('util');
        const formatSqlString = function( s ) {
            if( s=='\\N' ) return 'null';
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
            return r!=s ? util.format("E'%s'",r) : util.format("'%s'",r); 
        };
        var airports_pax = {};
        for( var ndx=1; ndx<result.length; ndx++ ) {
            for( k in result[ndx].pax ) {
                if( result[ndx].pax[k]>0 ) {
                    airports_pax[k] = {
                        'csvfile_name' : result[ndx].csvfile_name,
                        'pax' : result[ndx].pax[k]
                    }
                }
            }
        }
        var geolib        = require('geolib');
        var airports_data = result[0];
        console.log("BEGIN;\n"+
                    "ALTER TABLE airports_new RENAME TO airports_old;\n"+
                    "CREATE TABLE airports_new (\n"+
                    "  id		int primary key,\n"+
                    "  name 	varchar,\n"+
                    "  city 	varchar,\n"+
                    "  country	varchar,\n"+
                    "  iata_3code	varchar(5),\n"+
                    "  icao_4code	varchar(5),\n"+
                    "  latitude	float,\n"+
                    "  longitude	float,\n"+
                    "  altitude	float,\n"+
                    "  timezone	float,\n"+
                    "  dst		varchar(2),\n"+
                    "  tz		varchar,\n"+
                    "  pax          float,\n"+
                    "  neighbors varchar\n"+
                    ");");
        // see https://github.com/ubilabs/kd-tree-javascript
        var kdTree = require('kd-tree-javascript/kdTree');
        var airports_data_array = [];
        for( var iata_3code in airports_data ) {
            airports_data_array.push(airports_data[iata_3code]);
        }
        var tree = new kdTree.kdTree(airports_data_array,function( a, b ) {
            return geolib.getDistance(a,b);
        },['latitude','longitude']);
        for( var iata_3code in airports_data ) {
            var data = airports_data[iata_3code];
            data.pax = airports_pax.hasOwnProperty(iata_3code) ? airports_pax[iata_3code].pax : 0;
            data.neighbors = tree.nearest(data,11).sort(function(a,b) {
                return a[1]-b[1];
            }).slice(1).map(function( dd ) {
                return {'iata_3code':dd[0].iata_3code,'distance':dd[1]};
            });
            console.log("INSERT INTO airports_new(%s,pax,neighbors) VALUES(%d,%s,%s,%s,%s,%s,%d,%d,%d,%d,%s,%s,%d,%s);",
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
                        data.pax,
                        formatSqlString(JSON.stringify(data.neighbors)));
        }
        console.log("DROP TABLE airports_old;\n"+
                    "ROLLBACK;");
    }
);
