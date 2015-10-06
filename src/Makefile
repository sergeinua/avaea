REPORTER=spec
TESTS=$(shell find ./tests -type f -name "*.js")

installdev:
	@NODE_ENV=development npm install -verbose

rundev:
	@NODE_ENV=development sails lift --dev --verbose

test:
	@NODE_ENV=test ./node_modules/.bin/mocha ./tests/bootstrap.test.js ./tests/unit/**/*.test.js \
		--reporter $(REPORTER) \
		$(TESTS)

.PHONY: test