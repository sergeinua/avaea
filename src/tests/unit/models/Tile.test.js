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

        itineraries.length.should.be.eql(30);
        for (var i = 0; i < itineraries.length; i++) {
          itineraries[i].should.have.properties('smartRank');
          itineraries[i].should.have.properties('id');
          switch (itineraries[i].smartRank) {
            case  1: itineraries[i].id.should.be.eql('35f9a627-ff41-4bbc-9c19-07c0090838e3'); break;
            case  2: itineraries[i].id.should.be.eql('621fa435-7e7d-4662-97a5-d64f59fbbb56'); break;
            case  3: itineraries[i].id.should.be.eql('bdb01799-5a6a-4770-82ed-e6fe1ab34bc1'); break;
            case  4: itineraries[i].id.should.be.eql('de9a5b23-575d-4f52-a492-b8baa4045513'); break;
            case  5: itineraries[i].id.should.be.eql('e86de146-0281-434a-b39d-9a05537645d3'); break;
            case  6: itineraries[i].id.should.be.eql('6bdb57a9-1304-4c76-91e3-753eac79986f'); break;
            case  7: itineraries[i].id.should.be.eql('57f668ec-029e-4df5-bc30-073ce864ef7e'); break;
            case  8: itineraries[i].id.should.be.eql('c47a6a8d-3dd2-4688-98a7-e4b99c0e1dd9'); break;
            case  9: itineraries[i].id.should.be.eql('1e419b99-e832-45df-8257-5751e383eb18'); break;
            case 10: itineraries[i].id.should.be.eql('06477c58-74fb-49df-bfde-02987112e15c'); break;
            case 11: itineraries[i].id.should.be.eql('8f3ec19e-0c5e-4d84-999d-c5e1dd79167d'); break;
            case 12: itineraries[i].id.should.be.eql('7b1b5ba7-69aa-4d0a-94b9-fcf494311612'); break;
            case 13: itineraries[i].id.should.be.eql('d2077fdc-8cf4-43d4-a17d-7a579ebc0616'); break;
            case 14: itineraries[i].id.should.be.eql('d37b03ea-8d6b-40a2-9b3c-504f5450151f'); break;
            case 15: itineraries[i].id.should.be.eql('c6205c31-2729-412f-aabf-f387e5e4d5c3'); break;
            case 16: itineraries[i].id.should.be.eql('9e60ad86-9d4f-4c34-86f6-b49dfea27689'); break;
            case 17: itineraries[i].id.should.be.eql('7f9de8d2-8e22-4ade-8b1c-47eee572290f'); break;
            case 18: itineraries[i].id.should.be.eql('9284066d-c723-4519-bf45-fdddeeed8183'); break;
            case 19: itineraries[i].id.should.be.eql('36790578-d5f6-42d8-8a52-1ac13908edf4'); break;
            case 20: itineraries[i].id.should.be.eql('6a64e956-776c-46fc-94fc-e31a74de820d'); break;
            case 21: itineraries[i].id.should.be.eql('5ceb36a7-6b5c-44ff-a48d-98234698bbbb'); break;
            case 22: itineraries[i].id.should.be.eql('f9be787b-9ac1-4b83-839d-c173b1ee881f'); break;
            case 23: itineraries[i].id.should.be.eql('02beef6d-b438-4d26-b036-2c851fd272ba'); break;
            case 24: itineraries[i].id.should.be.eql('c282f984-0271-4a15-b9b3-00d07837d36f'); break;
            case 25: itineraries[i].id.should.be.eql('329a7b5a-44de-4c40-b9c4-b1de5b7c6efc'); break;
            case 26: itineraries[i].id.should.be.eql('cea8ff9c-0fa9-4261-95f9-82e5525085b0'); break;
            case 27: itineraries[i].id.should.be.eql('e4bb88cd-8442-4538-8b9b-f3098aebb231'); break;
            case 28: itineraries[i].id.should.be.eql('8237a58c-2c70-42a7-a658-3fde273d4789'); break;
            case 29: itineraries[i].id.should.be.eql('653583a9-8999-49a8-8f1e-bba105f3592c'); break;
            case 30: itineraries[i].id.should.be.eql('f06b8cca-ee01-4a95-a6af-358389b31e76'); break;
            default : /* throw an error here */ break;
          }
        }

        done();
      });
    });
  });

});
