/////////////////////////////////////////////////////////////////
// Module functions
/////////////////////////////////////////////////////////////////
function ordinal_to_number(s) {
  if (/one|first/i.exec(s)) return 1;
  if (/two|second/i.exec(s)) return 2;
  if (/three|third/i.exec(s)) return 3;
  if (/four|fourth/i.exec(s)) return 4;
  if (/five|fifth/i.exec(s)) return 5;
  if (/six|sixth/i.exec(s)) return 6;
  if (/seven|seventh/i.exec(s)) return 7;
  if (/eight|eighth/i.exec(s)) return 8;
  if (/nine|nineth/i.exec(s)) return 9;
  if (/ten|tenth/i.exec(s)) return 10;
  if (/eleven|eleventh/i.exec(s)) return 11;
  if (/twelve|twelfth/i.exec(s)) return 12;
  var matches = /(\d+)(?:st|nd|rd|th)/.exec(s);
  return matches ? Number(matches[1]) : Number(s);
}
function get_weekday(d) {
  return d.toDateString().replace(/^([a-z]+)\s.*/i, '$1');
}
function get_date_of_next_weekday(start, weekday) {
  // Always make a copy so that we leave the original intact
  start = new Date(start.getTime());
  weekday = String(weekday).toLowerCase();
  for (var n = 0; n < 7; n++) {
    if (weekday.indexOf(get_weekday(start).toLowerCase()) == 0)
      return start;
    start.setDate(start.getDate() + 1);
  }
  throw new Exception("Cannot find the next date for " + weekday);
}
function get_today() {
  return (new Date());
}
function get_tomorrow() {
  var result = new Date();
  result.setDate(result.getDate() + 1);
  return result;
}
function validate_city_name(city_name) {
  city_name = city_name.replace(/( on|[^a-z]+)$/i, '');
  if (/flying|leaving|departing|students/i.exec(city_name))
    throw new Exception("Wrong city name" + city_name);
  return city_name;
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
    'origin_date',
    'return_date',
    'origin_airport',
    'return_airport',
    'class_of_service',
    'number_of_tickets'
  ];

  this.date_pattern = "\\d{1,2}(?:st|nd|rd|th)?|"+
    "first(?!\\s+class)|" +
    "second|" +
    "third|" +
    "fourth|" +
    "fifth|" +
    "sixth|" +
    "seventh|" +
    "eighth|" +
    "nineth|" +
    "tenth|" +
    "eleventh|" +
    "twelfth";

  this.month_pattern = "jan(?:uary)?|"+
    "feb(?:ruary)?|" +
    "mar(?:ch)?|" +
    "apr(?:il)?|" +
    "may|" +
    "jun(?:e)?|" +
    "jul(?:y)?|" +
    "aug(?:ust)?|" +
    "sep(?:t)?(?:ember)?|" +
    "oct(?:ober)?|" +
    "nov(?:ember)?|" +
    "dec(?:ember)?";

  this.number_pattern = "\\d{1,2}|"+
    "one|" +
    "two|" +
    "three|" +
    "four|" +
    "five|" +
    "six|" +
    "seven|" +
    "eight|" +
    "nine|" +
    "ten|" +
    "eleven|" +
    "twelve";

  this.weekday_pattern = "monday|"+
    "tuesday|" +
    "wednesday|" +
    "thursday|" +
    "friday|" +
    "saturday|" +
    "sunday";

  // Handle "St. " and "Ft. " leading in the city names or handle three letter airport codes
  this.city_pattern = "(?:[A-Z][A-z\\-,]+\\s+[SsFf]t\\.?(?:\\s+[A-Z][A-z\\-]*,?))|" +
    "(?:(?:[SsFf]t\\.?\\s*)?[A-Z][A-z\\-,]+(?:\\s+[A-Z][A-z\\-]*,?){0,2})|" +
    "(?:[A-Z]{3})";

  // regexps matching different elements
  this.origin_date_regexps = [
    new Regexp_and_Conversion('today|(depart|leav|fly)\\w+\\s+now|earliest|soon|quickly', get_today),
    new Regexp_and_Conversion('(?! after\\s*)tomorrow', get_tomorrow),
    new Regexp_and_Conversion('((' + this.date_pattern + ')\\s+(' + this.month_pattern + ')[,; \\t]*(\\d{4})?)', function (matches, result) {
      var date = ordinal_to_number(matches[2]);
      var month = matches[3];
      var year = /\d{4}/.exec(matches[4]) ? matches[4] : (new Date()).getFullYear();
      return new Date(date + " " + month + " " + year);
    }),
    new Regexp_and_Conversion('((' + this.month_pattern + ')\\s+(' + this.date_pattern + ')[,; \\t]*(\\d{4})?)', function (matches, result) {
      var date = ordinal_to_number(matches[3]);
      var month = matches[2];
      var year = /\d{4}/.exec(matches[4]) ? matches[4] : (new Date()).getFullYear();
      return new Date(date + " " + month + " " + year);
    }),
    new Regexp_and_Conversion('next\\s+((?:week)|(?:month))', function (matches, result) {
      return (new Date((new Date()).getTime() + (matches[1] == 'week' ? 7 : 30) * 24 * 60 * 60 * 1000));
    }),
    new Regexp_and_Conversion('(' + this.number_pattern + ')\\s+((?:week)|(?:month))', function (matches, result) {
      return (new Date((new Date()).getTime() + ordinal_to_number(matches[1]) * (matches[2] == 'week' ? 7 : 30) * 24 * 60 * 60 * 1000));
    }),
    new Regexp_and_Conversion('(' + this.weekday_pattern + ')', function (matches, result) {
      return get_date_of_next_weekday(new Date(), matches[1]);
    })
  ];
  this.return_date_regexps = [
    new Regexp_and_Conversion('today|(depart|leav|fly)\\w+\\s+now|earliest|soon|quickly', get_today),
    new Regexp_and_Conversion('(?! after\\s*)tomorrow', get_tomorrow),
    new Regexp_and_Conversion('((' + this.date_pattern + ')\\s+(' + this.month_pattern + ')[,; \\t]*(\\d{2,4})?)', function (matches, result) {
      var date = ordinal_to_number(matches[2]);
      var month = matches[3];
      var year = /\d{4}/.exec(matches[4]) ? matches[4] : result.origin_date.value.getFullYear();
      return new Date(date + " " + month + " " + year);
    }),
    new Regexp_and_Conversion('((' + this.month_pattern + ')\\s+(' + this.date_pattern + ')[,; \\t]*(\\d{4})?)', function (matches, result) {
      var date = ordinal_to_number(matches[3]);
      var month = matches[2];
      var year = /\d{4}/.exec(matches[4]) ? matches[4] : result.origin_date.value.getFullYear();
      return new Date(date + " " + month + " " + year);
    }),
    new Regexp_and_Conversion('the next day', function (matches, result) {
      var r = new Date(result.origin_date.value.getTime());
      r.setDate(r.getDate() + 1);
      return r;
    }),
    new Regexp_and_Conversion('(in (a|1)|next) week', function (matches, result) {
      var r = new Date(result.origin_date.value.getTime());
      r.setDate(r.getDate() + 7);
      return r;
    }),
    new Regexp_and_Conversion('((' + this.number_pattern + ')(?=\\s+week))', function (matches, result) {
      var r = new Date(result.origin_date.value.getTime());
      r.setDate(r.getDate() + 7 * ordinal_to_number(matches[1]));
      return r;
    }),
    new Regexp_and_Conversion('((' + this.number_pattern + ')(?=\\s+day))', function (matches, result) {
      var r = new Date(result.origin_date.value.getTime());
      r.setDate(r.getDate() + 1 * ordinal_to_number(matches[1]));
      return r;
    }),
    new Regexp_and_Conversion('(' + this.weekday_pattern + ')', function (matches, result) {
      return get_date_of_next_weekday(result.origin_date.value, matches[1]);
    }),
    new Regexp_and_Conversion('(' + this.date_pattern + ')', function (matches, result) {
      var r = new Date(result.origin_date.value.getTime());
      var date_of_month = ordinal_to_number(matches[matches.length - 1]);
      if (date_of_month > 31)
        throw new Exception("Cannot convert '" + matches[matches.length - 1] + "' to a date of a month");
      r.setDate(date_of_month);
      if (r.getTime() < result.origin_date.value.getTime())
        r.setMonth(r.getMonth() + 1);
      return r;
    })
  ];
  this.origin_airport_regexps = [
    new Regexp_and_Conversion(new RegExp("(" + this.city_pattern + ")\\s+(?:to|-)\\s+(" + this.city_pattern + ")"), function (matches, result) {
      result['return_airport'] = {
        value: validate_city_name(matches[2]),
        pattern: 'same as origin_airport'
      };
      return validate_city_name(matches[1]);
    }),
    new Regexp_and_Conversion(new RegExp("between\\s+(" + this.city_pattern + ")\\s+and\\s*(" + this.city_pattern + ")"), function (matches, result) {
      result['return_airport'] = {
        value: validate_city_name(matches[2]),
        pattern: 'same as origin_airport'
      };
      return validate_city_name(matches[1]);
    }),
    new Regexp_and_Conversion(new RegExp("(" + this.city_pattern + ")\\s+from\\s+(" + this.city_pattern + ")"), function (matches, result) {
      result['return_airport'] = {
        value: validate_city_name(matches[1]),
        pattern: 'same as origin_airport'
      };
      return validate_city_name(matches[2]);
    }),
    new Regexp_and_Conversion(new RegExp("\\b(?:(?:[Ff]rom|[Dd]epart\\w*)|(?:(?:am|is|are)\\s+(?:\\w+\\s+)?in))\\s+(" + this.city_pattern + ")"), function (matches, result) {
      return validate_city_name(matches[1]);
    })
  ];
  this.return_airport_regexps = [
    new Regexp_and_Conversion(new RegExp("\\b(?:(?:(?:(?:[Rr]eache?s?)|(?:[Ff]l[iy]e?s?)|(?:[Aa]rrive?s?)|(?:[Ll]ands?)|(?:[Gg]oe?s?))(?:ing)?(?:\\s+(?:(?:[Tt]o)|(?:[Aa]t)))?)|(?:[Tt]o))\\s+(" + this.city_pattern + ")"), function (matches, result) {
      return validate_city_name(matches[1]);
    }),
    // This is the last resort match for cases like "Kiev-Moscow" or even "Kiev Moscow"
    new Regexp_and_Conversion(new RegExp("(" + this.city_pattern + ")(?:-|\\s+)(" + this.city_pattern + ")"), function (matches, result) {
      result['origin_airport'] = {
        value: validate_city_name(matches[1]),
        pattern: 'same as return_airport'
      };
      return validate_city_name(matches[2]);
    })
  ];
  this.class_of_service_regexps = [
    new Regexp_and_Conversion('economy',function() { return "E"; }),
    new Regexp_and_Conversion('premium',function() { return "P"; }),
    new Regexp_and_Conversion('business',function() { return "B"; }),
    new Regexp_and_Conversion('first',function() { return "F"; })
  ];
  this.number_of_tickets_regexps = [
    new Regexp_and_Conversion('\\w+s\\b\\s+(with|and)\\s+\\w+s\\b',function() { return 4; } ), // NEW: added to handle "Cats and dogs are flying from SFO to JFK"
    new Regexp_and_Conversion('\\w+\\s+(with|and)\\s+\\w+s\\b',function() { return 3; } ),     // NEW: added to handle "Cat and dogs are flying from SFO to JFK"
    new Regexp_and_Conversion('\\w+s\\b\\s+(with|and)\\s+\\w+',function() { return 3; } ),     // NEW: added to handle "Cats and dog are flying from SFO to JFK"
    new Regexp_and_Conversion('\\b(ticket|needs|by\\smyself|one)\\b',function() { return 1; }),
    new Regexp_and_Conversion('s\\s+(with|and)\\s+(I|myself|me)\\b',function() { return 3; } ), // same as old NUM #02
    new Regexp_and_Conversion('\\b(two)|(seco(?= nd))|((with|and)\\s+(I|myself|me))\\b',function() { return 2; }),
    new Regexp_and_Conversion('(\\d+)(?:\\s+[a-z\\-]+)?(?:\\s+[a-z\\-]+)?\\s+ticket',function(s) { return Number(s); }),
    new Regexp_and_Conversion('s\\s+(three)|(thi(?= rd))|(with|and)\\s+(I|myself|me)\\b',function() { return 3; }),
    new Regexp_and_Conversion('\\b(with|and)\\s+my\\s+\\w+s\\b',function() { return 3; } ), // same as old NUM #04
    new Regexp_and_Conversion('\\b(with|and)\\s+(my|a)\\b',function() { return 2; } ),
    new Regexp_and_Conversion('and\\s*my\\s+\\w+s\\b',function() { return 2; } ), // same as old NUM #06
    new Regexp_and_Conversion('\\b[Ww]e\\b\\s+',function() { return 'multiple'; } ),
    new Regexp_and_Conversion('\\b[Oo]ur\\s+',function() { return 'multiple'; } ),
    new Regexp_and_Conversion('\\b(children|students|a group)\\s+',function() { return 'multiple'; } ), // same as old NUM #09
    new Regexp_and_Conversion('tickets',function() { return 'multiple'; } ), // same as old NUM #10
    new Regexp_and_Conversion('how\\s+much\\s+does\\s+it\\s+cost',function() { return 1; } ), // same as old NUM #11
    // This test is unreliable, so we try to catch constructs like "I am flying with my parents are" earlier
    new Regexp_and_Conversion("(?:\\bi\\s+)|(?:\\bi[`']m\\b)",function() { return 1; } ),
    // NEW: added to handle "Cat and dog are flying from SFO to JFK"
    new Regexp_and_Conversion('\\w+\\s+(with|and)\\s+\\w+',function() { return 2; } ),
    new Regexp_and_Conversion('\\bare\\b\\s+',function() { return 'multiple'; } )
  ];

  /////////////////////////////////////////////////////////////////
  // Methods
  /////////////////////////////////////////////////////////////////
  this.run = function (text) {
    // Takes a text, parses it, returns whatever is left unrecognized
    this.not_parsed = text;
    var match_and_convert = (regexp_and_conversion) => {
      try {
        var matches = regexp_and_conversion.re.exec(this.not_parsed);
        if (!matches) {
          throw {
            message: 'Matches not found!'
          };
        }
        var result = {};
        result['matches'] = matches;
        result['value'] = regexp_and_conversion.conversion_proc ? regexp_and_conversion.conversion_proc(matches, this) : matches[matches.length - 1];
        result['pattern'] = regexp_and_conversion.re;
        this.not_parsed = this.not_parsed.replace(regexp_and_conversion.re, '');
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
        this[key + '_regexps'].find(function (re) {
          return this[key] = match_and_convert(re);
        }, this);
      }
    }, this);
    // set the type of the travel
    this.type = this.return_date ? 'round_trip' : 'one_way';
    return this.not_parsed;
  }
}
/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
var parser = new AvaeaTextParser();

module.exports = {
  parser: parser,
  run: function(text, callback) {
    var err, result;
    try {
      var not_parsed = parser.run(text);
      result = {
        query               : text,
        not_parsed          : not_parsed,
        action              : 'form', // 'top', 'all' // TODO: is not recognized yet
        airline             : undefined,              // TODO: is not recognized yet
        origin_airport      : parser.origin_airport     ? parser.origin_airport.value     : undefined,
        destination_airport : parser.return_airport     ? parser.return_airport.value     : undefined,
        origin_date         : parser.origin_date        ? parser.origin_date.value        : false,
        return_date         : parser.return_date        ? parser.return_date.value        : false,
        type                : parser.type               ? parser.type                     : undefined,
        number_of_tickets   : parser.number_of_tickets  ? parser.number_of_tickets.value  : undefined,
        class_of_service    : parser.class_of_service   ? parser.class_of_service.value   : undefined
      };
    } catch (e) {
      err = e;
    }
    return callback(err, result);
  }
};
