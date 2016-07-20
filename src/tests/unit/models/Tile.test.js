var params      = require('../../fixtures/params.json');
var itineraries = require('../../fixtures/itineraries.json');
var tiles       = require('../../fixtures/tiles.json');

describe('Tile generation test', function() {
  describe('#getTilesDataEmpty()', function() {
    it('should return empty array', function (done) {
      Tile.getTilesDataEmpty([], [], function(itineraries, tileArr, params) {
          tileArr.length.should.be.eql(0);
          tileArr.should.be.eql([]);
          done();
        }
      );
    });
  });

  describe('#getTilesDataAlternative()', function() {
    it('should check tiles generation', function (done) {
      Tile.getTilesDataAlternative(itineraries, params, function(itineraries, tileArr, params) {
          tileArr.length.should.be.eql(8);
          tileArr.should.be.eql(tiles);
          done();
      });
    });
  });

});
