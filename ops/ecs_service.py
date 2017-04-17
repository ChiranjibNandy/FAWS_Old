import os

import boto3


class EcsService(object):
    """ECS Service is a definition for deploying and managing ECS tasks.

    A service takes a task definition and runs a desired number of instances of
    those tasks on an ECS cluster. If an ALB is associated with the service,
    the service will handle registering tasks to the ALB target group when new
    tasks are started, and draining connections from the tasks before stopping
    them when the service has been updated with a new task definition.

    The naming assumptions in this class are based on naming conventions
    defined in the migrator-infrastructure Terraform configs.
    """

    def __init__(self, cluster, svc_name, task, desired_count=2, port=None):
        self.ecs = boto3.client('ecs')
        self.alb = boto3.client('elbv2')
        self.iam = boto3.resource('iam')
        self.env = self._get_env()
        self.cluster = cluster
        self.service_name = svc_name
        self.desired_count = desired_count
        self.task = task
        self.port = port
        self.alb_tg = self._find_alb_tg()

    def _get_env(self):
        env = os.environ.get('ENVIRONMENT', None)  # defined if on EB / EC2
        if env is None:
            env = os.environ.get('ENV', None)  # may be defined if local
        if env is None:
            env = 'local'  # default local configuration

        return env

    def _find_service(self, next_token=None):
        if next_token:
            list_response = self.ecs.list_services(cluster=self.cluster,
                                                   nextToken=next_token)
        else:
            list_response = self.ecs.list_services(cluster=self.cluster)

        service_arns = list_response.get('serviceArns', None)
        next_token = list_response.get('nextToken', None)
        if next_token == 'null':
            next_token = None

        service = None
        if len(service_arns) > 0:
            desc_response = self.ecs.describe_services(
                cluster=self.cluster,
                services=service_arns)

            services = desc_response['services']

            try:
                service = next((svc for svc in services
                                if svc['serviceName'] == self.service_name))
            except StopIteration:
                pass

            if service is None and next_token is not None:
                service = self._find_service(next_token)

        return service

    def _find_alb_tg(self, next_token=None):
        if next_token:
            tg_response = self.alb.describe_target_groups(Marker=next_token)
        else:
            tg_response = self.alb.describe_target_groups()

        target_groups = tg_response.get('TargetGroups', None)
        next_token = tg_response.get('NextMarker', None)

        tg_name = '%s-%s-tg' % (self.env, self.service_name)
        try:
            tg = next((tg for tg in target_groups
                       if tg['TargetGroupName'] == tg_name))
        except StopIteration:
            tg = None

        if tg is None and next_token is not None:
            tg = self._find_alb_tg(next_token)

        return tg

    def _get_iam_role(self):
        role = self.iam.Role('%s-ecs-cluster' % self.env)
        return role.arn

    def _create_service(self):
        if self.alb_tg:
            alb_def = [
                {
                    'targetGroupArn': self.alb_tg['TargetGroupArn'],
                    'containerName': self.service_name,
                    'containerPort': self.port
                }
            ]
            ecs_role = self._get_iam_role()

            self.ecs.create_service(
                cluster=self.cluster,
                serviceName=self.service_name,
                taskDefinition=self.task,
                loadBalancers=alb_def,
                desiredCount=self.desired_count,
                role=ecs_role,
                deploymentConfiguration={
                    'maximumPercent': 200,
                    'minimumHealthyPercent': 100
                })
        else:
            self.ecs.create_service(
                cluster=self.cluster,
                serviceName=self.service_name,
                taskDefinition=self.task,
                desiredCount=self.desired_count,
                deploymentConfiguration={
                    'maximumPercent': 200,
                    'minimumHealthyPercent': 100
                })

        print('Created Service %s with Task Definition %s' %
              (self.service_name, self.task))

    def _update_service(self):
        self.ecs.update_service(
            cluster=self.cluster,
            service=self.service_name,
            taskDefinition=self.task,
            desiredCount=self.desired_count)

        print('Updated Service %s with Task Definition %s' %
              (self.service_name, self.task))

    def __call__(self):
        service = self._find_service()
        if service:
            self._update_service()
        else:
            self._create_service()
