var request = require('supertest');

describe('AuthController', function() {

  describe('#login()', function() {
    it('should redirect to /search', function (done) {
      request(sails.hooks.http.app)
        .post('/auth/login')
        .send({ name: 'test', password: 'test' })
        .expect(302)
        .expect('location','/search', done);
    });
  });

});
