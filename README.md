# NodeJs OAuth2 system (examples)

## Links

1. OAuth2 client: https://github.com/IvanRave/nodejs-oauth2-client-sample
2. Authorize dialog: /dialog/authorize
3. Exchange a confirmation code to an access token: /dialog/token

## Register a client in the provider

Create a web client, where you want to use this authentication. See example of a client in [link1].

Get client id from the provider. Contact with administration of the provider to register your application. Client parameters: ```client_id```, ```redirect_uri```

## Get a confirmation code (authentication)

1. Redirect your users (or open a popup window) to the special page [link2] of the provider with next query params:
  - client\_id = ```APP_CLIENT_ID```
  - redirect\_uri = ```APP_REDIRECT_URI```
  - response_type = code
2. If all parameters are valid, the user will be redirected to the login/register page.
3. After successful login, the user will be redirected to the ```APP_REDIRECT_URI``` with one parameter in url: ```code```
4. Get this confirmation code from url of a page and use it to exchange to an access\_token

## Exchange a confirmation code to an access token

For exchanging you must have a ```client_secret``` code

If you develop a JavaScript application without server side or a mobile application with non-secured server side (installed application), you can't store secret codes.
In this case, you can use some side web server to keep this ```client_secret``` and get ```access_token``` from the provider.
```access_token``` allows you to send requests to some API server, verified by provider. This API server can be used to store your ```client_secret``` and exchange your ```confirmation_code``` to ```access_token```:

1. Contact with administration of your API server to register your client.
2. See API docs for your API server to get method to exchange a ```confirmation_code``` to ```access_token```
3. Use received ```access_token``` to send requests to your API server
