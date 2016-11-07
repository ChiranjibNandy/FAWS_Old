#!/usr/bin/env python

from pip.download import PipSession
from pip.req import parse_requirements
from setuptools import setup, find_packages

# reqs is a list of requirement
# e.g. ['django==1.5.1', 'mezzanine==1.4.6']
install_reqs = [str(ir.req) for ir in
                parse_requirements('requirements.txt', session=PipSession())]

setup(
    name='opdash-cp',
    author="Rackspace",
    description='Control Panel for Rackspace Operational Dashboard',
    url='https://github.rackspace.com/FAWS-Migration/opdash-cp',
    version='1.0.0',
    packages=find_packages(),
    include_package_data=True,
    package_dir={'opdash-cp': 'opdash-cp'},
    install_requires=install_reqs,
)
