var request = require('supertest');
require('should');
var sinon = require('sinon');
var assert = require('assert');

describe('SearchController', function() {

  describe('#index()', function() {
    it('should return search form', function (done) {
      request(sails.hooks.http.app)
        .post('/search')
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          res.body.should.have.properties('title', 'head_title', 'defaultParams', 'serviceClass');
          res.body.title.should.be.eql('Search for flights');
          res.body.head_title.should.be.eql('Search for flights with Avaea Agent');
          res.body.defaultParams.should.have.properties([
            'DepartureLocationCode', 'ArrivalLocationCode', 'CabinClass',
            'departureDate', 'returnDate', 'passengers', 'flightType'
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
    it('should decode params from string', function (done) {
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
        arrival: {},
        errorType: "no_flights"
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
        arrival: {},
        errorType: "no_flights"
      }, 'search/result'));
      view.reset();
      done();
    });

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
            return '2016-07-25';
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
        user: {id: 1},
        title: 'TEST-TEST',
        tiles: [],
        max_filter_items: 0,
        searchParams: {
          DepartureLocationCode: 'TEST',
          ArrivalLocationCode: 'TEST',
          departureDate: '25 Jul',
          returnDate: '',
          CabinClass: 'undefined',
          passengers: 'test',
          topSearchOnly: 'test',
          flightType: 'test'
        },
        searchResult: [],
        timelog: '',
        head_title: 'Flights from TEST to TEST on 25 Jul \'16',
        iconSpriteMap: {},
        departure: {},
        arrival: {},
        errorType: "no_flights"
      }, 'search/result']);
      assert(view.calledWith({
        user: {id: 1},
        title: 'TEST-TEST',
        tiles: [],
        max_filter_items: 0,
        searchParams: {
          DepartureLocationCode: 'TEST',
          ArrivalLocationCode: 'TEST',
          departureDate: '25 Jul',
          returnDate: '',
          CabinClass: 'undefined',
          passengers: 'test',
          topSearchOnly: 'test',
          flightType: 'test'
        },
        searchResult: [],
        timelog: '',
        head_title: 'Flights from TEST to TEST on 25 Jul \'16',
        iconSpriteMap: {},
        departure: {},
        arrival: {},
        errorType: "no_flights"
      }, 'search/result'));
      view.reset();
      done();
    });

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
      Airlines.makeIconSpriteMap = function (cb) {return cb(false, {});};
      Search.getResult = function (params, cb) {
        var ititns = require('../../fixtures/itineraries.json');
        cb(false, ititns);
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
      assert(view.called);
      var result = require('../../fixtures/searchResult.json');
      view.args[0].should.be.eql([result, 'search/result']);
      assert(view.calledWith(result, 'search/result'));
      view.reset();
      done();
    });
  });


});
