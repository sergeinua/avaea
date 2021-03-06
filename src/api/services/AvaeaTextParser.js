///////////////////////////////////////////////////////////////
// Module constants
/////////////////////////////////////////////////////////////////
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
const _PRONOUNS = {
  "my"                  : 1,
  "mine"                : 1,
  "our"                 : 2,
  "ours"                : 2,
  "her"                 : 1,
  "his"                 : 1,
  "its"                 : 1,
  "they"                : 2,
  "their"               : 2,
  "theirs"              : 2
};
////////////////////////////////////////////////////////////////
// Module functions
/////////////////////////////////////////////////////////////////
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
  var result = Number(s);
  if( isNaN(result) || (result<0) || (result>31) )
    throw Error("'"+s+"' is not a date of the month");
  return result;
}
function get_date_from_matches( min_date, year_match, month_match, date_of_month_match ) {
  // In JScript monht numbers start from 0
  var month_number  = /\d+/.test(month_match) ? (Number(month_match)-1) : get_matching_pattern(month_match,_MONTH_NAMES);
  var date_of_month = string_to_date_of_month(date_of_month_match);
  // If year is not specified then make sure to return the date compliant with the min_date requirement
  if( !year_match ) {
    var candidate = new Date(min_date.getFullYear(),month_number,date_of_month);
    return candidate<min_date ? new Date(min_date.getFullYear()+1,month_number,date_of_month) : candidate;
  }
  // The year was explicitly specified. Ignore the min_date
  return new Date(((year_match.length==2)?2000:0)+Number(year_match),month_number,date_of_month);
}
function get_date_of_next_weekday(start, weekday) {
  // Always make a copy so that we leave the original intact
  start = new Date(start);
  weekday = String(weekday);
  for (var n = 0; n < 7; n++) {
    if (weekday.indexOf(start.toLocaleString("en-us",{ weekday: "short" }).toLowerCase()) == 0)
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
function validate_city_name( city_name ) {
  city_name = city_name.replace(/( on|[^a-z]+)$/i, '');
  if (/from|fly|flying|leaving|departing|students/i.exec(city_name)) // TODO: Get rid of this eventually. Do not even capture these words as possible airports.
    throw new Error("Wrong city name" + city_name);
  return city_name;
}
function do_date_arithmetics( base_date, quantity_match, date_unit_match, qualifier_match ) {
  var result    = new Date(base_date);
  var quantity  = (["a","next"].indexOf(quantity_match)<0 ? Number(quantity_match) : 1) * _DATE_QUALIFIERS[qualifier_match];
  if( date_unit_match=='month' )
    result.setMonth(result.getMonth()+quantity);
  else
    result.setDate(result.getDate()+_DATE_UNITS[date_unit_match]*quantity);
  return result;
}
function canonicalize_numbers( s ) {
  const _CARDINALS_1DIGIT_WORDS = {
    "one"   : 1,
    "two"   : 2,
    "three" : 3,
    "four"  : 4,
    "five"  : 5,
    "six"   : 6,
    "seven" : 7,
    "eight" : 8,
    "nine"  : 9
  }
  const _TEEN_CARDINALS_2DIGITS_WORDS = {
    "ten"       : 10,
    "eleven"    : 11,
    "twelve"    : 12,
    "thirteen"  : 13,
    "fourteen"  : 14,
    "fifteen"   : 15,
    "sixteen"   : 16,
    "seventeen" : 17,
    "eighteen"  : 18,
    "nineteen"  : 19
  };
  const _CARDINALS_DECIMAL_WORDS = {
    "twenty"    : 20,
    "thirty"    : 30,
    "fourty"    : 40,
    "fifty"     : 50,
    "sixty"     : 60,
    "seventy"   : 70,
    "eighty"    : 80,
    "ninety"    : 90
  };
  const _ORDINALS_1DIGIT_WORDS = {
    "first"     : 1,
    "second"    : 2,
    "third"     : 3,
    "fourth"    : 4,
    "fifth"     : 5,
    "sixth"     : 6,
    "seventh"   : 7,
    "eighth"    : 8,
    "nineth"    : 9,
    "ninth"     : 9  // a common typo
  };
  const _TEEN_ORDINALS_2DIGITS_WORDS = {
    "tenth"        : 10,
    "eleventh"     : 11,
    "twelfth"      : 12,
    "thirteenth"   : 13,
    "fourteenth"   : 14,
    "fifteenth"    : 15,
    "sixteenth"    : 16,
    "seventeenth"  : 17,
    "eighteenth"   : 18,
    "nineteenth"   : 19
  };
  const _ORDINALS_DECIMAL_WORDS = {
    "twentieth"    : 20,
    "thirtieth"    : 30,
    "fourtieth"    : 40,
    "fiftieth"     : 50,
    "sixtieth"     : 60,
    "seventieth"   : 70,
    "eightieth"    : 80,
    "ninetieth"    : 90
  };
  // First replace word cardinals with numbers (e.g. "thirty one" with "31")
  return s
    .replace(new RegExp('\\b(?:('+Object.keys(_CARDINALS_DECIMAL_WORDS).join('|')+') )?('+Object.keys(_CARDINALS_1DIGIT_WORDS).join('|')+')\\b',"gi"),function( matches, decimal, _1digit ) {
      return (decimal ? _CARDINALS_DECIMAL_WORDS[decimal.toLowerCase()]:0)+_CARDINALS_1DIGIT_WORDS[_1digit.toLowerCase()];
    })
    .replace(new RegExp('\\b('+Object.keys(_CARDINALS_DECIMAL_WORDS).join('|')+')\\b',"gi"),function( matches, decimal ) {
      return _CARDINALS_DECIMAL_WORDS[decimal.toLowerCase()];
    })
    .replace(new RegExp('\\b('+Object.keys(_TEEN_CARDINALS_2DIGITS_WORDS).join('|')+')\\b',"gi"),function( matches, _2digits ) {
      return _TEEN_CARDINALS_2DIGITS_WORDS[_2digits.toLowerCase()];
    })
  // First replace word ordinals with numbers (e.g. "thirty first" with "31th", yes, we will not bother to have it as 31st")
    .replace(new RegExp('\\b(?:('+Object.keys(_CARDINALS_DECIMAL_WORDS).join('|')+') )?('+Object.keys(_ORDINALS_1DIGIT_WORDS).join('|')+')\\b',"gi"),function( matches, decimal, _1digit ) {
      return (decimal ? _CARDINALS_DECIMAL_WORDS[decimal.toLowerCase()]:0)+_ORDINALS_1DIGIT_WORDS[_1digit.toLowerCase()]+"th";
    })
    .replace(new RegExp('\\b('+Object.keys(_ORDINALS_DECIMAL_WORDS).join('|')+')\\b',"gi"),function( matches, decimal ) {
      return _ORDINALS_DECIMAL_WORDS[decimal.toLowerCase()]+"th";
    })
    .replace(new RegExp('\\b('+Object.keys(_TEEN_ORDINALS_2DIGITS_WORDS).join('|')+')\\b',"gi"),function( matches, _2digits ) {
      return _TEEN_ORDINALS_2DIGITS_WORDS[_2digits.toLowerCase()]+"th";
    })
  // Bring ..1st, ..2nd and 3rd to stardard ..th form
    .replace(/( |\d)(1st|2nd|3rd)/gi,function( matches, one, two ) {
      return one+two.substr(0,1)+"th";
    });
}
/////////////////////////////////////////////////////////////////
// Module classes
/////////////////////////////////////////////////////////////////
function Regexp_and_Conversion(pattern, conversion_proc) {
  // if the pattern is an object then assume that it is a regexp already
  this.re              = (typeof(pattern)=='string') ? new RegExp(pattern,'i') : pattern;
  this.fold_the_case   = (typeof(pattern)=='string') ? true : false; // regretfully re.flags is not standard
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
      'tomorrow',
      function( min_date, matches, atp ) {
	var result = new Date();
	result.setDate(result.getDate()+1);
	return result;
      }
    ],
    [
      '(new year|martin luther king day|mlk day|groundhog day|valentine\'s day|presidents\' day|mardi gras|fat tuesday|purim|st\. patrick\'s day|passover|easter|' +
      'tax day|cinco de mayo|memorial day|independence day|labor day|yom kippur|columbus day|halloween|thanksgiving|black friday|cyber monday|hanukkah|christmas|xmas)',
      function( min_date, matches, atp ) {
	var result;
	switch( matches[1] ) {
	case 'new year': // fixed: Jan 1
          result = new Date(min_date.getFullYear(),0,1);
	  break;
	case 'martin luther king day': // third Monday in January
	case 'mlk day': // third Monday in January
	  result = get_date_of_next_weekday(new Date(min_date.getFullYear(),0,15),"monday"); // check current year
	  if (result<min_date) result = get_date_of_next_weekday(new Date(min_date.getFullYear()+1,0,15),"monday"); // in in the past, check next year
	  break;
	case 'groundhog day': // fixed: Feb 2
          result = new Date(min_date.getFullYear(),1,2);
	  break;
	case 'valentine\'s day': // fixed: Feb 14
          result = new Date(min_date.getFullYear(),1,14);
	  break;
	case 'presidents\' day': // third Monday in February
	  result = get_date_of_next_weekday(new Date(min_date.getFullYear(),1,15),"monday"); // check current year
	  if (result<min_date) result = get_date_of_next_weekday(new Date(min_date.getFullYear()+1,0,15),"monday"); // in in the past, check next year
	  break;
	case 'mardi gras': // Feb 28 // TODO: make dynamic
	case 'fat tuesday': // Feb 28 // TODO: make dynamic
          result = new Date(min_date.getFullYear(),1,28);
	  break;
	case 'purim': // Mar 12 // TODO: make dynamic
          result = new Date(min_date.getFullYear(),2,12);
	  break;
	case 'st. patrick\'s day': // fixed Mar 17
          result = new Date(min_date.getFullYear(),2,17);
	  break;
	case 'passover': // Apr 11 // TODO: make dynamic
          result = new Date(min_date.getFullYear(),3,11);
	  break;
	case 'easter': // Apr 16 // TODO: make dynamic
          result = new Date(min_date.getFullYear(),3,16);
	  break;
	case 'tax day': // Apr 18 // TODO: make dynamic
          result = new Date(min_date.getFullYear(),3,18);
	  break;
	case 'cinco de mayo': // fixed: May 5
          result = new Date(min_date.getFullYear(),4,5);
	  break;
	case 'memorial day': // last Monday in May
	  result = get_date_of_next_weekday(new Date(min_date.getFullYear(),4,25),"monday"); // check current year
	  if (result<min_date) result = get_date_of_next_weekday(new Date(min_date.getFullYear()+1,4,25),"monday"); // if in the past, check next year
	  break;
	case 'independence day': // fixed: Jul 4
          result = new Date(min_date.getFullYear(),6,4);
	  break;
	case 'labor day': // first Monday in Sep
	  result = get_date_of_next_weekday(new Date(min_date.getFullYear(),8,1),"monday"); // check current year
	  if (result<min_date) result = get_date_of_next_weekday(new Date(min_date.getFullYear()+1,8,1),"monday"); // if in the past, check next year
	  break;
	case 'yom kippur': // Oct 12 // TODO: make dynamic
          result = new Date(min_date.getFullYear(),9,12);
	  break;
	case 'halloween': // fixed: Oct 31
          result = new Date(min_date.getFullYear(),9,31);
	  break;
	case 'columbus day': // second Monday in Oct
	  result = get_date_of_next_weekday(new Date(min_date.getFullYear(),9,8),"monday"); // check current year
	  if (result<min_date) result = get_date_of_next_weekday(new Date(min_date.getFullYear()+1,9,8),"monday"); // if in the past, check next year
	  break;
	case 'thanksgiving': // fourth Thursday in November
	  result = get_date_of_next_weekday(new Date(min_date.getFullYear(),10,22),"thursday"); // check current year
	  if (result<min_date) result = get_date_of_next_weekday(new Date(min_date.getFullYear()+1,10,22),"thursday"); // if in the past, check next year
	  break;
	case 'black friday': // Friday after the fourth Thursday in November
	  result = get_date_of_next_weekday(get_date_of_next_weekday(new Date(min_date.getFullYear(),10,22),"thursday"),"friday"); // check current year
	  if (result<min_date) result = get_date_of_next_weekday(get_date_of_next_weekday(new Date(min_date.getFullYear()+1,10,22),"thursday"),"friday"); // if in the past, check next year
	  break;
	case 'cyber monday': // Monday after the fourth Thursday in November
	  result = get_date_of_next_weekday(get_date_of_next_weekday(new Date(min_date.getFullYear(),10,22),"thursday"),"monday"); // check current year
	  if (result<min_date) result = get_date_of_next_weekday(get_date_of_next_weekday(new Date(min_date.getFullYear()+1,10,22),"thursday"),"monday"); // if in the past, check next year
	  break;
	case 'hanukkah': // fixed: Dec 25
	case 'christmas': // fixed: Dec 25
	case 'xmas': // fixed: Dec 25
	  result = new Date(min_date.getFullYear(),11,25);
	  break;
	default:
	  throw new Error("'"+s+"' does not look like a holiday name");
	}
	if( result>=min_date )
	  return result;
	result.setFullYear(result.getFullYear()+1);
	return result;
      }
    ],
    [
      '(monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
      function( min_date, matches, atp ) {
	return get_date_of_next_weekday(min_date,matches[1]);
      }
    ],
    [
      '(\\d+)(?:th)?(?: (?:of )?('+Object.keys(_MONTH_NAMES).join("|")+'))(?:(?:, | )(\\d{2,4}))?',
      function( min_date, matches, atp ) {
	return get_date_from_matches(min_date,matches[3],matches[2],matches[1]);
      }
    ],
    [
      '(?:('+Object.keys(_MONTH_NAMES).join("|")+') )(\\d+)(?:th)?(?:(?:, | )(\\d{2,4}))?',
      function( min_date, matches, apt ) {
	return get_date_from_matches(min_date,matches[3],matches[1],matches[2]);
      }
    ],
    [
      '(?:[^\\./\\w]|^)(\\d{1,2})([\\./])(\\d{1,2})(?:[\\./](\\d{2,4})|(?![\\./\\w]))?',
      function( min_date, matches, apt ) {
	// JavaScript counts months from 0 to 11. January is 0. December is 11.
	return (matches[2]=='/') ?
	  // 01/13/2017, 01/13/17, 1/13
	  get_date_from_matches(min_date,matches[4],matches[1],matches[3]) : 
	  // 13.01.2017, 13.01.17, 13.1
	  get_date_from_matches(min_date,matches[4],matches[3],matches[1]) ;
      }
    ],
    [
      '(\\d+)th(?! class)',
      function( min_date, matches, apt ) {
	return get_date_of_next_date_of_month(min_date,string_to_date_of_month(matches[1]));
      }
    ]
  ].map(function( pattern_and_proc ) {
    // This function maps patterns and conversion procs for dates without date arithmetics to
    // patterns and conversion procs with date arithmetics. Basically all date arithmetics
    // handling is contained in this function.
    return [
      '((?:in )?(next|a|\\d+) ('+Object.keys(_DATE_UNITS).join('|')+')s? ('+Object.keys(_DATE_QUALIFIERS).join('|')+') )?'+pattern_and_proc[0],
      function( min_date, matches, apt ) {
	// The date arithmetics regexp has 4 submatches, so slice the parsing of the date itself by 4
	var result = pattern_and_proc[1](min_date,Array.prototype.slice.call(matches,4),apt);
	return matches[1] ? do_date_arithmetics(result,matches[2],matches[3],matches[4]) : result;
      }
    ];
  });
  
  // Handle "St. ", "Ft. ", and "Pt. " leading in the city names or handle three letter airport codes
  this.city_pattern = "(?:[A-Z][A-z\\-,]+ (?:\\b[SsFfPp]t\\.?|de|am|upon|on)(?: [A-Z][A-z\\-]+,?))|" +
    "(?:(?:\\b[SsFfPp]t\\.? *)?[A-Z][A-z\\-,]+(?: [A-Z][A-z\\-]+,?){0,3})";

  // regexps matching different elements
  this.action_regexps = [
    new Regexp_and_Conversion('top flights',function() { return "top"; }),
    new Regexp_and_Conversion('all flights',function() { return "all"; })
  ];
  this.origin_date_regexps = this.date_patterns_and_procs.concat([
    [
      // Below go the date patterns that do not refer to specific date
      '(?:in )?(next|a|\\d+) ('+Object.keys(_DATE_UNITS).join('|')+')s?',
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
	var matches1 = /(from|ending|return|returning|come back|coming back|get back|getting back|back)( (?:on|next))? $/i.exec(input);
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
      '(?:in )?(next|a|\\d+) ('+Object.keys(_DATE_UNITS).join('|')+')s?',
      function( min_date, matches, apt ) {
	return do_date_arithmetics(min_date,matches[1],matches[2],"after");
      }
    ],
    [
      '(\\d+)(?: |-)('+Object.keys(_DATE_UNITS).join('|')+')s? (?:trip|travel|voyage|getaway)',
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
    new Regexp_and_Conversion(new RegExp("("+this.city_pattern+") (?:to|2|-) ("+this.city_pattern+")"), function ( matches, apt ) {
      apt['return_airport'] = {
        value: validate_city_name(matches[2]),
        pattern: 'same as origin_airport'
      };
      return validate_city_name(matches[1]);
    }),
    new Regexp_and_Conversion(new RegExp("between ("+this.city_pattern+") and ("+this.city_pattern+")"), function ( matches, apt ) {
      apt['return_airport'] = {
        value: validate_city_name(matches[2]),
        pattern: 'same as origin_airport'
      };
      return validate_city_name(matches[1]);
    }),
    new Regexp_and_Conversion(new RegExp("("+this.city_pattern+") from ("+this.city_pattern+")"), function ( matches, apt ) {
      apt['return_airport'] = {
        value: validate_city_name(matches[1]),
        pattern: 'same as origin_airport'
      };
      return validate_city_name(matches[2]);
    }),
    new Regexp_and_Conversion(new RegExp("\\b(?:(?:[Ff]rom|[Dd]epart\\w*)|(?:(?:I'm|am|is|are) (?:\\w+ )?in)) ("+this.city_pattern+")"), function ( matches, apt ) {
      return validate_city_name(matches[1]);
    })
  ];
  this.return_airport_regexps = [
    new Regexp_and_Conversion(new RegExp("\\b(?:(?:(?:(?:[Rr]eache?s?)|(?:[Ff]l[iy]e?s?)|(?:[Aa]rrive?s?)|(?:[Ll]ands?)|(?:[Gg]oe?s?))(?:ing)?(?: (?:(?:[Tt]o)|(?:[Aa]t)))?)|(?:[Tt]o)) ("+this.city_pattern+")"), function ( matches, apt ) {
      return validate_city_name(matches[1]);
    }),
    // This is the last resort match for cases like "Kiev-Moscow" or even "Kiev Moscow"
    new Regexp_and_Conversion(new RegExp("("+this.city_pattern+")(?:-| )("+this.city_pattern+")"),function ( matches, apt ) {
      apt['origin_airport'] = {
        value: validate_city_name(matches[1]),
        pattern: 'same as return_airport'
      };
      return validate_city_name(matches[2]);
    })
  ];
  this.class_of_service_regexps = [
    ['(?:in )?economy(?: class)?',function() { return "E"; }],
    ['(?:in )?premium(?: class)?',function() { return "P"; }],
    ['(?:in )?business(?: class)?',function() { return "B"; }],
    ['(?:in )?1th(?: class)?',function() { return "F"; }]
  ].map(function( e ) {
    return new Regexp_and_Conversion(e[0],e[1]);
  });
  function get_ticket_count( a1, a2 ) {
    if( (a1==undefined) && (a2==undefined) )
      return 1;
    if( /\d+/.test(a1) )
      return Number(a1);
    if( a1=='a' )
      return 1;
    switch( a2 ) {
    case 'boss':
      return 1;
    }
    return a2[a2.length-1]=='s' ? 2 : 1;
  }
  this.number_of_tickets_regexps = [
    new Regexp_and_Conversion('^',function( matches, apt ) {
      // Here we want to see if there are any companions to the flier and count their number. The companions can be found
      // by watching for pattern with|and, except that we do not want the words by both sides of with|and to be anything
      // but nouns or pronouns. The trouble is that regular expressions to do allow to catch only certain parts of speech.
      // So we really have to do some interesting analysis here.
      apt.not_parsed = matches.input.replace(/\b(?:out|in|back|flying|returning|leave|stop|want|departing|fly|ending|leaving|will|would|from|to|so|let's|on|a|like|trip|travel|flight|need|return|show|starting|(?:look|search)(?:ing)? for|\.|,)\b /g,'')
      var regexps = [
	['\\b(?:we|children|students|group|team) ',function() { return 'multiple'; }],
	['(\\d+) tickets?',function( matches, apt ) { return Number(matches[1]); }],
	['for (\\d+) ?$',function( matches, apt ) { return Number(matches[1]); }],
	['\\b(?:(?:('+Object.keys(_PRONOUNS).join('|')+'|a|\d+) )?(\\w+) )?(?:with|and) (?:('+Object.keys(_PRONOUNS).join('|')+'|a|\\d+) )?(\\w+)\\b',function( matches, apt ) {
	  return get_ticket_count(matches[1],matches[2])+get_ticket_count(matches[3],matches[4]);
	}],
	['\\b(?:for )?(?:('+Object.keys(_PRONOUNS).join('|')+'|a|\\d+) )(\\w+)\\b',function( matches, apt ) {
	  return get_ticket_count(matches[1],matches[2]);
	}]
      ];
      regexps.find(function( e ) {
	var result = apt.match_and_convert(new Regexp_and_Conversion(e[0],e[1]));
	return apt['temp_number_of_tickets'] = result;
      });
      return apt['temp_number_of_tickets'] ? apt['temp_number_of_tickets'].value : 1;
    })
  ];
  this.match_and_convert = function( regexp_and_conversion ) {
    try {
      // Remove extra spaces at every step because they can re-appear as we remove found parts
      // Also if the regexp is case insensitive then immediately lowercase the string so that
      // we do not have to write .toLowerCase() on every match
      var not_parsed = this.not_parsed.replace(/\s+/gi,' ');
      var matches    = regexp_and_conversion.re.exec(regexp_and_conversion.fold_the_case?not_parsed.toLowerCase():not_parsed);
      if (!matches)
	throw new Error("Did not match '"+regexp_and_conversion.re.source+"'");
      var result = {
        'matches' : matches,
        'value'   : regexp_and_conversion.conversion_proc(matches,this),
        'pattern' : regexp_and_conversion.re
      };
      this.not_parsed = this.not_parsed.replace(regexp_and_conversion.re,'');
      return result;
    } catch (e) {
      return undefined;
    }
  }

  /////////////////////////////////////////////////////////////////
  // Methods
  /////////////////////////////////////////////////////////////////
  this.run = function( text ) {
    // Clean up the string a bit first
    this.not_parsed = canonicalize_numbers(String(text).replace(/\bthe\s+/ig,' ').replace(/\ban\s+/ig,'a '));
    // clean the previous matches
    this.keys.forEach(function (key) {
      delete this[key];
    }, this);
    // find the regexp matching the key... unless key has already been set by an earlier match
    this.keys.forEach(function (key) {
      if (!this[key]) {
        this[key+'_regexps'].find(function (re) {
          return this[key] = this.match_and_convert(re);
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
          //sails.log.verbose("Parser success: "+JSON.stringify(result));
          sails.log.verbose("Parsing query : '" + result.query + "'"
            + "\n                                                 Parsing result:       from '" + result.origin_airport + "' to '" + result.return_airport + "'"
            + "\n                                                 Parsing result:       leaving on '" + result.origin_date + "' returning on '" + result.return_date + "'"
            + "\n                                                 Parsing result:       '" + result.number_of_tickets + "' tickets in '" + result.class_of_service + "' class"
            + "\n                                                 Parsing result:       trip type: '" + result.type + "', action: '" + result.action + "'"
            + "\n                                                 Parsing result:       not parsed: '" + result.not_parsed + "'"
          //+ "\n                                                 Parsing result:       airline: '" + result.airline + "'"
            );
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
