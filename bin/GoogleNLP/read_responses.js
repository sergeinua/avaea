#!/usr/bin/nodejs

///////////////////////////////////////////////////////////////////////////
// GLOBALS
///////////////////////////////////////////////////////////////////////////
const _FS   = require('fs');
const _UTIL = require('util');
const _JSON = /^.+\.json/i;
const _LOG_LEVEL = 0;

///////////////////////////////////////////////////////////////////////////
// FUNCTIONS
///////////////////////////////////////////////////////////////////////////
function does_obj_match_criteria( obj, criteria ) {
  if( _LOG_LEVEL>0 ) {
    console.log(obj);
    console.log(criteria);
  }
  for( var k in criteria ) {
    if( !obj.hasOwnProperty(k) )
      return false;
    if( typeof(obj[k])!=typeof(criteria[k]) )
      return false;
    switch( typeof(obj[k]) ) {
    case 'object':
      if( !does_obj_match_criteria(obj[k],criteria[k]) )
	return false;
      break;
    case 'number':
    case 'string':
      if( obj[k]!=criteria[k] )
	return false;
      break;
    default:
      return false;
    }
  }
  return true;
}
function does_token_match_criteria( token, partOfSpeech_tag, dependencyEdge_label ) {
  var criteria = {};
  if( typeof(partOfSpeech_tag)!='undefined' ) {
    criteria['partOfSpeech'] = {'tag':partOfSpeech_tag};
  }
  if( typeof(dependencyEdge_label)!='undefined' ) {
    criteria['dependencyEdge'] = {'label':dependencyEdge_label};
  }
  return does_obj_match_criteria(token,criteria);
}
function get_token_closure( token ) {
  var result = [token];
  token.referring_tokens.forEach(function( rt ) {
    var rt_closure = get_token_closure(rt);
    for( var n=0; n<rt_closure.length; n++ ) {
      if( !result.find(function( t ) { return t.ndx==rt_closure[n].ndx }) )
	result.push(rt_closure[n]);
    }
  });
  result.sort(function( t1, t2 ) {
    return t1.ndx-t2.ndx;
  });
  return result;
}
function get_preposition_object_texts( preposition_token ) {
  return preposition_token.referring_tokens.map(function( t1 ) {
    return get_token_closure(t1).map(function( t2 ) {
      return t2.text.content;
    }).join(" ");
  });
}
function make_sense_of_nlp_response( response ) {
  // First go over each token and add ndx in there, it will help us later
  response.tokens.forEach(function( token, ndx ) {
    token.ndx = ndx;
  });
  // Then find all the tokens this token is referring to
  response.tokens.forEach(function( token, ndx ) {
    token.referring_tokens = response.tokens.filter(function( token2 ) {
      if( !token2.dependencyEdge ) return false;
      if( token2.dependencyEdge.headTokenIndex!=token.ndx ) return false;
      if( token2.ndx==token.ndx ) return false;
      return true;
    });
  });
  // Now start making sense of the sentense 
  var preposition_tokens = response.tokens.filter(function( token ) {
    return does_token_match_criteria(token,'ADP','PREP');
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
	  result[key] = get_preposition_object_texts(preposition_token);
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
for( var ndx=2; ndx<process.argv.length; ndx++ ) {
  var val = process.argv[ndx];
  if( !_JSON.test(val) )
    return;
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
      console.log(JSON.stringify(
	sense,
	function(key,value) {
	  return (key=='referring_tokens') ? undefined : value;
	},
	2));
    }
  }
  catch( err ) {
    console.log(_UTIL.format("Cannot load file %s (%j)",val,err))
  }
};

