#!/usr/bin/nodejs

"use strict";

const _COMMON = require('./common');

/////////////////////////////////////////////////////////////////
// top level
/////////////////////////////////////////////////////////////////
if( _COMMON.argv.hasOwnProperty('help') ) {
  console.log(
    "USAGE: %s [--loglevel=loglevel] [--database=avaea] [--user=avaea] [--password=] [--table=] [--geotable=] [--dump_to_table=] [--migrate_table=airports]\n"+
      "--loglevel      - defines verbosity.\n"+
      "--database      - database to connect to on localhost. Default is 'avaea'\n"+
      "--user          - name of the user to connect to the database as. Default is 'avaea'\n"+
      "--password      - password of the user to connect to the database as. Default is ''\n"+
      "--table         - where to read the initial set of airports from\n"+
      "--geotable      - if provided then should point to a table in the database defined above\n"+
      "                  containing columns iata_3code, state and state_short. In this case module\n"+
      "                  googleapis won't be called for those values of iata_3code that are in that\n"+
      "                  table. This saves on Google API quota. If not provided or empty then Google\n"+
      "                  Geolocation API will called for *each* found iats_3code.\n"+
      "--dump_to_table - if provided then the script will dump all found airports into that table and\n"+
      "                  WILL IGNORE --migrate_table argument.\n"+
      "--migrate_table - if provided then the script will dump on STDOUT a set of SQL statement\n"+
      "                  that update the given table with the data the script found. The default is\n"+
      "                  'airports'\n",
    process.argv[1]);
  process.exit(0);
}
// 
var modules       = [
  
  // This just reads initial airports from th database
  './database'
  
  // The following modules just populate _COMMON.airports. In case if for the same airport
  // there are multiple values of the same property name then the value of the property 
  // becomes a hash indexed by the source of the property value (see merge_airports)
  ,'./openflights' // has to be the first because it has getlocations
  ,'./annaaero'
  ,'./googleapis'
  ,'./alternative_names'
  ,'./spreadsheet'
  ,'./wikipedia'
  
  // These modules cleanup what has been found before and calculate additional values
  ,'./disambiguate'
  ,'./latinize'
  ,'./neighbors'    // has to be after other modules counting the pax
  ,'./all_airports'
];
var asyncsCounter = new _COMMON.AsyncsCounter();
modules.forEach(function( moduleName ) {
  // run the module
  var Module = require(moduleName);
  (new Module()).run(asyncsCounter);
  // Wait for all its asyncs to finish
  asyncsCounter.wait();
  console.log("Module %s has finished",moduleName);
});

