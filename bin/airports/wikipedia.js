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
		    console.log("Pageid "+pageid+" has already been parsed: %j",this.parsed_pageids[pageid]);
		}
	    }
	    else if( /^.+airport$/i.exec(page.title) ) {
		const complete_url = _WIKIPEDIA_API_BASE+"action=parse&pageid="+pageid+"&format=json&prop=text";
		if( this.argv.loglevel>1 ) {
		    console.log("Parsing "+complete_url);
		}
		this.ac.http_request(_REQUEST,complete_url,function( error, response, body ) {
		    var json = JSON.parse(body);
		    if( json.parse && json.parse.text && json.parse.text['*']) {
			// I tried to parse HTML but finding in the resulting structure is even worse
			// So apply regexps to find statistical properties in the HTML
                        // TODO: handle wikipedia redirects: http://prntscr.com/bq9um8
			var text       = json.parse.text['*'].replace(/[\n\r]/g,"");
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
				var properties = {};
				var prop_count = 0;
				var passengers = 0
				for( var n=1; n<matches.length; n+=2 ) {
				    if( matches[n] ) {
					// Just grab the first number even if the triples in it are separated with commas ot periods
					properties[matches[n]] = matches[n+1].replace(/^([\d,\.\s]+).*$/,"$1").replace(/[^\d]/g,"");
					if( matches[n].toLowerCase().indexOf("passenger")>=0 ) {
					    // There can be several "passenger" properties, i.e. "Domestic Passengers","International Passengers", etc
					    // Choose the largest one
					    var new_passengers = Number(properties[matches[n]])
					    if( new_passengers>passengers )
						passengers = new_passengers;
					}
					prop_count++;
				    }
				}
				if( passengers>0 ) {
				    airports[iata_3code] = _COMMON.set_pax_in_airport_data(airports[iata_3code],passengers);
				    this.parsed_pageids[pageid] = properties;
				}
				else {
				    if( this.argv.loglevel>0 ) {
					console.log("Cannot find any passengers in "+page.title+",properties=%j",properties);
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
		    }
		    else {
			if( this.argv.loglevel>0 ) {
			    console.log("ERROR: cannot parse JSON of "+complete_url);
			}
		    }
		}.bind(this));
	    }
	});
    });
};
module.exports = WikipediaScraper;

