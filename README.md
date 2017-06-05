# Op-Dash Control Panel
### The UI for the AWS Migration Dashboard

---

# Setup for Local Development


### Install Required System Packages:
```
sudo apt-get -q update && \
sudo apt-get -y install python-pip python-dev libpython-dev libffi-dev libssl-dev libxml2-dev libxmlsec1-dev
```

### Clone the opdash-cp application from github:
```
git clone git@github.rackspace.com:FAWS-Migration/opdash-cp.git
```
### Change to the opdash-cp directory:
```
cd opdash-cp
```

### Create virtual environment:
```
virtualenv .venv
```

### Activate virtual environment:
```
. .venv/bin/activate
```

### Install Required Python Packages:
```
pip install .
```

### Start Flask:
```
python application.py
```

# Setup using the Makefile

```bash
# install python dependencies in a virtualenv
make setup

# run the unit tests with tox
make test

# run flask
make run
```

Use `make help` to get descriptions of all the Makefile targets.
