////////////////////////////////////////////////////////////////
// Module constants
/////////////////////////////////////////////////////////////////
const _CARDINALS_1DIGIT = {
  "one"   : 1,
  "two"   : 2,
  "three" : 3,
  "four"  : 4,
  "five"  : 5,
  "six"   : 6,
  "seven" : 7,
  "eight" : 8,
  "nine"  : 9,
  "1"     : 1,
  "2"     : 2,
  "3"     : 3,
  "4"     : 4,
  "5"     : 5,
  "6"     : 6,
  "7"     : 7,
  "8"     : 8,
  "9"     : 9
};
const _CARDINALS_2DIGITS_DATE = {
  "ten"       : 10,
  "eleven"    : 11,
  "twelve"    : 12,
  "thirteen"  : 13,
  "fourteen"  : 14,
  "fifteen"   : 15,
  "sixteen"   : 16,
  "seventeen" : 17,
  "eighteen"  : 18,
  "nineteen"  : 19,
  "twenty"    : 20,
  "thirty"    : 30,
  "10"        : 10,
  "11"        : 11,
  "12"        : 12,
  "13"        : 13,
  "14"        : 14,
  "15"        : 15,
  "16"        : 16,
  "17"        : 17,
  "18"        : 18,
  "19"        : 19,
  "20"        : 20,
  "21"        : 21,
  "22"        : 22,
  "23"        : 23,
  "24"        : 24,
  "25"        : 25,
  "26"        : 26,
  "27"        : 27,
  "28"        : 28,
  "29"        : 29,
  "30"        : 30,
  "31"        : 31
};
const _CARDINALS_DECIMALS = {
  "twenty"    : 20,
  "thirty"    : 30,
  "fourty"    : 40,
  "fifty"     : 50,
  "sixty"     : 60,
  "seventy"   : 70,
  "eighty"    : 80,
  "ninety"    : 90
};
const _ORDINALS_1DIGIT = {
  "first(?!\\s+class)" : 1,
  "second(?!\\s+class)" : 2,
  "third" : 3,
  "fourth" : 4,
  "fifth" : 5,
  "sixth" : 6,
  "seventh" : 7,
  "eighth" : 8,
  "ninth" : 9,
  "1st(?!\\s+class)" : 1,
  "2nd(?!\\s+class)" : 2,
  "3rd" : 3,
  "4th" : 4,
  "5th" : 5,
  "6th" : 6,
  "7th" : 7,
  "8th" : 8,
  "9th" : 9,
};
const _ORDINALS_2DIGITS_DATE = {
  "tenth" : 10,
  "eleventh" : 11,
  "twelfth" : 12,
  "thirteenth" : 13,
  "fourteenth" : 14,
  "fifteenth" : 15,
  "sixteenth" : 16,
  "seventeenth" : 17,
  "eighteenth" : 18,
  "nineteenth" : 19,
  "twentieth" : 20,
  "thirtieth" : 30,
  "10th" : 10,
  "11th" : 11,
  "12th" : 12,
  "13th" : 13,
  "14th" : 14,
  "15th" : 15,
  "16th" : 16,
  "17th" : 17,
  "18th" : 18,
  "19th" : 19,
  "20th" : 20,
  "21st" : 21,
  "22nd" : 22,
  "23rd" : 23,
  "24th" : 24,
  "25th" : 25,
  "26th" : 26,
  "27th" : 27,
  "28th" : 28,
  "29th" : 29,
  "30th" : 30,
  "31st" : 31
};
const _MONTH_NAMES = {
  "jan(?:uary)?"        : 0,
  "feb(?:ruary)?"       : 1,
  "mar(?:ch)?"          : 2,
  "apr(?:il)?"          : 3,
  "may"                 : 4,
  "jun(?:e)?"           : 5,
  "jul(?:y)?"           : 6,
  "aug(?:ust)?"         : 7,
  "sep(?:t)?(?:ember)?" : 8,
  "oct(?:ober)?"        : 9,
  "nov(?:ember)?"       : 10,
  "dec(?:ember)?"       : 11
};
const _DATE_UNITS = {
  "day"                 : 1,
  "week"                : 7,
  "fortnight"           : 14,
  "month"               : 30 // FIXME
};
const _DATE_QUALIFIERS = {
  "from"                : 1,
  "after"               : 1,
  "before"              : -1
};

