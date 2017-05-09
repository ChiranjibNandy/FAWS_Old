import yaml
import os
import logging
from opdash import encryption_helper


logger = logging.getLogger(__name__)


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


def _load_config(config_string, encryption_key=None):
    """
    :type config_string: str
    :type encryption_key: str
    """
    if encryption_key is not None:
        config_string = encryption_helper.decrypt_string(
            encryption_key,
            config_string)

    return yaml.load(config_string)


def import_config_to_env_var_defaults(config_string,
                                      encryption_key=None):
    """
    Imports a yml config to os.environ for use
    :param str config_string: configuration string
    :param str encryption_key: encryption key to use, if required
    """

    results = {}

    conf = _load_config(
        config_string,
        encryption_key=encryption_key)

    flat_conf = {}

    _flatten_config_dict_or_list(flat_conf, conf)

    for key in flat_conf:
        value = flat_conf[key]
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

        results[key] = value

    return results
