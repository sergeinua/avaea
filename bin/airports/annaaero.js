"use strict";

/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _CSVPARSER     = require('csv-parser');
const _CHILD_PROCESS = require('child_process');
const _COMMON        = require('./common');

/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function AnnaAero() {
  this.urls = [
    'http://www.anna.aero/wp-content/uploads/european-airports.xls'
    ,'http://www.anna.aero/wp-content/uploads/row-airports-database.xls'
    ,'http://www.anna.aero/wp-content/uploads/american-airport-traffic-trends.xls'
  ];
}
AnnaAero.prototype.run = function( asyncsCounter, airports ) {
  // The .csv files with information about airport passenger traffic are gotten from http://www.anna.aero/databases/
  //
  // Another option for figuring out which airports take and do not take passenger traffic is information about
  // "airport enplanements". This information is publicly available at
  // http://www.faa.gov/airports/planning_capacity/passenger_allcargo_stats/passenger/media/cy14-commercial-service-enplanements.xlsx
  // The good news that it has enplanement information for about 500 US airports, compare this with http://www.anna.aero/databases/
  // which has passenger information about 93 US airports out of 1457 total airports in USA. The bad news is that FAA information
  // does not give any information about not USA airports. To support "enplanements" information we will have to create another column in
  // the database.
  //
  // One other way to get airport passenger information is scraping pages like http://www.transtats.bts.gov/airports.asp?Airport=PWM
  var airports  = {};
  this.urls.forEach(function( url ) {
    _COMMON.log(0,"AnnaAero: Reading %s",url);
    var csvStream = _CSVPARSER({
      separator: ',',
      quite: '"',
      newline: '\n',
      headers: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
    });
    var get_hash_index_by_value = ( h, v ) => {
      for ( let k in h ) {
        if ( h[k] == v ) {
          return k;
        }
      } 
    };
    
    // ssconvert utuility comes with Ubuntu "gnumeric" package. If it is not installed then the following code
    // will produce an exception
    asyncsCounter.asyncs_to_finish++;
    var child = _CHILD_PROCESS.spawn("/usr/bin/ssconvert",["--export-type=Gnumeric_stf:stf_csv",url,"fd://1"],{
      'stdio' : ['ignore','pipe','ignore']
    }).on('close',function( code ) {
      _COMMON.log(0,"AnnaAero: Process %j has finished with code %d",child.spawnargs,code);
      asyncsCounter.finished_asyncs++;
    });	
    asyncsCounter.wait();
    
    var code_ndx     = undefined;
    var pax_ndx_2016 = undefined;
    var pax_ndx_2017 = undefined;
    child.stdout.pipe(csvStream).on('data',function(data) {
      if( code_ndx==undefined && (pax_ndx_2016==undefined || pax_ndx_2017==undefined) ) {
        code_ndx      = get_hash_index_by_value(data,"Code");
        pax_ndx_2016  = get_hash_index_by_value(data,"Pax 2016");
        pax_ndx_2017  = get_hash_index_by_value(data,"Pax 2017");
      }
      else if( data.length<code_ndx || data.length<pax_ndx_2016 || data.length<pax_ndx_2017 ) {
	_COMMON.log(2,"AnnaAero: malformatted line in %s?",url);
      }
      else {
	let iata_3code = data[code_ndx].toUpperCase();
	if( iata_3code.length==3 ) {
	  let pax_2016   = pax_ndx_2016 ? Number(data[pax_ndx_2016]) : 0;
	  let pax_2017   = pax_ndx_2017 ? Number(data[pax_ndx_2017]) : 0;
	  let pax        = (pax_2016>pax_2017) ? pax_2016 : pax_2017;
	  if( pax>0 ) {
	    airports[iata_3code.toUpperCase()] = {
	      'source'     : 'annaaero',
	      'iata_3code' : iata_3code, 
	      'pax'        : pax
	    };
	  }
	}
	else {
	  _COMMON.log(2,"AnnaAero: malformatted iata_3code '%s' in %s",iata_3code,url);
	}
      }
    });
  });
  _COMMON.merge_airports(airports);
};
module.exports = AnnaAero;
