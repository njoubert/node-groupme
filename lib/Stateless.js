var events          = require('events');
var util            = require('util');
var querystring     = require('querystring');

var request         = require('request');           //Easy http requests
var Q               = require('q');

var Constants       = require('./Constants');
var Promisify       = require('./Promisify');

/************************************************************************
 * Helper functions for requests
 ***********************************************************************/

// Helper function to construct the individual paths for API calls.
// api_url takes the format "/url"
function getURL(at, api_url, opts) {
  var params = "?token=" + at;
  if (opts)
    params = params + "&" + querystring.stringify(opts);
  return Constants.API_BASEURL + api_url + params;
}

// Helper function to construct the the source_guid string.
function generateGUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (a) {
        var b, c;
        return b = Math.random() * 16 | 0, c = a === "x" ? b : b & 3 | 8, c.toString(16);
    });
};

// This makes one of many different types of post requests.
// config.opts         - this adds additional parameters to the url
// config.doParse      - if true,  parses the return value as json
// config.responseCode - if set, checks for this response code
function getRequest(at, api_url, config, callback) {
  if (!config.responseCode)
    config.responseCode = 200;

  request(
    {
      uri:    getURL(at, api_url, config.opts),
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    },
    function(err,res,body) {
      if (!err && res.statusCode == config.responseCode) {
        if (config.doParse) {
          callback(null,JSON.parse(body).response);    
        } else {
          callback(null,res.statusCode);         
        }
      } else  {
        callback(res)
      }
  });  

}

// This makes one of many different types of post requests.
// config.body         - this stingifies the object as the POST body
// config.form         - this sets the POST body as form parameters
// config.doParse      - if true,  parses the return value as json
// config.responseCode - if set, checks for this response code
function postRequest(at, api_url, config, callback) {

  var r_opts = {
    uri:    getURL(at, api_url),
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
  };

  if (config.body && !config.form) {
    r_opts.body = JSON.stringify(config.body);
  } else {
    r_opts.form = config.form;
  }

  if (!config.responseCode)
    config.responseCode = 200;

  request(
    r_opts,
    function(err,res,body) {
      if (!err && res.statusCode == config.responseCode) {
        if (config.doParse) {
          callback(null,JSON.parse(body).response);    
        } else {
          callback(null,res.statusCode);         
        }
      } else  {
        callback(res)
      }
  });    

}

/************************************************************************
 * API Containers
 ***********************************************************************/

// Objects representing the different API calls,
// each holding all the functions for that part of the API.
// All the functions take the form function(options,callback);
// and all callbacks take the form function(err,returnval);
api = {};
api.Groups   = {};
api.Members  = {};
api.Messages = {};
api.DirectMessages = {};
api.Likes    = {};
api.Bots     = {};
api.Users    = {};

/************************************************************************
 * Groups
 ***********************************************************************/

// List the authenticated user's active groups.
// Callback gets a JSON object of groups.
api.Groups.index = function(at, callback) {
  getRequest(at, "/groups", {doParse:true}, callback);
}

// List they groups you have left but can rejoin.
// Callback gets a JSON object of groups.
api.Groups.former = function(at, callback) {
  getRequest(at, "/groups/former", {doParse:true}, callback);
}

// Load a specific group.
//  id [required] - group_id string 
// Callback gets a JSON object describing the group.
api.Groups.show = function(at, id, callback) {
  getRequest(at, "/groups/" + id, {doParse:true}, callback);
}

// Create a new group
//  opts.name [required] - string, name of new group
//  opts.description     - string
//  opts.image_url       - string, must point to GroupMe Image Service URL, eg "http://i.groupme.com/123456789"
//  opts.share           - boolean, if true, generates a share url for anyone to join
// Callback gets a JSON object describing the group.
api.Groups.create = function(at, opts, callback) {
  if (!opts.name) {
    callback({error:"Requires opts.name"});
  } else {
    postRequest(at, "/groups", {body:opts, responseCode:201, doParse:true}, callback);  
  }
}

