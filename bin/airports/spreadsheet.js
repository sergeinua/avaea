"use strict";

/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _COMMON             = require('./common');
const _GOOGLE_SPREADSHEET = require('google-spreadsheet');

/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function Spreadsheet() {
};
Spreadsheet.prototype.run = function( asyncsCounter) {
  var airports = {};
  var doc      = new _GOOGLE_SPREADSHEET('1t3NyoOaxxiXrecdGl5siwJCxMrC_QegkdpggNO5GYxk');
  var creds    = require('./Avaea-d78848fcb517.json');
  asyncsCounter.asyncs_to_finish++;
  let cleanup_spreadsheet_string = ( s ) => {
    return (s===null || s==undefined || s==='') ? undefined : s.trim();
  }
  doc.useServiceAccountAuth(creds,function() {
    doc.getInfo(function(err, info) {
      var sheet = info.worksheets[0];
      _COMMON.log(1,'Spreadsheet: Loaded doc: '+info.title+' by '+info.author.email+",sheet 1: "+sheet.title+",rows="+sheet.rowCount+',cols='+sheet.colCount);
      sheet.getRows({offset: 1},function( err, rows ) {
	try {
	  if( err ) {
	    _COMMON.log(0,"Spreadsheet: Cannot read %j",err);
	  }
	  else {
	    _COMMON.log(2,"Spreadsheet: Read "+sheet.rowCount+" rows");
	    rows.forEach(function(e) {
	      if( String(e['iata3code']).length!=3 )
		return;
	      airports[e['iata3code']] = {
		source           : 'spreadsheet',
		id               : _COMMON.convert_to_number(e,'id'),
		name             : _COMMON.convert_to_string(e,'name',cleanup_spreadsheet_string),
		city             : _COMMON.convert_to_string(e,'city',cleanup_spreadsheet_string),
		state            : _COMMON.convert_to_string(e,'state',cleanup_spreadsheet_string),
		country          : _COMMON.convert_to_string(e,'country',cleanup_spreadsheet_string),
		iata_3code       : _COMMON.convert_to_string(e,'iata3code',cleanup_spreadsheet_string),
		icao_4code       : _COMMON.convert_to_string(e,'icao4code',cleanup_spreadsheet_string),
		// Nobody is going to change geolocations in spreadsheet
		//latitude         : _COMMON.convert_to_number(e,'latitude'),
		//longitude        : _COMMON.convert_to_number(e,'longitude'),
		//altitude         : _COMMON.convert_to_number(e,'altitude'),
		timezone         : _COMMON.convert_to_number(e,'timezone'),
		dst              : _COMMON.convert_to_string(e,'dst',cleanup_spreadsheet_string),
		tz               : _COMMON.convert_to_string(e,'tz',cleanup_spreadsheet_string),
		state_short      : _COMMON.convert_to_string(e,'stateshort',cleanup_spreadsheet_string),
		pax              : _COMMON.convert_to_number(e,'pax'),
		alternative_name : _COMMON.convert_to_string(e,'alternativename',cleanup_spreadsheet_string)
	      };
	    });
	  }
	}
	catch( e ) {
	  _COMMON.log(0,"Spreadsheet: Exception "+e);
	}
	finally {
	  asyncsCounter.finished_asyncs++;
	}
      });
    });
  });
  asyncsCounter.wait();
  return _COMMON.merge_airports(airports);
}
module.exports = Spreadsheet;
