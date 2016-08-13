require('should');

global.urlToCheck = 'http://localhost:1337'; //default
global.test_user_token = 'af54f2426b1a9957f5f7cb79537a959e'; //default

if (process.env.CHECK_ENV == 'production') {
  global.urlToCheck = 'https://avaea.com'
}
if (process.env.CHECK_ENV == 'staging') {
  global.urlToCheck = 'http://stage.avaea.com'
}

before(function(done) {
  console.log("Starting Health check tests for URL " + global.urlToCheck);
  done();
});

after(function(done) {
  done();
});
