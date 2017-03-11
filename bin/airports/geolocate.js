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
function Geolocate() {
};
Geolocate.prototype.run = function( asyncsCounter ) {
  _COMMON.log(0,"Googleapis: Starting google geolocation API");
  var airports       = {};
  var quota_exceeded = false;
  for( let iata_3code in _COMMON.airports ) {
    let known_airport = _COMMON.airports[iata_3code];
    let data = airports[iata_3code] = {
      'source'     : 'geolocate',
      'iata_3code' : iata_3code
    };
    if( ((known_airport.state||'')!='') && ((known_airport.state_short||'')!='') && !_COMMON.argv.hasOwnProperty('geolocate_all') ) {
      _COMMON.log(2,"Geolocate: using already known geolocations for "+iata_3code);
      data.state       = known_airport.state;
      data.state_short = known_airport.state_short;
    }
    else {
      _COMMON.log(1,"Geolocate: querying Google API for "+iata_3code);
      // Get it from google API
      var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
	  known_airport.latitude + ',' + known_airport.longitude +
	  '&key=AIzaSyASMByFEx-M1HAtPIRchtC7YxmD5_Cc-VU';
      asyncsCounter.http_request(_LIMITED_REQUEST,url,function(error,response,geodata) {
	var jdata = JSON.parse(geodata);
	if( !jdata.results ) {
	  _COMMON.log(0,"Geolocate: Cannot parse response from GoogleAPIs: %s",geodata);
	}
	else if( jdata.hasOwnProperty('error_message') && (jdata['error_message'].indexOf('exceeded')>=0) ) {
	  _COMMON.log(0,"Geolocate: We seem to have exceeded the quota: %s",jdata.error_message);
	  quota_exceeded = true;
	}
	else if( !jdata.results[0] ) {
	  _COMMON.log(0,"Geolocate: Unexpected result for %s from GoogleAPIs: %j",iata_3code,jdata);
	}
	else {
	  _COMMON.log(2,"Geolocate: got result for %s from GoogleAPIs: %j",iata_3code,jdata);
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
module.exports = Geolocate;
