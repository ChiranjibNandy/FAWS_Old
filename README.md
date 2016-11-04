# Operational Dashboard Control Panel
This is the control panel for the Operational Dashboard

## Start the Control Panel for Development

### Install virtual environment:
```
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

### Export Developer Config
```bash
export OPDASH_CONFIG="../config/opdash_dev.cfg"
```

### Start Flask:
```bash
python run.py
```
