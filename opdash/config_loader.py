import yaml
import os
import boto3
import botocore.config
import logging
from opdash import encryption_helper


config = {}


def _flatten_config_dict_or_list(results, source, prefix=''):
    # TODO(Team): Optimize this code to make it a bit simpler
    for entry in source:
        if isinstance(entry, dict):
            for k in entry:
                v = entry[k]
                if isinstance(v, dict) or isinstance(v, list):
                    _flatten_config_dict_or_list(results, v, prefix + k + '_')
                else:
                    results[prefix + k] = v
        else:
            try:
                v = source[entry]
                if isinstance(v, dict) or isinstance(v, list):
                    _flatten_config_dict_or_list(
                        results, v, prefix + entry + '_')
                else:
                    results[prefix + entry] = v
            except TypeError:
                # Fall back in case the source is a list of values
                key = prefix[:-1] if prefix.endswith('_') else prefix
                results[key] = source


def _load_conf_file(file_path):
    """
    :type file_path: str
    """
    logger = logging.getLogger()
    conf = {}

    # Attempt to load our file as if it is encrypted.
    try:
        if file_path.startswith('https://s3.amazonaws.com/'):
            parts = file_path.split('/')
            bucket = parts[3]
            key = '/'.join(parts[4:])
            s3_client = boto3.client(
                's3', config=botocore.config.Config(signature_version='s3v4'))
            resp = s3_client.get_object(Bucket=bucket, Key=key)

            # File is in S3 and is set up with server-side encryption. This
            # encryption is handled 100% AWS side and is based on IAM roles.
            if 'ServerSideEncryption' in resp:
                conf = yaml.load(
                    resp['Body'].read()
                )
            else:
                key = os.environ.get('ENCRYPTION_CONFIG_LOCAL_KEY', None)
                conf = yaml.load(
                    encryption_helper.decrypt_string(
                        os.environ[key],
                        resp['Body'].read()
                    )
                )
        else:
            enc_key = os.environ.get(
                os.environ.get('ENCRYPTION_CONFIG_LOCAL_KEY', ''))
            if enc_key:
                conf = yaml.load(
                    encryption_helper.decrypt_file_to_string(
                        enc_key,
                        file_path
                    )
                )
    except ValueError as ex:
        logger.warning('Error while loading config.', ex)

    # Last ditch, read the file directly
    if not conf:
        with open(file_path, 'r') as f:
            conf = yaml.load(f)

    return conf


def import_config_to_env_var_defaults(config_path, silent=False,
                                      alt_config=None):
    """Imports a yml config to os.environ for use

    :param config_path: path to the configuration file to load
    :param silent: If the config_path is None or empty do not raise an error.
                   Also, if there is an error while processing the config
                   file, do not raise an error.
    :param alt_config: Override internal config with the supplied config.
    """

    if alt_config:
        global config
        config = alt_config

    logger = logging.getLogger()
    if not config_path and silent:
        logger.debug('config path null or empty, with silent flag. Skipping '
                     'config load')
        return

    try:
        conf = _load_conf_file(config_path)

        results = {}

        _flatten_config_dict_or_list(results, conf)

        for key in results:
            value = results[key]
            skip_environ = False
            if isinstance(value, dict) or isinstance(value, list):
                logger.warning(
                    'Value for key "{key}" detected as list or dict. This '
                    'key value combination will not be placed in the '
                    'os.environ construct.'.format(
                        key=key))
                skip_environ = True

            if value and skip_environ is False:
                # Only updates the environ variable for the current process
                os.environ[key] = str(value)
            global config
            config[key] = value
    except:
        if silent:
            logger.debug('Exception raised while loading config "{config}." '
                         'Silent flag is enabled so exception has not been '
                         're-raised.'.format(config=config_path))
            return
        raise
