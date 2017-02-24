/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _LODASH       = require('lodash');
const _ALL_AIRPORTS = {
  // TODO: all other "cumulative" airport codes
  'NYC' : { country : 'United States', state : 'New York', city : 'New York' },
  'CHI' : { country : 'United States', state : 'Illinois', city : 'Chicago' },
  'WAS' : { country : 'United States', state : 'District of Columbia', city : 'Washington' },
  'PAR' : { country : 'France', city : 'Paris' },
  'MOW' : { country : 'Russia', city : 'Moscow' },
  'LON' : { country : 'United Kingdom', city : 'London' },
  'TYO' : { country : 'Japan', city : 'Tokyo' },
  'MIL' : { country : 'Italy', city : 'Milan' },
  'YMQ' : { country : 'Canada', city : 'Montreal' },
  'YTO' : { country : 'Canada', city : 'Toronto' },
  'BJS' : { country : 'China', city : 'Beijing' },
  'ROM' : { country : 'Italy', city : 'Rome' },
  'BUE' : { country : 'Argentina', city : 'Buenos Aires' }
};
/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function AlternativeNames() {
};
AlternativeNames.prototype.run = function( argv, asyncsCounter, airports ) {
  var match_airport = function( a1, a2 ) {
    for( var k in a1 ) {
      if( !a2.hasOwnProperty(k) ) return false;
      if( a2[k]!=a1[k] ) return false;
    }
    return true;
  }
  // Count the max ID
  var max_id = -1;
  for( var iata_3code in airports ) {
    if( Number(airports[iata_3code].id)>max_id )
      max_id = Number(airports[iata_3code].id);
  }
  // Create those psedo airports. TODO: Handle WAS separately
  for( var k in _ALL_AIRPORTS ) {
    var matching_airports = [];
    for( var iata_3code in airports ) {
      if( match_airport(_ALL_AIRPORTS[k],airports[iata_3code]) ) {
	matching_airports.push(airports[iata_3code]);
      }
    }
    if( matching_airports && matching_airports.length ) {
      // Clone the largest airport and then change some of its properties
      // PAX is counted as the sum of all other PAXes
      airports[k]            = _LODASH.clone(matching_airports.sort(function(a1,a2){ return (a2.pax?a2.pax:0)-(a1.pax?a1.pax:0);})[0]);
      airports[k].id         = ++max_id;
      airports[k].name       = 'All Airports';
      airports[k].iata_3code = k;
      airports[k].icao_4code = null;
      airports[k].pax        = matching_airports.reduce(function(acc,a){return acc+(a.pax?a.pax:0);},0);
    }
    else {
      if( argv.loglevel>0 ) {
	console.log("All Airports: Cannot find matching airports for %s",k);
      }
    }
  }
};
module.exports = AlternativeNames;
