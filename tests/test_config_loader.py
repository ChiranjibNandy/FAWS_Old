import os
import unittest
import tempfile
import mock
import StringIO

from opdash import config_loader as cl
from opdash import encryption_helper as eh

ENCRYPTION_KEY = '1234567890abcdef'


class ConfigLoaderTests(unittest.TestCase):
    def setUp(self):
        self.config_fd, self.config_fd_name = tempfile.mkstemp()

    def tearDown(self):
        os.close(self.config_fd)
        os.unlink(self.config_fd_name)

    def test_import_config_missing_file_fails_with_IOError(self):
        self.assertRaises(
            IOError, cl.import_config_to_env_var_defaults, 'missing.yml')

    @staticmethod
    def test_import_config_missing_file_with_silent_true_succeeds():
        cl.import_config_to_env_var_defaults('missing.yml', silent=True)

    def test_import_config_simple_file_loaded_properly(self):
        # Arrange
        with open(self.config_fd_name, 'w') as target:
            # I'm not sure why but this doesn't include new lines...
            target.write('\n'.join(['---', '- TEST: Value']))

        # Act
        cl.import_config_to_env_var_defaults(self.config_fd_name)

        # Assert
        assert os.environ['TEST'] == 'Value'
        assert cl.config['TEST'] == 'Value'

    def test_import_config_simple_file_overrides_existing_environ(self):
        # Arrange
        os.environ['TEST'] = 'Doomed Value'
        cl.config['TEST'] = 'Doomed Value'
        with open(self.config_fd_name, 'w') as target:
            # I'm not sure why but this doesn't include new lines...
            target.write('\n'.join(['---', '- TEST: Value']))

        # Act
        cl.import_config_to_env_var_defaults(self.config_fd_name)

        # Assert
        assert os.environ['TEST'] == 'Value'
        assert cl.config['TEST'] == 'Value'

    def test_import_config_flattens_indented_yaml_correctly(self):
        # Arrange
        with open(self.config_fd_name, 'w') as target:
            # I'm not sure why but this doesn't include new lines...
            target.write('\n'.join(['---',
                                    '- TEST:',
                                    '    ITEM: Value1',
                                    '    OTHER: Value2']
                                   ))

        # Act
        cl.import_config_to_env_var_defaults(self.config_fd_name)

        # Assert
        assert cl.config['TEST_ITEM'] == 'Value1'
        assert cl.config['TEST_OTHER'] == 'Value2'

    def test_import_config_flattens_dashed_yaml_correctly(self):
        # Arrange
        with open(self.config_fd_name, 'w') as target:
            # I'm not sure why but this doesn't include new lines...
            target.write('\n'.join(['---',
                                    '- TEST:',
                                    '  - ITEM: Value1',
                                    '  - OTHER: Value2']
                                   ))

        # Act
        cl.import_config_to_env_var_defaults(self.config_fd_name)

        # Assert
        assert cl.config['TEST_ITEM'] == 'Value1'
        assert cl.config['TEST_OTHER'] == 'Value2'

    def test_import_config_flattens_list_of_dict_yaml_correctly(self):
        # Arrange
        with open(self.config_fd_name, 'w') as target:
            # I'm not sure why but this doesn't include new lines...
            target.write('\n'.join(['---',
                                    '- TEST:',
                                    '    ITEM: ',
                                    '      - OTHER: Value']
                                   ))

        # Act
        cl.import_config_to_env_var_defaults(self.config_fd_name)

        # Assert
        assert cl.config['TEST_ITEM_OTHER'] == 'Value'

    def test_import_config_flattened_list_has_list_or_dict_value(self):
        # Arrange
        with open(self.config_fd_name, 'w') as target:
            # I'm not sure why but this doesn't include new lines...
            target.write('\n'.join(['---',
                                    '- TEST:',
                                    '    ITEM: ',
                                    '      - Value1',
                                    '      - Value2']
                                   ))

        # Act
        cl.import_config_to_env_var_defaults(self.config_fd_name)

        # Assert
        assert 'TEST_ITEM' not in os.environ
        assert 'TEST_ITEM' in cl.config

    def test_import_encrypted_config_loaded_properly(self):
        # Arrange
        os.environ['ENCRYPTION_CONFIG_LOCAL_KEY'] = 'DECRYPT_KEY'
        os.environ['DECRYPT_KEY'] = ENCRYPTION_KEY
        with open(self.config_fd_name, 'w') as target:
            # I'm not sure why but this doesn't include new lines...
            target.write('\n'.join(['---', '- TEST: Value']))
        eh.encrypt_file(ENCRYPTION_KEY, self.config_fd_name)
        encrypted_file = self.config_fd_name + eh.OUTPUT_FILE_DEFAULT_SUFFIX

        # Act
        cl.import_config_to_env_var_defaults(encrypted_file)

        # Assert
        assert os.environ['TEST'] == 'Value'

    @mock.patch('opdash.config_loader.boto3.client')
    def test_import_self_encrypted_S3_config_loaded_properly(
            self, mock_client):
        # Arrange
        os.environ['ENCRYPTION_CONFIG_LOCAL_KEY'] = 'DECRYPT_KEY'
        os.environ['DECRYPT_KEY'] = ENCRYPTION_KEY
        encrypted_data = eh.encrypt_string(
            ENCRYPTION_KEY,
            '\n'.join(['---', '- TEST: Value'])
        )
        mock_client.return_value = mock.MagicMock(
            get_object=mock.MagicMock(
                return_value={
                    'Body': StringIO.StringIO(encrypted_data)
                }
            )
        )

        # Act
        cl.import_config_to_env_var_defaults(
            'https://s3.amazonaws.com/foo/bar.yml')

        # Assert
        assert os.environ['TEST'] == 'Value'

    @mock.patch('opdash.config_loader.boto3.client')
    def test_import_aws_encrypted_S3_config_loaded_properly(
            self, mock_client):
        # Arrange
        os.environ['ENCRYPTION_CONFIG_LOCAL_KEY'] = 'DECRYPT_KEY'
        os.environ['DECRYPT_KEY'] = ENCRYPTION_KEY
        data = '\n'.join(['---', '- TEST: Value'])

        mock_client.return_value = mock.MagicMock(
            get_object=mock.MagicMock(
                return_value={
                    'ServerSideEncryption': 'BLAH',
                    'Body': StringIO.StringIO(data)
                }
            )
        )

        # Act
        cl.import_config_to_env_var_defaults(
            'https://s3.amazonaws.com/foo/bar.yml')

        # Assert
        assert os.environ['TEST'] == 'Value'
