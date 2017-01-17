REPORTER=spec
TESTS=$(shell find ./src/tests -type f -name "*.js")
export


dbmigrate:
	./db-migration/node_modules/db-migrate/bin/db-migrate up

app-test-integration:
	cd ./src && ./node_modules/.bin/mocha ./tests/bootstrap.integration.test.js ./tests/integration/**/*.test.js

app-test-unit:
	cd ./src && ./node_modules/.bin/mocha ./tests/bootstrap.unit.test.js ./tests/unit/**/*.test.js

app-test-jest-snapshot:
	cd ./src && ./node_modules/.bin/jest

abo-test-integration:
	cd ./abo && ./node_modules/.bin/mocha ./tests/bootstrap.integration.test.js ./tests/integration/**/*.test.js

abo-test-unit:
	cd ./abo && ./node_modules/.bin/mocha ./tests/bootstrap.unit.test.js ./tests/unit/**/*.test.js

app-test-health:
	cd ./src && ./node_modules/.bin/mocha ./tests/bootstrap.health.test.js ./tests/health/**/*.test.js

app-test-health-stage:
	cd ./src && CHECK_ENV=staging ./node_modules/.bin/mocha ./tests/bootstrap.health.test.js ./tests/health/**/*.test.js

app-test-health-prod:
	cd ./src && CHECK_ENV=production ./node_modules/.bin/mocha ./tests/bootstrap.health.test.js ./tests/health/**/*.test.js


%:
	@:
