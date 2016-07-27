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
	@NODE_ENV=development sails lift --dev --verbose

test-integration:
	@NODE_ENV=test ./node_modules/.bin/mocha ./tests/bootstrap.integration.test.js ./tests/integration/**/*.test.js \

test:
	@NODE_ENV=test ./node_modules/.bin/mocha ./tests/bootstrap.test.js ./tests/unit/**/*.test.js \

showprocess:
	sudo lsof | grep IPv | grep -F LISTEN

startwww:
	sudo forever start -ae errors.log app.js --prod --port 80

stopwww:
	sudo forever stopall

.PHONY: test

%:
	@:
