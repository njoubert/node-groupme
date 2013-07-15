node-groupme
============

A [GroupMe v3 API](http://dev.groupme.com/docs/v3) Module for NodeJS.

Available from NPM: `npm install groupme`
https://npmjs.org/package/groupme

For known issues, see ISSUES.md file.

This supports all 3 parts of the GroupMe API:

- The [Stateless API](http://dev.groupme.com/docs/v3)
- The [Push API](http://dev.groupme.com/tutorials/push), a Websocket-based message pushing service 
- The [Image Service API](http://dev.groupme.com/docs/image_service), for uploading images to messages

One use case of this library is [building bots](http://dev.groupme.com/tutorials/bots).

If you are using this library, feel free to shoot me an email with any questions! Niels Joubert [njoubert@gmail.com](mailto:njoubert@gmail.com)

## Getting Started

The GroupMe API is built upon the OAuth Implicit Autentication standard.
This means that once you have an access token for your application, you never have to reauthenticate or mess with usernames and passwords. The access token is bound to your specific username.

For this server-side library, we assume you're writing an app using your own account (aka on the server side). If you're writing an app that sits on a client, you have to go through an extra step to get that user's access token from your application's access token.

#### Step 1: Obtain an Access Token.

First, you register an application with GroupMe [here](http://dev.groupme.com/applications/new).

Once you've done this, you will have an access token string that you can now use to identify and authenticate yourself. You can copy this into your code directly:

```javascript
const ACCESS_TOKEN = "13a14310effe0130ee234ea2b99c2231";
```

If you want to act on the behalf of other users, you have to send them to your redirect url, also supplied by GroupMe. Once the user authenticates, they are routed back to your application with an access token for this user.

An example of this is beyond the scope of our introduction, but you can peruse [GroupMe's example](http://dev.groupme.com/) or the official RFC for [OAuth Implicit Grant](http://tools.ietf.org/html/rfc6749#section-4.2).

#### Step 2: Get access to the stateless API

```javascript
var API = require('groupme').Stateless
```

#### Step 3: Getting and posting data with the stateless API, using your Access Token

```javascript    
API.Users.me(ACCESS_TOKEN, function(err,ret) {
  if (!err) {
    console.log("Your user id is", ret.id, "and your name is", ret.name);        
  }
});
```
## Using the Command Line Inteface to GroupMe

A simple CLI interface to the GroupMe API is one of the examples. This is useful to prototype and test, since all the commands print out the raw JSON returned from GroupMe. See it in /examples/CommandLineInterface.  Simply run:

```javascript
npm install .
node cli.js --help
```

This depends on the excellent commander.js for command line option parsing.


## Examples

Examples live in the `/example` directory.

*Examples require that you pass it an Access Token as a command line argument*

#### HelloWorld

This example simply requests your username and user id, and prints out the groups you belong to.

```javascript
node HelloWorld.js <ACCESS_TOKEN>
```
#### HelloBot

This example uses the IncomingStream API to monitor for a message containing the words "@BOT", and replies to that with a canned message.

Step 1: Get info about your account, groups and bots

```javascript
node HelloBot.js <ACCESS_TOKEN>
```

Step 2: Register a bot with GroupMe

```javascript
node HelloBot.js <ACCESS_TOKEN> <USER_ID> <GROUP_ID> <BOT_NAME>
```

Step 3: Start the bot to listen for messages coming in, replying to the group it is registerd on

```javascript
node HelloBot.js <ACCESS_TOKEN> <USER_ID> <BOT_ID>
```
#### PictureText

This example uploads an image to GroupMe's ImageService, which is then used to send a picture message.

It also demonstrates using EventEmitters to turn callback-based APIs into event-based APIs, a useful and alternative way to fight callback bloat.

You can use it to just upload an image:

```javascript
node PictureText.js <ACCESS_TOKEN> <IMAGE_PATH>
```

Or you can use it to upload an image and post it as a message to a group:

```javascript
node PictureText.js <ACCESS_TOKEN> <IMAGE_PATH> <GROUP_ID>
```

#### Command Line Interface.

This lets you query the stateless API from the command line.

```
node cli.js --help

  Usage: cli.js [options] [command]

  Commands:

    Groups.index           List the authenticated user's active groups.
    Groups.former          List they groups you have left but can rejoin.
    Groups.show            List a specific group.
    Groups.create          Create a new group.
    Groups.update          Update a group after creation.
    Groups.destroy         Disband a group. This action is only available to the group creator.
    Members.add            Add members to a group.
    Members.results        Get the membership results from an add call.
    Messages.index         Messages for a group. Return 20, can request before_id or after_id.
    Messages.create        Send a message to a group.
    Likes.create           Like a message.
    Likes.destroy          Unlike a liked message.
    Bots.create            Create a bot.
    Bots.post              Post a message as a bot
    Bots.index             List bots you have created
    Bots.destroy           Remove a bot that you have created
    Users.me               Get details about the authenticated user.

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -a, --authtoken <token>  Set the auth token to use
    -g, --group_id <id>      The group_id to use
    -r, --results_id <id>    The results_id to use
    -m, --message_id <id>    The message_id to use
    -b, --bot_id <id>        The message_id to use
    -n, --name <string>      The bot name to use
    -t, --text <string>      The text to use for a bot message. Be sure to quote it!
    -o, --opts <JSON>        supply a json object as options. Be sure to wrap it in double-quotes!
```

Example: Creating a bot

```
node cli.js -a <ACCESSTOKEN> Bots.create --name "My Bot" --group_id <GROUPID>
```

Example: Creating a group

```
node cli.js -a 02f19310adac0130ac394ea6b36c8247 Groups.create -o '{"name":"testing","description":"bookashala"}' 
```

#### Promises

```javascript
node Promises.js <ACCESS_TOKEN>
```

This prints out your group info, and shows how an error is handles.

Shows how to use the fantastic [Q promise library](http://documentup.com/kriskowal/q/) to wrap all the callback-based Stateless API functions and create a promise-based library.

All the functions in the stateless API is patched to have a .Q function hanging off it. We can use these functions to generate promises:

```javascript
API.Users.me.Q(ACCESS_TOKEN)
    .then(function(da) { 
        return API.Groups.index.Q(ACCESS_TOKEN); 
    }).then(function(da) {
        console.log(da);
    });
```



## Development

I welcome pull requests, emails, bug reports and the like. 

That being said, this is not my full-time job. If you are using this as part of yours and want to take over as lead developer we can have that discussion.


## Testing

Tests live in the `/test` directory. To run them, simply type: `node test.js ACCESS_TOKEN`.

Currently there is a set integration test of the entire Stateless API.

## API Documentation

The code itself is fairly terse and well-commented, and is the best place to go for the full API, but here we stub out all the functionality for quick reference. 

### Stateless

Include it as follows: `var api = require('groupme').Stateless;`

Callbacks follow the node.js standard: `function callback(error, data) {};`. If no error occurs, the `error` parameter is `null`.

`Opts` are always optional, except for `api.Messages.create`, and consists of a JSON object.

**Promises vs Callbacks:**

The default interface uses callbacks, but you can also use the Promise interface to every function, by calling `promise = func.Q()`. The parameters are exactly the same, except the last `callback` parameter from the original function is gone in the Promise-based version. See the Promise example and read the [Q documentation](http://documentup.com/kriskowal/q/).

#### Groups


* `Groups.index(access_token, callback)` List the authenticated user's active groups.
* `Groups.former(access_token, callback)` List they groups you have left but can rejoin.
* `Groups.show(access_token, group_id, callback)` Load a specific group.
* `Groups.create(access_token, opts, callback)` Create a new group. 
    * Opts consists of `{name:,description:,mage_url:,share:}`
* `Groups.update(access_token, group_id, opts, callback)` Update a group after creation. 
    * Opts consists of `{name:,description:,mage_url:,share:}`
* `Groups.destroy(access_token, group_id, callback)` Disband a group. This action is only available to the group creator.


#### Members

* `Members.add(access_token, group_id, opts, callback)` Add members to a group.
    * Opts consists of `{members: [{nickname:, user_id:, phone_number:, email: }, ...]}`
* `Members.results(access_token, group_id, results_id, callback)` Get the membership results from an add call.


#### Messages

* `Messages.index(access_token, group_id, opts, callback)` Get messages for a group
    * Opts consists of `{before_id:}` or `{after_id:}`
* `Messages.create(access_token, group_id, opts, callback)`
    * Opts here are required, and consists of `{message:{source_guid:, text:, attachments: [{type:"image", url:}, {type:"location", name:, lat, lng}, {type:"split", token:}, {type:"emoji", placeholder:, charmap:}]}}`


#### Likes


* `Likes.create(access_token, group_id, message_id, callback)` Like a message.
* `Likes.destroy(access_token, group_id, message_id, callback)` Unlike a liked message.

#### Bots

* `Bots.create(access_token, name, group_id, opts, callback)` Create a bot. Associated with a specific name and group.
    * Opts consists of `{avatar_url:, callback_url:}`
* `Bots.post(access_token, bot_id, text, opts, callback)` Post a message as a bot.
    * Opts cosists of `{picture_url:}`
* `Bots.index(access_token, callback)` List bots you have created
* `Bots.destroy(access_token, bot_id, callback)` Remove a bot that you have created

#### Users

* `Users.me(access_token, callback)` Get details about the authenticated user

### IncomingStream

The IncomingStream is based around a PubSub message passing approach. It extends EventEmitter, and all the asynchronous push messages coming in from the server causes events to be fired.

#### Initialization & Function Calls


* `IncomingStream(access_token, userid, groupids)` - Constructs an IncomingStream for the given token and user_id. The optional groupids parameter is an array of group ids to receive in-progress notifications from.
* `IncomingStream.connect()` - Starts the websocket connection process, handshakes with GroupMe
* `IncomingStream.disconnect()` - Ends the websocket connection. Can `connect()` after this again.

Include the IncomingStream as follows:

```javascript
    var IncomingStream = require('groupme').IncomingStream;
```

You can construct an IncomingStream for a given access token and user id, which will receive all messages sent to that user, regardless of group: 

```javascript
    var iStream = new IncomingStream(ACCESS_TOKEN, USER_ID);
```

If you want to receive typing-in-progress notifications for specific groups, you can supply an array of group ids:

```javascript
    var iStream = new IncomingStream(ACCESS_TOKEN, USER_ID, [GROUP_ID1, ...]);
```

#### Events

Register for events using `iStream.on(EVENT, CALLBACK);`


* `connected` When the connection succeeds and is listening for messages.
* `pending` When a connection is in progress
* `disconnected` When a connection is dropped.
* `message` Received a message from GroupMe, passing `(data)`, JSON from server
* `error` when a failure occurs, passing `(message, payload)`
* `status` For logging purposes, passing `(message, payload)`

### ImageService

If you want to post images as part of messages or set your avatar, you need a URL to an image that's living on GroupMe's ImageService. This part of the API allows you to upload a raw png to GroupMe, and get a GroupMe ImageService URL back. This URL can then be used in subsequent messages and to set your avatar.

This uses the [node-mime](https://github.com/broofa/node-mime) library to determine the content-type of the file.

Include it:

```javascript
var ImageService = require('groupme').ImageService;
```

Upload an image based on a path on your server:

```javascript
ImageService.post(
    IMAGE_PATH, 
        function(err,ret) {
          if (err) {
            console.log(err)
          } else {
            console.log(ret); 
          }
        });
```

#### API

* `post(path, callback)` Callback receives a JSON object with the `picture_url` of your upload.

## ISSUES

For known issues, see ISSUES.md file.

## LICENSE

See LICENSE file


[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/267fa65389e14ec58d75b5e995f9501b "githalytics.com")](http://githalytics.com/njoubert/node-groupme)