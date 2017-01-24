var request = require('supertest');
require('should');
var sinon = require('sinon');
var assert = require('assert');

describe('SiteController', function() {
  this.timeout(5000);
  describe('get /search without parameters', function () {
    it('should return default search form', function (done) {
      request(sails.hooks.http.app)
        .get('/search')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
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
          res.body.defaultSearch.CabinClass.should.be.eql('E');
          res.body.defaultSearch.passengers.should.be.eql('1');
          res.body.defaultSearch.flightType.should.be.eql('round_trip');

          done();
        });
    });
  });
  this.timeout(5000);
  describe('get /search with wrong parameters', function () {
    it('should return default search form', function (done) {
      // Search.validateSearchParams = () => {return false;};
      request(sails.hooks.http.app)
        .get('/search?DepartureLocationCode=SFO&ArrivalLocationCode=LHR&CabinClass=QQQ&departureDate=2017-05-02&returnDate=2017-07-23&passengers=3')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            throw err;
          }

          res.body.should.have.properties('user', 'head_title', 'page', 'defaultSearch', 'serviceClass');
          res.body.page.should.be.eql('/search?DepartureLocationCode=SFO&ArrivalLocationCode=LHR&CabinClass=QQQ&departureDate=2017-05-02&returnDate=2017-07-23&passengers=3');
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
          res.body.defaultSearch.CabinClass.should.be.eql('E');
          res.body.defaultSearch.passengers.should.be.eql('1');
          res.body.defaultSearch.flightType.should.be.eql('round_trip');

          done();
        });
    });
  });
  this.timeout(5000);
  describe.skip('get /search with good parameters', function () {
    it('should return filled search form', function (done) {
      // Airports.findOne = () => {
      //   return {
      //     exec: () => {return doneCb(null, {
      //       city: 'Test'
      //     })}
      //   }
      // };
      let doneCb = () => {
        return {
          departure: {city:'wwww'},
          arrival: {city:'qqq'}
        };
      };
      request(sails.hooks.http.app)
        .get('/search?DepartureLocationCode=SFO&ArrivalLocationCode=LHR&CabinClass=P&departureDate=2017-05-02&returnDate=2017-07-23&passengers=3')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
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
          res.body.defaultSearch.CabinClass.should.be.eql('P');
          res.body.defaultSearch.passengers.should.be.eql('3');
          res.body.defaultSearch.flightType.should.be.eql('round_trip');

          done();
        });
    });
  });
});
