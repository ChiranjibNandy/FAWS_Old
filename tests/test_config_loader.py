import os
import unittest

from opdash import config_loader as cl
from opdash import encryption_helper as eh

ENCRYPTION_KEY = 'ABCDEFGHIJKLMNOPABCDEFGH'


class ConfigLoaderTests(unittest.TestCase):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    # def test_import_config_missing_file_fails_with_IOError(self):
    #      self.assertRaises(
    #         ValueError, cl.import_config_to_env_var_defaults, {}, "")

    #  @staticmethod
    #  def test_import_config_missing_file_with_silent_true_succeeds():
    #      cl.import_config_to_env_var_defaults({}, 'missing.yml', silent=True)

    def test_import_simple_config_properly(self):

        yaml_string = "\n".join([
            "---",
            "- TEST: Value"
        ])

        result_dict = cl.import_config_to_env_var_defaults(yaml_string)

        # Assert
        assert os.environ['TEST'] == 'Value'
        assert result_dict['TEST'] == 'Value'

    def test_import_config_simple_file_overrides_existing_environ(self):
        # Arrange
        os.environ['TEST'] = 'Doomed Value'
        config_dict = {
            'TEST': 'Original Value'
        }

        yaml_string = "\n".join([
            "---",
            "- TEST: New Value"
        ])

        result_dict = cl.import_config_to_env_var_defaults(yaml_string)

        config_dict.update(result_dict)

        # Assert
        assert os.environ['TEST'] == 'New Value'
        assert config_dict['TEST'] == 'New Value'

    def test_import_config_flattens_indented_yaml_correctly(self):
        yaml_string = "\n".join([
            '---',
            '- TEST:',
            '    ITEM: Value1',
            '    OTHER: Value2'])

        # Act
        result_dict = cl.import_config_to_env_var_defaults(yaml_string)

        # Assert
        assert result_dict['TEST_ITEM'] == 'Value1'
        assert result_dict['TEST_OTHER'] == 'Value2'

    def test_import_config_flattens_dashed_yaml_correctly(self):
        yaml_string = "\n".join([
            '---',
            '- TEST:',
            '  - ITEM: Value1',
            '  - OTHER: Value2'])

        # Act
        result_dict = cl.import_config_to_env_var_defaults(yaml_string)

        # Assert
        assert result_dict['TEST_ITEM'] == 'Value1'
        assert result_dict['TEST_OTHER'] == 'Value2'

    def test_import_config_flattens_list_of_dict_yaml_correctly(self):
        yaml_string = "\n".join([
            '---',
            '- TEST:',
            '    ITEM: ',
            '      - OTHER: Value'])

        result_dict = cl.import_config_to_env_var_defaults(yaml_string)

        # Assert
        assert result_dict['TEST_ITEM_OTHER'] == 'Value'

    def test_import_config_flattened_list_has_list_or_dict_value(self):
        yaml_string = "\n".join([
            '---',
            '- TEST:',
            '    ITEM: ',
            '      - Value1',
            '      - Value2'])

        # Act
        result_dict = cl.import_config_to_env_var_defaults(yaml_string)

        # Assert
        assert 'TEST_ITEM' not in os.environ
        assert 'TEST_ITEM' in result_dict

    def test_import_encrypted_config_loaded_properly(self):

        yaml_string = "\n".join([
            "---",
            "- TEST: Value"
        ])

        result_dict = cl.import_config_to_env_var_defaults(yaml_string)

        # Encrypt Config
        encrypted_string = eh.encrypt_string(ENCRYPTION_KEY, yaml_string)

        result_dict = cl.import_config_to_env_var_defaults(
            encrypted_string,
            encryption_key=ENCRYPTION_KEY)

        assert os.environ['TEST'] == 'Value'
        assert result_dict['TEST'] == 'Value'
