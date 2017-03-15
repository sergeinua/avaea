"use strict";

/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _COMMON                = require('./common');

/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function Database() {
};
Database.prototype.run = function( asyncsCounter ) {
  _COMMON.log(0,"Database: Querying existing airports from table \""+_COMMON.argv.table+"\"");
  const pgclient = _COMMON.get_connection();
  try {
    let cleanup_sql_string = ( s ) => {
      return (s==='' || s===null ) ? undefined : s.trim();
    };
    asyncsCounter.sql_query(
      pgclient,
      "SELECT * FROM \""+_COMMON.argv.table+"\"",
      function( result ) {
	result.rows.forEach(function( r ) {
	  if( r.iata_3code===null )
	    return;
	  _COMMON.airports[r.iata_3code.toUpperCase()] = {
	    source           : 'database',
	    id               : _COMMON.convert_to_number(r,'id'),
	    name             : _COMMON.convert_to_string(r,'name',cleanup_sql_string),
	    city             : _COMMON.convert_to_string(r,'city',cleanup_sql_string),
	    state            : _COMMON.convert_to_string(r,'state',cleanup_sql_string),
	    country          : _COMMON.convert_to_string(r,'country',cleanup_sql_string),
	    iata_3code       : _COMMON.convert_to_string(r,'iata_3code',cleanup_sql_string),
	    icao_4code       : _COMMON.convert_to_string(r,'icao_4code',cleanup_sql_string),
	    latitude         : _COMMON.convert_to_number(r,'latitude'),
	    longitude        : _COMMON.convert_to_number(r,'longitude'),
	    altitude         : _COMMON.convert_to_number(r,'altitude'),
	    timezone         : _COMMON.convert_to_number(r,'timezone'),
	    dst              : _COMMON.convert_to_string(r,'dst',cleanup_sql_string),
	    tz               : _COMMON.convert_to_string(r,'tz',cleanup_sql_string),
	    state_short      : _COMMON.convert_to_string(r,'state_short',cleanup_sql_string),
	    pax              : _COMMON.convert_to_number(r,'pax'),
	    alternative_name : _COMMON.convert_to_string(r,'alternative_name',cleanup_sql_string)
	  };
	});
      });
    asyncsCounter.wait();
  }
  finally {
    pgclient.end();
  }
  return _COMMON.airports;
};
module.exports = Database;
