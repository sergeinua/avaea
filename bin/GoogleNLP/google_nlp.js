#!/usr/bin/nodejs

////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////
const _FS           = require('fs');
const _REQUEST      = require('request');
const _UTIL         = require('util');
const _APT          = require('../../src/tests/fixtures/AvaeaTextParser');
const _ACCESS_TOKEN = 'ya29.CjBIA8V62Vnql-Qh9Ox5RO9psAPQGHHRTzJ2NHpSJGL3M0pfKUZB0F1fgUBoD5_2s_8';

////////////////////////////////////////////////////////////////////////////////////////////////////
// functions
////////////////////////////////////////////////////////////////////////////////////////////////////
function call_nlp_api_and_store_result( options, query, test_ndx ) {
  options.body = {
    'document' : {
      'type'    : 'PLAIN_TEXT',
      'content' : query
    },
    'features' : {
      'extractSyntax': true,
      'extractEntities': true
    },
    'encodingType' : 'UTF8',
  };
  console.log("Request:\n"+JSON.stringify(options.body));
  _REQUEST.post(options,function(error, response, body ) {
      if (!error && response.statusCode == 200) {
	var file_name = _UTIL.format('%d',test_ndx);
	while( file_name.length<3 ) {
	  file_name = "0"+file_name;
	}
	var wstream = _FS.createWriteStream("Responses/"+file_name+".json");
	wstream.write(JSON.stringify(body,null,2));
	wstream.end();
      }
      else {
	console.log(_UTIL.format('error: %j, response: %j',error,response));
      }
  });
}
////////////////////////////////////////////////////////////////////////////////////////////////////
// top level
////////////////////////////////////////////////////////////////////////////////////////////////////
var options = {
  url: 'https://language.googleapis.com/v1beta1/documents:annotateText',
  headers: {
    'Content-Type':'application/json',
    'Authorization':'Bearer '+_ACCESS_TOKEN
  },
  'json': true,
  'body': undefined
};
for( var test_ndx=0; test_ndx<_APT.length; test_ndx++ ) {
  call_nlp_api_and_store_result(options,_APT[test_ndx].query,test_ndx);
  //break;
};

