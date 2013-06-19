#!/usr/bin/env node

/************************************************************************
 * Include the Stateless API
 ***********************************************************************/

var API = require('../../index').Stateless;

/************************************************************************
 * Read the access token from the command line.
 ***********************************************************************/

if (process.argv.length < 3) {
    console.log("Usage: node HelloWorld.js ACCESS_TOKEN");
    process.exit(1);
} 
var ACCESS_TOKEN = process.argv[2];

/************************************************************************
 * Request your user id and name
 ***********************************************************************/

API.Users.me(ACCESS_TOKEN, function(err,ret) {
  if (!err) {
    console.log("Your user id is", ret.id, "and your name is", ret.name);        
  } else {
    console.log("ERROR!", err)
  }
});

/************************************************************************
 * Request all your group info
 ***********************************************************************/

API.Groups.index(ACCESS_TOKEN, function(err,ret) {
  if (!err) {
    var names = [];
    for (var i = 0; i < ret.length; i++) {
      names.push({"name":ret[i].name, "id":ret[i].id});
    }
    console.log(names); 
    //console.log(ret);
  } else {
    console.log("ERROR!", err)
  }
});

/************************************************************************
 * If you also supply a group_id as a second argument, get group details
 ***********************************************************************/

if (process.argv.length == 4) {

    var group_id = process.argv[3];

    API.Groups.show(ACCESS_TOKEN, group_id,function(err,ret) {
      if (!err) {
        console.log("Group info is", ret);        
      } else {
        console.log("ERROR!", err)
      }
    });


}
