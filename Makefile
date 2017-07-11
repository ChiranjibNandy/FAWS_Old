.PHONY: venv tox setup docs test ops-% clean

# Ensure virtualenv has correct Python version
VIRTUALENV              = virtualenv --python=python2.7

# Define the virtualenv for "local" builds
VENV                    = .venv
VENV_ACTIVATE           = . $(VENV)/bin/activate

# Define the virtualenv for "ops" builds
OPS_VENV                = .ops_venv
OPS_VENV_ACTIVATE       = . $(OPS_VENV)/bin/activate
OPS_REQUIREMENTS        = $(OPS_VENV) require-env

# Define tox defaults
TOX                     = tox
TOX_ARGS                ?= -r

# Define method for invoking "ops" commands
OPDASH_CP_OPS           = python ops/main.py

ENV                     ?= local

PIP_CONFIG_FILE         ?= config/pip/$(ENV).conf
PIP_CONF                = PIP_CONFIG_FILE=$(PIP_CONFIG_FILE)
PIP_INSTALL             = $(PIP_CONF) pip install -U

DOCKER                  = docker

OPEN                    = open


##### Help #####

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


##### Development #####

$(VENV):
	$(VIRTUALENV) $(VENV)
	$(VENV_ACTIVATE); $(PIP_INSTALL) pip
	$(VENV_ACTIVATE); $(PIP_INSTALL) -c constraints.txt tox

venv: $(VENV) ## Create Python virtual environment.

setup: $(VENV) ## Install/upgrade project and development requirements in virtual environment.
	# install in same order as tox: 1. dev requirements 2. project
	$(VENV_ACTIVATE); $(PIP_INSTALL) -c constraints.txt -r dev_requirements.txt
	$(VENV_ACTIVATE); $(PIP_INSTALL) -c constraints.txt -e .

test: $(VENV) ## The official test suite entry point. You can verify your patch by running `make test`.
	$(VENV_ACTIVATE); $(PIP_CONF) $(TOX) $(TOX_ARGS)

test-unit: $(VENV) ## Run unit tests.  Skips integrated tests requiring fixtures like Dynamo.  To refresh Python dependencies, run `tox -r`
	$(VENV_ACTIVATE); $(PIP_CONF) $(TOX) -e py27,flake8 -- tests/unit


##### Documentation #####

docs: $(VENV) ## Build the docs and open them in a browser. If you're on linux you can use `make -e OPEN=xdg-open` to see them in a browser automatically.
	$(VENV_ACTIVATE); $(PIP_INSTALL) sphinx
	$(VENV_ACTIVATE); cd docs && make html
	$(OPEN) docs/_build/html/index.html


##### Execution #####

run: $(VENV) ## Run opdash-cp locally
	$(VENV_ACTIVATE); python application.py


##### Operations #####

ops-help: ## Learn a bit about the ops workflow.
	@echo "From the docs/ops.rst"
	@echo ""
	cat docs/ops.rst

require-env: ## Ensure the required variables have been set
ifeq "$(origin ENV)" "file"
	$(error ENV not explicitly set! \
	ENV is needed to pass params to PIP. \
	Ex: "make ENV=foo ..." sets PIP_INDEX_URL, etc)
endif

ifndef AWS_DEFAULT_REGION
	    $(error Please set the AWS_DEFAULT_REGION environment variable explicitly!)
endif
ifndef AWS_ACCESS_KEY_ID
	    $(error Please set the AWS_ACCESS_KEY_ID environment variable explicitly!)
endif
ifndef AWS_SECRET_ACCESS_KEY
	    $(error Please set the AWS_SECRET_ACCESS_KEY environment variable explicitly!)
endif

setup-ops: ## Create a virtualenv for running ops tasks
	$(VIRTUALENV) $(OPS_VENV)
	$(OPS_VENV_ACTIVATE); $(PIP_INSTALL) pip
	$(OPS_VENV_ACTIVATE); $(PIP_INSTALL) -r ops_requirements.txt

release: require-env ## Tag and push a Docker image to ECR
	$(OPS_VENV_ACTIVATE); ENV=$(ENV) $(OPDASH_CP_OPS) release

show-latest-release: ## Print the tag of the latest released image
	@$(OPS_VENV_ACTIVATE) && ENV=$(ENV) $(OPDASH_CP_OPS) show_latest_release

promote-pull: require-env ## Pull an image down for promotion (supports RELEASE=<image_tag>)
	$(OPS_VENV_ACTIVATE) && ENV=$(ENV) $(OPDASH_CP_OPS) promote_pull

promote-push: require-env ## Push a image for promotion (supports RELEASE=<image_tag>)
	$(OPS_VENV_ACTIVATE) && ENV=$(ENV) $(OPDASH_CP_OPS) promote_push

update-git-tags: require-env ## Update Git tags
	$(OPS_VENV_ACTIVATE) && ENV=$(ENV) $(OPDASH_CP_OPS) update_git_tags

deploy: require-env ## Create/Update ECS Tasks and Services with current tag
	$(OPS_VENV_ACTIVATE); ENV=$(ENV) $(OPDASH_CP_OPS) deploy


##### Utilities #####

clean-pyc:
	find opdash/ tests/ -name '*.pyc' -exec rm -f {} +
	find opdash/ tests/ -name '*.pyo' -exec rm -f {} +
	find opdash/ tests/ -name '*~' -exec rm -f {} +
	find opdash/ tests/ -name '__pycache__' -exec rm -fr {} +

clean: clean-pyc ## Delete temporary and intermediate files
	rm -rf .venv
	rm -rf .ops_venv
	rm -rf .tox
