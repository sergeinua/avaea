"use strict";

/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _DEASYNC = require('deasync');
const _UTIL    = require('util');
			 
/////////////////////////////////////////////////////////////////
// module classes
/////////////////////////////////////////////////////////////////
function AsyncsCounter() {
  this.asyncs_to_finish = 0;
  this.finished_asyncs  = 0;
}
AsyncsCounter.prototype.reset = function() {
  this.asyncs_to_finish = 0;
  this.finished_asyncs  = 0;
};
AsyncsCounter.prototype.wait = function() {
  _DEASYNC.loopWhile(function() {return this.finished_asyncs!=this.asyncs_to_finish; }.bind(this));
};
AsyncsCounter.prototype.sql_query = function( pgclient, arg, callback ) {
  this.asyncs_to_finish++;
  return pgclient.query(arg,function( err, result ) {
    try {
      if( err ) {
        module.exports.log("Common: Error from SQL query: err=%j",err);
      }
      else {
	/*
	if( module.exports.argv.loglevel>3 ) {
          module.exports.log(3,"Common: Successful SQL query: result=%j",result);
	}
	else if( module.exports.argv.loglevel>1 ) {
          module.exports.log(1,"Common: Successful SQL query: result=%j",arg);
	}
	*/
	if( typeof(callback)=="function" ) {
	  return callback(result);
	}
      }
    }
    finally {
      this.finished_asyncs++;
    }
  }.bind(this));
};
AsyncsCounter.prototype.http_request = function( request, url, callback ) {
  this.asyncs_to_finish++;
  return request(url,function( error, response, body ) {
    try {
      if( error || response.statusCode!=200 )
	throw new Error("Error out of %s, error=%j, response=%j",url,error,response);
      if( typeof(callback)=="function" ) {
	return callback(error,response,body);
      }
    }
    finally {
      this.finished_asyncs++;
    }
  }.bind(this));
};
/////////////////////////////////////////////////////////////////
// module exports
/////////////////////////////////////////////////////////////////
module.exports = {
  airports : {
    /* this is the object we fill out in different modules */
  },
  argv : (function() {
    var result = require('minimist')(process.argv.slice(2));
    result.loglevel = result.hasOwnProperty('loglevel') ? Number(result.loglevel) : 0;
    result.database = result.hasOwnProperty('database') ? result.database         : 'avaea';
    result.user     = result.hasOwnProperty('user')     ? result.user             : 'avaea';
    result.password = result.hasOwnProperty('password') ? result.password         : '';
    return result;
  })(),
  log : function( level ) {
    if( this.argv.loglevel>level ) {
      var args = (arguments.length===2) ? [arguments[0],arguments[1]] : Array.apply(null, arguments);
      args.shift();
      console.log(level+": "+_UTIL.format.apply(this,args));
    }
  },
  get_connection : function() {
    var pgconfig = {
      'host'             : 'localhost',
      'user'             : this.argv.user,
      'database'         : this.argv.database,
      'password'         : this.argv.password,
      'port'             : 5432,
      'idleTimeoutMillis': 2000 // how long a client is allowed to remain idle before being closed
    };
    var pg       = require('pg');
    var pgclient = new pg.Client(pgconfig);
    pgclient
      .on('error',function( error ) {
        module.exports.log(0,"Common: ERROR: %j",error);
      })
      .on('notification',function( msg ) {
        module.exports.log(0,"Common: NOTIFICATION: %j",msg);
      })
      .on('notice',function( msg ) {
        module.exports.log(0,"Common: NOTICE: %j",msg);
      })
      .connect(function( err ) {
        if( err ) {
          modoule.exports.log(0,"Common: In pgclient.connect, err=%j",err);
          process.exit(-1);
       }
        else {
          module.exports.log(1,"Common: Successfully connected");
        }
      });
    return pgclient;
  },
  set_pax_in_airport_data : ( data, pax ) => {
    if( !data ) {
      // looks like the data for this airport has never been set
      return {'pax':Number(pax)};
    }
    var current_pax = data.hasOwnProperty('pax') ? data.pax : 0;
    pax = Number(pax);
    data.pax = current_pax<pax ? pax : current_pax;
    return data;
  },
  escape_sql_value : ( v, desired_type ) => {
    return ((v==null) || (v==undefined) || (v=="\\N") || (v=='')) ? "NULL" :
      (desired_type=='number') ? Number(v) :
      (String(v).indexOf("'")<0) ? "'"+v+"'" : ("E'"+String(v).replace(/\\*'/g,"\\'")+"'");
  },
  convert_to_number : ( o, ndx, number_cleanup_proc ) => {
    if( !o.hasOwnProperty(ndx) ) return undefined;
    if( typeof(number_cleanup_proc)=='function' ) return number_cleanup_proc(o[ndx]);
    if( o[ndx]==='' || o[ndx]===null ) return undefined;
    return Number.isNaN(o[ndx]) ? undefined : Number(o[ndx]);
  },
  convert_to_string : ( o, ndx, string_cleanup_proc ) => {
    if( !o.hasOwnProperty(ndx) ) return undefined;
    return typeof(string_cleanup_proc)=='function' ? string_cleanup_proc(o[ndx]) : o[ndx];
  },
  get_object_keys : ( o ) => {
    let result = [];
    for( let k in o ) {
      result.push(k);
    }
    return result;
  },
  merge_airports : function( src ) {
    for( let iata_3code in this.airports ) {
      if( src.hasOwnProperty(iata_3code) ) {
	let a     = this.airports[iata_3code];
	let src_a = src[iata_3code];
	for( let k in a ) {
	  if( k=='source' ) {
	    // special case
	    continue;
	  }
	  if( src_a.hasOwnProperty(k) ) {
	    if( src_a[k]===undefined ) {
	      // do not update with undefined value
	    }
	    else if( a[k]==src_a[k] ) {
	      // the values are already equal, nothing to update
	    }
	    else if( typeof(a[k])=='object' ) {
	      // Just stick the value from the new source into existing object
	      a[k][src_a.source] = src_a[k];
	    }
	    else {
	      // See http://es6-features.org/#ComputedPropertyNames
	      a[k] = {
		[a.source]     : a[k],
		[src_a.source] : src_a[k]
	      };
	    }
	  }
	  else {
	    this.log(2,"Property '"+k+"' of "+a.source+" airport '"+iata_3code+"' with value '"+a[k]+"' was not found in "+src_a.source+" airport");
	  }
	}
	for( let k in src_a ) {
	  if( a.hasOwnProperty(k) ) {
	    // Then we must have merged it above
	  }
	  else {
	    a[k] = {
	      [src_a.source] : src_a[k]
	    }
	  }
	}
      }
      else {
	this.log(2,iata_3code+" was found in the airports but not in src airports");
      }
    }
    for( let iata_3code in src ) {
      if( this.airports.hasOwnProperty(iata_3code) ) {
	// Then we must have merged it above
      }
      else {
	this.log(1,iata_3code+" was found in src airports but not in airports");
	this.airports[iata_3code] = src[iata_3code];
      }
    }
    return this.airports;
  },
  'AsyncsCounter' : AsyncsCounter
};

