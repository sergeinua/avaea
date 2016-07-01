#!/usr/bin/nodejs

/////////////////////////////////////////////////////////////////////////////////////////
// globals
/////////////////////////////////////////////////////////////////////////////////////////
var _WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/api.php?";
var _PROPS_PATTERN      = "(?:aircraft\\s+operations)"+
    "|(?:total\\s+cargo)"+
    "|(?:total\\s+passengers)"+
    "|(?:number\\s+of\\s+passengers)"+
    "|(?:passengers)"+
    "|(?:cargo\\s+tonnage)"+
    "|(?:metric\\s+tonnes\\s+of\\s+cargo)"+
    "|(?:based\\s+aircraft)"+
    "|(?:aircraft\\s+movements)"
    ;
var _PROPS_RE           = new RegExp("<tr><t(?:d|h)[^>]*>Statistics[^<]*</t(?:d|h)></tr>"+
				     "<tr><td[^>]*><table[^>]*>"+
				     // Depending on the airport the number of properties on the statistics section varies from 1 to 4
				     // However adding {1,4} after the regular expression does not work
				     "(?:<tr><t(?:d|h)[^>]*>("+_PROPS_PATTERN+")[^<]*</t(?:d|h)><t(?:d|h)[^>]*>([^<]+)</t(?:d|h)></tr>)"+
				     "(?:<tr><t(?:d|h)[^>]*>("+_PROPS_PATTERN+")[^<]*</t(?:d|h)><t(?:d|h)[^>]*>([^<]+)</t(?:d|h)></tr>)?"+
				     "(?:<tr><t(?:d|h)[^>]*>("+_PROPS_PATTERN+")[^<]*</t(?:d|h)><t(?:d|h)[^>]*>([^<]+)</t(?:d|h)></tr>)?"+
				     "(?:<tr><t(?:d|h)[^>]*>("+_PROPS_PATTERN+")[^<]*</t(?:d|h)><t(?:d|h)[^>]*>([^<]+)</t(?:d|h)></tr>)?",
				     "i");
var _IATA_CODE_RE       = new RegExp("<a\\s+href=\"/wiki/International_Air_Transport_Association_airport_code\"[^>]*>IATA</a>:?\\s*<span[^>]*>([A-Z]{3})</span>",
				     "i");
var _ICAO_CODE_RE       = new RegExp("<a\\s+href=\"/wiki/International_Civil_Aviation_Organization_airport_code\"[^>]*>ICAO</a>:?\\s*<span[^>]*>([A-Z]{4})</span>",
				     "i");

