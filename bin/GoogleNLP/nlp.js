#!/usr/bin/nodejs

///////////////////////////////////////////////////////////////////////////////////////////////////
// internal functions
///////////////////////////////////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////////////////////////
// functions helping make sense of NLP response
///////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
  outfit_tokens : function( tokens ) {
    // First go over each token and add ndx in there, it will help us later
    tokens.forEach(function( token, ndx ) {
      token.ndx     = ndx;
      token.closure = function() {
	var result = [this];
	token.referring_tokens.forEach(function( rt ) {
	  var rt_closure = rt.closure();
	  for( var n=0; n<rt_closure.length; n++ ) {
	    if( !result.find(function( t ) { return t.ndx==rt_closure[n].ndx }) )
	      result.push(rt_closure[n]);
	  }
	});
	result.sort(function( t1, t2 ) {
	  return t1.ndx-t2.ndx;
	});
	return result;
      };
      token.match_criteria = function( partOfSpeech_tag, dependencyEdge_label ) {
	var criteria = {};
	if( typeof(partOfSpeech_tag)!='undefined' ) {
	  criteria['partOfSpeech'] = {'tag':partOfSpeech_tag};
	}
	if( typeof(dependencyEdge_label)!='undefined' ) {
	  criteria['dependencyEdge'] = {'label':dependencyEdge_label};
	}
	return does_obj_match_criteria(this,criteria);
      };
      token.get_texts = function() {
	return this.referring_tokens.map(function( t1 ) {
	  return t1.closure().map(function( t2 ) {
	    return t2.text.content;
	  }).join(" ");
	});
      };
    });
    // Then find all the tokens this token is referring to
    tokens.forEach(function( token, ndx ) {
      token.referring_tokens = tokens.filter(function( token2 ) {
	if( !token2.dependencyEdge ) return false;
	if( token2.dependencyEdge.headTokenIndex!=token.ndx ) return false;
	if( token2.ndx==token.ndx ) return false;
	return true;
      });
    });
    // We are done
    return tokens;
  },
  format_tokens : function( key, value ) {
    switch( key ) {
    case 'referring_tokens':
      return value.length ? value.map(function( e ) { return e.ndx; }).join(',') : undefined;
    }
    return (typeof(value)=='function') ? undefined : value;
  }
};
