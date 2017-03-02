#!/usr/bin/nodejs

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

asyncsCounter.sql_query(
  pgclient,
  "SELECT * FROM airports",
  function( result ) {
    result.rows.forEach(function( r ) {
      var changed_values = [];
      fields_to_latinize.forEach(function( e, ndx ) {
	if( r.hasOwnProperty(e) ) {
	}
      });
      
      if( r.hasOwnProperty('city') ) {
	let latin_value = r['city'];
	if( latin_value!=r['city'] ) {
	  r['city'] = latin_value;
	  changed_values.push('city');
	}
      }
      console.log(row.join(","));
    });
  }
);
asyncsCounter.wait();
pgclient.end();
