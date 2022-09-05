install:
	npm ci
lint:
	npx eslint .
publish:
	npm publish --dry-run
test:
	npm test
test-coverage:
	npx test --coverage
