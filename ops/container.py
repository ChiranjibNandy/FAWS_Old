import base64
import os
import subprocess
import sys

import boto3
import docker


class Container(object):

    def __init__(self):
        self.ecr = boto3.client('ecr')
        self.client = docker.from_env(version='auto')
        self.env = self._get_env()
        self.repo_name = self.env

    def _get_env(self):
        env = os.environ.get('ENVIRONMENT', None)  # defined if on EB / EC2
        if env is None:
            env = os.environ.get('ENV', None)  # may be defined if local
        if env is None:
            env = 'local'  # default local configuration

        return env

    def registry(self):
        repos = self.ecr.describe_repositories()
        for repo in repos['repositories']:
            if repo['repositoryName'] == self.repo_name:
                return repo

    def login(self, repo):
        # get an auth token to our ECR image repository:
        resp = self.ecr.get_authorization_token(registryIds=[
            repo['registryId']
        ])
        auth = resp['authorizationData'][0]

        token = auth['authorizationToken']
        token = base64.b64decode(token)
        assert token.startswith("AWS:")
        token = token[4:]

        proxy_url = auth['proxyEndpoint']

        # use token info to login to the repo via docker:
        resp = self.client.login(username='AWS',
                                 password=token,
                                 email='codemonkey@rackspace.com',
                                 registry=proxy_url,
                                 reauth=True)
        assert resp['Status'] == 'Login Succeeded'
        return token

    def tag(self):
        tag = os.environ.get('RELEASE', None)
        if tag:
            return tag

        tag = subprocess.check_output([
            'git', 'rev-parse', '--short', 'HEAD'
        ])
        tag = tag.replace('_', '-').strip()
        return tag

    def build_api(self, tag=None, **kw):
        if 'path' not in kw:
            here = os.path.dirname(os.path.abspath(__file__))
            kw['path'] = os.path.normpath(os.path.join(here, '..'))

        self.client.images.build(**kw)

    def build(self, tag):
        cmd = [
            'docker', 'build', '-t', tag, '.'
        ]

        return subprocess.call(cmd)

    def retag(self, src_tag, dst_tag):
        cmd = [
            'docker', 'tag', '-f', src_tag, dst_tag
        ]

        rc = subprocess.call(cmd)
        if rc != 0:
            print("Failed to tag docker image")
            sys.exit(rc)
        return rc

    def push(self, token, repo, tag):
        print('Pushing: %s' % tag)
        result = self.client.images.push(
            repo['repositoryUri'],
            tag=tag,
            auth_config={
                'username': 'AWS',
                'password': token,
            },
            stream=True
        )
        self.consume_stream(result)

    def pull(self, token, repo, tag):
        result = self.client.api.pull(
            repo['repositoryUri'],
            tag=tag,
            auth_config={
                'username': 'AWS',
                'password': token,
            },
            stream=True,
        )
        self.consume_stream(result)

    @classmethod
    def consume_stream(cls, stream):
        errors = []
        for line in stream:
            print line

            # dockerpy does not raise when there's an error message returned
            # during a push/pull. this is a workaround to get a non-zero exit
            # code (on jenkins) if the operation actually failed.
            if 'error' in line:
                errors.append(line)

        if errors:
            msg = "ERROR: docker server returned errors:\n" + "\n".join(errors)
            raise Exception(msg)

    def __call__(self):
        repo = self.registry()
        tag = self.tag()
        token = self.login(repo)
        rc = self.build('%s:%s' % (repo['repositoryUri'], tag))
        if rc != 0:
            print("Failed to build docker image.  No soup for you!")
            sys.exit(rc)

        self.push(token, repo, tag)
