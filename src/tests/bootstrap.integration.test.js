var Sails = require('sails'),
  sails;
  require('should');

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(50000);

  Sails.lift({
    // configuration for testing purposes
    log: {
      level: 'error'
    },
    policies: {
      '*' : true
    },
    hooks: {
      session: false
    },
    models: {
      connection: 'etPostgresqlServer'
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
