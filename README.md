# Operational Dashboard Control Panel
This is the control panel for the Operational Dashboard

## Start the Control Panel for Development


### Install virtual environment:
```bash
virtualenv .venv
```

### Activate virtual environment:
```bash
. .venv/bin/activate
```

### Install Requirements:
```bash
pip install -r requirements.txt
```

### Export Development Debug Configuration
```bash
export UI_DEPLOY_ENVIRON="DebugConfig"
```

### Application Session
For **local development** the session is stored in the flask_session directory under the application root.

For **AWS environments**, Redis is used to store the session information.

If you would like to test Redis locally, you need to set the environment variables:
```bash
export SESSION_TYPE="redis"
export AWS_REDIS_HOST="0.0.0.0"
```

To install a Redis server locally on Linux:
```bash
sudo apt-get install redis-server
```

To run a Redis server using Docker:
```bash
sudo docker run --name redis -h redis -it -p 6379 --rm redis
```

### Start Flask:
```bash
python application.py
```

## Publishing this package

Please see the README for the [faws-migration-jenkins-devpi-server](
https://github.rackspace.com/qe-neutron-ansible-roles/faws-migration-jenkins-devpi-server)
repository to learn about publishing this Python package to our internal
_devpi_ (PyPI-compatible) server.

Bumping the version number
--------------------------

We use [bumpversion](https://pypi.python.org/pypi/bumpversion) to bump the
major, minor, or patch component of the semantic versioning number of the
package for releases.

The work flow is:

1. `git commit` your work.

1. Run a command like `bumpversion { patch | major | minor }` to bump the patch
(least significant component) number. The _bumpversion_ command does the
following for you:

  * bumps the version number,

  * adds a Git Tag for the new version, and 

  * performs a Git Commit for the new version.

1. (Optional) You can `git log` to verify the version number was bumped.

1. Now `git push` your work to GitHub Enterprise and submit a Pull Request.

1. After your Pull Request has been Merged into Master: run Jenkins job
[opdash-cp-publish-dev](
https://migration.jenkins.cit.rackspace.net/view/Dev-Publish/job/opdash-cp-publish-dev/).
This job has the proper credentials and procedure for publishing to the _devpi_
server.

You can now `pip install` the published package.

You can verify the published version number [here](
http://migration.jenkins.cit.rackspace.net:3141/faws-migration-svc/dev).
