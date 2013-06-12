node-groupme
============

A GroupMe v3 API Module for NodeJS.
http://dev.groupme.com/docs/v3

This supports all 3 parts of the GroupMe API:

- The [Stateless API](http://dev.groupme.com/docs/v3)
- The [Push API](http://dev.groupme.com/tutorials/push), a Websocket-based message pushing service 
- The [Image Service API](http://dev.groupme.com/docs/image_service), for uploading images to messages

One use case of this library is [building bots](http://dev.groupme.com/tutorials/bots).

If you are using this library, feel free to shoot me an email with any questions! Niels Joubert <[njoubert@gmail.com](mailto:njoubert@gmail.com)>

## Getting Started

The GroupMe API is built upon the OAuth Implicit Autentication standard.
This means that once you have an access token for your application, you never have to reauthenticate or mess with usernames and passwords. The access token is bound to your specific username.

For this server-side library, we assume you're writing an app using your own account (aka on the server side). If you're writing an app that sits on a client, you have to go through an extra step to get that user's access token from your application's access token.

#### Step 1: Obtain an Access Token.

First, you register an application with GroupMe [here](http://dev.groupme.com/applications/new).

Once you've done this, you will have an access token string that you can now use to identify and authenticate yourself. You can copy this into your code directly:

    const ACCESS_TOKEN = "13a14310effe0130ee234ea2b99c2231";

If you want to act on the behalf of other users, you have to send them to your redirect url, also supplied by GroupMe. Once the user authenticates, they are routed back to your application with an access token for this user.

An example of this is beyond the scope of our introduction, but you can peruse [GroupMe's example](http://dev.groupme.com/) or the official RFC for [OAuth Implicit Grant](http://tools.ietf.org/html/rfc6749#section-4.2).

#### Step 2: Get access to the stateless API

    var API = require('groupme').Stateless

#### Step 3: Getting and posting data with the stateless API, using your Access Token
    
    API.Users.me(ACCESS_TOKEN, function(err,ret) {
      if (!err) {
        console.log("Your user id is", ret.id, "and your name is", ret.name);        
      }
    });

## Examples

Examples live in the `/example` directory.

*Examples require that you pass it an Access Token as a command line argument*

#### HelloWorld

This example simply requests your username and user id, and prints out the groups you belong to.

    node HelloWorld.js <ACCESS_TOKEN>
    
#### HelloBot

This example uses the IncomingStream API to monitor for a message containing the words "@BOT", and replies to that with a canned message.

    node HelloBot.js <ACCESS_TOKEN>

#### Promises

Shows how to use the fantastic [Q promise library](http://documentup.com/kriskowal/q/) to wrap all the callback-based Stateless API functions and create a promise-based library.

First, we patch all the functions in the stateless API to have a .Q function hanging off it:

    var API = require('../../index').Stateless;
    var Q   = require('Q');

    var qfunc = function() {
        var args = Array.prototype.slice.call(arguments);
        return Q.nfapply(this, args);
    }

    for (g in API) {
        for (f in API[g]) {
            API[g][f].Q = qfunc;
        }
    }

Now, we can use these functions to generate promises:

    API.Users.me.Q(ACCESS_TOKEN)
        .then(function(da) { 
            return API.Groups.index.Q(ACCESS_TOKEN); 
        }).then(function(da) {
            console.log(da);
        });



## Development

I welcome pull requests, emails, bug reports and the like. 

That being said, this is not my full-time job. If you are using this as part of yours and want to take over as lead developer we can have that discussion.


## API Documentation

The code itself is fairly terse and well-commented, and is the best place to go for the full API, but here we stub out all the functionality for quick reference. 

### Stateless

Include it as follows: `var api = require('groupme').Stateless;`

Callbacks follow the node.js standard: `function callback(error, data) {};`. If no error occurs, the `error` parameter is `null`.

`Opts` are always optional, except for `api.Messages.create`, and consists of a JSON object.

#### Groups


* `api.Groups.index(access_token, callback)` List the authenticated user's active groups.
* `api.Groups.former(access_token, callback)` List they groups you have left but can rejoin.
* `api.Groups.show(access_token, group_id, callback)` Load a specific group.
* `api.Groups.create(access_token, opts, callback)` Create a new group. 
    * Opts consists of `{name:,description:,mage_url:,share:}`
* `api.Groups.update(access_token, group_id, opts, callback)` Update a group after creation. 
    * Opts consists of `{name:,description:,mage_url:,share:}`
* `api.Groups.destroy(access_token, group_id, callback)` Disband a group. This action is only available to the group creator.


#### Members

* `api.Members.add(access_token, group_id, opts, callback)` Add members to a group.
    * Opts consists of `{members: [{nickname:, user_id:, phone_number:, email: }, ...]}`
* `api.Members.results(access_token, group_id, results_id, callback)` Get the membership results from an add call.


#### Messages

* `api.Messages.index(access_token, group_id, opts, callback)` Get messages for a group
    * Opts consists of `{before_id:}` or `{after_id:}`
* `api.Messages.create(access_token, group_id, opts, callback)`
    * Opts here are required, and consists of `{message:{source_guid:, text:, attachments: [{type:"image", url:}, {type:"location", name:, lat, lng}, {type:"split", token:}, {type:"emoji", placeholder:, charmap:}]}}`


#### Likes


* `api.Likes.create(access_token, group_id, message_id, callback)` Like a message.
* `api.Likes.destroy(access_token, group_id, message_id, callback)` Unlike a liked message.

#### Bots

* `api.Bots.create(access_token, name, group_id, opts, callback)` Create a bot. Associated with a specific name and group.
    * Opts consists of `{avatar_url:, callback_url:}`
* `api.Bots.post(access_token, bot_id, text, opts, callback)` Post a message as a bot.
    * Opts cosists of `{picture_url:}`
* `api.Bots.index(access_token, callback)` List bots you have created
* `api.Bots.destroy(access_token, bot_id, callback)` Remove a bot that you have created

#### Users

* `api.Users.me(access_token, callback)` Get details about the authenticated user

### IncomingStream

In Progress.

### ImageService

In Progress.



