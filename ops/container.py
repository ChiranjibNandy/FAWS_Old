import base64
import os
import subprocess
import sys

import boto3
import docker


class Container(object):

    def __init__(self):
        self.ecr = boto3.client('ecr')
        self.client = docker.from_env()
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

        for line in result:
            print(line)

    def __call__(self):
        repo = self.registry()
        tag = self.tag()
        token = self.login(repo)
        rc = self.build('%s:%s' % (repo['repositoryUri'], tag))
        if rc != 0:
            print("Failed to build docker image.  No soup for you!")
            sys.exit(rc)

        self.push(token, repo, tag)
