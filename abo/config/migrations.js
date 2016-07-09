module.exports.migrations = {
  // connection name matches a field from config/connections.js
  connection: 'etPostgresqlServer',
  //connection: 'dockerPostgresqlServer',
  //connection: 'productionPostgresqlServer',
  driver: 'pg',
  table: 'sails_migrations',
  migrationsDir: 'sails_migrations',
  coffeeFile: false
};
