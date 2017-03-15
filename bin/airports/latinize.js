"use strict";

/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _COMMON   = require('./common');
const _LATINIZE = require('latinize');

/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function Latinize() {
};
Latinize.prototype.run = function() {
  let latinize_value = ( a, key ) => {
    if( a.hasOwnProperty(key) ) {
      var value = _LATINIZE(a[key]);
      if( value!=a[key] ) {
	a.alternative_name += ', '+value;
	a[key] = value;
      }
    }
  }
  for( let iata_3code in _COMMON.airports ) {
    latinize_value(_COMMON.airports[iata_3code],'city');
    latinize_value(_COMMON.airports[iata_3code],'state');
    latinize_value(_COMMON.airports[iata_3code],'country');
  }
};
module.exports = Latinize;
