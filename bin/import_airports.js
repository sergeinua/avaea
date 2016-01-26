#!/usr/bin/nodejs

var fs   = require('fs');
var csv  = require('csv-parser');
var argv = require('minimist')(process.argv.slice(2));
if( argv.datfile ) {
  if( argv.datfile=='default' ) {
    argv.datfile = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
  }
  const datFile_headers = ['id','name','city','country','iata_3code','icao_4code','latitude','longitude','altitude','timezone','dst','tz'];
  var readDatfile = function( callback ) {
    // console.log("Reading %s",argv.datfile);
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
        airports[data.iata_3code.toUpperCase()] = data;
      }
    }).on('end',function() {
      callback(null,airports);
    });
  };
  const getReadCsvfile = function( csvfile_name ) {
    return function( callback ) {
       // console.log("Reading %s",csvfile_name);
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
  const tasks = [readDatfile];
  argv._.forEach(function(a) {
    tasks.push(getReadCsvfile(a));
  });
  require('async').parallel(
    tasks,
    function( err, result ) {
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
"  pax          float\n"+
");");
      const util = require('util');
      const formatSqlString = function( s ) {
        if( s=='\\N' ) return 'null';
        var r = s.replace(/[\0\n\r\b\t\\'"\x1a]/g, function (s) {
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
          case '"':
            return '""';
          default:
            return "\\" + s;
          }
        });
        return r!=s ? util.format("E'%s'",r) : util.format("'%s'",r);  
      };
      for( var iata_3code in result[0] ) {
         var data = result[0][iata_3code];
         var pax  = 0;
         for( var ndx=1; ndx<result.length; ndx++ ) {
            if( result[ndx].pax.hasOwnProperty(iata_3code) ) {
              // console.log("found pax for %s in %s",iata_3code,result[ndx].csvfile_name);
              pax = result[ndx].pax[iata_3code];
              break;
            }
         }
         console.log("INSERT INTO airports_new(%s,pax) VALUES(%d,%s,%s,%s,%s,%s,%d,%d,%d,%d,%s,%s,%d);",
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
           pax);
      }
      console.log("DROP TABLE airports_old;\n"+
"ROLLBACK;");
    }
  );
}
else {
  console.log("--datfile was not specified");
  process.exit(1);
}

