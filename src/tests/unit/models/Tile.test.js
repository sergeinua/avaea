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
      	// fake merchandising filters removed, when restored adjust to (8)
        tileArr.length.should.be.eql(7);
        // tileArr.should.be.oneOf(tilesRoundTrip);
        done();
      });
    });
    it('should check tiles generation (one way)', function (done) {
      params.flightType = 'ONE_WAY';
      params.returnDate = '';
      Tile.getTilesDataAlternative(itineraries, params, function (err, itineraries, tileArr) {
      	// fake merchandising filters removed, when restored adjust to (6)
        tileArr.length.should.be.eql(5);
        // tileArr.should.be.eql(tilesOneWay);
        done();
      });
    });
    it('should check smartRanknig', function (done) {
      Tile.getTilesDataAlternative(itineraries, params, function (err, itineraries, tileArr) {
        tileArr.length.should.be.eql(5);
        itineraries.length.should.be.eql(30);
        itineraries[0].should.have.properties('service');
        itineraries[0].should.have.properties('priceRank');
        itineraries[0].should.have.properties('smartRank');
        itineraries[ 0].smartRank.should.be.eql( 2);
        itineraries[ 1].smartRank.should.be.eql(10);
        itineraries[ 2].smartRank.should.be.eql(21);
        itineraries[ 3].smartRank.should.be.eql( 5);
        itineraries[ 4].smartRank.should.be.eql( 3);
        itineraries[ 5].smartRank.should.be.eql( 1);
        itineraries[ 6].smartRank.should.be.eql( 4);
        itineraries[ 7].smartRank.should.be.eql(11);
        itineraries[ 8].smartRank.should.be.eql( 8);
        itineraries[ 9].smartRank.should.be.eql(17);
        itineraries[10].smartRank.should.be.eql(14);
        itineraries[11].smartRank.should.be.eql(24);
        itineraries[12].smartRank.should.be.eql(16);
        itineraries[13].smartRank.should.be.eql(22);
        itineraries[14].smartRank.should.be.eql(19);
        itineraries[15].smartRank.should.be.eql(20);
        itineraries[16].smartRank.should.be.eql(12);
        itineraries[17].smartRank.should.be.eql( 6);
        itineraries[18].smartRank.should.be.eql( 7);
        itineraries[19].smartRank.should.be.eql( 9);
        itineraries[20].smartRank.should.be.eql(13);
        itineraries[21].smartRank.should.be.eql(18);
        itineraries[22].smartRank.should.be.eql(25);
        itineraries[23].smartRank.should.be.eql(26);
        itineraries[24].smartRank.should.be.eql(27);
        itineraries[25].smartRank.should.be.eql(23);
        itineraries[26].smartRank.should.be.eql(15);
        itineraries[27].smartRank.should.be.eql(30);
        itineraries[28].smartRank.should.be.eql(29);
        itineraries[29].smartRank.should.be.eql(28);

        done();
      });
    });
  });

});
