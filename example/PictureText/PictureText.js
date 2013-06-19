/************************************************************************
 * This example shows how to use the ImageService API to upload images
 * to GroupMe.
 *
 * It also demonstrates using EventEmitters to turn callback-based APIs
 * into event-based APIs.
 ***********************************************************************/


var fs           = require('fs');
var path         = require('path');
var EventEmitter = require('events').EventEmitter
var assert       = require('assert');

var ImageService = require('../../index').ImageService;
var API          = require('../../index').Stateless;

if (process.argv.length < 4) {
    console.log("Usage: node HelloWorld.js ACCESS_TOKEN IMAGE [GROUP_ID]");
    process.exit(1);
} 
var ACCESS_TOKEN = process.argv[2];
var IMAGE_PATH   = process.argv[3];

/************************************************************************
 * Here we show an example of uploading an image
 * and providing an EventEmitter interface to the process.
 ***********************************************************************/

var uploadImageEvented = function(eventEmitter, path) {

  ImageService.post(
      path, 
      function(err,ret) {
        if (err) {
          eventEmitter.emit('error', err);
        } else {
          eventEmitter.emit('success', ret);
        }
      });

  eventEmitter.emit('start');

  return eventEmitter;

}

/************************************************************************
 * Helper function for posting a picture message
 ***********************************************************************/

var postImageAsBot = function(eventEmitter, access_token, bot_id, picture_url) {

  API.Bots.post(
    access_token,
    bot_id,
    "Picture Message Test",
    {picture_url:picture_url},
    function(err,ret) {
      if (err) {
        eventEmitter.emit('error', err);
      } else {
        eventEmitter.emit('success', ret);
      }
    });

  eventEmitter.emit('start');

  return eventEmitter;

}

/************************************************************************
 * Helper function for creating a bot
 ***********************************************************************/

var createBot = function(eventEmitter, access_token, group_id, picture_url) {

  API.Bots.create(
    access_token,
    "TestBot_PictureText",
    group_id,
    {avatar_url:"https://secure.gravatar.com/avatar/0ea0a27ab0e9a49b753cd2e3c27e585d?s=420&d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png"},
    function(err,ret) {
      if (err) {
        eventEmitter.emit('error', err);
      } else {
        eventEmitter.emit('success', ret);
      }
    });

  eventEmitter.emit('start');

  return eventEmitter;

}


/************************************************************************
 * The logic of this example built around EventEmitters
 ***********************************************************************/

var errorFunc = function(err) {
  console.log(err);
  process.exit(1);
}


var uploader = new EventEmitter();
var botter   = new EventEmitter();
var poster   = new EventEmitter();


uploader.on('error', errorFunc);
poster.on('error', errorFunc);
botter.on('error', errorFunc);

var picture_url;
uploader.on('success', function(data) {
  console.log("Successfully uploaded image:", data);
  assert(data.picture_url);
  picture_url = data.picture_url;

  if (process.argv.length == 5) {
    //Start the Message Post
    createBot(botter, ACCESS_TOKEN, process.argv[4], picture_url);
  }

});

var bot_id;
botter.on('success', function(ret) {
  console.log("Created bot!");
  assert(ret.bot);
  assert(ret.bot.bot_id);
  bot_id = ret.bot.bot_id;
  postImageAsBot(poster, ACCESS_TOKEN, bot_id, picture_url);
});

poster.on('success', function(ret) {
  console.log("Successfully posted picture message using bot!", ret);

//*
  API.Bots.destroy(
    ACCESS_TOKEN,
    bot_id,
    function(err,ret) {
      if (err) {
        console.log("Could not destroy ", bot_id);
      } else {
        console.log("Bot destroyed.")
      }
    });
// */

});

//Start the Image Upload
uploadImageEvented(uploader, IMAGE_PATH);



