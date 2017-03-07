"use strict";

/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _COMMON    = require('./common');
const _CSVPARSER = require('csv-parser');
const _REQUEST   = require('request');
const _HEADERS   = ['id','name','city','country','iata_3code','icao_4code','latitude','longitude','altitude','timezone','dst','tz'];

/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function Openflights() {
  this.datfile = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
};
Openflights.prototype.run = function( asyncsCounter ) {
  _COMMON.log(0,"Openflights: Reading %s",this.datfile);
  const datStream = _CSVPARSER({
    'separator': ',',
    'quote'    : '"',
    'newline'  : '\n',
    'headers'  : _HEADERS
  });
  asyncsCounter.asyncs_to_finish += 1;
  let cleanup_openflights_string = ( s ) => {
    return (s===null || s==undefined || s==='' || s==='\\N') ? undefined : s.replace(/\\\\'/g,"'").trim();
  };
  let cleanup_openflights_number = ( s ) => {
    return (s===null || s==undefined || s==='' || s==='\\N' || Number.isNaN(s)) ? undefined : Number(s);
  };
  var airports = {};
  _REQUEST(this.datfile).pipe(datStream)
    .on('data',function(row) {
      if ( row.iata_3code ) {
	switch( row.iata_3code ) {
	case 'NID':
	case '\\N':
          // Skip some airports
          break;
	default:
	  // see https://avaeaeng.atlassian.net/browse/DEMO-501
	  airports[row.iata_3code.toUpperCase()] = {
	    source           : 'openflights',
            id               : _COMMON.convert_to_number(row,'id'),
	    name             : _COMMON.convert_to_string(row,'name',cleanup_openflights_string),
	    city             : _COMMON.convert_to_string(row,'city',cleanup_openflights_string),
	    country          : _COMMON.convert_to_string(row,'country',cleanup_openflights_string),
	    iata_3code       : _COMMON.convert_to_string(row,'iata_3code',cleanup_openflights_string),
	    icao_4code       : _COMMON.convert_to_string(row,'icao_4code',cleanup_openflights_string),
	    latitude         : _COMMON.convert_to_number(row,'latitude',cleanup_openflights_number),
	    longitude        : _COMMON.convert_to_number(row,'longitude',cleanup_openflights_number),
	    altitude         : _COMMON.convert_to_number(row,'altitude',cleanup_openflights_number),
	    timezone         : _COMMON.convert_to_number(row,'timezone',cleanup_openflights_number),
	    dst              : _COMMON.convert_to_string(row,'dst',cleanup_openflights_string),
	    tz               : _COMMON.convert_to_string(row,'tz',cleanup_openflights_string)
	  };
	  break;
	}
      }
    })
    .on('end',function() {
      _COMMON.log(0,"Openflights: Datfile reading is done");
      asyncsCounter.finished_asyncs++;
    });
  asyncsCounter.wait();
  _COMMON.merge_airports(airports);
};
module.exports = Openflights;
