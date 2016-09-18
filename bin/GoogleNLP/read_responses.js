#!/usr/bin/nodejs

///////////////////////////////////////////////////////////////////////////
// GLOBALS
///////////////////////////////////////////////////////////////////////////
const _FS     = require('fs');
const _UTIL   = require('util');
const _NLP    = require('./nlp');

///////////////////////////////////////////////////////////////////////////
// FUNCTIONS
///////////////////////////////////////////////////////////////////////////
function make_sense_of_nlp_response( response ) {
  _NLP.outfit_tokens(response.tokens);
  // Now start making sense of the sentense 
  var preposition_tokens = response.tokens.filter(function( token ) {
    return token.match_criteria('ADP','PREP');
  });
  var result = {};
  preposition_tokens.forEach(function( preposition_token, ndx ) {
    switch( preposition_token.lemma ) {
    case 'from':
    case 'to':
    case 'in':
    case 'on':
      var headToken = response.tokens[preposition_token.dependencyEdge.headTokenIndex];
      if( headToken ) {
	var key = undefined;
	switch( headToken.partOfSpeech.tag ) {
	case 'NOUN':
	  // ticket from/to/on
	  key = (preposition_token.lemma=='from') ? 'origin_airport' :
	    (preposition_token.lemma=='to') ? 'return_airport' :
	    'origin_date';
	  break;
	case 'VERB':
	  // leaving/departing/returning from/to/on
	  switch( headToken.lemma ) {
	  case 'fly':
	  case 'leave':
	  case 'depart':
	    key = (preposition_token.lemma=='from') ? 'origin_airport' :
	      (preposition_token.lemma=='to') ? 'return_airport' :
	      'origin_date';
	    break;
	  case 'return':
	    key = (preposition_token.lemma=='from') ? 'return_airport' :
	      (preposition_token.lemma=='to') ? 'origin_airport' :
	      'return_date';
	    break;
	  }
	  break;
	}
	if( key ) {
	  result[key] = preposition_token.get_texts();
	  console.log(key+"="+result[key]);
	}
      }
      else {
	console.log(_UTIL.format("Cannot find head token for %j",token));
      }
      break;
    default:
      break;
    }
  });
  return result;
}
///////////////////////////////////////////////////////////////////////////
// TOP LEVEL
///////////////////////////////////////////////////////////////////////////
var argv = require('minimist')(process.argv.slice(2));
if( argv.hasOwnProperty('help') ) {
  console.log("USAGE: %s [--loglevel=loglevel]\n"+
	      "Arguments:\n"+
	      "\t--help     - print this message\n"+
	      "\t--loglevel - defines verbosity.\n"+
	      "\n"+
	      "This program process all the Google NLP JSON response files and print\n"+
	      "what it understood in there\n",
	      process.argv[1]);
  process.exit(0);
}
global._LOG_LEVEL = argv.hasOwnProperty('loglevel') ? Number(argv.loglevel) : 0;
for( var ndx=0; ndx<argv._.length; ndx++ ) {
  var val = argv._[ndx];
  try {
    var response = require('./'+val);
    console.log("\n"+val+": "+response.sentences[0].text.content);
    var sense = make_sense_of_nlp_response(response);
    if( !sense ) {
      console.log("Cannot make sense of NLP response");
    }
    else if( sense.error ) {
      console.log("Cannot make sense of NLP response ("+sense.error+")");
    }
    else {
      console.log(sense);
      console.log(JSON.stringify(response,_NLP.format_tokens,2));
    }
  }
  catch( err ) {
    console.log(_UTIL.format("Cannot load file %s (%s)",val,err.getMessage()))
  }
  break;
};

