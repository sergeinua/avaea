#!/usr/bin/nodejs

var fs   = require('fs');
var cheerio = require('cheerio');

// Parse argv for source data file and log level
var argv = require('minimist')(process.argv.slice(2));
argv.file  = argv.hasOwnProperty('file') ? argv.file : 'http://en.wikipedia.org/w/index.php?title=List_of_airports_by_ICAO_code:_K&action=edit&section=';
argv.loglevel = argv.hasOwnProperty('loglevel') ? Number(argv.loglevel) : 0;
var airports = {};

// Function for read and parse file
const readDatfile = function(url) {
    if ( argv.loglevel>0 ) {
        console.log("Reading %s", url);
    }
    const request   = require('request');

    return request(url, function(error, response, html) {
        var $ = cheerio.load(html);
        $('#wpTextbox1').filter(function() {
            var data = $(this).html();
            var rx = /&apos;(\w{4})&apos;.*\[([\s\w]+),([\s\w]+)[^\]]*\]]/g;
            var parsed = rx.exec(data);

            while (parsed != null) {
                airports.icao_4code = parsed[1];
                airports.city = parsed[2];
                airports.state = parsed[3].trim();

                parsed = rx.exec(data);
                console.log("UPDATE airports_new SET city = city || ', " +
                    airports.state + "' WHERE icao_4code = '" + airports.icao_4code + "'");
            }
        });
    });
};
console.log("UPDATE airports_new SET city = city || ', ' || country WHERE id IN (SELECT id FROM airports_new WHERE city IN (SELECT city FROM airports_new GROUP BY 1 HAVING count(*) > 1) AND country != 'United States' ORDER BY city);");
for (var i = 2; i<=27; i++) {
    readDatfile(argv.file + i);
}
