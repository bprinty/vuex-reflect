#
# Makefile for building and installing js package.
#
# ---------------------------------------------------


# config
# ------
PROJECT = js-project
VERSION = `cat package.json | grep 'version' | sed -E 's/.*version.*\s+"(.+?)".*/\1/g'`


# targets
# -------
.PHONY: build docs test install deploy


default: build


help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


info: ## list info about package
	@echo "$(PROJECT), version $(VERSION)"
	@echo last updated: `git log | grep --color=never 'Date:' | head -1 | sed 's/Date:   //g'`


clean: ## Clean build resources
	rm -rf dist node_modules lib docs/_html yarn-error.log yarn.lock package-lock.json


build: ## Build and compile package
	yarn run build


test: build ## Run unit tests for package
	yarn run test


docs: ## Build documentation for package
	yarn run docs


release: test build ## Release package to external package repository
	VER=$(VERSION) && git push origin :$$VER || echo 'Remote tag available'
	VER=$(VERSION) && git push origin $$VER
	yarn run publish
