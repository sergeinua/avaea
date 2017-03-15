"use strict";

/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _COMMON       = require('./common');
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
function AllAirports() {
};
AllAirports.prototype.run = function() {
  let get_matching_airports = ( a ) => {
    let match_airport = ( a, a2 ) => {
      for( let k in a ) {
	if( !a2.hasOwnProperty(k) )
	  return false;
	if( a2[k]!=a[k] )
	  return false;
      }
      return true;
    }
    let result = [];
    for( let iata_3code in _COMMON.airports ) {
      if( match_airport(a,_COMMON.airports[iata_3code]) ) {
	result.push(_COMMON.airports[iata_3code]);
      }
    }
    return result;
  }
  // Create those pseudo airports. TODO: Handle WAS separately
  for( let iata_3code in _ALL_AIRPORTS ) {
    var matching_airports = get_matching_airports(_ALL_AIRPORTS[iata_3code]);
    if( matching_airports && matching_airports.length ) {
      _COMMON.airports[iata_3code] = {
	'source'     : 'all_airports',
	'name'       : 'All Airports',
	'iata_3code' : iata_3code,
	'pax'        : matching_airports.reduce(function(acc,a){return acc+(a.pax?a.pax:0);},0)
      };
    }
    else {
      _COMMON.log(0,"All Airports: Cannot find matching airports for %s",k);
    }
  }
};
module.exports = AllAirports;
