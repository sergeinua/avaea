#!/usr/bin/nodejs

"use strict";

const _COMMON   = require('./common');
const _LATINIZE = require('latinize');

/////////////////////////////////////////////////////////////////
// top level
/////////////////////////////////////////////////////////////////
const argv = require('minimist')(process.argv.slice(2));
argv.loglevel = argv.hasOwnProperty('loglevel') ? Number(argv.loglevel) : 0;
argv.database = argv.hasOwnProperty('database') ? argv.database         : 'avaea';
argv.user     = argv.hasOwnProperty('user')     ? argv.user             : 'avaea';
argv.password = argv.hasOwnProperty('password') ? argv.password         : '';
if( argv.hasOwnProperty('help') ) {
    console.log(
    "USAGE: %s [--loglevel=loglevel] [--database=avaea] [--user=avaea] [--password=]\n"+
        "--loglevel - defines verbosity.\n"+
        "--database - database to connect to on localhost. Default is 'avaea'\n"+
        "--user     - name of the user to connect to the database as. Default is 'avaea'\n"+
        "--password - password of the user to connect to the database as. Default is ''\n",
    process.argv[1]);
    process.exit(0);
}

// 
const asyncsCounter      = new _COMMON.AsyncsCounter();
const pgclient           = _COMMON.get_connection(argv);
const makePretend        = true;
const fields_to_latinize = ['city','state','country'];

function get_object_keys( o ) {
  let result = [];
  for( let k in o ) {
    result.push(k);
  }
  return result;
}

asyncsCounter.sql_query(
  pgclient,
  "SELECT * FROM airports",
  function( result ) {
    result.rows.forEach(function( r ) {
      var changes = {};
      fields_to_latinize.forEach(function( e, ndx ) {
	if( r.hasOwnProperty(e) ) {
	  let latin_value = _LATINIZE(r[e]);
	  if( latin_value!=r[e] ) {
	    changes[e]                  = latin_value;
	    if( !changes.hasOwnProperty('alternative_name') ) {
	      changes['alternative_name'] = r.alternative_name ? [r.alternative_name] : [];
	    }
	    changes['alternative_name'].push(r[e]);
	  }
	}
      });
      let changes_keys = get_object_keys(changes);
      if( changes_keys.length>0 ) {
	// Since there is at least one key then there must ne 'alternative_name'
	changes['alternative_name'] = changes['alternative_name'].join(' ');
	console.log("UPDATE airports SET "+changes_keys.map(function(e,ndx) { return e+'='+_COMMON.escape_sql_value(changes[e],'string'); } ) .join(',')+" WHERE iata_3code='"+r['iata_3code']+"';")
      }
    });
  }
);

asyncsCounter.wait();
pgclient.end();
