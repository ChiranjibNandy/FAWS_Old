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

### Export Development Debug Configuration
```bash
export UI_DEPLOY_ENVIRON="DebugConfig"
```

### Start Flask:
```bash
python application.py
```
