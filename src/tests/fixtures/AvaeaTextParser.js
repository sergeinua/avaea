// test # 9: should the return date be January 1? ("Check availability for my parents trip from JFK to Tokyo, leaving on 20 Dec, coming back in January.")
// test #20: should the return date be n/a? ("I need a ticket departing Los Angeles on May 2 and reaching London the next day.")
// test #23: should the return date be April 29? ("I have to go to Beijing (China) for a business trip, leaving on April 21. I would like to leave from SFO and would like to stop in Japan for 2 days, and then to Beijing. I need to back in my office for a meeting on April 30th.")

function get_avaea_parser_tests() {
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
  const add_days = function( start, num_days ) {
    // Always make a copy so that we leave the original intact
    start = new Date(start.getTime());
    start.setDate(start.getDate() + num_days);
    return start;
  }
  const add_weeks = function( start, num_weeks ) {
    // Always make a copy so that we leave the original intact
    start = new Date(start.getTime());
    start.setDate(start.getDate() + 7*num_weeks);
    return start;
  }
  const add_months = function( start, num_month ) {
    // Always make a copy so that we leave the original intact
    start = new Date(start.getTime());
    start.setMonth(start.getMonth() + num_month);
    return start;
  }
  const get_future_date = function( month_number, date_of_month, min_date ) {
    // JavaScript counts months from 0 to 11. January is 0. December is 11.
    min_date = min_date ? min_date : new Date();
    var candidate = new Date(min_date.getFullYear(),month_number-1,date_of_month);
    return candidate<min_date ? new Date(min_date.getFullYear()+1,month_number-1,date_of_month) : candidate;
  }
  function AvaeaTextParserTest( query, origin_airport, return_airport, origin_date, return_date, number_of_tickets, class_of_service, action ) {
    // Populate a test structure with the 8 input parameters
    this.query             = query;
    this.origin_airport    = origin_airport;
    this.return_airport    = return_airport;
    this.origin_date       = ((typeof(origin_date)=="object") && (typeof(origin_date.toDateString)=="function")) ? origin_date.toDateString() : origin_date;
    this.return_date       = ((typeof(return_date)=="object") && (typeof(return_date.toDateString)=="function")) ? return_date.toDateString() : return_date;
    this.number_of_tickets = number_of_tickets;
    this.class_of_service  = class_of_service;
    this.action            = action;
  }
  return [
    new AvaeaTextParserTest("Fly from Amsterdam to Petit St. Vincent with my girlfriend today",
                            "Amsterdam",
                            "Petit St. Vincent",
                            new Date(),
                            undefined,
                            "2"),
    new AvaeaTextParserTest("Skiing trip from Portland, Maine to Portland, Oregon on December 20, 2017 returning two weeks later",
                            "Portland, Maine",
                            "Portland, Oregon",
                            new Date("Dec 20 2017"),
                            add_weeks(new Date("Dec 20 2017"), 2), // two weeks from Dec 20, 2017
                            "1"),
    new AvaeaTextParserTest("Singapore to Sidney tomorrow first class",
                            "Singapore",
                            "Sidney",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1",
                            "F"),
    new AvaeaTextParserTest("Singapore to Sidney tomorrow 1st class",
                            "Singapore",
                            "Sidney",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1",
                            "F"),
    new AvaeaTextParserTest("My baby sitter and I need to fly from San Francisco to Boston, leaving on March 25 and returning on April 10th.",
                            "San Francisco",
                            "Boston",
                            get_future_date(3,25), // Mar 25
                            get_future_date(4,10,get_future_date(3,25)), // first Apr 10 after Mar 25
                            "2"),
    new AvaeaTextParserTest("I need to fly to Wichita with my parents next week.",
                            undefined,
                            "Wichita",
                            add_weeks(new Date(), 1), // one week from now
                            undefined,
                            "3"),
    new AvaeaTextParserTest("Ft. Lauderdale, Florida to St.Peterburg, Russia, leave now return two weeks later.",
                            "Ft. Lauderdale, Florida",
                            "St.Peterburg, Russia",
                            new Date(),
                            add_weeks(new Date(), 2), // two weeks from now
                            "1"),
    new AvaeaTextParserTest("Round-trip from Istanbul to Hong Kong, Aug 20, 2017 through September 23",
                            "Istanbul",
                            "Hong Kong",
                            new Date("Aug 20 2017"),
                            get_future_date(9,23,new Date("Aug 20 2017")), // first Sep 23 after Aug 20, 2017
                            "1"),
    new AvaeaTextParserTest("I need to fly to Washington on business as soon as possible.",
                            undefined,
                            "Washington",
                            new Date(),
                            undefined,
                            "1",
                            "B"),
    new AvaeaTextParserTest("Check availability for my parents trip from JFK to Tokyo, leaving on 20 Dec, coming back in January.",
                            "JFK",
                            "Tokyo",
                            get_future_date(12,20), // Dec 20
                            undefined,
                            "2"),
    new AvaeaTextParserTest("One economy ticket from Yoshkar-Ola to Paris-Orly tomorrow, return in six days.",
                            "Yoshkar-Ola",
                            "Paris-Orly",
                            add_days(new Date(), 1), // one day from now
                            add_days(new Date(), 7), // seven days from now
                            "1",
                            "E"),
    new AvaeaTextParserTest("I am currently in Bogota. Need to get to Miami as soon as possible. Back next week.",
                            "Bogota",
                            "Miami",
                            new Date(),
                            add_weeks(new Date(), 1), // one week from now
                            "1"),
    new AvaeaTextParserTest("Tickets for a group of athletes flying from San Diego, CA to Austin, TX in March returning in May.",
                            "San Diego, CA",
                            "Austin, TX",
                            undefined,
                            undefined,
                            "multiple"),
    new AvaeaTextParserTest("Vacation trip from Toronto to Cabo San Lucas on December 13. Flying back on the 2nd. I will travel with a body guard.",
                            "Toronto",
                            "Cabo San Lucas",
                            get_future_date(12,13), // Dec 13
                            get_future_date(1,2,get_future_date(12,13)), // First 2nd of the month after Dec 13 // NOTE: Jan is not specified
                            "2"),
    new AvaeaTextParserTest("Leaving from Buenos Aires to Vancouver today, returning two weeks later",
                            "Buenos Aires",
                            "Vancouver",
                            new Date(),
                            add_weeks(new Date(), 2), // two weeks from now
                            "1"),
    new AvaeaTextParserTest("Two business class tickets from Memphis to Madrid on March 8, back in three weeks",
                            "Memphis",
                            "Madrid",
                            get_future_date(3,8), // Mar 8
                            add_weeks(get_future_date(3,8), 3), // three weeks from Mar 8
                            "2",
                            "B"),
    new AvaeaTextParserTest("We would like to leave on March 10 from Sacramento in the evening to Lahore Pakistan, and would like to be back in Sacramento on the 17th.",
                            "Sacramento",
                            "Lahore Pakistan",
                            get_future_date(3,10), // Mar 10
                            get_future_date(3,17,get_future_date(3,10)), // First 17th of the month after Mar 10 // NOTE: Mar is not specified
                            "multiple"),
    new AvaeaTextParserTest("My wife needs to fly to Dubai right away. She is stuck in Paris right now. Get her the earliest ticket there.",
                            "Paris",
                            "Dubai",
                            new Date(),
                            undefined,
                            "1"),
    new AvaeaTextParserTest("How much is a Kiev-Moscow one-way ticket two weeks from now?",
                            "Kiev",
                            "Moscow",
                            add_weeks(new Date(), 2), // two weeks from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("How soon can my children reach Frankfurt-Hahn from Minneapolis St. Paul?",
                            "Minneapolis St. Paul",
                            "Frankfurt-Hahn",
                            new Date(),
                            undefined,
                            "multiple"),
    new AvaeaTextParserTest("My parents and I are flying to Johannesburg on Jul 10, returning in September",
                            undefined,
                            "Johannesburg",
                            get_future_date(7,10), // Jul 10
                            undefined,
                            "3"),
    new AvaeaTextParserTest("I need a ticket departing Los Angeles on May 2 and reaching London the next day.",
                            "Los Angeles",
                            "London",
                            get_future_date(5,2), // May 2
                            add_days(get_future_date(5,2), 1), // one day from May 2
                            "1"),
    new AvaeaTextParserTest("Flight 77 departs Kona on May 7 lands at SFO. Get tickets for me and my associate.",
                            "Kona",
                            "SFO",
                            get_future_date(5,7), // May 7
                            undefined,
                            "2"),
    new AvaeaTextParserTest("Students from Kalamazoo, MI are flying on a school trip to Mexico City. April 3 to April 17.",
                            "Kalamazoo, MI",
                            "Mexico City",
                            get_future_date(4,3), // Apr 3
                            get_future_date(4,17,get_future_date(4,3)), // First Apr 17 after Apr 3
                            "multiple"),
    new AvaeaTextParserTest("I have to go to Beijing (China) for a business trip, leaving on April 21. I would like to leave from SFO and would like to stop " +
                            "in Japan for 2 days, and then to Beijing. I need to back in my office for a meeting on April 30th.",
                            "SFO",
                            "Beijing",
                            get_future_date(4,21), // Apr 21
                            get_future_date(4,30,get_future_date(4,21)), // First Apr 30 after Apr 21
                            "1",
                            "B"),
    new AvaeaTextParserTest("I'd like a ticket between San Francisco and New York City",
                            "San Francisco",
                            "New York City",
                            undefined,
                            undefined,
                            "1"),
    new AvaeaTextParserTest("I am in Paris. Need to fly to Nice.",
                            "Paris",
                            "Nice",
                            undefined,
                            undefined,
                            "1"),
    new AvaeaTextParserTest("I need to fly to London on Friday",
                            undefined,
                            "London",
                            get_date_of_next_weekday(new Date(),"Friday"),
                            undefined,
                            "1"),
    new AvaeaTextParserTest("Flying to Phoenix on Wednesday, back on Friday",
                            undefined,
                            "Phoenix",
                            get_date_of_next_weekday(new Date(),"Wednesday"),
                            get_date_of_next_weekday(get_date_of_next_weekday(new Date(),"Wednesday"),"Friday"),
                            "1"),
    new AvaeaTextParserTest("I would like to book two tickets from San Francisco to Honolulu June 26th return July 17th",
                            "San Francisco",
                            "Honolulu",
                            get_future_date(6,26), // Jun 26
                            get_future_date(7,17,get_future_date(6,26)), // First Jul 17 after Jun 26
                            "2"),
    new AvaeaTextParserTest("Ticket from Juno, Alaska to Augusta, Georgia, September 20 through September 23",
                            "Juno, Alaska",
                            "Augusta, Georgia",
                            get_future_date(9,20), // Sep 20
                            get_future_date(9,23,get_future_date(9,20)), // Fist Sep 23 after Sep 20
                            "1"),
    new AvaeaTextParserTest("I would like to fly from San Francisco to New York on June 15th returning August 25th 2016 in business class",
                            "San Francisco",
                            "New York",
                            get_future_date(6,15), // Jun 15
                            new Date("Aug 25 2016"),
                            1,
                            "B"),
    new AvaeaTextParserTest("I'm flying from Tokyo to st. Petersburg Russia next week",
                            "Tokyo",
                            "st. Petersburg Russia",
                            add_weeks(new Date(), 1), // one week from now
                            undefined,
                            1),
    new AvaeaTextParserTest("I'm flying from Tokyo to St. Petersburg Russia next week",
                            "Tokyo",
                            "St. Petersburg Russia",
                            add_weeks(new Date(), 1), // one week from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("I'm flying from Tokyo to Saint Petersburg Russia next week",
                            "Tokyo",
                            "Saint Petersburg Russia",
                            add_weeks(new Date(), 1), // one week from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("1 ticket from SFO to Pt. Hope tomorrow",
                            "SFO",
                            "Pt. Hope",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("1 ticket from SFO to Point Hope tomorrow",
                            "SFO",
                            "Point Hope",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("1 ticket from SFO to Ft. Lauderdale tomorrow",
                            "SFO",
                            "Ft. Lauderdale",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("1 ticket from SFO to Fort Lauderdale tomorrow",
                            "SFO",
                            "Fort Lauderdale",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("1 ticket from Pt. Hope to St. Petersburg tomorrow",
                            "Pt. Hope",
                            "St. Petersburg",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("I am in SFO, need to fly to JFK",
                            "SFO",
                            "JFK",
                            undefined,
                            undefined,
                            "1"),
    new AvaeaTextParserTest("I am in Paris need to fly to Madrid tomorrow",
                            "Paris",
                            "Madrid",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("I'm in Paris. I need to fly to Madrid.",
                            "Paris",
                            "Madrid",
                            undefined,
                            undefined,
                            "1"),
    new AvaeaTextParserTest("Petya and Vasya are flying from SFO to JFK on Nov 15, returning on Dec 20",
                            "SFO",
                            "JFK",
                            get_future_date(11,15), // Nov 15
                            get_future_date(12,20,get_future_date(11,15)), // First Dec 20 after Nov 15
                            "2"),
    new AvaeaTextParserTest("Cats and dogs are flying from SFO to JFK on Nov 15, returning on Dec 20",
                            "SFO",
                            "JFK",
                            get_future_date(11,15), // Nov 15
                            get_future_date(12,20,get_future_date(11,15)), // First Dec 20 after Nov 15
                            "4"),
    new AvaeaTextParserTest("I'm looking for the return ticket from Pittsburgh to Oakland flying out on the 24th of October and flying back on the 15th of November",
                            "Pittsburgh",
                            "Oakland",
                            get_future_date(10,24), // Oct 24
                            get_future_date(11,15,get_future_date(10,24)), // First Nov 15 after Oct 24
                            "1"),
    new AvaeaTextParserTest("1 ticket from London to Madrid depart 30th of November arrive 10th of December",
                            "London",
                            "Madrid",
                            get_future_date(11,30), // Nov 30
                            get_future_date(12,10,get_future_date(11,30)), // First Dec 10 after Nov 30
                            "1"),
    new AvaeaTextParserTest("My parents and I are flying from Boston to Phoenix Arizona on November 14th returning two weeks later",
                            "Boston",
                            "Phoenix Arizona",
                            get_future_date(11,14), // Nov 14
                            add_weeks(get_future_date(11,14), 2), // two weeks from Nov 14
                            "3"),
    new AvaeaTextParserTest("1 ticket from Detroit Michigan to Tampa Florida on November 14th returning two weeks later",
                            "Detroit Michigan",
                            "Tampa Florida",
                            get_future_date(11,14), // Nov 14
                            add_weeks(get_future_date(11,14), 2), // two weeks from Nov 14
                            "1"),
    new AvaeaTextParserTest("1 ticket from Phoenix Arisona to Portlend Main on November 14th returning two weeks later", // intentional typos
                            "Phoenix Arisona",
                            "Portlend Main",
                            get_future_date(11,14), // Nov 14
                            add_weeks(get_future_date(11,14), 2), // two weeks from Nov 14
                            "1"),
    new AvaeaTextParserTest("1 ticket from Ho Chi Minh City to Washington Deep Sea tomorrow", // intentional incorrect voice transcription
                            "Ho Chi Minh City",
                            "Washington Deep Sea",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("from TLL to Moscow",
                            "TLL",
                            "Moscow",
                            undefined,
                            undefined,
                            "1"),
    new AvaeaTextParserTest("I want to fly from San Jose 2 Oregon on the 1st of August", // "2" instead of "to" is intended
                            "San Jose",
                            "Oregon",
                            get_future_date(8,1), // Aug 1
                            undefined,
                            "1"),
    new AvaeaTextParserTest("I'm flying from San Jose to New York on the 1st of August returning on the 10th of August",
                            "San Jose",
                            "New York",
                            get_future_date(8,1), // Aug 1
                            get_future_date(8,10,get_future_date(8,1)), // First Aug 10 after Aug 1
                            "1"),
    new AvaeaTextParserTest("From SFO to JFK next week, returning October 10", // unparsed in Meri2.4.html
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 1), // one week from now
                            get_future_date(10,10,add_weeks(new Date(), 1)), // First Oct 10 after one week from now
                            "1"),
    new AvaeaTextParserTest("1 ticket from SFO to JFK on 10/13/2016, returning on 1/13/2017", // unparsed in Meri2.4.html
                            "SFO",
                            "JFK",
                            new Date("Oct 13 2016"),
                            new Date("Jan 13 2017"),
                            "1"),
    new AvaeaTextParserTest("1 ticket from SFO to JFK on 10/13/16, returning on 1/13/17", // unparsed in Meri2.4.html
                            "SFO",
                            "JFK",
                            new Date("Oct 13 2016"),
                            new Date("Jan 13 2017"),
                            "1"),
    new AvaeaTextParserTest("1 ticket from SFO to JFK on 10/13, returning on 1/13", // unparsed in Meri2.4.html
                            "SFO",
                            "JFK",
                            get_future_date(10,13), // Oct 13
                            get_future_date(1,13,get_future_date(10,13)), // First Jan 13 after Oct 13
                            "1"),
    new AvaeaTextParserTest("1 ticket from London to Paris on 13.10.2016, returning on 13.01.2017", // unparsed in Meri2.4.html
                            "London",
                            "Paris",
                            new Date("Oct 13 2016"),
                            new Date("Jan 13 2017"),
                            "1"),
    new AvaeaTextParserTest("1 ticket from London to Paris on 13.10.16, returning on 13.01.17", // unparsed in Meri2.4.html
                            "London",
                            "Paris",
                            new Date("Oct 13 2016"),
                            new Date("Jan 13 2017"),
                            "1"),
    new AvaeaTextParserTest("1 ticket from London to Paris on 13.10, returning on 13.01", // unparsed in Meri2.4.html
                            "London",
                            "Paris",
                            get_future_date(10,13), // Oct 13
                            get_future_date(1,13,get_future_date(10,13)), // First Jan 13 after Oct 13
                            "1"),
    new AvaeaTextParserTest("1 ticket from Santa Fe, New Mexico, to Ho Chi Minh City on October 13, returning on December 13", // unparsed in Meri2.4.html
                            "Santa Fe, New Mexico",
                            "Ho Chi Minh City",
                            get_future_date(10,13), // Oct 13
                            get_future_date(12,13,get_future_date(10,13)), // First Dec 13 after Oct 13
                            "1"),
    new AvaeaTextParserTest("1 ticket from Rio de Janeiro to Santiago de Chile on October 13, returning on December 13", // unparsed in Meri2.4.html
                            "Rio de Janeiro",
                            "Santiago de Chile",
                            get_future_date(10,13), // Oct 13
                            get_future_date(12,13,get_future_date(10,13)), // First Dec 13 after Oct 13
                            "1"),
    new AvaeaTextParserTest("1 ticket from San Jose, California to San Jose, Costa Rica, on October 13, returning on December 13", // unparsed in Meri2.4.html
                            "San Jose, California",
                            "San Jose, Costa Rica",
                            get_future_date(10,13), // Oct 13
                            get_future_date(12,13,get_future_date(10,13)), // First Dec 13 after Oct 13
                            "1"),
    new AvaeaTextParserTest("two tickets to Dublin departing tonight returning tomorrow",
                            undefined,
                            "Dublin",
                            new Date(),
                            add_days(new Date(), 1), // one day from now
                            "2"),
    new AvaeaTextParserTest("I'd like to fly from the San Francisco International Airport to Boston Logan International Airport",
                            "San Francisco International Airport",
                            "Boston Logan International Airport",
                            undefined,
                            undefined,
                            "1"),
    new AvaeaTextParserTest("I need to fly from Phoenix to Boston on Sunday return in two weeks",
                            "Phoenix",
                            "Boston",
                            get_date_of_next_weekday(new Date(),"Sunday"),
                            add_weeks(get_date_of_next_weekday(new Date(),"Sunday"), 2),
                            "1"),
    new AvaeaTextParserTest("I need to fly from Phoenix to Boston in two weeks return on Sunday",
                            "Phoenix",
                            "Boston",
                            add_weeks(new Date(), 2), // two weeks from now
                            get_date_of_next_weekday(add_weeks(new Date(), 2),"Sunday"),
                            "1"),
    new AvaeaTextParserTest("Show me all flights in business class from San Francisco to JFK departing Oct 5, returning Nov 7",
                            "San Francisco",
                            "JFK",
                            get_future_date(10,5), // Oct 5
                            get_future_date(11,7,get_future_date(10,5)), // First Nov 7 after Oct 5
                            "1",
                            "B",
                            "all"),
    new AvaeaTextParserTest("Show me top flights in first class from San Francisco to JFK departing Oct 5, returning Nov 7",
                            "San Francisco",
                            "JFK",
                            get_future_date(10,5), // Oct 5
                            get_future_date(11,7,get_future_date(10,5)), // First Nov 7 after Oct 5
                            "1",
                            "F",
                            "top"),
    new AvaeaTextParserTest("I want 3 tickets from SFO to London",
                            "SFO",
                            "London",
                            undefined,
                            undefined,
                            "3"),
    new AvaeaTextParserTest("I want three tickets from SFO to London",
                            "SFO",
                            "London",
                            undefined,
                            undefined,
                            "3"),
    new AvaeaTextParserTest("Fly to San Francisco from Los Angeles on the 1st of September returning a month later",
                            "Los Angeles",
                            "San Francisco",
                            get_future_date(9,1), // Sep 1
                            add_months(get_future_date(9,1), 1), // one month from Sep 1
                            "1"),
    new AvaeaTextParserTest("I'm stuck in Paris, need to fly to Berlin, returning next Monday in business class",
                            "Paris",
                            "Berlin",
                            undefined,
                            get_date_of_next_weekday(new Date(),"Monday"),
                            "1",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning the next day",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_days(get_future_date(10,10), 1), // one day from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in a day",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_days(get_future_date(10,10), 1), // one day from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in 1 day",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_days(get_future_date(10,10), 1), // one day from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in one day",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_days(get_future_date(10,10), 1), // one day from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in 2 days",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_days(get_future_date(10,10), 2), // two days from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in two days",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_days(get_future_date(10,10), 2), // two days from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning next week",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 1), // one week from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in a week",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 1), // one week from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in 1 week",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 1), // one week from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in one week",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 1), // one week from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in 2 weeks",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 2), // two weeks from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in two weeks",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 2), // two weeks from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning next fortnight",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 2), // two weeks from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in a fortnight",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 2), // two weeks from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in 1 fortnight",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 2), // two weeks from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in one fortnight",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 2), // two weeks from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in 2 fortnights",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 4), // four weeks from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in two fortnights",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_weeks(get_future_date(10,10), 4), // four weeks from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning next month",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_months(get_future_date(10,10), 1), // one month from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in a month",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_months(get_future_date(10,10), 1), // one month from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in 1 month",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_months(get_future_date(10,10), 1), // one month from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in one month",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_months(get_future_date(10,10), 1), // one month from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in 2 months",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_months(get_future_date(10,10), 2), // two months from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Oct 10 in business class, returning in two months",
                            "SFO",
                            "JFK",
                            get_future_date(10,10), // Oct 10
                            add_months(get_future_date(10,10), 2), // two months from Oct 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("My boss and I need to fly from SFO to JFK on Sep 10 in business class, returning in a month",
                            "SFO",
                            "JFK",
                            get_future_date(9,10), // Sep 10
                            add_months(get_future_date(9,10), 1), // one month from Sep 10
                            "2",
                            "B"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving next day",
                            "SFO",
                            "JFK",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in a day",
                            "SFO",
                            "JFK",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in 1 day",
                            "SFO",
                            "JFK",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in one day",
                            "SFO",
                            "JFK",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in 2 days",
                            "SFO",
                            "JFK",
                            add_days(new Date(), 2), // two days from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in two days",
                            "SFO",
                            "JFK",
                            add_days(new Date(), 2), // two days from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving next week",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 1), // one week from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in a week",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 1), // one week from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in 1 week",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 1), // one week from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in one week",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 1), // one week from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in 2 weeks",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 2), // two weeks from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in two weeks",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 2), // two weeks from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving next fortnight",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 2), // two weeks from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in a fortnight",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 2), // two weeks from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in 1 fortnight",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 2), // two weeks from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in one fortnight",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 2), // two weeks from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in 2 fortnights",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 4), // four weeks from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in two fortnights",
                            "SFO",
                            "JFK",
                            add_weeks(new Date(), 4), // four weeks from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving next month",
                            "SFO",
                            "JFK",
                            add_months(new Date(), 1), // one month from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in a month",
                            "SFO",
                            "JFK",
                            add_months(new Date(), 1), // one month from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in 1 month",
                            "SFO",
                            "JFK",
                            add_months(new Date(), 1), // one month from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in one month",
                            "SFO",
                            "JFK",
                            add_months(new Date(), 1), // one month from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in 2 months",
                            "SFO",
                            "JFK",
                            add_months(new Date(), 2), // two months from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("one economy ticket from SFO to JFK, leaving in two months",
                            "SFO",
                            "JFK",
                            add_months(new Date(), 2), // two months from now
                            undefined,
                            "1",
                            "E"),
    new AvaeaTextParserTest("My parents are flying from Hong Kong to Beijing on the 1st of September returning on the 23rd of September",
                            "Hong Kong",
                            "Beijing",
                            get_future_date(9,1), // Sep 1
                            get_future_date(9,23,get_future_date(9,1)), // First Sep 23 after Sep 1
                            "2"),
    new AvaeaTextParserTest("My wife with her parents are flying from Hong Kong to Beijing on the 1st of September returning on the 23rd of September",
                            "Hong Kong",
                            "Beijing",
                            get_future_date(9,1), // Sep 1
                            get_future_date(9,23,get_future_date(9,1)), // First Sep 23 after Sep 1
                            "3"),
    new AvaeaTextParserTest("I want to fly to Tokyo with two friends on the 1st of November returning a week later",
                            undefined,
                            "Tokyo",
                            get_future_date(11,1), // Nov 1
                            add_weeks(get_future_date(11,1), 1), // one week from Nov 1
                            "3"),
    new AvaeaTextParserTest("I want to fly to Tokyo with two friends on the 1st of November for a week",
                            undefined,
                            "Tokyo",
                            get_future_date(11,1), // Nov 1
                            add_weeks(get_future_date(11,1), 1), // one week from Nov 1
                            "3"),
    new AvaeaTextParserTest("I want to fly to Tokyo with two friends on the 1st of November for 10 days",
                            undefined,
                            "Tokyo",
                            get_future_date(11,1), // Nov 1
                            add_days(get_future_date(11,1), 10), // ten days from Nov 1
                            "3"),
    new AvaeaTextParserTest("3 tickets from Moscow to Tokyo on the 1st of September returning a week later",
                            "Moscow",
                            "Tokyo",
                            get_future_date(9,1), // Sep 1
                            add_weeks(get_future_date(9,1), 1), // one week from Sep 1
                            "3"),
    new AvaeaTextParserTest("A 10-day trip from LA to New York starting first of November for me",
                            "LA",
                            "New York",
                            get_future_date(11,1), // Nov 1
                            add_days(get_future_date(11,1), 10), // ten days from Nov 1
                            "1"),
    new AvaeaTextParserTest("A 10-day trip from LA to New York ending 2nd of September for 3",
                            "LA",
                            "New York",
                            add_days(get_future_date(9,2), -10), // ten days before Sep 2
                            get_future_date(9,2), // Sep 2
                            "3"),
    new AvaeaTextParserTest("One first class ticket from LA to NYC departing one week before Thanksgiving and returning ten days after Christmas",
                            "LA",
                            "NYC",
                            add_weeks(get_date_of_next_weekday(get_future_date(11,22, new Date('1/1/2017')),"thursday"),-1), // one week before fourth Thursday in Nov
                            add_days(new Date("Dec 25 2017"), 10), // ten days after Dec 25
                            "1",
                            "F"),
    new AvaeaTextParserTest("3 tickets from New York to Milan on the 1st of October returning exactly a month later",
                            "New York",
                            "Milan",
                            get_future_date(10,1), // Oct 1
                            add_months(get_future_date(10,1), 1), // one month from Oct 1
                            "3"),
    new AvaeaTextParserTest("11 tickets from Hong Kong to Narita on the 1st of September one way",
                            "Hong Kong",
                            "Narita",
                            get_future_date(9,1), // Sep 1
                            undefined,
                            "11"),
    new AvaeaTextParserTest("Tickets for two travelling from LA to Portland for a 30-day trip starting on December the 3rd",
                            "LA",
                            "Portland",
                            get_future_date(12,3), // Dec 3
                            add_days(get_future_date(12,3), 30), // thirty days after Dec 3
                            "2"),
    new AvaeaTextParserTest("I'm in Phoenix I need to fly to Boston",
                            "Phoenix",
                            "Boston",
                            undefined,
                            undefined,
                            "1"),
    new AvaeaTextParserTest("Leave Paris on October 15 for Nice back in two weeks",
                            "Paris",
                            "Nice",
                            get_future_date(10,15), // Oct 15
                            add_weeks(get_future_date(10,15), 2), // two weeks from Oct 15
                            "1"),
    new AvaeaTextParserTest("Coast to coast LA to Chicago tomorrow",
                            "LA",
                            "Chicago",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("Coast to coast, LA to Chicago tomorrow",
                            "LA",
                            "Chicago",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("Flying from SFO on October 15 landing in Paris, returning in one week",
                            "SFO",
                            "Paris",
                            get_future_date(10,15), // Oct 15
                            add_weeks(get_future_date(10,15), 1), // one week from Oct 15
                            "1"),
    new AvaeaTextParserTest("I need to reach Paris on October 15, flying from New York",
                            "New York",
                            "Paris",
                            get_future_date(10,15), // Oct 15
                            undefined,
                            "1"),
    new AvaeaTextParserTest("From SFO to Santa Cruz de la Palma tomorrow",
                            "SFO",
                            "Santa Cruz",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("From SFO to Frankfurt am Main tomorrow",
                            "SFO",
                            "Frankfurt am Main",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("From SFO to Newcastle upon Tyne tomorrow",
                            "SFO",
                            "Newcastle upon Tyne",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("From SFO to Komsomolsk on Amur tomorrow",
                            "SFO",
                            "Komsomolsk on Amur",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("From SFO to Komsomolsk-on-Amur tomorrow",
                            "SFO",
                            "Komsomolsk-on-Amur",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("From SFO to Baden Baden tomorrow",
                            "SFO",
                            "Baden Baden",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("From SFO to Baden-Baden tomorrow",
                            "SFO",
                            "Baden-Baden",
                            add_days(new Date(), 1), // one day from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("So let's fly from Illinois to Texas two weeks before Thanksgiving returning on the 6th with my friend in business class",
                            "Illinois",
                            "Texas",
                            add_weeks(get_date_of_next_weekday(get_future_date(11,22),"thursday"),-2), // two weeks before fourth Thursday in Nov
                            get_future_date(12,6,add_weeks(new Date("Nov 24 2017"), -2)), // First 6th
                            "2",
                            "B"),
    new AvaeaTextParserTest("Flying from LA to the Big Apple next Monday",
                            "LA",
                            "Big Apple",
                            get_date_of_next_weekday(new Date(),"Monday"),
                            undefined,
                            "1"),
    new AvaeaTextParserTest("Flying from LA to Big Apple next Monday",
                            "LA",
                            "Big Apple",
                            get_date_of_next_weekday(new Date(),"Monday"),
                            undefined,
                            "1"),
    new AvaeaTextParserTest("Coast to coast LA to Chicago (next Tuesday) back to LA (one week later)",
                            "LA",
                            "Chicago",
                            get_date_of_next_weekday(new Date(),"Tuesday"),
                            add_weeks(get_date_of_next_weekday(new Date(),"Tuesday"), 1),
                            "1"),
    new AvaeaTextParserTest("Coast to coast, LA to Chicago (next Tuesday) back to LA (one week later)",
                            "LA",
                            "Chicago",
                            get_date_of_next_weekday(new Date(),"Tuesday"),
                            add_weeks(get_date_of_next_weekday(new Date(),"Tuesday"), 1),
                            "1"),
    new AvaeaTextParserTest("Flying from Santa Cruz de La Palma maybe early in the morning to Mexico City for under $600 with free wifi",
                            "Santa Cruz",
                            "Mexico City",
                            undefined,
                            undefined,
                            "1"),
    new AvaeaTextParserTest("Flying from the Windy City to the Big Apple in early March returning two weeks later with my dog",
                            "Windy City",
                            "Big Apple",
                            new Date("Mar 5 2017"),
                            add_weeks(new Date("Mar 5 2017"), 2),
                            "1"),
    new AvaeaTextParserTest("Flying from the Windy City to the Big Apple for Easter back next Friday",
                            "Windy City",
                            "Big Apple",
                            new Date("Apr 16 2017"),
                            get_date_of_next_weekday(new Date("Apr 16 2017"),"Friday"),
                            "1"),
    new AvaeaTextParserTest("How do I get from Texas to Paris with at most one connection on Delta or United for under $900 next week?",
                            "Texas",
                            "Paris",
                            add_weeks(new Date(), 1), // one week from now
                            undefined,
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on New Year, back on Groundhog Day",
                            "SFO",
                            "JFK",
                            get_future_date(1,1), // Jan 1
                            get_future_date(2,2), // Feb 2
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Xmas, back on MLK day",
                            "SFO",
                            "JFK",
                            get_future_date(12,25), // Dec 25
                            get_date_of_next_weekday(get_future_date(1,15),"monday"), // third Monday in Jan
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Christmas, back on Mardi Gras",
                            "SFO",
                            "JFK",
                            get_future_date(12,25), // Dec 25
                            get_future_date(2,28,get_future_date(12,25)), // first Feb 28 after Dec 25
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Martin Luther King Day, back on Fat Tuesday",
                            "SFO",
                            "JFK",
                            get_date_of_next_weekday(get_future_date(1,15),"monday"), // third Monday in Jan
                            get_future_date(2,28,get_date_of_next_weekday(get_future_date(1,15),"monday")), // first Feb 28 after third Monday in Jan
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Valentine\'s Day, back on Presidents\' Day",
                            "SFO",
                            "JFK",
                            get_future_date(2,14), // Feb 14
                            get_date_of_next_weekday(get_future_date(2,15),"monday"), // third Monday in Feb
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Purim, back on St. Patrick's Day",
                            "SFO",
                            "JFK",
                            get_future_date(3,12), // Mar 12
                            get_future_date(3,17), // Mar 17
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Easter, back on Tax Day",
                            "SFO",
                            "JFK",
                            get_future_date(4,16), // Mar 12
                            get_future_date(4,18), // Mar 17
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Passover, back on Cinco de Mayo",
                            "SFO",
                            "JFK",
                            get_future_date(4,11), // Apr 11
                            get_future_date(5,5), // May 5
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Memorial Day, back on Labor Day",
                            "SFO",
                            "JFK",
                            get_date_of_next_weekday(get_future_date(5,25),"monday"), // last Monday in May
                            get_date_of_next_weekday(get_future_date(9,1),"monday"), // first Monday in Sep
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Columbus Day, back on Independence Day",
                            "SFO",
                            "JFK",
                            get_date_of_next_weekday(get_future_date(10,8, new Date('1/1/2017')),"monday"), // second Monday in Oct
                            get_future_date(7,4, new Date('1/1/2018')), // Jul 4
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Yom Kippur, back on Halloween",
                            "SFO",
                            "JFK",
                            get_future_date(10,12), // Oct 12
                            get_future_date(10,31), // Oct 31
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Black Friday, back on Cyber Monday",
                            "SFO",
                            "JFK",
                            get_date_of_next_weekday(get_date_of_next_weekday(get_future_date(11,22),"thursday"),"friday"), // Friday after fourth Thursday in Nov
                            get_date_of_next_weekday(get_date_of_next_weekday(get_future_date(11,22),"thursday"),"monday"), // Monday after fourth Thursday in Nov
                            "1"),
    new AvaeaTextParserTest("from SFO to JFK on Thanksgiving, back on Hanukkah",
                            "SFO",
                            "JFK",
                            get_date_of_next_weekday(get_future_date(11,22, new Date('1/1/2017')),"thursday"), // fourth Thursday in Nov
                            get_future_date(12,25, new Date('1/1/2017')), // Dec 25
                            "1")
  ];
}
(function() {
  if( typeof module != 'undefined' && module.exports ) {
    module.exports = get_avaea_parser_tests();
  }
  else {
    // Are we running in a browser? If so, just use function get_avaea_parser_tests
  }
})();
