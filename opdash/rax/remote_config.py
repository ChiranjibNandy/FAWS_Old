import boto3
import botocore.config
import logging

from urlparse import urlparse

LOG = logging.getLogger(__name__)


class RemoteConfig(object):

    def __init__(self, aws_access_key_id=None, aws_secret_access_key=None):

        self._s3_client = None
        self._aws_access_key_id = aws_access_key_id
        self._aws_secret_access_key = aws_secret_access_key

    def _get_s3_client(self):
        try:
            if self._s3_client is None:
                self._s3_client = boto3.client(
                    's3',
                    config=botocore.config.Config(signature_version='s3v4'),
                    aws_access_key_id=self._aws_access_key_id,
                    aws_secret_access_key=self._aws_secret_access_key)
            return self._s3_client
        except:
            LOG.debug("Unable to create Boto3 client to S3.")
            raise

    def _load_from_stream(self, stream_obj):
        return stream_obj.read()

    def _load_from_s3(self, bucket, key):
        s3_client = self._get_s3_client()
        result = None
        try:
            resp = s3_client.get_object(Bucket=bucket, Key=key)
            if resp.get("Body", None):
                result = self._load_from_stream(resp['Body'])
        except:
            LOG.debug(
                "Error loading from S3. Bucket:{0} -- Key:{1}".format(
                    bucket, key))
            raise
        return result

    def _load_from_file(self, file_path):
        result = None
        try:
            with open(file_path, 'r') as f:
                result = self._load_from_stream(f)
        except:
            LOG.debug(
                "Error while loading from file. Path:{0}".format(
                    file_path))
            raise
        return result

    def load(self, url_or_path):
        '''
            Loads a text file from a url or file path
            path parameter accepts either an S3 URL, or a file path:
            Example S3 URL:
            https://s3.amazonaws.com/rax-bucket-here/path/to/file.txt
            Example File Path:
            /my/local-config/file.txt
        '''
        result = None

        parsed = urlparse(url_or_path)

        if parsed.scheme == "":
            # path is a file path, so load from file
            result = self._load_from_file(url_or_path)
        else:
            # path is URL, so load from S3
            split_path = parsed.path.split("/")
            bucket = split_path[1]
            key = "/".join(split_path[2:])
            result = self._load_from_s3(bucket, key)

        return result
