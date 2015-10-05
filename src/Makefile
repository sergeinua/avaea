REPORTER=spec
TESTS=$(shell find ./tests -type f -name "*.js")

test:
	@NODE_ENV=test ./node_modules/.bin/mocha ./tests/bootstrap.test.js ./tests/unit/**/*.test.js \
		--reporter $(REPORTER) \
		$(TESTS)

.PHONY: test