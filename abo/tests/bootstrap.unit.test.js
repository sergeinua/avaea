var Sails = require('sails'),
  sails;
require('should');

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(5000);

  Sails.lift({
    // configuration for testing purposes
    port: 4001,
    proxyHost: 'http://localhost/',
    proxyPort: 4001,
    explicitHost: false,
    models: {
      connection: 'testMemoryDb'
    },
    log: {
      level: 'error',
      timestamp: false
    },
    session: false,
    policies: {
      '*' : true
    },
    hookTimeout: 40000,
    hooks: {
      session: false,
      grunt: false
    },
  }, function(err, server) {
    sails = server;
    if (err) return done(err);
    // here you can load fixtures, etc.
    done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  Sails.lower(done);
});
