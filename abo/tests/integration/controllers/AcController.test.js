var request = require('supertest');
require('should');

describe('AcController', function() {

  describe('#airports()', function () {
    it('should return empty', function (done) {
      request(sails.hooks.http.app)
        .post('/ac/airports')
        .send({q: 'blabla'})
        .expect(200, [])
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          done();
        });
    });
  });
});