////////////////////////////////////////////////////////////////
// Different RE patterns
/////////////////////////////////////////////////////////////////
const _NUMBER_PATTERN   = "\d{1,2}|"+
      "(?:(?:(?:"+Object.keys(_CARDINALS_DECIMALS).join("|")+")\\s+)?"+Object.keys(_CARDINALS_1DIGIT).join("|")+")|"+
      Object.keys(_CARDINALS_2DIGITS_DATE).join("|");
const _ORDINAL_DATE_OF_MONTH_PATTERN =
      // December 13th, 2016
      Object.keys(_ORDINALS_2DIGITS_DATE).join("|")+"|"+
      // December twenty? 2nd, 2016
      "(?:(?:twenty\\s+)?"+Object.keys(_ORDINALS_1DIGIT).join("|")+")|"+
      // December thirty 1st, 2016
      "(?:thirty\\s+(?:1st|first))";
const _CARDINAL_DATE_OF_MONTH_PATTERN =
      // December 13, 2016
      Object.keys(_CARDINALS_2DIGITS_DATE).join("|")+"|"+
      // December 2, 2016
      "(?:(?:twenty\\s+)?"+Object.keys(_CARDINALS_1DIGIT).join("|")+")|"+
      // December thirty 1, 2016
      "(?:thirty\\s+(?:1|one))";
const _DATE_OF_MONTH_PATTERN   = "\\b(?:"+
      _ORDINAL_DATE_OF_MONTH_PATTERN+"|"+
      _CARDINAL_DATE_OF_MONTH_PATTERN+
      ")\\b";
const _MONTH_NAME_PATTERN  = Object.keys(_MONTH_NAMES).join("|");

