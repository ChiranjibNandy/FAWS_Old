#!/usr/bin/env python
import opdash.server

# This is a stub to see if beanstalk can build the app and display it
# correctly
application, context = opdash.server.build_app()

if __name__ == '__main__':
    opdash.server.main(application, context)