/////////////////////////////////////////////////////////////////////////////////////////
// functions
/////////////////////////////////////////////////////////////////////////////////////////
function query_wikipedia( params, subpage_callback ) {
    var querystring = require('querystring');
    var url_params   = ["action=query&format=json"];
    for( k in params ) {
	url_params.push(querystring.escape(k)+"="+querystring.escape(params[k]));
    }
    const complete_url = _WIKIPEDIA_API_BASE+url_params.join("&");
    if( argv.loglevel>1 ) {
	console.log("Querying "+complete_url);
    }
    request(complete_url,function( error, response, body ) {
	if( error || response.statusCode!=200 )
	    throw new Error("Error of out "+complete_url);
	// Handle pages returned by generator
	var json = JSON.parse(body);
	if( json.query && json.query.pages ) {
	    for( pageid in json.query.pages ) {
		subpage_callback(pageid,json.query.pages[pageid]);
	    }
	}
	else {
	    if( argv.loglevel>0 ) {
		console.log("ERROR: Cannot parse JSON of "+complete_url);
	    }
	}
	// See if we have to continue to generate
	if( json.batchcomplete=='' && json['continue'] && json['continue']['continue']!='' ) {
	    var continue_name = json['continue']['continue'].replace(/^([a-z]+)[^a-z]+$/i,"$1");
	    if( argv.loglevel>1 ) {
		console.log("Continuting with "+continue_name+"="+json['continue'][continue_name]);
	    }
	    var continue_params = _.clone(params);
	    continue_params[continue_name] = json['continue'][continue_name];
	    query_wikipedia(continue_params,subpage_callback);
	}
	else {
	    if( argv.loglevel>1 ) {
		console.log("Stopping, batchcomplete="+json.batchcomplete+",continue.gcmcontinue="+(json['continue'] ? json['continue'].gcmcontinue : 'n/a'));
	    }
	}
    });
}
function stringify_hash( h ) {
    var result = [];
    for( k in h ) {
	result.push(k+"="+h[k]);
    }
    return "{"+result.join(",")+"}";
}
function formatSqlString( s ) {
    if ( !s || s == '\\N' ) {
	return 'null';
    }
    var r = s.replace(/[\0\n\r\b\t\\'\x1a]/g, function (s) {
	switch (s) {
	case "\0":
	    return "\\0";
	case "\n":
	    return "\\n";
	case "\r":
	    return "\\r";
	case "\b":
	    return "\\b";
	case "\t":
	    return "\\t";
	case "\x1a":
	    return "\\Z";
	case "'":
	    return "''";
	default:
	    return "\\" + s;
	}
    });
    return (r != s) ? util.format("E'%s'", r) : util.format("'%s'", r);
}
/////////////////////////////////////////////////////////////////////////////////////////
// top level code
/////////////////////////////////////////////////////////////////////////////////////////
const _           = require('lodash');
const request     = require('request');
const util        = require('util');
const argv        = require('minimist')(process.argv.slice(2));
if( argv.hasOwnProperty('help') ) {
    console.log(
	    "USAGE: %s [--loglevel=loglevel] [--format=sql|csv] \n\n"+
	    process.argv[1]);
    process.exit(0);
}
argv.loglevel = argv.hasOwnProperty('loglevel') ? Number(argv.loglevel) : 0;
if( argv.hasOwnProperty('format') && argv['format']=='csv' ) {
    cosole.log("name,iata_3code,icao_4code,pax");
}
else {
    console.log("create temp table wikipedia_airports (name varchar, iata_3code varchar, icao_4code varchar, pax int);");
}
query_wikipedia({
    "generator" : "categorymembers",
    "gcmtitle"  : "Category:Lists of airports by IATA code"
},function( pageid, page ) {
    query_wikipedia({
	"generator" : "links",
	"pageids"  : pageid
    },function( pageid, page ) {
	if( pageid<0 )
	    return; // see http://prntscr.com/bmu301
	if( /^.+airport$/i.exec(page.title) ) {
	    const complete_url = _WIKIPEDIA_API_BASE+"action=parse&pageid="+pageid+"&format=json&prop=text";
	    if( argv.loglevel>1 ) {
		console.log("Parsing "+complete_url);
	    }
	    request(complete_url,function( error, response, body ) {
		if( error || response.statusCode!=200 )
		    throw new Error("Error of out "+complete_url);
		var json = JSON.parse(body);
		if( json.parse && json.parse.text && json.parse.text['*']) {
		    // I tried to parse HTML but finding in the resulting structure is even worse
		    // So apply regexps to find statistical properties in the HTML
		    var text = json.parse.text['*'].replace(/[\n\r]/g,"");
		    var matches = _PROPS_RE.exec(text);
		    if( matches && matches.length ) {
			var properties = {};
			var prop_count = 0;
			var passengers = 0
			for( var n=1; n<matches.length; n+=2 ) {
			    if( matches[n] ) {
				// Just grab the first number even if the triples in it are separated with commas ot periods
				properties[matches[n]] = matches[n+1].replace(/^([\d,\.]+).*$/,"$1").replace(/[^\d]/g,"");
				if( matches[n].toLowerCase().indexOf("passenger")>=0 ) {
				    passengers = Number(properties[matches[n]]);
				}
				prop_count++;
			    }
			}
			if( passengers>0 ) {
			    var iata_matches = _IATA_CODE_RE.exec(text);
			    var icao_matches = _ICAO_CODE_RE.exec(text);
			    var iata_3code    = iata_matches ? iata_matches[1] : undefined;
			    var icao_4code    = icao_matches ? icao_matches[1] : undefined;
			    if( argv.loglevel>0 ) {
				console.log(page.title+",IATA="+iata_3code+",ICAO="+icao_4code+",properties="+stringify_hash(properties));
			    }
			    else {
				if( argv.hasOwnProperty('format') && argv['format']=='csv' ) {
				    console.log(page.title+","+iata_3code+","+icao_4code+","+passengers);
				}
				else {
				    console.log("insert into wikipedia_airports(name,iata_3code,icao_4code,pax) values("+
						formatSqlString(page.title)+","+
						formatSqlString(iata_3code)+","+
						formatSqlString(icao_4code)+","+
						passengers+");");
				}
			    }
			}
			else {
			    if( argv.loglevel>0 ) {
				console.log(page.title+",properties="+stringify_hash(properties));
			    }
			}
		    }
		    else {
			if( argv.loglevel>1 ) {
			    console.log("Cannot find statistical properties in "+complete_url);
			}
		    }
		}
		else {
		    if( argv.loglevel>0 ) {
			console.log("ERROR: cannot parse JSON of "+complete_url);
		    }
		}
	    });
	}
    });
});

