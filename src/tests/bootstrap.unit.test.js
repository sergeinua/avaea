var Sails = require('sails'),
  sails;
  require('should');

before(function(done) {
  // Increase the Mocha timeout so that Sails has enough time to lift.
  // this.timeout(10000);
  // timeout increased to let Pipelines work
    this.timeout(512000);

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
   // timeout increased to let Pipelines work
    hookTimeout: 512000,
    hooks: {
      session: false,
      grunt: false
    },    
    connections:{
      memcacheConf: {
        host: 'localhost',
        port: '11211',
        exptime: 60*30 // 30 minutes
      },
      redisConf: {
        host: 'localhost',
        port: 6379,
        ttl: 600,
        db: 0,
        pass: '',
        prefix: 'cache:',
        exptime: 60*30 // 30 minutes
      }      
    },
    globals: {
      //cacheStore: 'redis', //<redis|memcache>
    },
    cron: false
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