// Update a group after creation
//  id [required]        - group_id string
//  opts.name            - string, name of new group
//  opts.description     - string
//  opts.image_url       - string, must point to GroupMe Image Service URL, eg "http://i.groupme.com/123456789"
//  opts.share           - boolean, if true, generates a share url for anyone to join
// Callback gets a JSON object describing the group.
api.Groups.update = function(at, id, opts, callback) {
  postRequest(at, "/groups/" + id + "/update", {body:opts, responseCode:200, doParse:true}, callback);  
}

// Disband a group. This action is only available to the group creator.
//  id [required] - group_id string 
// Callback gets a statusCode of 200
api.Groups.destroy = function(at, id, callback) {
  postRequest(at, "/groups/" + id + "/destroy", {}, callback);
}

/************************************************************************
 * Members
 ***********************************************************************/

// Add members to a group.
// Multiple members can be added in a single request, 
// and results are fetched with a separate call (since memberships are processed asynchronously). 
// The response includes a results_id that's used in the results request.
// In order to correlate request params with resulting memberships, GUIDs can be added to the members 
// parameters. These GUIDs will be reflected in the membership JSON objects.
//  id [required] - group_id string
//  opts.members  - array of objects containing "nickname" 
//                  and one of "user_id", "phone_number" or "email" as identifiers
//                  can also include "guid" which is returned in the results call
api.Members.add = function(at, id, opts, callback) {
  if (!opts.members || opts.members.length < 1) {
    callback({error:"Requires an array of new members"})
  } else {
    postRequest(at, "/groups/" + id + "/members/add", {body:opts, responseCode:202, doParse:true}, callback);       
  }
}

// Get the membership results from an add call.
// Successfully created memberships will be returned, including any GUIDs that were sent up in the add request. 
// If GUIDs were absent, they are filled in automatically. Failed memberships and invites are omitted.
// Keep in mind that results are temporary -- they will only be available for 1 hour after the add request.
//  id [required]         - group_id string
//  results_id [required] - guid for results returned by the add call
//
api.Members.results = function(at, id, results_id, callback) {
  getRequest(at, "/groups/" + id + "/members/results/" + results_id, {opts:opts, doParse:true}, callback);  
}

/************************************************************************
* Messages
***********************************************************************/

// Messages for a group
// Messages are returned in groups of 20, ordered by created_at descending
//   id [required]  - group_id string
//   opts.before_id - returns 20 messages created before the given id
//   opts.after_id  - returns 20 messages created after the given id
api.Messages.index = function(at, id, opts, callback) {
  getRequest(at, "/groups/" + id + "/messages", {opts:opts, doParse:true}, callback);  
}

// Send a message to a group
// If you want to attach an image, you must first process it through our image service.
// Attachments of type emoji rely on data from emoji PowerUps.
// Clients use a placeholder character in the message text and specify a replacement charmap to substitute emoji characters
// The character map is an array of arrays containing rune data ([[{pack_id,offset}],...]).
// The placeholder should be a high-point/invisible UTF-8 character.
//  id [required] - group_id string
//  opts.message  - object representing message, with the following keys:
//    text [required]        - string. can be omitted if at least one attachment is present
//    attachments            - A polymorphic list of attachments, each an object with a type field:
//      { type: "image",    url: <from image service> }
//      { type: "location", name: <string>, lat: <string>, lng: <string> }
//      { type: "split",    token: <string> }
//      { type: "emoji",    placeholder: <string>, charmap: array }
api.Messages.create = function(at, id, opts, callback) {
  if (!opts || !opts.message) {
    callback({error:"Requires options for new message"})
  } else {
    opts.message.source_guid = generateGUID();
    postRequest(at, "/groups/" + id + "/messages", {body:opts, responseCode:201, doParse:true}, callback);     
  }
}

/************************************************************************
* Direct Messages
***********************************************************************/

// Direct messages between two users
// Direct messages are returned in groups of 20, ordered by created_at descending
//   opts.other_user_id [required]  - user_id string
//   opts.before_id                 - returns 20 messages created before the given id
//   opts.after_id                  - returns 20 messages created after the given id
api.DirectMessages.index = function(at, opts, callback) {
  if (!opts || !opts.other_user_id) {
    callback({error:"Requires options for getting direct messages"})
  } else {
    getRequest(at, "/direct_messages", {opts:opts, doParse:true}, callback);  
  }
}

