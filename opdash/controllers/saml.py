from flask import make_response
from opdash.controllers.base import SamlBlueprint

mod = SamlBlueprint('saml', __name__)


# Endpoint that receives the Authenication Response from the IdP
@mod.route('/acs', methods=['POST'])
def acs():
    '''
        This endpoint is called by Astra after the user has been
        authenticated. We then create a session for the user and
        return a redirect to the user's browser to go to the
        correct page on our site.
    '''
    return mod.SAML_process_authentication_response()


@mod.route('/slo', methods=['GET'])
@mod.route('/logout', methods=['GET'])
def front_channel_logout():
    '''
        Logout Endpoint That Sends Logout from CP to Astra
    '''
    return mod.SAML_send_logout_request()


@mod.route('/sls', methods=['POST'])
def back_channel_logout():

    '''
        Endpoint that receives back channel logout from Astra (POST)
    '''
    # To test: login to the CP,
    # navigate to https://login.rackspace.com/slo/v2/
    #             mock_logout_request?issuer=<full url of your issuer>
    # post the resulting XML to this endpoint

    return mod.SAML_process_logout_request()


@mod.route('/sls', methods=['GET'])
def get_logout():
    '''
        Endpoint that processes logout GET response from Astra
        This confirms the logout was successful.
    '''
    return mod.SAML_process_authentication_logout()


# Endpoint that creates CP Metadata
@mod.route('/metadata/')
def saml_metadata():

    settings = mod.saml_auth.get_settings()
    metadata = settings.get_sp_metadata()
    errors = settings.validate_metadata(metadata)

    if len(errors) == 0:
        resp = make_response(metadata, 200)
        resp.headers['Content-Type'] = 'text/xml'
    else:
        resp = make_response(', '.join(errors), 500)
    return resp
