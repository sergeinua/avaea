#!/usr/bin/nodejs

const _COMMON = require('./common');

/////////////////////////////////////////////////////////////////
// top level
/////////////////////////////////////////////////////////////////
const argv = require('minimist')(process.argv.slice(2));
argv.loglevel = argv.hasOwnProperty('loglevel') ? Number(argv.loglevel) : 0;
argv.database = argv.hasOwnProperty('database') ? argv.database         : 'avaea';
argv.user     = argv.hasOwnProperty('user')     ? argv.user             : 'avaea';
argv.password = argv.hasOwnProperty('password') ? argv.password         : '';
if( argv.hasOwnProperty('help') ) {
    console.log(
    "USAGE: %s [--loglevel=loglevel] [--table=] [--database=avaea] [--user=avaea] [--password=]\n"+
        "--loglevel - defines verbosity.\n"+
        "--table    - if provided then gives the name of the table to write the results to. If not provided\n"+
        "             then the results are dumped on STDOUT and the rest of the argugments is ignored\n"+
        "--database - database to connect to on localhost. Default is 'avaea'\n"+
        "--user     - name of the user to connect to the database as. Default is 'avaea'\n"+
        "--password - password of the user to connect to the database as. Default is ''\n",
    process.argv[1]);
    process.exit(0);
}
// 
var asyncsCounter = new _COMMON.AsyncsCounter();
var airports      = {};
var modules       = [
    './openflights' // has to be the first
    ,'./googleapis'
    ,'./annaaero'
    ,'./wikipedia'
    ,'./neighbors'  // has to be after other modules counting the pax
    ,'./all_airports'
    ,'./alternative_names'
];
modules.forEach(function( moduleName ) {
    // run the module
    var Module = require(moduleName);
    (new Module()).run(argv,asyncsCounter,airports);
    // Wait for all its asyncs to finish
    asyncsCounter.wait();
    console.log("Module %s has finished",moduleName);
});
// Now all the data is in airports
if( argv.hasOwnProperty("table") ) {
    // Write airports to the database
    const pgclient = _COMMON.get_connection(argv);
    var   fields   = [
        ["id"         ,"int primary key"],
        ["name"       ,"varchar"],
        ["city"       ,"varchar"],
        ["country"    ,"varchar"],
        ["iata_3code" ,"varchar(5)"],
        ["icao_4code" ,"varchar(5)"],
        ["latitude"   ,"float"],
        ["longitude"  ,"float"],
        ["altitude"   ,"float"],
        ["timezone"   ,"float"],
        ["dst"        ,"varchar(2)"],
        ["tz"         ,"varchar"],
        ["state"      ,"varchar"],
        ["state_short","varchar"],
        ["pax"        ,"int"],
        ["wikipedia"  ,"varchar"], // New field. Will contain ALL airport properties we were able to grab from Wikipedia (not only pax)
        ["neighbors"  ,"varchar"],
        ["alternative_name", "varchar"]
    ];
    asyncsCounter.sql_query(
	pgclient,
	"BEGIN;\n"+
            "DROP TABLE IF EXISTS "+argv.table+" CASCADE;\n"+
            "CREATE TABLE "+argv.table+" (\n"+fields.map(function(f){return f[0]+" "+f[1];}).join(",\n")+");\n"+
            "CREATE INDEX ON "+argv.table+"(lower(iata_3code));");
    var airport_count = 0;
    for( var iata_3code in airports ) {
	var data = airports[iata_3code];
	if( !data.hasOwnProperty('iata_3code') || !data.hasOwnProperty('id') ) {
            if( argv.loglevel>0 ) {
		console.log("Skipping an incomplete airport record %j",data);
            }
	}
	else {
            switch( iata_3code ) {
            case 'TLL':
            case 'ZQN':
		// see http://prntscr.com/bafap0
		var tmp = data.city;
		data.city = data.name;
		data.name = tmp;
		break;
            }
            asyncsCounter.sql_query(
		pgclient,
		{
		    'text'  : "INSERT INTO "+argv.table+"("+fields.map(function(f){return f[0];}).join(",")+") VALUES("+fields.map(function(f,ndx){return ("$"+(ndx+1));}).join(",")+");",
                    'values': fields.map(function( f ) {
			if( !this.hasOwnProperty(f[0]) ) return null;
			if( this[f[0]]=='\\N' ) return null;
                        // TODO: replace ' with `
			return this[f[0]];
		    },data)
		});
	}
    }
    asyncsCounter.sql_query(pgclient,"COMMIT;");
    asyncsCounter.wait();
    pgclient.end();
}
else {
    console.log(airports);
}
