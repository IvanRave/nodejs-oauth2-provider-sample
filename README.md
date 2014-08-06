# NodeJs OAuth2 system (examples)

## Links

1. OAuth2 client: https://github.com/IvanRave/nodejs-oauth2-client-sample
2. Authorize dialog: /dialog/authorize
3. Exchange a confirmation code to an access token: /dialog/token

## Register a client in the provider

Create a web client, where you want to use this authentication. See example of a client in [link1].

Get client id from the provider. Contact with administration of the provider to register your application. Client parameters: ```client_id```, ```redirect_uri```

## Process of authentication and authorization

1. Redirect your users (or open a popup window) to the special page [link2] of the provider with next query params:
  - client\_id = ```APP_CLIENT_ID```
  - redirect\_uri = ```APP_REDIRECT_URI```
  - response_type = code
2. If all parameters are valid, the user will be redirected to the login/register page.
3. After successful login, the user will be redirected to the ```APP_REDIRECT_URI``` with one parameter in url: ```code```
4. Get this code from url of a page and use it to exchange to the access\_token

## Excange a confi
