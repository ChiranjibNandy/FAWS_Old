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

To install a Redis server locally on linux:
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
