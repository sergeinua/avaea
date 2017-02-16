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
Googleapis.prototype.get_geolocation_from_table = function( argv, iata_3code ) {
  if( !_CACHE_OF_GEOLOCATIONS.hasOwnProperty('__we_have_alteady_queried_geotable__') && argv.hasOwnProperty("geotable") ) {
    if( argv.loglevel>0 ) {
      console.log("Googleapis: Quering existing geolocations from table \""+argv.geotable+"\"");
    }
    const pgclient = _COMMON.get_connection(argv);
    try {
      const asyncsCounter = new _COMMON.AsyncsCounter();
      asyncsCounter.sql_query(
	pgclient,
	"SELECT iata_3code,state,state_short FROM \""+argv.geotable+"\" WHERE state IS NOT NULL",
	function( result ) {
	  result.rows.forEach(function( r ) {
	    _CACHE_OF_GEOLOCATIONS[r.iata_3code] = r;
	  });
	});
      asyncsCounter.wait();
    }
    finally {
      if( argv.loglevel>2 ) {
	console.log("Googleapis: Got existing geolocations from table \""+argv.geotable+"\"");
      }
      pgclient.end();
      _CACHE_OF_GEOLOCATIONS['__we_have_alteady_queried_geotable__'] = true;
    }
  }
  if( _CACHE_OF_GEOLOCATIONS.hasOwnProperty(iata_3code) ) {
    if( argv.loglevel>1 ) {
      console.log("Googleapis: Found existing geolocation for "+iata_3code);
    }
    return _CACHE_OF_GEOLOCATIONS[iata_3code];
  }
  return undefined;
}
Googleapis.prototype.run = function( argv, asyncsCounter, airports ) {
  if( argv.loglevel>0 ) {
    console.log("Googleapis: Starting google geolocation API");
  }
  var quota_exceeded = false;
  for( var iata_3code in airports ) {
    var data        = airports[iata_3code];
    var geolocation = this.get_geolocation_from_table(argv,iata_3code);
    if( geolocation ) {
      // We got it from the table!
      data.state       = geolocation.state;
      data.state_short = geolocation.state_short;
    }
    else {
      if( argv.loglevel>1 ) {
	console.log("Googleapis: querying Google API for "+iata_3code);
      }
      // Get it from google API
      var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
	  data.latitude + ',' + data.longitude +
	  '&key=AIzaSyASMByFEx-M1HAtPIRchtC7YxmD5_Cc-VU';
      asyncsCounter.http_request(_LIMITED_REQUEST,url,function(error,response,google_data) {
	var jdata = JSON.parse(google_data);
	if( !jdata.results ) {
	  if( argv.loglevel>0 ) {
	    console.log("Googleapis: Cannot parse response from GoogleAPIs: %s",google_data);
	  }
	}
	else if( jdata.hasOwnProperty('error_message') && (jdata['error_message'].indexOf('exceeded')>=0) ) {
	  if( argv.loglevel>0 ) {
	    console.log("Googleapis: We seem to have exceeded the quota: %s",jdata.error_message);
	  }
	  quota_exceeded = true;
	}
	else if( !jdata.results[0] ) {
	  if( argv.loglevel>0 ) {
	    console.log("Googleapis: Unexpected result from GoogleAPIs: %j",jdata);
	  }
	}
	else {
	  for ( var i = 0; i < jdata.results[0].address_components.length; i++ ) {
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
};
module.exports = Googleapis;
