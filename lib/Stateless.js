var events          = require('events');
var util            = require('util');
var querystring     = require('querystring');

var request         = require('request');           //Easy http requests
var _               = require('underscore');        //Javascript functional programming helpers

var Constants       = require('./Constants');


/************************************************************************
 * A single function call to construct the API for a given access_token
 ***********************************************************************/
exports.makeAPI = function(access_token) {


  /************************************************************************
   * Helper functions for requests
   ***********************************************************************/

  // Helper function to construct the individual paths for API calls.
  // api_url takes the format "/url"
  function getURL(api_url, opts) {
    var params = "?token=" + access_token;
    if (opts)
      params = params + "&" + querystring.stringify(opts);
    return Constants.API_BASEURL + api_url + params;
  }

  // Helper function to make a simple get request, expecting JSON as the response.
  function simpleGetRequestAndParse(api_url, callback) {
    request(
      {
        uri:    getURL(api_url),
        method: 'GET',
      },
      function(err,res,body) {
        if (!err && res.statusCode == 200) {
          callback(null,JSON.parse(body).response);
        } else  {
          callback(res)
        }
    });
  }

  // Helper function to make a simple post request, expecting a 200 OK return value.
  function simplePostRequest(api_url, callback) {
    request(
      {
        uri:    getURL(api_url),
        method: 'POST',
      },
      function(err,res,body) {
        if (!err && res.statusCode == 200) {
          callback(null,res.statusCode);
        } else  {
          callback(res)
        }
    });    
  }

  function optonsGetRequestAndParse(api_url, responseCode, opts, callback) {
    request(
      {
        uri:    getURL(api_url, opts),
        method: 'GET'
      },
      function(err,res,body) {
        if (!err && res.statusCode == responseCode) {
          callback(null,JSON.parse(body).response);
        } else  {
          callback(res)
        }
    });        
  }

  function optionsPostRequestAndParse(api_url, responseCode, opts, callback) {
    console.log(opts);
    request(
      {
        uri:    getURL(api_url),
        method: 'POST',
        body:   JSON.stringify(opts)
      },
      function(err,res,body) {
        if (!err && res.statusCode == responseCode) {
          callback(null,JSON.parse(body).response);
        } else  {
          callback(res)
        }
    });        
  }

  function mutliStatusGetRequestAndParse(api_url, responseCode, callback) {
    request(
      {
        uri:    getURL(api_url),
        method: 'GET',
      },
      function(err,res,body) {
        if (!err && res.statusCode == responseCode) {
          callback(null,JSON.parse(body).response);
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
  api.Likes    = {};
  api.Users    = {};

  /************************************************************************
   * Groups
   ***********************************************************************/

  // List the authenticated user's active groups.
  // Callback gets a JSON object of groups.
  api.Groups.index = function(callback) {
    simpleGetRequestAndParse("/groups", callback);
  }

  // List they groups you have left but can rejoin.
  // Callback gets a JSON object of groups.
  api.Groups.former = function(callback) {
    simpleGetRequestAndParse("/groups/former", callback);
  }

  // Load a specific group.
  //  id [required] - group_id string 
  // Callback gets a JSON object describing the group.
  api.Groups.show = function(id, callback) {
    simpleGetRequestAndParse("/groups/" + id, callback);
  }

  // Create a new group
  //  opts.name [required] - string, name of new group
  //  opts.description     - string
  //  opts.image_url       - string, must point to GroupMe Image Service URL, eg "http://i.groupme.com/123456789"
  //  opts.share           - boolean, if true, generates a share url for anyone to join
  // Callback gets a JSON object describing the group.
  api.Groups.create = function(opts, callback) {
    if (!opts.name) {
      callback({error:"Requires opts.name"});
    } else {
      optionsPostRequestAndParse("/groups", 201, opts, callback);
    }
  }

  // Update a group after creation
  //  id [required]        - group_id string
  //  opts.name            - string, name of new group
  //  opts.description     - string
  //  opts.image_url       - string, must point to GroupMe Image Service URL, eg "http://i.groupme.com/123456789"
  //  opts.share           - boolean, if true, generates a share url for anyone to join
  // Callback gets a JSON object describing the group.
  api.Groups.update = function(id, opts, callback) {
    optionsPostRequestAndParse("/groups/" + id + "/update", 200, opts, callback);
  }

  // Disband a group. This action is only available to the group creator.
  //  id [required] - group_id string 
  // Callback gets a statusCode of 200
  api.Groups.destroy = function(id, callback) {
    simplePostRequest("/groups/" + id + "/destroy", callback);
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
  api.Members.add = function(id, opts, callback) {
    if (!opts.members || opts.members.length < 1) {
      callback({error:"Requires an array of new members"})
    } else {
      optionsPostRequestAndParse("/groups/" + id + "/members/add", 202, opts, callback);      
    }
  }

  // Get the membership results from an add call.
  // Successfully created memberships will be returned, including any GUIDs that were sent up in the add request. 
  // If GUIDs were absent, they are filled in automatically. Failed memberships and invites are omitted.
  // Keep in mind that results are temporary -- they will only be available for 1 hour after the add request.
  //  id [required]         - group_id string
  //  results_id [required] - guid for results returned by the add call
  //
  api.Members.results = function(id, results_id, callback) {
    mutliStatusGetRequestAndParse("/groups/" + id + "/members/results/" + results_id, 200, callback);
  }

  /************************************************************************
  * Messages
  ***********************************************************************/

  // Messages for a group
  // Messages are returned in groups of 20, ordered by created_at descending
  //   id [required]  - group_id string
  //   opts.before_id - returns 20 messages created before the given id
  //   opts.after_id  - returns 20 messages created after the given id
  api.Messages.index = function(id, opts, callback) {
    optonsGetRequestAndParse("/groups/" + id + "/messages", 200, opts, callback);
  }

  // Send a message to a group
  // If you want to attach an image, you must first process it through our image service.
  // Attachments of type emoji rely on data from emoji PowerUps.
  // Clients use a placeholder character in the message text and specify a replacement charmap to substitute emoji characters
  // The character map is an array of arrays containing rune data ([[{pack_id,offset}],...]).
  // The placeholder should be a high-point/invisible UTF-8 character.
  //  id [required] - group_id string
  //  opts.message  - object representing message, with the following keys:
  //    source_guid [required] - used for client-side deduplication.
  //    text [required]        - string. can be omitted if at least one attachment is present
  //    attachments            - A polymorphic list of attachments, each an object with a type field:
  //      { type: "image",    url: <from image service> }
  //      { type: "location", name: <string>, lat: <string>, lng: <string> }
  //      { type: "split",    token: <string> }
  //      { type: "emoji",    placeholder: <string>, charmap: array }
  api.Messages.create = function(id, opts, callback) {
    if (!opts || !opts.message || !opts.message.source_guid) {
      callback({error:"Requires options for new message"})
    } else {
      optionsPostRequestAndParse("/groups/" + id + "/messages", 201, opts, callback);      
    }
  }

  /************************************************************************
  * Likes
  ***********************************************************************/

  // Like a message.
  // Callback gets a statusCode of 200
  api.Likes.create = function(group_id, message_id, callback) {
    simplePostRequest("/messages/" + group_id + "/" + message_id + "/like", callback);
  }

  // Unlike a liked message.
  // Callback gets a statusCode of 200
  api.Likes.destroy = function(group_id, message_id, callback) {
    simplePostRequest("/messages/" + group_id + "/" + message_id + "/unlike", callback);
  }

  /************************************************************************
  * Users
  ***********************************************************************/

  // Get details about the authenticated user
  // Callback gets a JSON object about the user
  api.Users.me = function(callback) {
    simpleGetRequestAndParse("/users/me", callback);
  }

  return api;
}


