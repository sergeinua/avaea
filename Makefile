REPORTER=spec
TESTS=$(shell find ./src/tests -type f -name "*.js")
export


dbmigrate:
	./db-migration/node_modules/db-migrate/bin/db-migrate up

app-test-integration:
	cd ./src && NODE_ENV=test ./node_modules/.bin/mocha ./tests/bootstrap.integration.test.js ./tests/integration/**/*.test.js

app-test-unit:
	cd ./src && NODE_ENV=test ./node_modules/.bin/mocha ./tests/bootstrap.test.js ./tests/unit/**/*.test.js

abo-test-integration:
	cd ./abo && NODE_ENV=test ./node_modules/.bin/mocha ./tests/bootstrap.integration.test.js ./tests/integration/**/*.test.js

abo-test-unit:
	cd ./abo && NODE_ENV=test ./node_modules/.bin/mocha ./tests/bootstrap.test.js ./tests/unit/**/*.test.js


%:
	@:
