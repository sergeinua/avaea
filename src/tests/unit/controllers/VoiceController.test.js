var request = require('supertest');
const _TESTS  = require('../../fixtures/AvaeaTextParser');

describe('VoiceController', function() {
  this.timeout(5000);
  describe('#parse()', function() {
    _TESTS.forEach(function( t ) {
      it(t.query, function (done) {
        request(sails.hooks.http.app)
          .post('/voice/parse')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send({q: t.query})
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, result) => {
            if (!err) {
              Object.keys(t).forEach((key) => {
                if (key != 'query') {
                  var value = undefined;
                  if (result.body[key]) {
                    value = (typeof(result.body[key].toDateString) == "function") ? result.body[key].toDateString() : result.body[key];
                  }
                  if (t[key] != value) {
                    throw Error("Values for '" + key + "' do not match, '" + t[key] + "' vs. '" + value + "'");
                  }
                }
              });
              done();
            } else {
              throw err;
            }
          });
      });
    });
  });

});
