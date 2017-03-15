"use strict";

/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _COMMON = require('./common');

/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function Disambiguate() {
};
Disambiguate.prototype.run = function() {
  for( let iata_3code in _COMMON.airports ) {
    var a = _COMMON.airports[iata_3code];
    for( let k in a ) {
      if( typeof(a[k])=="object" ) {
	var keys = _COMMON.get_object_keys(a[k]);
	switch( keys.length ) {
	case 0:
	  _COMMON.log(1,"Disambiguate: property '"+k+"' of airport '"+iata_3code+"' has empty hash");
	  a[k] = undefined;
	  break;
	case 1:
	  _COMMON.log(2,"Disambiguate: property '"+k+"' of airport '"+iata_3code+"' has only one element (from "+keys[0]+"");
	  a[k] = a[k][keys[0]];
	  break;
	default:
	  if( k=='pax' ) {
	    // choose the largest know pax
	    a[k] = keys.map(function(e) { return a[k][e]; }).sort(function(a,b) { return b-a; })[0];
	  }
	  else if( k=='city' ) {
	    // choose the first city
	    a[k] = a[k][keys[0]];
	  }
	  else if( ['latitude','longitude','altitude'].indexOf(k)>=0 ) {
	    // For these kind of properties, discard the value in database and see if this eliminates the ambiguity
	    if( a[k].hasOwnProperty('database') ) {
	      _COMMON.log(2,"Disambiguate: ignoring value of '"+k+"' in the database");
	      delete a[k]['database'];
	      keys = _COMMON.get_object_keys(a[k]);
	    }
	  }
	  else if( k=='alternative_name' ) {
	    // Merge all the aternative names
	    let alternative_names = {};
	    keys.forEach(function( e ) {
	      // Go through each each of the alternative names and populate keys in alternative_names variable
	      if( typeof(a[k][e])!='string' )
		return;
	      a[k][e].split(',').forEach(function( e ) {
		e = e.toLowerCase().trim();
		// However do not all to alternative_names variable if the current AN is a part of any of the existing ANs. 
		var e_already_exists = false;
		for( let a in alternative_names ) {
		  if( a.indexOf(e)>=0 ) {
		    e_already_exists = true;
		    break;
		  }
		}
		if( !e_already_exists ) {
		  // If there are any keys that are contained in the current element then remove them as well
		  for( let a in alternative_names ) {
		    if( e.indexOf(a)>=0 ) {
		      delete alternative_names[a];
		    }
		  }
		  alternative_names[e] = e;
		}
	      });
	    });
	    _COMMON.log(2,"Result of alternative_names merge of %j is %j",a[k],alternative_names);
	    // Setup the things so that the code below works fine
	    a[k] = _COMMON.get_object_keys(alternative_names).join(',');
	  }
	  if( typeof(a[k])=="object" ) {
	    // Let's see if all the values are really the same
	    let first_key = keys.shift();
	    if( keys.findIndex(function(e) { return a[k][e]!=this; },a[k][first_key])>=0 ) {
	      _COMMON.log(1,"Disambiguate: property '"+k+"' of airport '"+iata_3code+"' has many different elements (%j), keys.length=%d, choosing the first one",a[k],keys.length+1);
	      a[k] = a[k][keys[0]];
	    }
	    else {
	      _COMMON.log(2,"Disambiguate: property '"+k+"' of airport '"+iata_3code+"' has all values equal to '"+a[k][first_key]+"' (%j)",a[k]);
	      a[k] = a[k][first_key];
	    }
	  }
	  break;
	}
      }
      else {
	// it is already a scalar, nothing else do to
      }
    }
  }
};
module.exports = Disambiguate;
