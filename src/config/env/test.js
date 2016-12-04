
module.exports = {


  models: {
    connection: 'etPostgresqlServer'
  },


  port: 80,
  explicitHost: 'localhost',

  log: {
    level: 'verbose',
    timestamp: true
  },

  session: {
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'testdb',
    port: 5432
  },


  hookTimeout: 120000,
  segmentio_key: 'xtV7Xew6UQa1scURs186FRazPcgCPcxR'
};