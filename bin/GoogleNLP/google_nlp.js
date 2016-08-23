var request     = require('request');
var util        = require('util');

var apt         = require('../../src/tests/fixtures/AvaeaTextParser');
var access_token= 'ya29.CjBHA-7cSeadGbelsLUaKSNLXVL9CyPF22k5nudon-XlPsxNtKnoS8dF90yPDaAG2As';

var options     = {
  url: 'https://language.googleapis.com/v1beta1/documents:annotateText',
  headers: {
    'Content-Type':'application/json',
    'Authorization':'Bearer '+access_token
  },
  'json': true,
  'body': undefined
};

for( var i=0; i<apt.length; i++ ) {
  var t = apt[i];

  options.body = {
    'document' : {
      'type'    : 'PLAIN_TEXT',
      'content' : t.query
    },
    'features' : {
      'extractSyntax': true,
      'extractEntities': true
    },
    'encodingType' : 'UTF8',
  };
  console.log("Request:\n"+JSON.stringify(options.body));
  
  request.post(options,function(error, response, body ) {
      if (!error && response.statusCode == 200) {
	console.log("Response:\n"+JSON.stringify(body,null,2));
      }
      else {
	console.log(util.format('error: %j, response: %j',error,response));
      }
  });
  //break;
};

