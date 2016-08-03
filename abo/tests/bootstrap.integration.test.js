var Sails = require('sails'),
  sails;
require('should');

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(50000);

  var useDB = 'etPostgresqlServer'; // default dev
  if (
    process.env.NODE_ENV == 'stage' ||
    process.env.NODE_ENV == 'prod' ||
    process.env.NODE_ENV == 'staging' ||
    process.env.NODE_ENV == 'production'
  ) {
    useDB = 'productionPostgresqlServer';
  }
  if (process.env.NODE_ENV == 'docker') {
    useDB = 'dockerPostgresqlServer';
  }

  Sails.lift({
    // configuration for testing purposes
    port: 4001,
    proxyHost: 'http://localhost/',
    proxyPort: 4001,
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
