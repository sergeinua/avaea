var request = require('supertest');

describe('NlpController', function() {

  describe.skip('#index()', function() {
    it('should redirect 302 to /search with cookie "flightType=voice_search; Path=/"', function (done) {
      request(sails.hooks.http.app)
        .get('/nlp')
        .expect(302)
        .expect('set-cookie', 'flightType=voice_search; Path=/')
        .expect('location','/search', done);
    });
  });

});
