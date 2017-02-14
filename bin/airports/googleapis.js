/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _RATE_LIMITER    = require("simple-rate-limiter");
const _LIMITED_REQUEST = _RATE_LIMITER(require('request')).to(10).per(100);
      
/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function Googleapis() {
};
Googleapis.prototype.run = function( argv, asyncsCounter, airports ) {
    if( argv.loglevel>0 ) {
        console.log("Starting google getlocation API");
    }
    var quota_exceeded = false;
    for( var iata_3code in airports ) {
	var data = airports[iata_3code];
	if( true || data.country=='United States' ) {
	    var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
		data.latitude + ',' + data.longitude +
		'&key=AIzaSyASMByFEx-M1HAtPIRchtC7YxmD5_Cc-VU';
	    asyncsCounter.http_request(_LIMITED_REQUEST,url,function(error,response,google_data) {
		var jdata = JSON.parse(google_data);
		if( !jdata.results ) {
		    if( argv.loglevel>0 ) {
			console.log("Cannot parse response from GoogleAPIs: %s",google_data);
		    }
		}
		else if( jdata.hasOwnProperty('error_message') && (jdata['error_message'].indexOf('exceeded')>=0) ) {
		    if( argv.loglevel>0 ) {
			console.log("We seem to have exceeded the quota: %s",jdata.error_message);
		    }
		    quota_exceeded = true;
		}
		else if( !jdata.results[0] ) {
		    if( argv.loglevel>0 ) {
			console.log("Unexpected result from GoogleAPIs: %j",jdata);
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
