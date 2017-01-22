var request = require('supertest');
require('should');
var cities = require('../../fixtures/citiesVScodes.json');

describe('AcController', function() {
   
  this.timeout(10000);   

  describe('#airports()', function () {
    it('should return empty', function (done) {
      request(sails.hooks.http.app)
        .post('/ac/airports')
        .send({ q: 'blabla'})
        .expect(200, [])
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          done();
        });
    });

    cities.forEach(function (city) {
      it('"'+city.name+'" should return ' + city.code, function (done) {
        request(sails.hooks.http.app)
          .post('/ac/airports')
          .send({ q: city.name})
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body[0].value.should.be.eql(city.code);
            done();
          });
      });
    });

    it('"San Francisco" should return SFO', function (done) {
      request(sails.hooks.http.app)
        .post('/ac/airports')
        .send({ q: 'San Francisco'})
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body[0].value.should.be.eql("SFO");
          done();
        });
    });
  });

});
