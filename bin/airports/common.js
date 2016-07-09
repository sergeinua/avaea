/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _DEASYNC = require('deasync');

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
    // console.log(arg);
    return pgclient.query(arg,function( err, result ) {
	try {
            if( err ) {
                console.log("Error from SQL query: err=%j",err);
            }
	    else {
		//if( this.argv.loglevel>1 ) {
                    console.log("Successful SQL query: result=%j",result);
		//}
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
    get_connection : function( argv ) {
        var pgconfig = {
            'host'             : 'localhost',
            'user'             : argv.user,
            'database'         : argv.database,
            'password'         : argv.password,
            'port'             : 5432,
            'idleTimeoutMillis': 2000 // how long a client is allowed to remain idle before being closed
        };
        var pg       = require('pg');
        var pgclient = new pg.Client(pgconfig);
        pgclient
            .on('error',function( error ) {
                console.log("ERROR: %j",error);
            })
            .on('notification',function( msg ) {
                console.log("NOTIFICATION: %j",msg);
            })
            .on('notice',function( msg ) {
                console.log("NOTICE: %j",msg);
            })
            .connect(function( err ) {
                if( err ) {
                    console.log("In pgclient.connect, err=%j",err);
                    process.exit(-1);
                }
                else {
                    if( argv.loglevel>1 ) {
                         console.log("Successfully connected");
                    }
               }
            });
        return pgclient;
    },
    set_pax_in_airport_data : function( data, pax ) {
	if( !data ) {
	    // looks like the data for this airport has never been set
	    return {'pax':Number(pax)};
	}
	var current_pax = data.hasOwnProperty('pax') ? data.pax : 0;
	pax = Number(pax);
	data.pax = current_pax<pax ? pax : current_pax;
	return data;
    },
    'AsyncsCounter' : AsyncsCounter
};

