REPORTER=spec
TESTS=$(shell find ./tests -type f -name "*.js")
export


deployweb:
	git push web

dbmigrate:
	./node_modules/sails-migrations/bin/cli.js $(filter-out $@,$(MAKECMDGOALS))

installdev:
	@NODE_ENV=development npm install -verbose

rundev:
	@NODE_ENV=development sails_email__instance_name=development1_1 sails lift --dev --verbose

rundevlocalhost:
	@NODE_ENV=localhost sails_email__instance_name=localhost1_1 sails lift --localhost

migratedevup:
	cd ../db-migration && ./node_modules/db-migrate/bin/db-migrate up -e dev

migratedevlocalhostup:
	cd ../db-migration && @NODE_ENV=localhost ./node_modules/db-migrate/bin/db-migrate up -e localhost

test-integration:
	./node_modules/.bin/mocha ./tests/bootstrap.integration.test.js ./tests/integration/**/*.test.js

test-integration-localhost:
	@NODE_ENV=localhost ./node_modules/.bin/mocha ./tests/bootstrap.integration.test.js ./tests/integration/**/*.test.js

test-unit:
	./node_modules/.bin/mocha ./tests/bootstrap.unit.test.js ./tests/unit/**/*.test.js

test-jest-snapshot:
	./node_modules/.bin/jest

test-health:
	./node_modules/.bin/mocha ./tests/bootstrap.health.test.js ./tests/health/**/*.test.js

test-health-stage:
	@CHECK_ENV=staging ./node_modules/.bin/mocha ./tests/bootstrap.health.test.js ./tests/health/**/*.test.js

test-health-prod:
	@CHECK_ENV=production ./node_modules/.bin/mocha ./tests/bootstrap.health.test.js ./tests/health/**/*.test.js

showprocess:
	sudo lsof | grep IPv | grep -F LISTEN

startwww:
	sudo forever start -ae errors.log app.js --prod --port 80

stopwww:
	sudo forever stopall

.PHONY: test

%:
	@:
