/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _LODASH             = require('lodash');
const _REQUEST            = require('request');
const _QUERYSTRING        = require('querystring');
const _COMMON             = require('./common');

const _WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/api.php?";
const _PROPS_PATTERN      = "(?:[^<>]*passengers[^<>]*)"+
      "|(?:aircraft\\s+operations)"+
      "|(?:total\\s+cargo)"+
      "|(?:cargo\\s+tonnage)"+
      "|(?:metric\\s+tonnes\\s+of\\s+cargo)"+
      "|(?:based\\s+aircraft)"+
      "|(?:aircraft\\s+movements)";
const _SUPTAG_PATTERN     = "<sup[^>]*><a[^>]*>[^<]+</a></sup>";
const _REDIRECT_RE        = new RegExp("<ul\\s+class=['\"]redirectText['\"]><li><a\\s+href=['\"]/wiki/([^'\"]+)['\"][^<]*</a></li></ul>",
				       "i");
const _PROPS_RE           = new RegExp("<tr><t(?:d|h)[^>]*>Statistics[^<]*</t(?:d|h)></tr>"+
				       "<tr><td[^>]*><table[^>]*>"+
				       // Depending on the airport the number of properties on the statistics section varies from 1 to 4
				       // However adding {1,4} after the regular expression does not work
				       "(?:<tr><t(?:d|h)[^>]*>("+_PROPS_PATTERN+")[^<]*(?:"+_SUPTAG_PATTERN+")?</t(?:d|h)><t(?:d|h)[^>]*>([^<]+)</t(?:d|h)></tr>)"+
				       "(?:<tr><t(?:d|h)[^>]*>("+_PROPS_PATTERN+")[^<]*(?:"+_SUPTAG_PATTERN+")?</t(?:d|h)><t(?:d|h)[^>]*>([^<]+)</t(?:d|h)></tr>)?"+
				       "(?:<tr><t(?:d|h)[^>]*>("+_PROPS_PATTERN+")[^<]*(?:"+_SUPTAG_PATTERN+")?</t(?:d|h)><t(?:d|h)[^>]*>([^<]+)</t(?:d|h)></tr>)?"+
				       "(?:<tr><t(?:d|h)[^>]*>("+_PROPS_PATTERN+")[^<]*(?:"+_SUPTAG_PATTERN+")?</t(?:d|h)><t(?:d|h)[^>]*>([^<]+)</t(?:d|h)></tr>)?",
				       "i");
const _IATA_3CODE_RE      = new RegExp("<a\\s+href=\"/wiki/International_Air_Transport_Association_airport_code\"[^>]*>IATA</a>:?\\s*<(?:span|b)[^>]*>([A-Z]{3})(?:"+_SUPTAG_PATTERN+"){0,2}</(?:span|b)>",
				       "i");

