import os
import json

import boto3

from jinja2 import Environment, FileSystemLoader


class EcsTask(object):
    """An ECS task is an instance of a Docker container running in a cluster.

    Tasks are defined as the Docker image, the resource constraints, network
    port bindings, the IAM role the container should run as, logging configs,
    amongst other things.

    The default expectation of this class is for a directory called "ecs"
    to exist in the current directory containing Jinja2 templates of a JSON
    formatted AWS task definition.
    """

    def __init__(self, task_name, tag, env_vars=None, tpl_dir=None):
        self.ecs = boto3.client('ecs')
        self.ecr = boto3.client('ecr')
        self.iam = boto3.resource('iam')
        self.env = self._get_env()
        self.role = self._get_iam_role()
        self.repo = self._get_repository()
        self.task_name = task_name
        self.tag = tag
        self.env_vars = env_vars
        if tpl_dir:
            self.tpl_dir = os.path.abspath(tpl_dir)
        else:
            self.tpl_dir = os.path.abspath('%s/ecs' % os.getcwd())

    def _get_env(self):
        env = os.environ.get('ENVIRONMENT', None)  # defined if on EB / EC2
        if env is None:
            env = os.environ.get('ENV', None)  # may be defined if local
        if env is None:
            env = 'local'  # default local configuration

        return env

    def _get_iam_role(self):
        role = self.iam.Role('%s-app' % self.env)
        return role.arn

    def _get_repository(self):
        repos = self.ecr.describe_repositories()
        for repo in repos['repositories']:
            if repo['repositoryName'] == self.env:
                return repo['repositoryUri']

    def __call__(self):
        jinja_env = Environment(loader=FileSystemLoader(self.tpl_dir))
        template = jinja_env.get_template('%s.json.j2' % self.task_name)
        rendered = template.render(env_vars=self.env_vars, repo=self.repo,
                                   tag=self.tag, env=self.env,
                                   aws_region=os.environ['AWS_DEFAULT_REGION'])
        container_def = json.loads(rendered)
        response = self.ecs.register_task_definition(
            family='%s-%s' % (self.task_name, self.env),
            taskRoleArn=self.role,
            containerDefinitions=container_def)

        task_arn = response['taskDefinition']['taskDefinitionArn']
        print('Created Task Definition %s' % task_arn)
        return task_arn
