"use strict";

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
      "|(?:cargo\\s+\\(t\\))"+
      "|(?:metric\\s+tonnes\\s+of\\s+cargo)"+
      "|(?:based\\s+aircraft)"+
      "|(?:aircraft\\s+movements?)";
const _SUPTAG_PATTERN     = "<sup[^>]*><a[^>]*>[^<]+</a></sup>";
const _IMAGE_PATTERN      = "<img\\s+[^>]+>"
const _SPANTAG_PATTERN    = "<span[^>]*>(?:"+_IMAGE_PATTERN+")?</span>";
const _PROP_TR_PATTERN    = "<tr>\\s*<t(?:d|h)[^>]*>("+_PROPS_PATTERN+")[^<]*(?:"+_SUPTAG_PATTERN+")?</t(?:d|h)>\\s*<t(?:d|h)[^>]*>(?:(?:"+_SPANTAG_PATTERN+")|(?:"+_IMAGE_PATTERN+"))?\\s*([^<]+)</t(?:d|h)>\\s*</tr>";
const _PROPS_RE           = new RegExp("<tr><t(?:d|h)[^>]*>Statistics[^<]*</t(?:d|h)></tr>"+
				       "<tr><td[^>]*><table[^>]*>"+
				       // Depending on the airport the number of properties on the statistics section varies from 1 to 4
				       // However adding {1,4} after the regular expression does not work
				       "(?:"+_PROP_TR_PATTERN+")"+
				       "(?:"+_PROP_TR_PATTERN+")?"+
				       "(?:"+_PROP_TR_PATTERN+")?"+
				       "(?:"+_PROP_TR_PATTERN+")?",
				       "i");
const _REDIRECT_RE        = new RegExp("<ul\\s+class=['\"]redirectText['\"]><li><a\\s+href=['\"]/wiki/([^'\"]+)['\"][^<]*</a></li></ul>",
				       "i");
const _IATA_3CODE_RE      = new RegExp("<a\\s+href=\"/wiki/International_Air_Transport_Association_airport_code\"[^>]*>IATA</a>:?\\s*<(?:span|b)[^>]*>([A-Z]{3})(?:"+_SUPTAG_PATTERN+"){0,2}</(?:span|b)>",
				       "i");

