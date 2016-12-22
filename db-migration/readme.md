db migration instruction

0. cd <repo root>/db-migration
1. npm install
2. folder 'migrations' contains scripts for database migrations
3. database.json describes key for the servers, that you can to define
at start migration script
 
how to
0. init DB

    !!! WARNING !!! 
    these scripts will drop all exists tables and recreate them 

    a. go to <repo root>/db-migration
    b. node_modules/db-migrate/bin/db-migrate up -m db-init -e <dev|prod|...>
    where <dev|prod|...> should be described in database.json
    
    !!! BE CAUTION !!!
    
1. add new migration (basic usage)
    a. go to <repo root>/db-migration
    b. add new migration by
    node_modules/db-migrate/bin/db-migrate create <migration name> [--sql-file]
    
    script will generate migration script with filename mask 
    <current datetime>-<migration name>.js
    
    user can define script type: sql-formatted or js-formatted, 
        default - js-formatted  
    
2. run migration up (basic usage)
    a. go to <repo root>/db-migration
    b. node_modules/db-migrate/bin/db-migrate up [-c <count>] [-e <dev|prod|...>]
    

3. run migration down (basic usage)
    a. go to <repo root>/db-migration
    b. node_modules/db-migrate/bin/db-migrate down [-c <step count>] [-e <dev|prod|...>]


detailed info about db-migration: 
https://db-migrate.readthedocs.io/en/latest/help/