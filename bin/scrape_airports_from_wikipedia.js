#!/usr/bin/nodejs

/////////////////////////////////////////////////////////////////////////////////////////
// functions
/////////////////////////////////////////////////////////////////////////////////////////
function query_wikipedia( params, subpage_callback ) {
    var url_params   = ["action=query&format=json"];
    for( k in params ) {
	url_params.push(querystring.escape(k)+"="+querystring.escape(params[k]));
    }
    const complete_url = "https://en.wikipedia.org/w/api.php?"+url_params.join("&");
    if( argv.loglevel>0 ) {
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
	// See if we have to continue to generate
	if( json.batchcomplete=='' && json['continue'] && json['continue']['continue']!='' ) {
	    var continue_name = json['continue']['continue'].replace(/^([a-z]+)[^a-z]+$/i,"$1");
	    if( argv.loglevel>0 ) {
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
    })
}
/////////////////////////////////////////////////////////////////////////////////////////
// top level code
/////////////////////////////////////////////////////////////////////////////////////////
var querystring = require('querystring');
var request     = require('request');
var _           = require('lodash');
var argv        = require('minimist')(process.argv.slice(2));
if( argv.hasOwnProperty('help') ) {
    console.log(
	    "USAGE: %s [--loglevel=loglevel]\n\n"+
	    process.argv[1]);
    process.exit(0);
}
argv.loglevel = argv.hasOwnProperty('loglevel') ? Number(argv.loglevel) : 0;
query_wikipedia({
    "generator" : "categorymembers",
    "gcmtitle"  : "Category:Lists of airports by IATA code"
},function( pageid, page ) {
    query_wikipedia({
	"generator" : "links",
	"pageids"  : pageid
    },function( pageid, page ) {
	if( /^.+airport$/i.exec(page.title) ) {
	    console.log("Got link pageid="+pageid+",title="+page.title);
	}
    })
});