// Send a direct message to another user
// If you want to attach an image, you must first process it through our image service.
// Attachments of type emoji rely on data from emoji PowerUps.
// Clients use a placeholder character in the message text and specify a replacement charmap to substitute emoji characters
// The character map is an array of arrays containing rune data ([[{pack_id,offset}],...]).
// The placeholder should be a high-point/invisible UTF-8 character.
//  opts.direct_message      - object representing message, with the following keys:
//    recipient_id [required]- group_id string
//    text [required]        - string. can be omitted if at least one attachment is present
//    attachments            - A polymorphic list of attachments, each an object with a type field:
//      { type: "image",    url: <from image service> }
//      { type: "location", name: <string>, lat: <string>, lng: <string> }
//      { type: "split",    token: <string> }
//      { type: "emoji",    placeholder: <string>, charmap: array }
api.DirectMessages.create = function(at, opts, callback) {
  if (!opts || !opts.direct_message) {
    callback({error:"Requires options for new direct message"})
  } else {
    opts.direct_message.source_guid = generateGUID();
    postRequest(at, "/direct_messages", {body:opts, responseCode:201, doParse:true}, callback);     
  }
}

/************************************************************************
* Likes
***********************************************************************/

// Like a message.
// Callback gets a statusCode of 200
api.Likes.create = function(at, group_id, message_id, callback) {
  postRequest(at, "/messages/" + group_id + "/" + message_id + "/like", {}, callback);
}

// Unlike a liked message.
// Callback gets a statusCode of 200
api.Likes.destroy = function(at, group_id, message_id, callback) {
  postRequest(at, "/messages/" + group_id + "/" + message_id + "/unlike", {}, callback);
}

/************************************************************************
* Bots
***********************************************************************/
// Bots are purely a way to send messages to a group
// under a different name than your own. 
// Receiving messages can be done through this as well, but it recommended
// through the IncomingStream push service


// Create a bot.
//  name [required]     - string, the nickname of the bot
//  group_id [required] - string, the group the bot can post to
//  opts.avatar_url     - string, ImageService url to avatar
//  opts.callback_url   - string, a callback for new messages
api.Bots.create = function(at, name, group_id, opts, callback) {
  var payload = {
    "bot[name]": name,
    "bot[group_id]": group_id,
  }
  if (opts && opts.avatar_url)
    payload["bot[avatar_url]"] = opts.avatar_url;
  if (opts && opts.callback_url)
    payload["bot[callback_url]"] = opts.callback_url;

  postRequest(at, "/bots", {form:payload, responseCode:201, doParse:true}, callback);
}

// Post a message as a bot
//  bot_id [required]   - string, the id of the bot
//  text [required]     - string, the message to post
//  opts.picture_url    - string, ImageService url to optional image to post
api.Bots.post = function(at, bot_id, text, opts, callback) {
  var payload = {
    bot_id: bot_id,
    text: text
  }
  if (opts.picture_url)
    payload.picture_url = opts.picture_url
  postRequest(at, "/bots/post", {form:payload, responseCode:202}, callback);
}

// List bots you have created
api.Bots.index = function(at, callback) {
  getRequest(at, "/bots", {doParse:true}, callback);
}

// Remove a bot that you have created
//  bot_id [required]   - string, the id of the bot
api.Bots.destroy = function(at, bot_id, callback) {
  postRequest(at, "/bots/destroy", {form:{"bot_id":bot_id}, responseCode:200}, callback);  
}

/************************************************************************
* Users
***********************************************************************/

// Get details about the authenticated user
// Callback gets a JSON object about the user
api.Users.me = function(at, callback) {
  getRequest(at, "/users/me", {doParse:true}, callback);
}

/************************************************************************
* Adding Promises for all the Stateless functions
***********************************************************************/

Promisify.promisify(api);

/************************************************************************
* Export the entire api;
***********************************************************************/

module.exports = api;


