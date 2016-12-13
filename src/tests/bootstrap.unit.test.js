var Sails = require('sails'),
  sails;
  require('should');

before(function(done) {
  // Increase the Mocha timeout so that Sails has enough time to lift.
  // this.timeout(10000);
    this.timeout(512000); // increased to let Pipelines work

  Sails.lift({
    // configuration for testing purposes
    environment: 'test',
    port: 4000,
    proxyHost: 'http://localhost/',
    proxyPort: 4000,
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
   // hookTimeout: 40000,
    hookTimeout: 512000
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
