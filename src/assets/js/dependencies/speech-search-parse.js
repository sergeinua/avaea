// Classes
function Regexp_and_Conversion( pattern, conversion_proc ) {
    // if the pattern is an object then assume that it is a regexp already
    this.re              = (typeof(pattern)=='string') ? new RegExp(pattern,'i') : pattern;
    this.conversion_proc = conversion_proc;
}
function AvaeaTextParser( text ) {

    // Properties
    this.not_parsed = text;
    
    // Methods 
    this.log = function() {
        if (typeof console !== 'undefined') {
            console.log.apply(console, arguments);
        }
    };
    this.match_and_convert = function( regexp_and_conversion ) { 
	var matches = regexp_and_conversion.re.exec(this.not_parsed);
	if( !matches )
            return undefined;
	try {
            var result = {};
            result['matches'] = matches;
            result['value']   = regexp_and_conversion.conversion_proc ? regexp_and_conversion.conversion_proc(matches,this) : matches[matches.length-1];
            this.not_parsed = this.not_parsed.replace(regexp_and_conversion.re,'');
            return result;
	}
	catch( e ) {
            return undefined;
	}
    };
    this.dates = function() {
        const ordinal_to_number = function( s ) {
            if( /one|first/i.exec(s) ) return 1; 
            if( /two|second/i.exec(s) ) return 2; 
            if( /three|third/i.exec(s) ) return 3; 
            if( /four|fourth/i.exec(s) ) return 4; 
            if( /five|fivth/i.exec(s) ) return 5; 
            if( /six|sixth/i.exec(s) ) return 6; 
            if( /seven|seventh/i.exec(s) ) return 7; 
            if( /eight|eighth/i.exec(s) ) return 8; 
            if( /nine|nineth/i.exec(s) ) return 9; 
            if( /ten|tenth/i.exec(s) ) return 10; 
            if( /eleven|eleventh/i.exec(s) ) return 11; 
            if( /twelve|twelveth/i.exec(s) ) return 12; 
            return Number(s);
        }
	const get_weekday = function( d ) {
            return d.toDateString().replace(/^([a-z]+)\s.*/i,'$1');
	}
	const get_date_of_next_weekday = function( start, weekday ) {
            // Always make a copy so that we leave the original intact
            start   = new Date(start.getTime());
            weekday = String(weekday).toLowerCase();
            for( var n=0; n<7; n++ ) {
		if( weekday.indexOf(get_weekday(start).toLowerCase())==0 ) 
		    return start;
		start.setDate(start.getDate()+1);
            }
            throw new Exception("Cannot find the next date for "+weekday);
	}
	const get_today = function() {
            return (new Date());
	}
	const get_tomorrow = function() {
            var result = new Date();
            result.setDate(result.getDate()+1);
            return result;
	}
        const notcapturing_date = "(?:\\d{1,2})|"+
              "(?:first)|"+
              "(?:second)|"+
              "(?:third)|"+
              "(?:fourth)|"+
              "(?:fivth)|"+
              "(?:sixth)|"+
              "(?:seventh)|"+
              "(?:eighth)|"+
              "(?:nineth)|"+
              "(?:tenth)|"+
              "(?:eleventh)|"+
              "(?:twelveth)";
        const notcapturing_month = "(?:jan(?:uary)?)|"+
              "(?:feb(?:ruary)?)|"+
              "(?:mar(?:ch)?)|"+
              "(?:apr(?:il)?)|"+
              "(?:may)|"+
              "(?:jun(?:e)?)|"+
              "(?:jul(?:y)?)|"+
              "(?:aug(?:ust)?)|"+
              "(?:sep(?:t)?(?:ember)?)|"+
              "(?:oct(?:ober)?)|"+
              "(?:nov(?:ember)?)|"+
              "(?:dec(?:ember)?)";
        const notcapturing_number = "(?:\\d{1,2})|"+
              "(?:one)|"+
              "(?:two)|"+
              "(?:three)|"+
              "(?:four)|"+
              "(?:five)|"+
              "(?:six)|"+
              "(?:seven)|"+
              "(?:eight)|"+
              "(?:nine)|"+
              "(?:ten)|"+
              "(?:eleven)|"+
              "(?:twelve)";
	const weekday = "(?:monday)|"+
              "(?:tuesday)|"+
              "(?:wednesday)|"+
              "(?:thursday)|"+
              "(?:friday)|"+
              "(?:saturday)|"+
              "(?:sunday)";
	var origin_date_regexps = [
            new Regexp_and_Conversion('today|(depart|leav|fly)\\w+\\s+now|earliest|soon|quickly',get_today),
            new Regexp_and_Conversion('(?! after\\s*)tomorrow',get_tomorrow),
            new Regexp_and_Conversion('(('+notcapturing_date+')\\s+('+notcapturing_month+')[,; \\t]*(\\d{4})?)',function( matches, result ) {
                var date  = ordinal_to_number(matches[2]);
                var month = matches[3];
                var year  = /\d{4}/.exec(matches[4]) ? matches[4] : (new Date()).getFullYear();
                return new Date(date+" "+month+" "+year);
            }),
            new Regexp_and_Conversion('(('+notcapturing_month+')\\s+('+notcapturing_date+')[,; \\t]*(\\d{4})?)',function( matches, result ) {
                var date  = ordinal_to_number(matches[3]);
                var month = matches[2];
                var year  = /\d{4}/.exec(matches[4]) ? matches[4] : (new Date()).getFullYear();
                return new Date(date+" "+month+" "+year);
            }),
            new Regexp_and_Conversion('next\\s+((?:week)|(?:month))',function( matches, result ) {
                return (new Date((new Date()).getTime() + (matches[1]=='week'?7:30)*24*60*60*1000));
            }),
            new Regexp_and_Conversion('('+notcapturing_number+')\\s+((?:week)|(?:month))',function( matches, result ) {
                return (new Date((new Date()).getTime() + ordinal_to_number(matches[1])*(matches[2]=='week'?7:30)*24*60*60*1000));
            }),
            new Regexp_and_Conversion('('+weekday+')',function( matches, result ) {
                return get_date_of_next_weekday(new Date(),matches[1]);
            })
        ];
	var return_date_regexps = [
            new Regexp_and_Conversion('today|(depart|leav|fly)\\w+\\s+now|earliest|soon|quickly',get_today),
            new Regexp_and_Conversion('(?! after\\s*)tomorrow',get_tomorrow),
            new Regexp_and_Conversion('(('+notcapturing_date+')\\s+('+notcapturing_month+')[,; \\t]*(\\d{2,4})?)',function( matches, result ) {
                var date  = ordinal_to_number(matches[2]);
                var month = matches[3];
                var year  = /\d{4}/.exec(matches[4]) ? matches[4] : result.origin_date.value.getFullYear();
                return new Date(date+" "+month+" "+year);
            }),
            new Regexp_and_Conversion('(('+notcapturing_month+')\\s+('+notcapturing_date+')[,; \\t]*(\\d{4})?)',function( matches, result ) {
                var date  = ordinal_to_number(matches[3]);
                var month = matches[2];
                var year  = /\d{4}/.exec(matches[4]) ? matches[4] : result.origin_date.value.getFullYear();
                return new Date(date+" "+month+" "+year);
            }),
            new Regexp_and_Conversion('the next day',function( matches, result ) {
                var r = new Date(result.origin_date.value.getTime());
                r.setDate(r.getDate()+1);
                return r;
            }),
            new Regexp_and_Conversion('(in (a|1)|next) week',function( matches, result ) {
                var r = new Date(result.origin_date.value.getTime());
                r.setDate(r.getDate()+7);
                return r;
            }),
            new Regexp_and_Conversion('(('+notcapturing_number+')(?=\\s+week))',function( matches, result ) {
                var r = new Date(result.origin_date.value.getTime());
                r.setDate(r.getDate()+7*ordinal_to_number(matches[1]));
                return r;        
            }),
            new Regexp_and_Conversion('(('+notcapturing_number+')(?=\\s+day))',function( matches, result ) {
                var r = new Date(result.origin_date.value.getTime());
                r.setDate(r.getDate()+1*ordinal_to_number(matches[1]));
                return r;        
            }),
            new Regexp_and_Conversion('('+notcapturing_date+')',function( matches, result ) {
                var r = new Date(result.origin_date.value.getTime());
                r.setDate(matches[matches.length-1]);
                if( r.toDateString()=="Invalid Date" ) 
                    throw new Exception("Cannot convert '"+matches[matches.length-1]+"' to date");
                if( r.getTime()<result.origin_date.value.getTime() )
                    r.setMonth(r.getMonth()+1);
                return r;
            }),
            new Regexp_and_Conversion('('+weekday+')',function( matches, result ) {
                return get_date_of_next_weekday(result.origin_date.value,matches[1]);
            })
        ];
	origin_date_regexps.find(function( re ) {
            return this['origin_date'] = this.match_and_convert(re);
        },this);
	if( !this.hasOwnProperty('return_date') ) {
            return_date_regexps.find(function( re ) {
		return this['return_date'] = this.match_and_convert(re);
            },this);
	}
	return this;
    };
    this.airports = function() {
        const chopoff_trailing = function( s ) {
            return s.replace(/( on|[^a-z]+)$/i,''); 
        }
	// Handle St. and Ft. leading in city names
	const city_name = "(?:(?:Petit\\s+St\\.?\\s+Vincent)|(?:(?:[SsFf]t\\.?\\s*)?[A-Z][A-z\\-,]+(?:\\s+[A-Z]\\w+,?){0,2}))";
	var origin_airport_regexps = [
            new Regexp_and_Conversion(new RegExp("("+city_name+")\\s*(?:to|-)\\s*("+city_name+")"),function( matches, result ) {
                // Avoid patterns like "Flying" to or "Leaving to" or "departing to"
                var city_name = chopoff_trailing(matches[1]);
                if( /(?:flying|leaving|departing)/i.exec(city_name) )
                    throw new Exception("Wrong city name"+city_name);
                result['return_airport'] = {
                    value : chopoff_trailing(matches[2])
                };
                return city_name; 
            }),
            new Regexp_and_Conversion(new RegExp("between\\s+("+city_name+")\\s+and\\s*("+city_name+")"),function( matches, result ) {
                result['return_airport'] = {
                    value : chopoff_trailing(matches[2])
                };
                return chopoff_trailing(matches[1]); 
            }),
            new Regexp_and_Conversion(new RegExp("("+city_name+")\\s+from\\s+("+city_name+")"),function( matches, result ) {
                result['return_airport'] = {
                    value : chopoff_trailing(matches[1])
                };
                return chopoff_trailing(matches[2]);
            }),
            new Regexp_and_Conversion(new RegExp("\\b(?:(?:[Ff]rom|[Dd]epart\\w*)|(?:(?:am|is|are)\\s+(?:\\w+\\s+)?in))\\s+("+city_name+")"),function( matches, result ) {
                return chopoff_trailing(matches[1]);
            })
        ];
	var return_airport_regexps = [
            new Regexp_and_Conversion(new RegExp("\\b(?:(?:[Tt]o)|(?:[Rr]each(?:\\s[Tt]o)?)|(?:[Aa]rrive(?:\\s[Tt]o)?))\\s+("+city_name+")"),function( matches, result ) {
                return chopoff_trailing(matches[1]);
            })
        ];
	// Cannot really use forEach here becasue need to make a return from parse_dates
	origin_airport_regexps.find(function( re ) {
            return this['origin_airport'] = this.match_and_convert(re);
        },this);
	if( !this.hasOwnProperty('return_airport') ) {
            return_airport_regexps.find(function( re ) {
		return this['return_airport'] = this.match_and_convert(re);
            },this);
	}
	return this;
    };
    this.class_of_service = function () {
	var class_of_service_regexps = [
            new Regexp_and_Conversion('economy',function() { return "E"; }),
            new Regexp_and_Conversion('premium',function() { return "P"; }),
            new Regexp_and_Conversion('business',function() { return "B"; }),
            new Regexp_and_Conversion('first',function() { return "F"; })
	];
	class_of_service_regexps.find(function( re ) {
            return this['class_of_service'] = this.match_and_convert(re);
        },this);
	return this;
    };
    this.number_of_tickets = function () {
	var number_of_tickets_regexps = [
            new Regexp_and_Conversion('\\b(ticket|needs|by\\smyself|one)\\b',function() { return 1; }),
            new Regexp_and_Conversion('\\b(two)|(seco(?= nd))|((with|and)\\s+(I|myself|me))\\b',function() { return 2; }),
            new Regexp_and_Conversion('(\\d+)(?:\\s+[a-z\\-]+)?(?:\\s+[a-z\\-]+)?\\s+ticket',function(s) { return Number(s); }),
            new Regexp_and_Conversion('s\\s+(three)|(thi(?= rd))|(with|and)\\s+(I|myself|me)\\b',function() { return 3; }),
            new Regexp_and_Conversion('\\b(with|and)\\s+my\\s+\\w+s\\b',function() { return 3; } ),
            new Regexp_and_Conversion('\\b(with|and)\\s+(my|a)\\b',function() { return 2; } ),
            new Regexp_and_Conversion('and\\s*my\\s+\\w+s\\b',function() { return 2; } ),
            new Regexp_and_Conversion('\\b([Ww]e|are)\\s+',function() { return 'multiple'; } ),
            new Regexp_and_Conversion('\\b[Oo]ur\\s+',function() { return 'multiple'; } ),
            new Regexp_and_Conversion('\\b(children|students|a group)\\s+',function() { return 'multiple'; } ),
            new Regexp_and_Conversion('tickets',function() { return 'multiple'; } ),
            new Regexp_and_Conversion('how\\s+much\\s+does\\s+it\\s+cost',function() { return 1; } ),
            // This test is unreliable, so we try to catch constructs like "I am flying with my parents are" earlier
            new Regexp_and_Conversion('\\bi\\s+',function() { return 1; } )
	];
	number_of_tickets_regexps.find(function( re ) {
            return this['number_of_tickets'] = this.match_and_convert(re);
        },this);
	return this;
    };
    this.run = function() {
	this.dates();
	this.airports();
	this.class_of_service();
	this.number_of_tickets();
	this.type  = this.return_date ? 'round_trip' : 'one_way';
	this.log(this);
	return this;
    }
};