/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function WikipediaScraper() {
};
WikipediaScraper.prototype.query = function( params, subpage_callback ) {
    var url_params   = ["action=query&format=json"];
    for( k in params ) {
	url_params.push(_QUERYSTRING.escape(k)+"="+_QUERYSTRING.escape(params[k]));
    }
    const complete_url = _WIKIPEDIA_API_BASE+url_params.join("&");
    if( this.argv.loglevel>1 ) {
	console.log("Querying "+complete_url);
    }
    return this.ac.http_request(_REQUEST,complete_url,function( error, response, body ) {
	// Handle pages returned by generator
	var json = JSON.parse(body);
	if( json.query && json.query.pages ) {
	    for( pageid in json.query.pages ) {
		(subpage_callback.bind(this))(pageid,json.query.pages[pageid]);
	    }
	}
	else {
	    if( this.argv.loglevel>0 ) {
		console.log("ERROR: Cannot parse JSON of "+complete_url);
	    }
	}
	// See if we have to continue to generate
	if( json.batchcomplete=='' && json['continue'] && json['continue']['continue']!='' ) {
	    var continue_name = json['continue']['continue'].replace(/^([a-z]+)[^a-z]+$/i,"$1");
	    if( this.argv.loglevel>1 ) {
		console.log("Continuting with "+continue_name+"="+json['continue'][continue_name]);
	    }
	    var continue_params = _LODASH.clone(params);
	    continue_params[continue_name] = json['continue'][continue_name];
	    this.query(continue_params,subpage_callback);
	}
	else {
	    if( this.argv.loglevel>1 ) {
		console.log("Stopping, batchcomplete="+json.batchcomplete+",continue.gcmcontinue="+(json['continue'] ? json['continue'].gcmcontinue : 'n/a'));
	    }
	}
    }.bind(this));
};
WikipediaScraper.prototype.parse_text = function( airports, complete_url, text ) {
    var matches    = _IATA_3CODE_RE.exec(text);
    var iata_3code = matches ? matches[1].toUpperCase() : undefined;
    if( !iata_3code ) {
	if( this.argv.loglevel>0 ) {
	    console.log("Cannot find iata_3code for "+complete_url);
	}
    }
    else if( !airports.hasOwnProperty(iata_3code) ) {
	if( this.argv.loglevel>1 ) {
	    console.log("Found airport %s but is it unknown to the rest of the code",iata_3code);
	}
    }
    else {
	matches = _PROPS_RE.exec(text);
	if( matches && matches.length ) {
	    var pax        = 0;
	    var properties = {};
	    for( var n=1; n<matches.length; n+=2 ) {
		if( matches[n] ) {
		    // Just grab the first number even if the triples in it are separated with commas ot periods
		    properties[matches[n]] = matches[n+1].replace(/^([\d,\.\s]+).*$/,"$1").replace(/[^\d]/g,"");
		    if( matches[n].toLowerCase().indexOf("passenger")>=0 ) {
			// There can be several "passenger" properties, i.e. "Domestic Passengers","International Passengers", etc
			// Choose the largest one
			var new_pax  = Number(properties[matches[n]])
			if( new_pax>pax )
			    pax = new_pax;
		    }
		}
	    }
	    if( pax>0 ) {
		airports[iata_3code].pax = pax;
	    }
	    else {
		if( this.argv.loglevel>0 ) {
		    console.log("Cannot find any passengers in %s,properties=%j",complete_url,properties);
		}
	    }
	    airports[iata_3code].wikipedia = JSON.stringify(properties);
	    // console.log("Set properties for %s: %j",iata_3code,properties);
	}
	else {
	    if( this.argv.loglevel>1 ) {
		console.log("Cannot find statistical properties for airport %s (%s) ",iata_3code,complete_url);
	    }
	}
    }
};
WikipediaScraper.prototype.parse = function( airports, complete_url, redirect_count ) {
    if( redirect_count>3 ) {
	if( this.argv.loglevel>0 ) {
	    console.log("Got to parse %s with redirect_count=%d, ignoring it",complete_url,redirect_count);
	}
    }
    else {
	this.ac.http_request(_REQUEST,complete_url,function( error, response, body ) {
	    if( this.argv.loglevel>1 ) {
		console.log("Parsing "+complete_url);
	    }
	    var json = {};
	    try {
		json = JSON.parse(body);
	    }
	    catch( err ) {
		console.log("JSON cannot parse the body of %s (%j)",complete_url,err);
		return;
	    }
	    if( json.parse && json.parse.text && json.parse.text['*']) {
		// I tried to parse HTML but finding in the resulting structure is even worse
		// So apply regexps to find statistical properties in the HTML
		var text       = json.parse.text['*'].replace(/[\n\r]/g,"");
		var matches    = _REDIRECT_RE.exec(text);
		if( matches ) {
		    var redirect_url = _WIKIPEDIA_API_BASE+"action=parse&page="+matches[1]+"&format=json&prop=text";
		    if( this.argv.loglevel>0 ) {
			console.log("Got redirect from %s to %s",complete_url,redirect_url);
		    }
		    this.parse(airports,redirect_url,redirect_count+1);
		}
		else {
		    this.parse_text(airports,complete_url,text);
		}
	    }
	    else {
		if( this.argv.loglevel>0 ) {
		    console.log("ERROR: cannot parse JSON of "+complete_url);
		}
	    }
	}.bind(this));
    }
};
WikipediaScraper.prototype.run = function( argv, asyncsCounter, airports ) {
    // Capture some params in this
    this.argv              = argv;
    this.ac                = asyncsCounter;
    this.parsed_pageids    = {};
    // Let's rock-n-roll
    this.query({
	"generator" : "categorymembers",
	"gcmtitle"  : "Category:Lists of airports by IATA code"
    },function( pageid, page ) {
	this.query({
	    "generator" : "links",
	    "pageids"  : pageid
	},function( pageid, page ) {
	    if( pageid<0 )
		return; // see http://prntscr.com/bmu301
	    if( this.parsed_pageids.hasOwnProperty(pageid) ) {
		if( this.argv.loglevel>0 ) {
		    console.log("Pageid "+pageid+" has already been parsed at %s",this.parsed_pageids[pageid]);
		}
	    }
	    else if( /^.+airport$/i.exec(page.title) ) {
		const complete_url = _WIKIPEDIA_API_BASE+"action=parse&pageid="+pageid+"&format=json&prop=text";
		this.parse(airports,complete_url,0);
		this.parsed_pageids[pageid] = complete_url;
	    }
	});
    });
};
module.exports = WikipediaScraper;

