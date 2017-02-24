/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _CSVPARSER = require('csv-parser');
const _REQUEST   = require('request');
const _HEADERS   = ['id','name','city','country','iata_3code','icao_4code','latitude','longitude','altitude','timezone','dst','tz'];

/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function Openflights() {
    this.datfile = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
};
Openflights.prototype.run = function( argv, asyncsCounter, airports ) {
    if( argv.loglevel>0 ) {
        console.log("Openflights: Reading %s",this.datfile);
    }
    const datStream = _CSVPARSER({
        'separator': ',',
        'quote'    : '"',
        'newline'  : '\n',
        'headers'  : _HEADERS
    });
    asyncsCounter.asyncs_to_finish += 1;
    _REQUEST(this.datfile).pipe(datStream)
	.on('data',function(row) {
            if ( row.iata_3code ) {
		switch( row.iata_3code ) {
		case 'NID':
                    // Skip some airports
                    break;
		default:
		    // Make sure these are numeric
		    row.latitude   = Number(row.latitude);
		    row.longitude  = Number(row.longitude);
		    // see https://avaeaeng.atlassian.net/browse/DEMO-501
		    row.name       = row.name.replace(/\\+'/g,"'");
		    airports[row.iata_3code] = row;
                    break;
		}
            }
	})
	.on('end',function() {
            if( argv.loglevel>0 ) {
                console.log("Openflights: Datfile reading is done");
            }
	    asyncsCounter.finished_asyncs++;
	});
};
module.exports = Openflights;
