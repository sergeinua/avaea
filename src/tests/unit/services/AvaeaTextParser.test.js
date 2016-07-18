/////////////////////////////////////////////////////////////////
// functions and classes
/////////////////////////////////////////////////////////////////
function get_weekday( d ) {
  return d.toDateString().replace(/^([a-z]+)\s.*/i,'$1');
}
function get_date_of_next_weekday( start, weekday ) {
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
function Test_and_Result( query, origin_airport, return_airport, origin_date, return_date, number_of_tickets, class_of_service ) {
  this.query             = query;
  this.origin_airport    = origin_airport;
  this.return_airport    = return_airport;
  this.origin_date       = ((typeof(origin_date)=="object") && (typeof(origin_date.toDateString)=="function")) ? origin_date.toDateString() : origin_date;
  this.return_date       = ((typeof(return_date)=="object") && (typeof(return_date.toDateString)=="function")) ? return_date.toDateString() : return_date;
  this.number_of_tickets = number_of_tickets;
  this.class_of_service  = class_of_service;
}
/////////////////////////////////////////////////////////////////
// Module globals
/////////////////////////////////////////////////////////////////
const _PARSER = require('../../../api/services/AvaeaTextParser');
const _TESTS  = [
  new Test_and_Result("Fly from Amsterdam to Petit St. Vincent with my girlfriend today",
                      "Amsterdam",
                      "Petit St. Vincent",
                      new Date(),
                      undefined,
                      "2"),
  new Test_and_Result("Skiing trip from Portland, Maine to Portland, Oregon on December 20, 2017 returning two weeks later",
                      "Portland, Maine",
                      "Portland, Oregon",
                      new Date("Wed Dec 20 2017"),
                      new Date(+new Date("Wed Dec 20 2017")+14*24*3600*1000)),
  new Test_and_Result("Singapore to Sidney tomorrow first class",
                      "Singapore",
                      "Sidney",
                      new Date((new Date()).getTime()+24*60*60*1000),
                      undefined,
                      undefined,
                      "F"),
  new Test_and_Result("My baby sitter and I need to fly from San Francisco to Boston, leaving on March 25 and returning on April 10th.",
                      "San Francisco",
                      "Boston",
                      "Fri Mar 25 2016",
                      "Sun Apr 10 2016",
                      "2"),
  new Test_and_Result("I need to fly to Wichita with my parents next week.",
                      undefined,
                      "Wichita",
                      new Date((new Date()).getTime() + 7*24*60*60*1000),
                      undefined,
                      "3"),
  new Test_and_Result("Ft. Lauderdale, Florida to St.Peterburg, Russia, leave now return two weeks later.",
                      "Ft. Lauderdale, Florida",
                      "St.Peterburg, Russia",
                      new Date(),
                      new Date((new Date()).getTime() + 14*24*60*60*1000)),
  new Test_and_Result("Round-trip from Istanbul to Hong Kong, Aug 20, 2017 through September 23",
                      "Istanbul",
                      "Hong Kong",
                      "Sun Aug 20 2017",
                      "Sat Sep 23 2017"),
  new Test_and_Result("I need to fly to Washington on business as soon as possible.",
                      undefined,
                      "Washington",
                      new Date(),
                      undefined,
                      "1",
                      "B"),
  new Test_and_Result("Check availability for my parents trip from JFK to Tokyo, leaving on 20 Dec, coming back in January.",
                      "JFK",
                      "Tokyo",
                      "Tue Dec 20 2016"),
  new Test_and_Result("One economy ticket from Yoshkar-Ola to Paris-Orly tomorrow, return in six days.",
                      "Yoshkar-Ola",
                      "Paris-Orly",
                      new Date(+new Date() + 1*24*60*60*1000),
                      new Date(+new Date() + 7*24*60*60*1000),
                      "1",
                      "E"),
  new Test_and_Result("I am currently in Bogota. Need to get to Miami as soon as possible. Back next week.",
                      "Bogota",
                      "Miami",
                      new Date(),
                      new Date(+new Date() + 7*24*60*60*1000),
                      "1"),
  new Test_and_Result("Tickets for a group of athletes flying from San Diego, CA to Austin, TX in March returning in May.",
                      "San Diego, CA",
                      "Austin, TX",
                      undefined,
                      undefined,
                      "multiple"),
  new Test_and_Result("Vacation trip from Toronto to Cabo San Lucas on December 13. Flying back on the 2nd. I will travel with a body guard.",
                      "Toronto",
                      "Cabo San Lucas",
                      "Tue Dec 13 2016",
                      "Mon Jan 02 2017",
                      "2"),
  new Test_and_Result("Leaving from Buenos Aires to Vancouver today, returning two weeks later",
                      "Buenos Aires",
                      "Vancouver",
                      new Date(),
                      new Date(+new Date() + 14*24*60*60*1000)),
  new Test_and_Result("Two business class tickets from Memphis to Madrid on March 8, back in three weeks",
                      "Memphis",
                      "Madrid",
                      "Tue Mar 08 2016",
                      "Tue Mar 29 2016",
                      "2",
                      "B"),
  new Test_and_Result("We would like to leave on March 10 from Sacramento in the evening to Lahore Pakistan, and would like to be back in Sacramento on the 17th.",
                      "Sacramento",
                      "Lahore Pakistan",
                      "Thu Mar 10 2016",
                      "Thu Mar 17 2016",
                      "multiple"),
  new Test_and_Result("My wife needs to fly to Dubai right away. She is stuck in Paris right now. Get her the earliest ticket there.",
                      "Paris",
                      "Dubai",
                      new Date(),
                      undefined,
                      "1"),
  new Test_and_Result("How much is a Kiev-Moscow one-way ticket two weeks from now?",
                      "Kiev",
                      "Moscow",
                      new Date(+new Date() + 14*24*60*60*1000),
                      undefined,
                      "1"),
  new Test_and_Result("How soon can my children reach Frankfurt-Hahn from Minneapolis St. Paul?",
                      "Minneapolis St. Paul",
                      "Frankfurt-Hahn",
                      new Date(),
                      undefined,
                      "multiple"),
  new Test_and_Result("My parents and I are flying to Johannesburg on Jul 10, returning in September",
                      undefined,
                      "Johannesburg",
                      "Sun Jul 10 2016",
                      undefined,
                      "3"),
  new Test_and_Result("I need a ticket departing Los Angeles on May 2 and reaching London the next day.",
                      "Los Angeles",
                      "London",
                      new Date("Mon May 02 2016"),
                      new Date(+new Date("Mon May 02 2016")+24*60*60*1000),
                      "1"),
  new Test_and_Result("Flight 77 departs Kona on May 7 lands at SFO. Get tickets for me and my associate.",
                      "Kona",
                      "SFO",
                      "Sat May 07 2016",
                      undefined,
                      "2"),
  new Test_and_Result("Students from Kalamazoo, MI are flying on a school trip to Mexico City. April 3 to April 17.",
                      "Kalamazoo, MI",
                      "Mexico City",
                      "Sun Apr 03 2016",
                      "Sun Apr 17 2016",
                      "multiple"),
  new Test_and_Result("I have to go to Beijing (China) for a business trip, leaving on April 21. I would like to leave from SFO and would like to stop in Japan for 2 days, and then to Beijing. I need to back in my office for a meeting on April 30th.",
                      "SFO",
                      "Beijing",
                      "Thu Apr 21 2016",
                      "Sat Apr 30 2016",
                      "1",
                      "B"),
  new Test_and_Result("I'd like a ticket between San Francisco and New York City",
                      "San Francisco",
                      "New York City",
                      undefined,
                      undefined,
                      "1"),
  new Test_and_Result("I am in Paris. Need to fly to Nice.",
                      "Paris",
                      "Nice",
                      undefined,
                      undefined,
                      "1"),
  new Test_and_Result("I need to fly to London on Friday",
                      undefined,
                      "London",
                      get_date_of_next_weekday(new Date(),"Friday"),
                      undefined,
                      "1"),
  new Test_and_Result("Flying to Phoenix on Wednesday, back on Friday",
                      undefined,
                      "Phoenix",
                      get_date_of_next_weekday(new Date(),"Wednesday"),
                      get_date_of_next_weekday(get_date_of_next_weekday(new Date(),"Wednesday"),"Friday")),
  new Test_and_Result("I would like to book two tickets from San Francisco to Honolulu June 26th return July 17th",
                      "San Francisco",
                      "Honolulu",
                      "Sun Jun 26 2016",
                      "Sun Jul 17 2016",
                      "2"),
  new Test_and_Result("Ticket from Juno, Alaska to Augusta, Georgia, September 20 through September 23",
                      "Juno, Alaska",
                      "Augusta, Georgia",
                      "Tue Sep 20 2016",
                      "Fri Sep 23 2016",
                      "1"),
  new Test_and_Result("I would like to fly from San Francisco to New York on June 15th returning August 25th 2016 in business class",
                      "San Francisco",
                      "New York",
                      "Wed Jun 15 2016",
                      "Thu Aug 25 2016",
                      1,
                      "B"),
  new Test_and_Result("I'm flying from Tokyo to st. Petersburg Russia next week",
                      "Tokyo",
                      "st. Petersburg Russia",
                      new Date(+new Date() + 7*24*60*60*1000),
                      undefined,
                      1),
  new Test_and_Result("I'm flying from Tokyo to St. Petersburg Russia next week",
                      "Tokyo",
                      "St. Petersburg Russia",
                      new Date(+new Date() + 7*24*60*60*1000),
                      undefined,
                      "1"),
  new Test_and_Result("I am in SFO, need to fly to JFK",
                      "SFO",
                      "JFK",
                      undefined,
                      undefined,
                      "1"),
  new Test_and_Result("I am in Paris need to fly to Madrid tomorrow",
                      "Paris",
                      "Madrid",
                      new Date(+new Date() + 24*60*60*1000),
                      undefined,
                      "1"),
  new Test_and_Result("Petya and Vasya are flying from SFO to JFK on Nov 15, returning on Dec 20",
                      "SFO",
                      "JFK",
                      "Tue Nov 15 2016",
                      "Tue Dec 20 2016",
                      "2"),
  new Test_and_Result("Cats and dogs are flying from SFO to JFK on Nov 15, returning on Dec 20",
                      "SFO",
                      "JFK",
                      "Tue Nov 15 2016",
                      "Tue Dec 20 2016",
                      "4")
];
/////////////////////////////////////////////////////////////////
// top level
/////////////////////////////////////////////////////////////////
describe('AvaeaTextParser', function() {
  var parser = _PARSER.parser;
  _TESTS.forEach(function( t ) {
    it(t.query,function() {
      var not_parsed = parser.run(t.query);
      parser.keys.forEach(function( key ) {
	var value = undefined;
	if( parser[key] )
	  value = (typeof(parser[key].value.toDateString)=="function") ? parser[key].value.toDateString() : parser[key].value;
	if( t[key]!=value )
          throw Error("Values for '"+key+"' do not match, '"+t[key]+"' vs. '"+value+"'"); 
      });
    });
  });
});