////////////////////////////////////////////////////////////////
// Module variables/functions
/////////////////////////////////////////////////////////////////
function __format_matches( m ) {
  var s = [];
  for( var n=0; n<m.length; n++ ) {
    s.push(n+" : "+m[n]);
  }
  return "["+s.join(",\n")+"]";
}
function get_matching_pattern( s, patterns ) {
  // See if there is a direct match
  for( var p in patterns ) {
    if( typeof(patterns[p])!='object' ) {
      patterns[p] = {
	're' : new RegExp("^"+p+"$","i"),
	'value' : patterns[p]
      };
    }
    if( patterns[p].re.test(s) ) {
      return patterns[p].value;
    }
  }
  throw new Error("'"+s+"' does not match anything expected");
}
function string_to_date_of_month( s ) {
  s = s.toLowerCase();
  var possibles = [
    _CARDINALS_1DIGIT,
    _ORDINALS_1DIGIT,
    _CARDINALS_2DIGITS_DATE,
    _ORDINALS_2DIGITS_DATE
  ];
  for( var n=0; n<possibles.length; n++ ) {
    try {
      return get_matching_pattern(s,possibles[n]);
    }
    catch( e ) {
      // suppress, keep trying
    }
  }
  // it is not a 2 digit/one word string. Try other options
  // Handle 'twenty ' or 'thirty ' prefix
  if( (matches=/^twenty\s+(.+)$/i.exec(s)) )
    return 20+string_to_date_of_month(matches[1]);
  if( (matches=/^thirty\s+(.+)$/i.exec(s)) )
    return 30+string_to_date_of_month(matches[1]);
  throw new Error("'"+s+"' does not look like a date of the month");
}
function string_to_number( s ) {
  s = s.toLowerCase();
  if( /^\d+$/.test(s) )
    return Number(s);
  var possibles = [
    _CARDINALS_1DIGIT,
    _CARDINALS_2DIGITS_DATE
  ];
  for( var n=0; n<possibles.length; n++ ) {
    try {
      return get_matching_pattern(s,possibles[n]);
    }
    catch( e ) {
      // suppress, keep trying
    }
  }
  // This is slow
  for( var d in _CARDINALS_DECIMALS ) {
    var re      = new RegExp("^"+d+"\\s+(.+)$","i");
    var matches = re.exec(s);
    if( matches )
      return _CARDINALS_DECIMALS[d]+get_matching_pattern(_CARDINALS_1DIGIT);
  }
  throw new Error("'"+s+"' does not look like a number");
}
function string_to_month_number( s ) {
  return get_matching_pattern(s.toLowerCase(),_MONTH_NAMES);
}
function string_to_full_year( s ) {
  return s.length==2 ? (2000+Number(s)) : Number(s);
}
function get_month_number_of( d ) {
  // d.toLocaleString() will return "8" for "August" but JScript needs months
  // indexed at 0 for new Date() object constructors. That's why -1 is.
  return Number(d.toLocaleString("en-us",{month:"numeric"}))-1;
}
function get_weekday_of( d ) {
  return d.toLocaleString("en-us",{ weekday: "short" });
}
function get_date_of_next_weekday(start, weekday) {
  // Always make a copy so that we leave the original intact
  start = new Date(start);
  weekday = String(weekday).toLowerCase();
  for (var n = 0; n < 7; n++) {
    if (weekday.indexOf(get_weekday_of(start).toLowerCase()) == 0)
      return start;
    start.setDate(start.getDate() + 1);
  }
  throw new Error("Cannot find the next date for " + weekday);
}
function get_date_of_next_date_of_month( start, date_of_month ) {
  start = new Date(start);
  // Assuming any given date can be found within 2 months.
  // E.g. if start = January 30th, then the next 30th of the month will be in March
  for( var n=0; n<30+31; n++ ) {
    if( start.getDate()==date_of_month )
      return start;
    start.setDate(start.getDate()+1);
  }
  throw new Error("Cannot find the next date for " + date_of_month);
}
function validate_city_name(city_name) {
  city_name = city_name.replace(/( on|[^a-z]+)$/i, '');
  if (/from|fly|flying|leaving|departing|students/i.exec(city_name)) // TODO: Get rid of this eventually. Do not even capture these words as possible airports.
    throw new Error("Wrong city name" + city_name);
  return city_name;
}
function do_date_arithmetics( base_date, quantity_match, date_unit_match, qualifier_match ) {
  var result    = new Date(base_date);
  var quantity  = (["a","next"].indexOf(quantity_match.toLowerCase())<0 ? string_to_number(quantity_match) : 1) * _DATE_QUALIFIERS[qualifier_match.toLowerCase()];
  if( date_unit_match.toLowerCase()=='month' )
    result.setMonth(result.getMonth()+quantity);
  else
    result.setDate(result.getDate()+_DATE_UNITS[date_unit_match.toLowerCase()]*quantity);
  return result;
}
/////////////////////////////////////////////////////////////////
// Module classes
/////////////////////////////////////////////////////////////////
function Regexp_and_Conversion(pattern, conversion_proc) {
  // if the pattern is an object then assume that it is a regexp already
  this.re = (typeof(pattern) == 'string') ? new RegExp(pattern, 'i') : pattern;
  this.conversion_proc = conversion_proc;
}
function AvaeaTextParser() {

  // Properties
  this.keys = [
    'action',
    'origin_date',
    'return_date',
    'origin_airport',
    'return_airport',
    'class_of_service',
    'number_of_tickets'
  ];

  this.date_patterns_and_procs = [
    [
      '(today|tonight|now|earliest|soon|quickly)',
      function( min_date, matches, atp ) {
	return new Date();
      }
    ],
    [
      '((?! after\\s*)tomorrow)',
      function( min_date, matches, atp ) {
	var result = new Date();
	result.setDate(result.getDate()+1);
	return result;
      }
    ],
    [
      '(thanksgiving|christmas|xmas)',
      function( min_date, matches, atp ) {
	switch( matches[1].toLowerCase() ) {
	case 'christmas':
	case 'xmas':
	  var result = new Date(min_date.getFullYear(),11,25);
	  if( result>=min_date )
	    return result;
	  result.setFullYear(result.getFullYear()+1);
	  return result;
	case 'thanksgiving':
	  // Fourth Thursday in November
	  var result = get_date_of_next_weekday(new Date(min_date.getFullYear(),10,1),"Thursday");
	  result.setDate(result.getDate()+21);
	  if( result>=min_date )
	    return result;
	  result.setFullYear(result.getFullYear()+1);
	  return result;
	}
	throw new Error("'"+s+"' does not look like a holiday name");
      }
    ],
    [
      '(monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
      function( min_date, matches, atp ) {
	var start   = new Date(min_date);
        var weekday = String(matches[1]).toLowerCase();
        for (var n=0; n<7; n++) {
	  if (weekday.indexOf(get_weekday_of(start).toLowerCase()) == 0)
	    return start;
	  start.setDate(start.getDate()+1);
	}
        throw new Error("Cannot find the next date for " + weekday);
      }
    ],
    [
      '(?:the\\s+)?('+_DATE_OF_MONTH_PATTERN+')(?:\\s+(?:of\\s+)?('+_MONTH_NAME_PATTERN+'))(?:(?:,\\s*|\\s+)(\\d{2,4}))?',
      function( min_date, matches, atp ) {
	var date_of_month = string_to_date_of_month(matches[1]);
	var month_number  = string_to_month_number(matches[2]);
	var year          = matches[3] ? string_to_full_year(matches[3]) : min_date.getFullYear();
	return new Date(year,month_number,date_of_month);
      }
    ],
    [
      '(?:('+_MONTH_NAME_PATTERN+')\\s+)(?:the\\s+)?('+_DATE_OF_MONTH_PATTERN+')(?:(?:,\\s*|\\s+)(\\d{2,4}))?',
      function( min_date, matches, apt ) {
	// These indexes can only be figured out by testing. Too bad that JS regexps do not have names
	// captures like python regexps have
	var date_of_month = string_to_date_of_month(matches[2]);
	var month_number  = string_to_month_number(matches[1]);
	var year          = matches[3] ? string_to_full_year(matches[3]) : min_date.getFullYear();
	return new Date(year,month_number,date_of_month);
      }
    ],
    [
      '(?:[^\\./\\w]|^)(\\d{1,2})([\\./])(\\d{1,2})(?:[\\./](\\d{2,4})|(?![\\./\\w]))?',
      function( min_date, matches, apt ) {
	var year = matches[4] ? string_to_full_year(matches[4]) : start.getFullYear();
	// JavaScript counts months from 0 to 11. January is 0. December is 11.
	return (matches[2]=='/') ?
	  // 01/13/2017, 01/13/17, 1/13
	  new Date(year,Number(matches[1])-1,Number(matches[3])) :
	  // 13.01.2017, 13.01.17, 13.1
	  new Date(year,Number(matches[3])-1,Number(matches[1])) ;
      }
    ],
    [
      '('+_ORDINAL_DATE_OF_MONTH_PATTERN+')',
      function( min_date, matches, apt ) {
	return get_date_of_next_date_of_month(min_date,string_to_date_of_month(matches[1]));
      }
    ]
  ].map(function( pattern_and_proc ) {
    // This function maps patterns and conversion procs for dates without date arithmetics to
    // patterns and conversion procs with date arithmetics. Basically all date arithmetics
    // handling is contained in this function.
    return [
      '((?:in\\s+)?(?:the\\s+)?(next|a|'+_NUMBER_PATTERN+')\\s+('+Object.keys(_DATE_UNITS).join('|')+')s?\\s+('+Object.keys(_DATE_QUALIFIERS).join('|')+')\\s+)?'+pattern_and_proc[0],
      function( min_date, matches, apt ) {
	// The date arithmetics regexp has 4 submatches, so slice the parsing of the date itself by 4
	var result = pattern_and_proc[1](min_date,Array.prototype.slice.call(matches,4),apt);
	return matches[1] ? do_date_arithmetics(result,matches[2],matches[3],matches[4]) : result;
      }
    ];
  });
  
  // Handle "St. ", "Ft. ", and "Pt. " leading in the city names or handle three letter airport codes
  this.city_pattern = "(?:[A-Z][A-z\\-,]+\\s+(?:[SsFfPp]t\\.?|de)(?:\\s+[A-Z][A-z\\-]+,?))|" +
    "(?:(?:[SsFfPp]t\\.?\\s*)?[A-Z][A-z\\-,]+(?:\\s+[A-Z][A-z\\-]+,?){0,3})";

  // regexps matching different elements
  this.action_regexps = [
    new Regexp_and_Conversion('top\\s+flights',function() { return "top"; }),
    new Regexp_and_Conversion('all\\s+flights',function() { return "all"; })
  ];
  this.origin_date_regexps = this.date_patterns_and_procs.concat([
    [
      // Below go the date patterns that do not refer to specific date
      '(?:in\\s+)?(?:the\\s+)?(next|a|'+_NUMBER_PATTERN+')\\s+('+Object.keys(_DATE_UNITS).join('|')+')s?',
      function( min_date, matches, apt ) {
	// If the origin_date didn not provide specific date (e.g. 8/16/2016) then it is based on the
	// current moment as in phrase 'I am leaving the next day.'
	return do_date_arithmetics(min_date,matches[1],matches[2],"after");
      }
    ]
  ]).map(function( pattern_and_proc ) {
    return new Regexp_and_Conversion(
      pattern_and_proc[0],
      function( matches, apt ) {
	// Make sure that origin date does not follow anything that belongs to return date
	// TODO: this needs to be much more sophisticated
	var input    = matches.input.substr(0,matches.index);
	var matches1 = /(from|ending|return|returning|come\s+back|coming\s+back|get\s+back|getting\s+back|back)(\s+(?:on|next))?\s+$/i.exec(input);
	if( matches1 )
	  throw new Error("origin_date cannot be preceded by a '"+matches1[1]+"'");
	// Now actually call the procedure
	return pattern_and_proc[1](new Date(),matches,apt);
      }
    );
  });
  this.return_date_regexps = this.date_patterns_and_procs.concat([
    // Below go the date patterns that do not refer to specific date
    [
      '(?:in\\s+)?(?:the\\s+)?(next|a|'+_NUMBER_PATTERN+')\\s+('+Object.keys(_DATE_UNITS).join('|')+')s?',
      function( min_date, matches, apt ) {
	return do_date_arithmetics(min_date,matches[1],matches[2],"after");
      }
    ],
    [
      '('+_NUMBER_PATTERN+')(?:\\s+|-)('+Object.keys(_DATE_UNITS).join('|')+')s?\\s+(?:trip|travel|voyage|getaway)',
      function( min_date, matches, apt ) {
	return do_date_arithmetics(min_date,matches[1],matches[2],"after");
      }
    ]
  ]).map(function( pattern_and_proc ) {
    return new Regexp_and_Conversion(
      pattern_and_proc[0],
      function( matches, apt ) {
	// If the return_date did not provide specific date (e.g. 8/16/2016) then it is based on the
	// origin date as in phrase 'I am leaving the next day returning 3 weeks later.'
	var min_date = apt.origin_date ? apt.origin_date.value : new Date();
	return pattern_and_proc[1](min_date,matches,apt);
      }
    );
  });
  this.origin_airport_regexps = [
    new Regexp_and_Conversion(new RegExp("("+this.city_pattern+")\\s+(?:to|-)\\s+("+this.city_pattern+")"), function ( matches, apt ) {
      apt['return_airport'] = {
        value: validate_city_name(matches[2]),
        pattern: 'same as origin_airport'
      };
      return validate_city_name(matches[1]);
    }),
    new Regexp_and_Conversion(new RegExp("between\\s+("+this.city_pattern+")\\s+and\\s*("+this.city_pattern+")"), function ( matches, apt ) {
      apt['return_airport'] = {
        value: validate_city_name(matches[2]),
        pattern: 'same as origin_airport'
      };
      return validate_city_name(matches[1]);
    }),
    new Regexp_and_Conversion(new RegExp("("+this.city_pattern+")\\s+from\\s+("+this.city_pattern+")"), function ( matches, apt ) {
      apt['return_airport'] = {
        value: validate_city_name(matches[1]),
        pattern: 'same as origin_airport'
      };
      return validate_city_name(matches[2]);
    }),
    new Regexp_and_Conversion(new RegExp("\\b(?:(?:[Ff]rom|[Dd]epart\\w*)|(?:(?:I'm|am|is|are)\\s+(?:\\w+\\s+)?in))\\s+("+this.city_pattern+")"), function ( matches, apt ) {
      return validate_city_name(matches[1]);
    })
  ];
  this.return_airport_regexps = [
    new Regexp_and_Conversion(new RegExp("\\b(?:(?:(?:(?:[Rr]eache?s?)|(?:[Ff]l[iy]e?s?)|(?:[Aa]rrive?s?)|(?:[Ll]ands?)|(?:[Gg]oe?s?))(?:ing)?(?:\\s+(?:(?:[Tt]o)|(?:[Aa]t)))?)|(?:[Tt]o))\\s+("+this.city_pattern+")"), function ( matches, apt ) {
      return validate_city_name(matches[1]);
    }),
    // This is the last resort match for cases like "Kiev-Moscow" or even "Kiev Moscow"
    new Regexp_and_Conversion(new RegExp("("+this.city_pattern+")(?:-|\\s+)("+this.city_pattern+")"),function ( matches, apt ) {
      apt['origin_airport'] = {
        value: validate_city_name(matches[1]),
        pattern: 'same as return_airport'
      };
      return validate_city_name(matches[2]);
    })
  ];
  this.class_of_service_regexps = [
    new Regexp_and_Conversion('(?:in\\s)?economy(?:\\sclass)?',function() { return "E"; }),
    new Regexp_and_Conversion('(?:in\\s)?premium(?:\\sclass)?',function() { return "P"; }),
    new Regexp_and_Conversion('(?:in\\s)?business(?:\\sclass)?',function() { return "B"; }),
    new Regexp_and_Conversion('(?:in\\s)?(?:first|1st)(?:\\sclass)?',function() { return "F"; })
  ];
  this.number_of_tickets_regexps = [
    new Regexp_and_Conversion('\\w+s\\b\\s+(with|and)\\s+\\w+s\\b',function() { return 4; } ), // NEW: added to handle "Cats and dogs are flying from SFO to JFK"
    new Regexp_and_Conversion('\\w+\\s+(with|and)\\s+\\w+s\\b',function() { return 3; } ),     // NEW: added to handle "Cat and dogs are flying from SFO to JFK"
    new Regexp_and_Conversion('\\w+[^s]s\\b\\s+(with|and)\\s+\\w+',function() { return 3; } ), // NEW: added to handle "Cats and dog are flying from SFO to JFK"

    new Regexp_and_Conversion('\\b(ticket|needs|by\\smyself|one(?!\\s+way))\\b',function() { return 1; }),
    new Regexp_and_Conversion('[^s]s\\s+(with|and)\\s+(me|myself|I)\\b',function() { return 3; } ), // same as old NUM #02
    new Regexp_and_Conversion('\\b(two)|(seco(?= nd))|((with|and)\\s+(me|myself|I))\\b',function() { return 2; }),
    new Regexp_and_Conversion('('+_NUMBER_PATTERN+')(?:\\s+[a-z\\-]+)?(?:\\s+[a-z\\-]+)?\\s+tickets?',function(s) { return string_to_number(s[1]); }),

    new Regexp_and_Conversion('s\\s+(three)|(thi(?= rd))|(with|and)\\s+(me|myself|I)\\b',function() { return 3; }),
    new Regexp_and_Conversion('\\b(with|and)\\s+my\\s+\\w+s\\b',function() { return 3; } ), // same as old NUM #04
    new Regexp_and_Conversion('\\b(with|and)\\s+(my|a)\\b',function() { return 2; } ),
    new Regexp_and_Conversion('and\\s*my\\s+\\w+s\\b',function() { return 2; } ), // same as old NUM #06
    new Regexp_and_Conversion('for\\s+me\\b',function() { return 1; } ),
    new Regexp_and_Conversion('for\\s+('+_NUMBER_PATTERN+')(?!\\s+day)',function(s) { return string_to_number(s[1]); }),

    new Regexp_and_Conversion('\\b[Ww]e\\b\\s+',function() { return 'multiple'; } ),
    new Regexp_and_Conversion('\\b[Oo]ur\\s+',function() { return 'multiple'; } ),
    new Regexp_and_Conversion('\\b(children|students|a group)\\s+',function() { return 'multiple'; } ), // same as old NUM #09
    new Regexp_and_Conversion('tickets',function() { return 'multiple'; } ), // same as old NUM #10
    new Regexp_and_Conversion('how\\s+much\\s+does\\s+it\\s+cost',function() { return 1; } ), // same as old NUM #11

    // This test is unreliable, so we try to catch constructs like "I am flying with my parents are" earlier
    new Regexp_and_Conversion("(?:\\bi\\s+)|(?:\\bi[`'](m|d)\\b)",function() { return 1; } ),
    new Regexp_and_Conversion('\\w+\\s+(with|and)\\s+\\w+',function() { return 2; } ),          // NEW: added to handle "Cat and dog are flying from SFO to JFK"
    new Regexp_and_Conversion('\\bare\\b\\s+',function() { return 'multiple'; } )
  ];

  /////////////////////////////////////////////////////////////////
  // Methods
  /////////////////////////////////////////////////////////////////
  this.run = function( text ) {
    // Takes a text, parses it, returns whatever is left unrecognized
    this.not_parsed = text;
    var match_and_convert = (regexp_and_conversion) => {
      try {
        var matches = regexp_and_conversion.re.exec(this.not_parsed);
        if (!matches)
	  throw new Error("Did not match '"+regexp_and_conversion.re.source+"'");
        var result = {};
        result['matches'] = matches;
        result['value']   = regexp_and_conversion.conversion_proc ? regexp_and_conversion.conversion_proc(matches, this) : matches[matches.length - 1];
        result['pattern'] = regexp_and_conversion.re;
        this.not_parsed = this.not_parsed.replace(regexp_and_conversion.re,'');
        return result;
      } catch (e) {
        return undefined;
      }
    };
    // clean the previous matches
    this.keys.forEach(function (key) {
      delete this[key];
    }, this);
    // find the regexp matching the key... unless key has already been set by an earlier match
    this.keys.forEach(function (key) {
      if (!this[key]) {
        this[key+'_regexps'].find(function (re) {
          return this[key] = match_and_convert(re);
        }, this);
      }
    }, this);
    // set the type of the travel
    this.type = this.return_date ? 'round_trip' : 'one_way';
    return this.not_parsed;
  }
}
(function() {
  if( typeof module != 'undefined' && module.exports ) {
    var parser = new AvaeaTextParser();
    module.exports = {
      parser : parser,
      run: function(text, callback) {
        var err, result;
        try {
          parser.run(text);
          result = {
            query               : text,
            not_parsed          : parser.not_parsed,
            action              : parser.action             ? parser.action.value             : undefined, // 'top', 'all', 'form'
            airline             : undefined,                // TODO: is not recognized yet
            origin_airport      : parser.origin_airport     ? parser.origin_airport.value     : undefined,
            return_airport      : parser.return_airport     ? parser.return_airport.value     : undefined,
            // The user of the voice search does not care for the timezone of the server where the speech
            // is parsed. If we do not strip the server timezone information from the parsed dates then the
            // clients will re-calculate server timezone into its own timezone, potentially even resulting
            // in a different date
            origin_date         : parser.origin_date        ? parser.origin_date.value.toDateString() : undefined,
            return_date         : parser.return_date        ? parser.return_date.value.toDateString() : undefined,
            type                : parser.type               ? parser.type                     : undefined, // 'one_way' or 'round_trip'
            number_of_tickets   : parser.number_of_tickets  ? parser.number_of_tickets.value  : undefined,
            class_of_service    : parser.class_of_service   ? parser.class_of_service.value   : undefined
          };
          sails.log.verbose("Parser success: "+JSON.stringify(result));
        } catch (e) {
          err = e;
          sails.log.error("Parser error: "+JSON.stringify(err));
        }
        return callback(err, result);
      }
    }
  } else {
    // Are we running in a browser?
  }
})();
