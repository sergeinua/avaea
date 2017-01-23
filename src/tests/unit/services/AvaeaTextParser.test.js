/////////////////////////////////////////////////////////////////
// Module globals
/////////////////////////////////////////////////////////////////
const _PARSER = require('../../../api/services/AvaeaTextParser');
const _TESTS  = require('../../fixtures/AvaeaTextParser');

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
