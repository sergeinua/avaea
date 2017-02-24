var Sails = require('sails'),
  sails;
  require('should');

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(512000);

  let env_config = require('../config/env/' + (process.env.NODE_ENV || 'staging') + '.js');
  Sails.lift(Object.assign({}, env_config, {
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
    hookTimeout: 512000,
    hooks: {
      session: false,
      grunt: false
    },
    globals: {
      cacheStore: 'redis', //<redis|memcache>
    },
    email: {
      instance_name: 'host1_test'
    },
    cron: false
  }), function(err, server) {
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
