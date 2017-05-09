##
##    Cloud Migration Control Panel -- DEVELOPMENT ENVIRONMENT
##

##
#
# To Run This File you must first build it:
# sudo docker build -t opdash .
#
# Then you must run it:
# sudo docker run -v $(pwd)/opdash:/var/www/opdash/opdash -ti -p 5000:5000 opdash
#
# You can then verify it it up at:
# http://0.0.0.0:5000/health
#
##

FROM ubuntu:16.04
MAINTAINER Jay Baugh <jay.baugh@rackspace.com>

RUN apt-get -qq update && \
	apt-get -qq upgrade && \
	apt-get -qqy install \
		libpython-dev \
		python-dev \
		python-pip \
		libffi-dev \
		libssl-dev

# Update pip
RUN pip install -U pip
RUN pip install -U setuptools

# SAML
RUN apt-get -qqy install \
		libxml2-dev \
		libxmlsec1-dev

RUN pip install -U dm.xmlsec.binding

COPY . /opdash

WORKDIR /opdash

RUN pip install -e .

# Open Port (you must also open it when you run with -p 5000:5000)
EXPOSE 5000

# Use this entrypoint if you want to go to a bash shell
#ENTRYPOINT ["/bin/bash"]

# Use this entrypoint if you want to run the server
ENTRYPOINT ["python","/opdash/application.py"]
