var request = require('supertest');

describe.skip('AuthController', function() {

  describe('#login() token based', function() {
    it('should redirect to /search', function (done) {
      request(sails.hooks.http.app)
        .post('/auth/login')
        .send({ name: 'testing', password: 'testpass' })
        .expect(302)
        .expect('location','/search', done);
    });
  });

});
