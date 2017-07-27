import argparse
import os
import sys


from migration_ops.operator import Operator


class OpdashCPOperator(Operator):

    def __init__(self):
        super(OpdashCPOperator, self).__init__(project_name='opdash-cp')

    def deploy(self):
        tag = self._get_tag()

        env_vars = {}
        env_vars['ENVIRONMENT'] = self.env
        env_vars['OPDASH_CP_CONFIG'] = os.environ.get(
            'OPDASH_CP_CONFIG',
            'https://s3.amazonaws.com/rackspace_faws_mt_%s_configs/'
            'opdash-cp.config.yml' % self.env)

        print('Creating OpDash CP Tasks')
        print('========================')
        cp_arn = self._task('opdash-cp', tag, env_vars)

        print('\n')
        print('Updating OpDash CP Services')
        print('===========================')
        self._service(self.env, 'opdash-cp', cp_arn, port=5000)

        print('\nDone')
        return 0


def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('action')
    return parser.parse_args()


def main():
    args = get_args()
    ops = OpdashCPOperator()
    action = getattr(ops, args.action)
    code = action()
    print('Exiting with %s' % code)
    sys.exit(code)


if __name__ == '__main__':
    main()
