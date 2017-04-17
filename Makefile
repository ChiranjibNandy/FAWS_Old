.PHONY: setup docs test ops-%

VIRTUALENV = virtualenv --python=python2.7

VENV=.venv
VENV_ACTIVATE=. $(VENV)/bin/activate

# Use a separate .venv for ops b/c of conflicting deps :(
OPS_VENV=.ops_venv
OPS_VENV_ACTIVATE=. $(OPS_VENV)/bin/activate
MIGRATOR_OPS=python ops/main.py

WITHENV=we -a env-$(ENV).yml
WITHLOCAL=we -a env-local.yml
CREDS=$(VENV)/bin/we -e .creds.yml

CONTROL_ARGS="-h"

# As you add new Makefile targets, you can document them for those
# that come afterwards by adding a `## My documentation here` after
# the target and its requirements.
#
# See the following blog post for more info:
#   http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
#
# The pipe to sort in here sorts our friends, ignoring target places in the Makefile
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


$(VENV):
	# just create the virtualenv on first-time setup
	$(VIRTUALENV) $(VENV)


setup: $(VENV) ## Create a virtualenv and install all the development requirements
	# install 1. dev requirements and 2. project in same order as tox
	$(VENV)/bin/pip install -c constraints.txt -r dev_requirements.txt
	$(VENV)/bin/pip install -c constraints.txt -e .


test: ## The official test suite entry point. You can verify your patch by running `make test`. NOTE: `tox` must be installed.
	$(eval TOX_ARGS := -r)
	$(VENV)/bin/tox $(TOX_ARGS)


require-env: ## Ensure the `ENV` variable has been set. `make -e ENV=dev`
ifndef ENV
	$(error ENV is required! It will be used to load an env alias $(ALIAS_DOC_URL). Ex: ENV=dev env-dev.yml ?)
endif


setup-ops: ## Create a virtualenv for running ops tasks
	# just create the virtualenv on first-time setup
	$(VIRTUALENV) $(OPS_VENV)
	$(OPS_VENV)/bin/pip install -r ops_requirements.txt


release: require-env ## Tag and push a Docker image to ECR
	$(OPS_VENV_ACTIVATE) && $(WITHENV) $(MIGRATOR_OPS) release


deploy: require-env ## Create/Update ECS Tasks and Services with current tag
	$(OPS_VENV_ACTIVATE) && $(WITHENV) $(MIGRATOR_OPS) deploy


# Utils
clean-pyc:
	find . -name '*.pyc' -exec rm -f {} +
	find . -name '*.pyo' -exec rm -f {} +
	find . -name '*~' -exec rm -f {} +
	find . -name '__pycache__' -exec rm -fr {} +
