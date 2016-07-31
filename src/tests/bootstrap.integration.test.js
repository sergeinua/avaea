var Sails = require('sails'),
  sails;
  require('should');

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(50000);

  var useDB = 'etPostgresqlServer'; // default dev
  if (process.env.NODE_ENV == 'stage' || process.env.NODE_ENV == 'prod') {
    useDB = 'productionPostgresqlServer';
  }
  if (process.env.NODE_ENV == 'docker') {
    useDB = 'dockerPostgresqlServer';
  }

  Sails.lift({
    // configuration for testing purposes
    port: 4000,
    proxyHost: 'http://localhost/',
    proxyPort: 4000,
    explicitHost: false,
    log: {
      level: 'error',
      timestamp: false
    },
    session: false,
    policies: {
      '*' : true
    },
    hookTimeout: 60000,
    hooks: {
      session: false,
      grunt: false
    },
    models: {
      connection: useDB
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
