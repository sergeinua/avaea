"use strict";

/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
var _COMMON = require('./common');
var _GEOLIB = require('geolib');
var _KDTREE = require('kd.tree'); // see https://www.npmjs.com/package/kd.tree

/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function Neighbors() {
};
Neighbors.prototype.run = function() {
  // Make source data for kd-tree as array of airports objects
  var neighbors_array = [];
  for( let iata_3code in _COMMON.airports ) {
    // Do not include local airports without pax into neighbors
    var data = _COMMON.airports[iata_3code];
    if( data.hasOwnProperty('pax') && data.hasOwnProperty('longitude') && data.hasOwnProperty('latitude') && data.pax>0 ) {
      neighbors_array.push(data);
    }
  }
  var neighbors_kdtree = new _KDTREE.createKdTree(neighbors_array,function( a, b ) {
    return _GEOLIB.getDistance(a,b);
  }, ['latitude','longitude']);
  //
  for( let iata_3code in _COMMON.airports ) {
    var data = _COMMON.airports[iata_3code];
    if( data.hasOwnProperty('longitude') && data.hasOwnProperty('latitude') ) {
      data.neighbors = JSON.stringify(neighbors_kdtree.nearest(data,11).sort(function (a, b) {
        return a[1]-b[1];
      }).filter(function (dd) {
	// Exclude the airport itself as its nearest neighbors
	return dd[0].iata_3code != iata_3code;
      }).map(function (dd) {
	// Map the remainder into a data structure
	return {'iata_3code': dd[0].iata_3code, 'distance': dd[1]};
      }));
    }
    else {
      _COMMON.log(0,"Neighbors: Skipping an incomplete aiports %s: %j",iata_3code,data);
    }
  }
};
module.exports = Neighbors;
