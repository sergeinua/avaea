"use strict";

/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _COMMON                = require('./common');
const _RATE_LIMITER          = require("simple-rate-limiter");
const _LIMITED_REQUEST       = _RATE_LIMITER(require('request')).to(10).per(100);
const _CACHE_OF_GEOLOCATIONS = {};

/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function Googleapis() {
};
Googleapis.prototype.get_geolocation_from_table = function( iata_3code ) {
  if( !_CACHE_OF_GEOLOCATIONS.hasOwnProperty('__we_have_alteady_queried_geotable__') && _COMMON.argv.hasOwnProperty("geotable") ) {
    _COMMON.log(0,"Googleapis: Quering existing geolocations from table \""+_COMMON.argv.geotable+"\"");
    const pgclient = _COMMON.get_connection();
    try {
      const asyncsCounter = new _COMMON.AsyncsCounter();
      asyncsCounter.sql_query(
	pgclient,
	"SELECT iata_3code,state,state_short FROM \""+_COMMON.argv.geotable+"\" WHERE state IS NOT NULL",
	function( result ) {
	  result.rows.forEach(function( r ) {
	    _CACHE_OF_GEOLOCATIONS[r.iata_3code] = r;
	  });
	});
      asyncsCounter.wait();
    }
    finally {
      _COMMON.log(2,"Googleapis: Got existing geolocations from table \""+_COMMON.argv.geotable+"\"");
      pgclient.end();
      _CACHE_OF_GEOLOCATIONS['__we_have_alteady_queried_geotable__'] = true;
    }
  }
  if( _CACHE_OF_GEOLOCATIONS.hasOwnProperty(iata_3code) ) {
    _COMMON.log(2,"Googleapis: Found existing geolocation for "+iata_3code);
    return _CACHE_OF_GEOLOCATIONS[iata_3code];
  }
  return undefined;
}
Googleapis.prototype.run = function( asyncsCounter ) {
  _COMMON.log(0,"Googleapis: Starting google geolocation API");
  var airports       = {};
  var quota_exceeded = false;
  for( let iata_3code in _COMMON.airports ) {
    let known_airport = _COMMON.airports[iata_3code];
    let data = airports[iata_3code] = {
      'source'     : 'googleapis',
      'iata_3code' : iata_3code
    };
    var geolocation = this.get_geolocation_from_table(iata_3code);
    if( geolocation ) {
      // We got it from the table!
      data.state       = geolocation.state;
      data.state_short = geolocation.state_short;
    }
    else {
      _COMMON.log(1,"Googleapis: querying Google API for "+iata_3code);
      // Get it from google API
      var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
	  known_airport.latitude + ',' + known_airport.longitude +
	  '&key=AIzaSyASMByFEx-M1HAtPIRchtC7YxmD5_Cc-VU';
      asyncsCounter.http_request(_LIMITED_REQUEST,url,function(error,response,google_data) {
	var jdata = JSON.parse(google_data);
	if( !jdata.results ) {
	  _COMMON.log(0,"Googleapis: Cannot parse response from GoogleAPIs: %s",google_data);
	}
	else if( jdata.hasOwnProperty('error_message') && (jdata['error_message'].indexOf('exceeded')>=0) ) {
	  _COMMON.log(0,"Googleapis: We seem to have exceeded the quota: %s",jdata.error_message);
	  quota_exceeded = true;
	}
	else if( !jdata.results[0] ) {
	  _COMMON.log(0,"Googleapis: Unexpected result for %s from GoogleAPIs: %j",iata_3code,jdata);
	}
	else {
	  _COMMON.log(2,"Googleapis: got result for %s from GoogleAPIs: %j",iata_3code,jdata);
	  for ( let i = 0; i < jdata.results[0].address_components.length; i++ ) {
	    var addr = jdata.results[0].address_components[i];
	    if (addr.types[0] == 'administrative_area_level_1') {
	      data.state = addr.long_name || '';
	      data.state_short = addr.short_name || '';
	    }
	  }
	}
      });
      // Obey the rate
      asyncsCounter.wait();
      if( quota_exceeded )
	break;
    }
  }
  _COMMON.merge_airports(airports);
};
module.exports = Googleapis;
