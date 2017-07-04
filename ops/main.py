import argparse
import os
import sys
import subprocess

# from migrator_common.ops.container import Container
# from migrator_common.ops.ecs_task import EcsTask
# from migrator_common.ops.ecs_service import EcsService
from container import Container
from ecs_service import EcsService
from ecs_task import EcsTask


LOCAL_PROMOTE_REPONAME = 'opdash-api-ops-promotable'


class Operator(object):

    def __init__(self):
        self.env = self._get_env()

    def _get_env(self):
        env = os.environ.get('ENVIRONMENT', None)  # defined if on EB / EC2
        if env is None:
            env = os.environ.get('ENV', None)  # may be defined if local
        if env is None:
            env = 'local'  # default local configuration

        return env

    def _get_tag(self):
        tag = os.environ.get('RELEASE', None)
        if tag:
            return tag

        tag = subprocess.check_output([
            'git', 'rev-parse', '--short', 'HEAD'
        ])
        tag = tag.replace('_', '-').strip()
        return tag

    def release(self):
        container = Container()
        container()
        print('Done')

    def deploy(self):
        tag = self._get_tag()

        env_vars = {}
        env_vars['ENVIRONMENT'] = self.env
        env_vars['OPDASH_CP_CONFIG'] = os.environ.get(
            'OPDASH_CP_CONFIG',
            'https://s3.amazonaws.com/rackspace_faws_mt_%s_configs/'
            'opdash-cp.config.yml' % self.env)
        cp_task = EcsTask('opdash-cp', tag, env_vars)
        cp_arn = cp_task()
        cp_svc = EcsService(self.env, 'opdash-cp', cp_arn, port=5000)
        cp_svc()
        print('Done')

    def promote_pull(self):
        container = Container()
        repo = container.registry()
        tag = container.tag()
        token = container.login(repo)

        container.pull(token, repo, tag)

        # retag the image to avoid needing to discover the repositoryUri
        # of another account during the push
        src_tag = '%s:%s' % (repo['repositoryUri'], tag)
        dst_tag = '%s:%s' % (LOCAL_PROMOTE_REPONAME, tag)
        container.retag(src_tag, dst_tag)
        print('Tagged %s' % dst_tag)
        print('Done')

    def promote_push(self):
        container = Container()
        repo = container.registry()
        tag = container.tag()
        token = container.login(repo)

        # retag the image to match the destination repository
        src_tag = '%s:%s' % (LOCAL_PROMOTE_REPONAME, tag)
        dst_tag = '%s:%s' % (repo['repositoryUri'], tag)
        container.retag(src_tag, dst_tag)
        print('Tagged %s' % dst_tag)

        container.push(token, repo, tag)
        print('Done')

    def show_latest_release(self):
        ecs = boto3.client('ecs')

def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('action')
    return parser.parse_args()


def main():
    args = get_args()
    ops = Operator()
    action = getattr(ops, args.action)
    code = action()
    print('Exiting with %s' % code)
    sys.exit(code)


if __name__ == '__main__':
    main()
