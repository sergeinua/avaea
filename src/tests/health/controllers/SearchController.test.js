var request = require('supertest');
var moment = require('moment');
var check = request(global.urlToCheck);
var token = global.test_user_token;

describe('SearchController', function() {

  describe(global.urlToCheck + '/search (NO auth)', function() {
    it('should redirect to login form', function (done) {
      check
        .get('/search')
        .expect(302)
        .expect('location','/login', done);
    });
  });

  describe(global.urlToCheck + '/search (token auth)', function() {

    it('should show search form', function (done) {
      check
        .get('/search')
        .set('Authorization', 'Bearer ' + token)
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          res.text.should.match(/<title>Search for flights with Avaea Agent<\/title>/);
          res.text.should.match(/<form[^>]*id="search_form"/);
          res.text.should.match(/<input[^>]*name="originAirport"/);
          res.text.should.match(/<input[^>]*name="destinationAirport"/);
          res.text.should.match(/<input[^>]*name="departureDate"/);
          res.text.should.match(/<input[^>]*name="returnDate"/);
          res.text.should.match(/<input[^>]*name="preferedClass"/);
          res.text.should.match(/<input[^>]*name="topSearchOnly"/);
          res.text.should.match(/<input[^>]*name="passengers"/);
          res.text.should.match(/<input[^>]*name="flightType"/);
          res.text.should.match(/<input[^>]*name="voiceSearchQuery"/);
          done();
        });
    });

    it('should show search result', function (done) {
      var searchDate = moment();
      searchDate = moment(searchDate).add(14, 'day'); // +2 weeks from now
      this.timeout(50000);
      check
        .post('/result')
        .field("originAirport", "LHR")
        .field("destinationAirport", "SFO")
        .field("preferedClass", "E")
        .field("passengers", "1")
        .field("topSearchOnly", "0")
        .field("flightType", "one_way")
        .field("returnDate", "")
        .field("voiceSearchQuery", "")
        .field("departureDate", searchDate.format('YYYY-MM-DD'))
        .set('Authorization', 'Bearer ' + token)
        .set('Accept', 'text/html')
        .set('Content-Type', 'text/html')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          // Make sure we have some results
          res.text.should.match(/<span id='search_count'>/);
          // Make sure we have more than 10 results
          res.text.should.match(/<span id='search_count'>[^0]\d+/);
          // Make sure we have tiles generated
          res.body.should.match(/<div[^>]*id="tiles"/);
          // Make sure we have results generated
          res.body.should.match(/<div[^>]*id="searchResultData"/);
          done();
        });
    });

  });

});
