node-groupme
============

A GroupMe v3 API Module for NodeJS.
http://dev.groupme.com/docs/v3

This supports all 3parts of the GroupMe API:

- The [Stateless API](http://dev.groupme.com/docs/v3)
- The [Push API](http://dev.groupme.com/tutorials/push), a Websocket-based message pushing service 
- The [Image Service API](http://dev.groupme.com/docs/image_service), for uploading images to messages

One use case of this library is [building bots](http://dev.groupme.com/tutorials/bots).

## Getting Started

The GroupMe API is built upon the OAuth Implicit Autentication standard.
This means that once you have an access token for your application, you never have to reauthenticate or mess with usernames and passwords. The access token is bound to your specific username.

For this server-side library, we assume you're writing an app using your own account (aka on the server side). If you're writing an app that sits on a client, you have to go through an extra step to get that user's access token from your application's access token.

#### Step 1: Obtain an Access Token.

To obtain an Access Token, you create an application [here](http://dev.groupme.com/applications/new).

Once you've done this, you will have an access token string that you can now use to identify and authenticate your code.

    const ACCESS_TOKEN = "13a14310effe0130ee234ea2b99c2231";

#### Step 2: Create the stateless API with the given ACCESS_TOKEN

    var API = require('groupme')Stateless.makeAPI(ACCESS_TOKEN)

#### Step 3: Getting and posting data with the stateless API
    
    API.Users.me(function(err,ret) {
      if (!err) {
        console.log("Your user id is", ret.id, "and your name is", ret.name);        
      }
    });

## Examples

Currently we have two simple examples in the /example directory.

**Both Examples require that you fill your Access Code into the file**

#### HelloWorld

This example simply requests your username and 

#### HelloBot

This example uses the IncomingStream API to monitor for a message containing the words "@BOT", and replies to that with a canned message.

## Documentation

The code itself is fairly terse and well-commented, and naturally is the final 