/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function Wikipedia() {
  this.airports = {};
};
Wikipedia.prototype.query = function( params, subpage_callback ) {
  var url_params   = ["action=query&format=json"];
  for( let k in params ) {
    url_params.push(_QUERYSTRING.escape(k)+"="+_QUERYSTRING.escape(params[k]));
  }
  const complete_url = _WIKIPEDIA_API_BASE+url_params.join("&");
  _COMMON.log(1,"Wikipedia: Querying "+complete_url);
  return this.ac.http_request(_REQUEST,complete_url,function( error, response, body ) {
    // Handle pages returned by generator
    var json = JSON.parse(body);
    if( json.query && json.query.pages ) {
      for( let pageid in json.query.pages ) {
	(subpage_callback.bind(this))(pageid,json.query.pages[pageid]);
      }
    }
    else {
      _COMMON.log(0,"Wikipedia: ERROR: Cannot parse JSON of "+complete_url);
    }
    // See if we have to continue to generate
    if( json.batchcomplete=='' && json['continue'] && json['continue']['continue']!='' ) {
      var continue_name = json['continue']['continue'].replace(/^([a-z]+)[^a-z]+$/i,"$1");
      _COMMON.log(1,"Wikipedia: Continuting with "+continue_name+"="+json['continue'][continue_name]);
      var continue_params = _LODASH.clone(params);
      continue_params[continue_name] = json['continue'][continue_name];
      this.query(continue_params,subpage_callback);
    }
    else {
      _COMMON.log(1,"Wikipedia: Stopping, batchcomplete="+json.batchcomplete+",continue.gcmcontinue="+(json['continue'] ? json['continue'].gcmcontinue : 'n/a'));
    }
  }.bind(this));
};
Wikipedia.prototype.parse_text = function( complete_url, text ) {
  var matches    = _IATA_3CODE_RE.exec(text);
  var iata_3code = matches ? matches[1].toUpperCase() : undefined;
  if( !iata_3code ) {
    _COMMON.log(0,"Wikipedia: Cannot find iata_3code for "+complete_url);
  }
  else {
    matches = _PROPS_RE.exec(text);
    if( matches && matches.length ) {
      var pax        = 0;
      var properties = {};
      for( let n=1; n<matches.length; n+=2 ) {
	if( matches[n] ) {
	  // Just grab the first number even if the triples in it are separated with commas ot periods
	  properties[matches[n]] = matches[n+1];
	  if( matches[n].toLowerCase().indexOf("passenger")>=0 ) {
	    // There can be several "passenger" properties, i.e. "Domestic Passengers","International Passengers", etc
            // However watch out for those "between X and Y numbers" as in https://en.wikipedia.org/wiki/R%C3%BCgen_Airport
            let convert_to_number = ( s ) => {
	      return Number(s.replace(/^([\d,\.\s]+)(.*)$/,function( match, p1, p2  ) {
		let multiple = (p2.search(/^million/)==0) ? 1000000 : ((p2.search(/^thousand/)==0) ? 1000 : 1);
		// if there is no multiple then . is just a separator, wipe it out and convert to number
		// if there is a multiple then . seems to be a decimal point and we need to account for that
		return (multiple==1) ? Number(p1.replace(/[,\.\s]/g,"")) : (Number(p1.replace(/[,\s]/g,""))*multiple);
	      }));
	    }
  	    var between_submatches = matches[n+1].match(/\s*between\s+([\d,\.]+)\s+and\s+([\d,\.]+)\s*/i);
	    var new_pax = between_submatches ? ((convert_to_number(between_submatches[1])+convert_to_number(between_submatches[2]))/2) : convert_to_number(matches[n+1]);
	    if( new_pax>pax )
              // Choose the largest one
	      pax = new_pax;
	  }
	}
      }
      this.airports[iata_3code] = {
	source    : 'wikipedia',
	pax       : pax>0 ? pax : undefined,
	wikipedia : JSON.stringify(properties)
      };
      if( this.airports[iata_3code].pax===undefined ) {
	_COMMON.log(0,"Wikipedia: Cannot find any passengers in %s,properties=%j",complete_url,properties);
      }
      _COMMON.log(1,"Wikipedia: Set properties for %s: %j",iata_3code,properties);
    }
    else {
      _COMMON.log(0,"Wikipedia: Cannot find statistical properties for airport %s (%s) ",iata_3code,complete_url);
    }
  }
};
Wikipedia.prototype.parse = function( complete_url, redirect_count ) {
  if( redirect_count>3 ) {
    _COMMON.log(0,"Wikipedia: Got to parse %s with redirect_count=%d, ignoring it",complete_url,redirect_count);
  }
  else {
    // complete_url = 'https://en.wikipedia.org/w/api.php?action=parse&pageid=266327&format=json&prop=text';
    this.ac.http_request(_REQUEST,complete_url,function( error, response, body ) {
      _COMMON.log(1,"Wikipedia: Parsing "+complete_url);
      var json = {};
      try {
	json = JSON.parse(body);
      }
      catch( err ) {
	_COMMON.log("Wikipedia: JSON cannot parse the body of %s (%j)",complete_url,err);
	return;
      }
      if( json.parse && json.parse.text && json.parse.text['*']) {
	// I tried to parse HTML but finding in the resulting structure is even worse
	// So apply regexps to find statistical properties in the HTML
	var text       = json.parse.text['*'].replace(/[\n\r]/g,"");
	var matches    = _REDIRECT_RE.exec(text);
	if( matches ) {
	  var redirect_url = _WIKIPEDIA_API_BASE+"action=parse&page="+matches[1]+"&format=json&prop=text";
	  _COMMON.log(0,"Wikipedia: Got redirect from %s to %s",complete_url,redirect_url);
	  this.parse(redirect_url,redirect_count+1);
	}
	else {
	  this.parse_text(complete_url,text);
	}
      }
      else {
	_COMMON.log(0,"Wikipedia: ERROR: cannot parse JSON of "+complete_url);
      }
      // process.exit(0);
    }.bind(this));
  }
};
Wikipedia.prototype.run = function( asyncsCounter ) {
  // Capture some params in this
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
	_COMMON.log(0,"Wikipedia: Pageid "+pageid+" has already been parsed at %s",this.parsed_pageids[pageid]);
      }
      else if( /^.+airport$/i.exec(page.title) ) {
	const complete_url = _WIKIPEDIA_API_BASE+"action=parse&pageid="+pageid+"&format=json&prop=text";
	this.parse(complete_url,0);
	this.parsed_pageids[pageid] = complete_url;
      }
    });
  });
  asyncsCounter.wait();
  return _COMMON.merge_airports(this.airports);
};
module.exports = Wikipedia;