// Now all the data is in airports
if( _COMMON.argv.hasOwnProperty("dump_to_table") ) {
  // Write airports to the database
  const pgclient = _COMMON.get_connection();
  try {
    var fields   = [
      ["id"         ,"int primary key"],
      ["name"       ,"varchar"],
      ["city"       ,"varchar"],
      ["country"    ,"varchar"],
      ["iata_3code" ,"varchar(5)"],
      ["icao_4code" ,"varchar(5)"],
      ["latitude"   ,"float"],
      ["longitude"  ,"float"],
      ["altitude"   ,"float"],
      ["timezone"   ,"float"],
      ["dst"        ,"varchar(2)"],
      ["tz"         ,"varchar"],
      ["state"      ,"varchar"],
      ["state_short","varchar"],
      ["pax"        ,"float"],
      ["wikipedia"  ,"varchar"], // New field. Will contain ALL airport properties we were able to grab from Wikipedia (not only pax)
      ["neighbors"  ,"varchar"],
      ["alternative_name", "varchar"]
    ];
    asyncsCounter.sql_query(
      pgclient,
      "BEGIN;\n"+
	"DROP TABLE IF EXISTS "+_COMMON.argv.dump_to_table+" CASCADE;\n"+
	"CREATE TABLE "+_COMMON.argv.dump_to_table+" (\n"+fields.map(function(f){return f[0]+" "+f[1];}).join(",\n")+");\n"+
	"CREATE INDEX ON "+_COMMON.argv.dump_to_table+"(lower(iata_3code));");
    var airport_count = 0;
    for( var iata_3code in _COMMON.airports ) {
      var data = _COMMON.airports[iata_3code];
      if( !data.hasOwnProperty('iata_3code') || !data.hasOwnProperty('id') ) {
	_COMMON.log(0,"Skipping an incomplete airport record %j",data);
      }
      else {
	asyncsCounter.sql_query(
	  pgclient,
	  {
	    'text'  : "INSERT INTO "+_COMMON.argv.dump_to_table+"("+fields.map(function(f){return f[0];}).join(",")+") VALUES("+fields.map(function(f,ndx){return ("$"+(ndx+1));}).join(",")+");",
            'values': fields.map(function( f ) {
	      if( !this.hasOwnProperty(f[0]) ) return null;
  	      return this[f[0]];
	    },data)
	  });
      }
    }
    asyncsCounter.sql_query(pgclient,"COMMIT;");
    asyncsCounter.wait();
  }
  finally {
    pgclient.end();
  }
}
else if( _COMMON.argv.hasOwnProperty("migrate_table") ) {
  // Write airports to the database
  const pgclient = _COMMON.get_connection();
  try {
    let iata_3codes_existing_in_table = {
    };
    let fields_metadata = {
      id               : 'number',
      name             : 'string',
      city             : 'string',
      country          : 'string',
      iata_3code       : 'string',
      icao_4code       : 'string',
      latitude         : 'number',
      longitude        : 'number',
      altitude         : 'number',
      timezone         : 'number',
      dst              : 'string',
      tz               : 'string',
      state            : 'string',
      state_short      : 'string',
      pax              : 'number',
      neighbors        : 'string',
      alternative_name : 'string'
    };
    asyncsCounter.sql_query(
      pgclient,
      "SELECT * FROM \""+_COMMON.argv.migrate_table+"\"",
      function( result ) {
	result.rows.forEach(function( r ) {
	  if( r.hasOwnProperty("iata_3code") ) {
	    iata_3codes_existing_in_table[r.iata_3code] = true;
	    if( _COMMON.airports.hasOwnProperty(r.iata_3code) ) {
	      var get_fields_to_update = function( r1, r2 ) {
		// Carefully collate the records
		var result = [];
		for( let k in r1 ) {
		  if( k=='iata_3code' )
		    continue;
		  if( r2.hasOwnProperty(k) ) {
		    if( (r2[k]==null) || (r2[k]==undefined) ) {
		      _COMMON.log(3,"// Airport "+r1.iata_3code+": will not overwrite property \""+k+"\" with NULL");
		    }
		    else {
		      if( (r1[k]==null) || (r1[k]==undefined) ) {
			result.push(k);
		      }
		      else {
			if( r1[k]!=r2[k] ) {
			  result.push(k);
			}
			else {
			  _COMMON.log(3,"// Airport "+r1.iata_3code+": property \""+k+"\" is already filled with the same value");
			}
		      }
		    }
		  }
		  else {
		    _COMMON.log(3,"// Airport "+r1.iata_3code+": property \""+k+"\" exists in \""+_COMMON.argv.migrate_table+"\" but not in %j",r2);
		  }
		}
		return result;
	      }
	      let fields_to_update = get_fields_to_update(r,_COMMON.airports[r.iata_3code]);
	      if( fields_to_update.length>0 ) {
		console.log("UPDATE \""+_COMMON.argv.migrate_table+"\" SET "+fields_to_update.map(
		  function( e ) { return e+"="+_COMMON.escape_sql_value(this[e],fields_metadata[e]); },
		  _COMMON.airports[r.iata_3code]).join(',')+" WHERE iata_3code='"+r.iata_3code+"';");
	      }
	    }
	    else {
	      console.log("// Airport "+r.iata_3code+" exists in \""+_COMMON.argv.migrate_table+"\" but is not known elsewhere");
	    }
	  }
	  else {
	    _COMMON.log(0,"Looks like we got a wrong table \""+_COMMON.argv.migrate_table+"\" for migration");
	  }
	});
      });
    asyncsCounter.wait();
    for( let iata_3code in _COMMON.airports ) {
      if( iata_3codes_existing_in_table.hasOwnProperty(iata_3code) ) {
	// We already updated it
      }
      else {
	let keys = [];
	for( let k in _COMMON.airports[iata_3code] ) {
	  if( fields_metadata.hasOwnProperty(k) ) {
	    keys.push(k);
	  }
	  else {
	    // Perhaps 'wikipedia'?
	    // TODO: add wikipedia to the table
	  }
	}
	console.log("INSERT INTO \""+_COMMON.argv.migrate_table+"\"("+keys.join(",")+") VALUES("+keys.map(
	  function( e ) { return _COMMON.escape_sql_value(this[e],fields_metadata[e]); } ,
	  _COMMON.airports[iata_3code]).join(",")+");");
      }
    }
  }
  finally {
    pgclient.end();
  }
  // TODO: find all records in airports that are not in migrate_table
}
else {
  console.log(_COMMON.airports);
}
