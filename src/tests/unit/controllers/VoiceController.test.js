var request = require('supertest');
const _TESTS  = require('../../fixtures/AvaeaTextParser');

describe('VoiceController', function() {

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
                  var rkey = (key == 'return_airport' ? 'destination_airport' : key);
                  var value = undefined;
                  if (result.body[rkey]) {
                    value = (typeof(result.body[rkey].toDateString) == "function") ? result.body[rkey].toDateString() : result.body[rkey];
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
