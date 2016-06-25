db migration instruction

1. npm install
2. folders 'migrations' contains script for database migrations
3. database.json describes key for the servers, that you can to define
at start migration script
 
how to
1. add new migration (basic usage)
    a. go to <repo root>/db-migration
    b. add new migration by
    node_modules/db-migrate/bin/db-migrate create <migration name>
    
    script will generate migration script with filename mask 
    <current datetime>-<migration name>.js
    
2. run migration up (basic usage)
    a. go to <repo root>/db-migrations
    b. run named migration by 
    node_modules/db-migrate/bin/db-migrate up <migration name> -e <dev|prod|...>
    or run <count> steps forward by
    c. node_modules/db-migrate/bin/db-migrate up -c <count> -e <dev|prod|...>
    
    where <dev|prod|...> should be described in database.json
    

3. run migration down (basic usage)
    a. go to <repo root>/db-migrations
    b. node_modules/db-migrate/bin/db-migrate down -c <step count>


detailed info about db-migration: 
https://db-migrate.readthedocs.io/en/latest/help/