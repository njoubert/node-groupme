var assert = require('assert');
var API = require('../index').Stateless;


if (process.argv.length < 3) {
  console.log("Usage: node test.js ACCESS_TOKEN");
  process.exit(1);
}

var ACCESS_TOKEN = process.argv[2];
var testGroupName = "testGroup"
var TEST_TIMEOUT_DELAY = 10000;

console.log("Starting Tests!");

/* 

Testing needs to check for timeouts and impose an ordering on things.

*/


/************************************************************************
 * Handling timeouts
 ***********************************************************************/
function Timeout(delay, name, description) {

  this.description = description;
  var self = this;

  this.tid = setTimeout(function() {
    assert(false, self.description);
  }, delay);

  console.log("*** Test", name);

}

Timeout.prototype.done = function(description) {
  clearTimeout(this.tid);
  console.log("RETURNED: ", this.description);
}

var count = 0;
var startTimeout = function(description) { 
  count += 1;
  return new Timeout(TEST_TIMEOUT_DELAY, count, description);
}

var testGroupName = "TestGroup" + Date.now();

//Placeholders for timeouts.
var t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14;


/************************************************************************
 * Running the tests
 * We use our promise-based library to help with ordering
 ***********************************************************************/

t1 = startTimeout("User info");

var user_id;
var group_id;
var bot_id;

function cleanup() {
  if (group_id) {

  API.Groups.destroy(ACCESS_TOKEN, group_id, function(err,res) {
      if (!err) {
        console.log("*** Cleaning up")
        console.log("Destroyed the dummy group.");    
      } else {
        assert(false, "Could not destroy the dummy group!")
      }
    });

  }
}

try {

API.Users.me.Q(ACCESS_TOKEN)  //First, We get the user info
  .then(function(res) {
    t1.done();
    assert(res);
    assert(res.id);

    user_id = res.id;

    t2 = startTimeout("Creating a test group")

    //Then we create a dummy group to work with

    return API.Groups.create.Q(ACCESS_TOKEN, {
      name: testGroupName,
      description: "This is a group used for testing node-groupme. https://github.com/njoubert/node-groupme"
    });

  })
  .then(function(group_create_res) {

    t2.done();

    //Check that group creation succeeded:

    assert(group_create_res);
    assert(group_create_res.id);
    assert.equal(group_create_res.id, group_create_res.group_id);
    assert.equal(group_create_res.name, testGroupName);

    group_id = group_create_res.id;

    t3 = startTimeout("Indexing all groups");
    return [group_create_res, API.Groups.index.Q(ACCESS_TOKEN)]


  })
  .spread(function(group_create_res, group_index_res) {

    t3.done();
      
    // Check that the dummy group shows up in the index

    assert(group_index_res);
    assert(group_index_res.length > 0);

    var found = -1;
    for (var i in group_index_res) {
      if (group_index_res[i].id == group_id) {
        found = i;
      }
    }

    assert(found > -1);
    assert(group_index_res[found].name == testGroupName);

    //Now we load this group specifically
    t4 = startTimeout("Getting details of dummy group.")
    return API.Groups.show.Q(ACCESS_TOKEN, group_id);

  })
  .then(function(res) {

    t4.done();

    assert(res);
    assert.equal(res.group_id, group_id);
    assert.equal(res.members.length,1);
    assert.equal(res.members[0].user_id, user_id);

    assert.equal(res.messages.count, 0);

    t5 = startTimeout("Updating group deets")
    return API.Groups.update.Q(ACCESS_TOKEN, group_id, { 
      description: "NOTHING_HERE"
    });

  })
  .then(function(res) {

    assert(res);
    assert.equal(res.id,group_id);
    assert.equal(res.group_id, group_id);
    assert.equal(res.description, "NOTHING_HERE");

    t5.done();

    t6 = startTimeout("Posting message to the group");
    return API.Messages.create.Q(ACCESS_TOKEN, group_id, {
      message : {
        source_guid: Date.now(),
        text: "Test Message One"        
      }
    });

  })
  .then(function(msg) {

    t6.done();

    assert(msg);
    assert(msg.message);
    assert.equal(msg.message.user_id, user_id);
    assert.equal(msg.message.group_id, group_id);
    assert.equal(msg.message.text, "Test Message One");

    t7 = startTimeout("Reading all messages")
    return [msg, API.Messages.index.Q(ACCESS_TOKEN, group_id, {})];

  })
  .spread(function(msg, msgs) {

    t7.done();

    assert(msgs);
    assert.equal(msgs.count, 1);
    assert.equal(msgs.count, msgs.messages.length);
    assert.equal(msgs.messages[0].text, msg.message.text);

    var msg_id = msg.message.id;
    t8 = startTimeout("Liking a message");
    return [msg_id, API.Likes.create.Q(ACCESS_TOKEN, group_id, msg_id)];

  })
  .spread(function(msg_id, res) {

    t8.done();

    assert(res);

    t9 = startTimeout("Unliking a message")
    return API.Likes.destroy.Q(ACCESS_TOKEN, group_id, msg_id);

  })
  .then(function(res) {

    t9.done();
    assert(res);

    //OK Now we try to create a BOT for the group

    t10 = startTimeout("Create a bot")
    return API.Bots.create.Q(ACCESS_TOKEN, "TestBot", group_id, {});

  })
  .then(function(botres) {

    t10.done()

    assert(botres);
    assert.equal(botres.bot.name, "TestBot");
    assert.equal(botres.bot.group_id, group_id);
    assert(botres.bot.bot_id);

    bot_id = botres.bot.bot_id

    t11 = startTimeout("Listing bots");
    return API.Bots.index.Q(ACCESS_TOKEN);
    
  })
  .then(function(res) {

    t11.done();

    assert(res);
    assert(res.length > 0);

    var found = -1;
    for (var i = 0; i < res.length; i++) {
      if (res[i].bot_id == bot_id)
        found = i;
    }
    assert(found >= 0);
    assert.equal(res[found].name, "TestBot");
    assert.equal(res[found].bot_id, bot_id);
    assert.equal(res[found].group_id, group_id);
    
    t12 = startTimeout("Post a message as a bot");
    return API.Bots.post.Q(ACCESS_TOKEN, bot_id, "Test Message from BOT", {});

  })
  .then(function(res) {

    t12.done();

    assert.equal(res, 202);

    t13 = startTimeout("Checking messages.")
    return API.Messages.index.Q(ACCESS_TOKEN, group_id, {});

  })
  .then(function(res) {

    t13.done();
    assert(res);
    assert.equal(res.count, 2);
    assert.equal(res.count, res.messages.length);

    assert.equal(res.messages[0].name, "TestBot");
    assert.equal(res.messages[0].text, "Test Message from BOT");
    assert.equal(res.messages[1].text, "Test Message One");

    t14 = startTimeout("Destroying bot");
    return API.Bots.destroy.Q(ACCESS_TOKEN, bot_id);

  })
  .then(function(res) {

    t14.done();
    assert(res);
    assert.equal(res, 200)

  })
  .then(function() {

    console.log("ALL TESTS FOR STATELESS API PASSED SUCCESSFULLY!")

  })
  .fail(function(err) {
    console.log(err);
  })
  .fin(cleanup);

} catch (err) {

  cleanup();


}
