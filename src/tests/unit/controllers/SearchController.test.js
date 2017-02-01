var request = require('supertest');
require('should');
var sinon = require('sinon');
var assert = require('assert');
var Q = require("q");

describe('SearchController', function() {

  describe('#index()', function() {
    it('should return search form', function (done) {
      request(sails.hooks.http.app)
        .get('/search')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          res.body.should.have.properties('user', 'head_title', 'page', 'defaultSearch', 'serviceClass');
          res.body.page.should.be.eql('/search');
          res.body.head_title.should.be.eql('Search for flights with OnVoya Agent');
          res.body.defaultSearch.should.have.properties([
            'DepartureLocationCode',
            'DepartureLocationCodeCity',
            'ArrivalLocationCode',
            'ArrivalLocationCodeCity',
            'CabinClass',
            'departureDate',
            'returnDate',
            'passengers',
            'flightType'
          ]);

          done();
        });
    });
  });

  describe.skip('#voiceLog()', function() {
    it('should return empty message', function (done) {
      request(sails.hooks.http.app)
        .post('/search/voiceLog')
        .send({ result: '', q: '' })
        .expect(200, [])
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.body.should.be.eql([]);
          done();
        });
    });

    it('should return success message', function (done) {
      UserAction.saveAction = function () {return true;};
      var json = sinon.spy();
      var res = {
        json: json
      };
      var req = {
        param: function (name) {
            return 'test'
        },
        user: {
          id: 1
        }
      };
      sails.controllers.search.voiceLog(req, res);
      assert(json.called);
      assert(json.calledWith({'success': true}));
      done();
    });
  });


  describe('#result()', function() {
    it('should return empty result', function (done) {
      UserAction.saveAction = function () {return true;};
      iPrediction.getUserRank = function () {return true;};
      Airports = {
        findOne: function () {
          return {
            exec: function(cb) {
              return cb(null, {});
            }
          };
        }
      };
      Search.getResult = function (params, cb) {
        cb(false, []);
      };
      var view = sinon.spy();
      var res = {
        ok: view,
        locals: {
          searchId: null
        }
      };
      var req = {
        param: function (name) {
          if (name == 's') {
            return '';
          }
          if (name == 'departureDate') {
            return '2017-07-25';
          }
          return 'test'
        },
        user: {
          id: 1
        },
        locals: {},
        session: {}
      };
      sails.controllers.search.result(req, res);
      assert(view.called);
      view.args[0].should.be.eql([{
        errorInfo: {
          messages: [
            "Validation error. Wrong cabin class"
          ],
          type: "Error.Search.Validation.CabinClass.Empty"
        }
      }, 'search/result']);
      assert(view.calledWith({
        errorInfo: {
          messages: [
            "Validation error. Wrong cabin class"
          ],
          type: "Error.Search.Validation.CabinClass.Empty"
        }
      }, 'search/result'));
      view.reset();
      done();
    });

    /*it('should decode params from string', function (done) {
      UserAction.saveAction = function () {return true;};
      iPrediction.getUserRank = function () {return true;};
      Airports = {
        findOne: function () {
          return {
            exec: function(cb) {
              return cb(null, {});
            }
          };
        }
      };
      Search.getResult = function (params, cb) {
        cb(false, []);
      };
      Search.validateSearchParams = function (params) {
        return false;
      };
      Search.serviceClass = {
        E:'Economy',
        P:'Premium',
        B:'Business',
        F:'First'
      };
      var view = sinon.spy();
      var res = {
        ok: view,
        locals: {
          searchId: null
        }
      };
      var req = {
        param: function (name) {
          if (name == 's') {
            return 'eyJEZXBhcnR1cmVMb2NhdGlvbkNvZGUiOiJTRk8iLCJBcnJpdmFsTG9jYXRpb25Db2RlIjoiTEhSIiwiRGVwYXJ0dXJlTG9jYXRpb25Db2RlQ2l0eSI6IlNhbiBGcmFuY2lzY28iLCJBcnJpdmFsTG9jYXRpb25Db2RlQ2l0eSI6IkxvbmRvbiIsIkNhYmluQ2xhc3MiOiJFIiwiZGVwYXJ0dXJlRGF0ZSI6IjIwMTctMDgtMDEiLCJyZXR1cm5EYXRlIjoiMjAxNy0wOC0xNyIsInBhc3NlbmdlcnMiOjEsImZsaWdodFR5cGUiOiJyb3VuZF90cmlwIiwidm9pY2VTZWFyY2hRdWVyeSI6IntcInF1ZXJ5XCI6XCJSb3VuZC10cmlwIGZyb20gSXN0YW5idWwgdG8gSG9uZyBLb25nLCBBdWcgMjAsIDIwMTcgdGhyb3VnaCBTZXB0ZW1iZXIgMjNcIixcIm5vdF9wYXJzZWRcIjpcInJvdW5kLXRocm91Z2ggXCIsXCJvcmlnaW5fYWlycG9ydFwiOlwiSXN0YW5idWxcIixcInJldHVybl9haXJwb3J0XCI6XCJIb25nIEtvbmdcIixcIm9yaWdpbl9kYXRlXCI6XCIyMDE3LTA4LTE5VDIxOjAwOjAwLjAwMFpcIixcInJldHVybl9kYXRlXCI6XCIyMDE3LTA5LTIyVDIxOjAwOjAwLjAwMFpcIixcInR5cGVcIjpcInJvdW5kX3RyaXBcIixcIm51bWJlcl9vZl90aWNrZXRzXCI6MSxcImNsYXNzX29mX3NlcnZpY2VcIjpcIkVcIn0iLCJ0b3BTZWFyY2hPbmx5IjowfQ=='
          }
          return 'test'
        },
        user: {
          id: 1
        },
        session: {}
      };
      sails.controllers.search.result(req, res);
      assert(view.called);
      view.args[0].should.be.eql([{
        user: {id: 1},
        title: 'SFO-LHR',
        tiles: [],
        max_filter_items: 0,
        searchParams: {
          DepartureLocationCode: 'SFO',
          ArrivalLocationCode: 'LHR',
          departureDate: '01 Aug',
          returnDate: '17 Aug',
          CabinClass: 'Economy',
          passengers: 1,
          topSearchOnly: 0,
          flightType: 'round_trip'
        },
        searchResult: [],
        timelog: '',
        head_title: 'Flights from SFO to LHR on 01 Aug \'17 and back on 17 Aug \'17',
        iconSpriteMap: {},
        departure: {},
        arrival: {}
      }, 'search/result']);
      assert(view.calledWith({
        user: {id: 1},
        title: 'SFO-LHR',
        tiles: [],
        max_filter_items: 0,
        searchParams: {
          DepartureLocationCode: 'SFO',
          ArrivalLocationCode: 'LHR',
          departureDate: '01 Aug',
          returnDate: '17 Aug',
          CabinClass: 'Economy',
          passengers: 1,
          topSearchOnly: 0,
          flightType: 'round_trip'
        },
        searchResult: [],
        timelog: '',
        head_title: 'Flights from SFO to LHR on 01 Aug \'17 and back on 17 Aug \'17',
        iconSpriteMap: {},
        departure: {},
        arrival: {}
      }, 'search/result'));
      view.reset();
      done();
    });*/

    it('should return formatted result', function (done) {
      UserAction.saveAction = function () {return true;};
      iPrediction.getUserRank = function () {return true;};
      Airports = {
        findOne: function () {
          return {
            exec: function(cb) {
              return cb(null, {});
            }
          };
        }
      };
      let savedOriginalFunctionGetMilesProgramsByUserId = FFMPrograms.getMilesProgramsByUserId;
      var deferred = Q.defer();
      FFMPrograms.getMilesProgramsByUserId = sinon.stub().returns(deferred.promise);
      ffmapi = {
        milefy : {
          Calculate: function ({itineraries, milesPrograms}, cb) {
            /*var exampleItineraryMilesResp = {
              "id": "bd63919e-e2d1-4c17-ad7b-9f040daf044f",
              "ffmiles": {
                "AccrualType": "RDM. Redeemable miles usually by default.",
                "miles": 15247,
                "ProgramCode": "BAC",
                "ProgramCodeName": ""
              }
            };*/
            return cb(null, itineraries.map(({id}) => ({id, ffmiles: {miles: 1234, ProgramCodeName: 'Program Name'}})));
          }
        }
      };
      sails.config.globals.bucketizationFunction = 'getTilesDataEmpty';
      Airlines.makeIconSpriteMap = function (cb) {return cb(false, {});};
      Search.getResult = function (params, cb) {
        var ititns = require('../../fixtures/itineraries.json');
        cb(false, ititns);
      };
      let savedOriginalFunction = Search.validateSearchParams;
      Search.validateSearchParams = function (params) {
        return false;
      };
      var view = sinon.spy();
      var res = {
        ok: view,
        locals: {
          searchId: null
        }
      };
      var req = {
        param: function (name) {
          if (name == 's') {
            return '';
          }
          if (name == 'departureDate') {
            return '2016-07-25';
          }
          return 'test'
        },
        user: {
          id: 1
        },
        session: {
          time_log: [''],
          showTiles: false
        }
      };
      sails.controllers.search.result(req, res);

      deferred.promise.then(function () {
        assert(view.called);
        var result = require('../../fixtures/searchResult.json');
        view.args[0].should.be.eql([result, 'search/result']);
        assert(view.calledWith(result, 'search/result'));
        view.reset();
        Search.validateSearchParams = savedOriginalFunction;
        FFMPrograms.getMilesProgramsByUserId = savedOriginalFunctionGetMilesProgramsByUserId;
        done();
      });
      deferred.resolve([]);
    });
  });


});
