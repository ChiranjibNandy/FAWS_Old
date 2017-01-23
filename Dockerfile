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
		libffi-dev \
		libssl-dev \
		python-dev \
		python-pip \
		python-setuptools \
		xmlsec1

# Update pip
RUN pip install -U pip

# Install Requirements
# Copy Requirements.txt file
ADD requirements.txt .
RUN pip install -r requirements.txt

# Create Application Directory Structure
RUN mkdir -p /var/www/opdash/opdash

# Copy Starting Python File to Container
COPY application.py /var/www/opdash/.

# Set the current directory
WORKDIR /var/www/opdash

# Open Port (you must also open it when you run with -p 5000:5000)
EXPOSE 5000

# Set Debug Environment
ENV UI_DEPLOY_ENVIRON='DockerConfig'

# Use this entrypoint if you want to go to a bash shell
#ENTRYPOINT ["/bin/bash"]

# Use this entrypoint if you want to run the server
ENTRYPOINT ["python","/var/www/opdash/application.py"]
