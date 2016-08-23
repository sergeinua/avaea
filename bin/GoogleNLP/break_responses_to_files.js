var _FS        = require('fs');
var _UTIL      = require('util');
var lineReader = require('readline').createInterface({
  input: _FS.createReadStream('google_nlp.out')
});

var n       = 0;
var wstream = undefined;
lineReader.on('line', function (line) {
  if( line=="Response:") {
    if( wstream ) {
      wstream.end();
    }
    n++;
    var file_name = _UTIL.format('%d',n);
    while( file_name.length<3 ) {
      file_name = "0"+file_name;
    }
    wstream = _FS.createWriteStream(file_name+".json");
  }
  else {
    wstream.write(line+"\n");
    // console.log('n='+n+',line from file:', line);
  }
});

if( wstream ) {
  wstream.end();
}

