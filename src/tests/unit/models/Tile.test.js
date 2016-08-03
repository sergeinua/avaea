var params = require('../../fixtures/params.json');
var itineraries = require('../../fixtures/itineraries.json');
var tilesRoundTrip = require('../../fixtures/tilesRoundTrip.json');
var tilesOneWay = require('../../fixtures/tilesOneWay.json');

describe('Tile generation test', function () {
  describe('#getTilesDataEmpty()', function () {
    it('should return empty array', function (done) {
      Tile.getTilesDataEmpty([], [], function (itineraries, tileArr, params) {
          tileArr.length.should.be.eql(0);
          tileArr.should.be.eql([]);
          done();
        }
      );
    });
  });

  describe('#getTilesDataAlternative()', function () {
    it('should check tiles generation (round)', function (done) {
      Tile.getTilesDataAlternative(itineraries, params, function (err, itineraries, tileArr) {
        tileArr.length.should.be.eql(8);
        tileArr.should.be.eql(tilesRoundTrip);
        done();
      });
    });
    it('should check tiles generation (one way)', function (done) {
      params.flightType = 'ONE_WAY';
      params.returnDate = '';
      Tile.getTilesDataAlternative(itineraries, params, function (err, itineraries, tileArr) {
        tileArr.length.should.be.eql(6);
        tileArr.should.be.eql(tilesOneWay);
        done();
      });
    });
  });

});
