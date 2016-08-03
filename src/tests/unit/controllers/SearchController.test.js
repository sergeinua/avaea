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
        .set('Accept', 'text/html')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.body.should.match(/<title>Search for flights with Avaea Agent<\/title>/);
          res.body.should.match(/<form[^>]*id="search_form"/);
          res.body.should.match(/<input[^>]*name="originAirport"/);
          res.body.should.match(/<input[^>]*name="destinationAirport"/);
          res.body.should.match(/<input[^>]*name="departureDate"/);
          res.body.should.match(/<input[^>]*name="returnDate"/);
          res.body.should.match(/<input[^>]*name="preferedClass"/);
          res.body.should.match(/<input[^>]*name="topSearchOnly"/);
          res.body.should.match(/<input[^>]*name="passengers"/);
          res.body.should.match(/<input[^>]*name="flightType"/);
          res.body.should.match(/<input[^>]*name="voiceSearchQuery"/);
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
            return 'W3sibmFtZSI6Im9yaWdpbkFpcnBvcnQiLCJ2YWx1ZSI6IkxIUiJ9LHsibmFtZSI6ImRlc3RpbmF0aW9uQWlycG9ydCIsInZhbHVlIjoiU0ZPIn0seyJuYW1lIjoiZGVwYXJ0dXJlRGF0ZSIsInZhbHVlIjoiMjAxNi0wOC0wMSJ9LHsibmFtZSI6InJldHVybkRhdGUiLCJ2YWx1ZSI6IjIwMTYtMDgtMjIifSx7Im5hbWUiOiJwcmVmZXJlZENsYXNzIiwidmFsdWUiOiJFIn0seyJuYW1lIjoidG9wU2VhcmNoT25seSIsInZhbHVlIjoiMCJ9LHsibmFtZSI6InBhc3NlbmdlcnMiLCJ2YWx1ZSI6IjEifSx7Im5hbWUiOiJmbGlnaHRUeXBlIiwidmFsdWUiOiJyb3VuZF90cmlwIn0seyJuYW1lIjoidm9pY2VTZWFyY2hRdWVyeSIsInZhbHVlIjoiIn1d';
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
      view.args[0].should.be.eql([
        {
          user: {id: 1},
          title: 'LHR &#8644; SFO',
          tiles: {},
          searchParams: {
            DepartureLocationCode: 'LHR',
            ArrivalLocationCode: 'SFO',
            departureDate: '01 Aug',
            returnDate: '22 Aug',
            CabinClass: 'Economy',
            passengers: '1',
            topSearchOnly: '0',
            flightType: 'ROUND_TRIP'
          },
          searchResult: []
        }, 'search/result'
      ]);
      assert(view.calledWith(
        {
          user: {id: 1},
          title: 'LHR &#8644; SFO',
          tiles: {},
          searchParams: {
            DepartureLocationCode: 'LHR',
            ArrivalLocationCode: 'SFO',
            departureDate: '01 Aug',
            returnDate: '22 Aug',
            CabinClass: 'Economy',
            passengers: '1',
            topSearchOnly: '0',
            flightType: 'ROUND_TRIP'
          },
          searchResult: []
        }, 'search/result'
      ));
      view.reset();
      done();
    });

    it('should return empty result', function (done) {
      UserAction.saveAction = function () {return true;};
      iPrediction.getUserRank = function () {return true;};
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
      view.args[0].should.be.eql([
        {
          "user": {"id": 1},
          "title": "TEST &rarr; TEST",
          "tiles": {},
          "searchParams": {
            "DepartureLocationCode": "TEST",
            "ArrivalLocationCode": "TEST",
            "departureDate": "25 Jul",
            "returnDate": "",
            "CabinClass": "undefined",
            "passengers": "test",
            "topSearchOnly": "test",
            "flightType": "test"
          },
          "searchResult": []
        }, 'search/result'
      ]);
      assert(view.calledWith({
        "user": {"id": 1},
        "title": "TEST &rarr; TEST",
        "tiles": {},
        "searchParams": {
          "DepartureLocationCode": "TEST",
          "ArrivalLocationCode": "TEST",
          "departureDate": "25 Jul",
          "returnDate": "",
          "CabinClass": "undefined",
          "passengers": "test",
          "topSearchOnly": "test",
          "flightType": "test"
        },
        "searchResult": []
      }, 'search/result'));
      view.reset();
      done();
    });

    it('should return formatted result', function (done) {
      UserAction.saveAction = function () {return true;};
      iPrediction.getUserRank = function () {return true;};
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
          time_log: ['']
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
