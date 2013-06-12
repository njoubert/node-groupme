#!/usr/bin/env node

var API = require('../../index').Stateless;

if (process.argv.length < 3) {
    console.log("Usage: node HelloWorld.js ACCESS_TOKEN");
    process.exit(1);
} 
var ACCESS_TOKEN = process.argv[2];

API.Users.me(ACCESS_TOKEN, function(err,ret) {
  if (!err) {
    console.log("Your user id is", ret.id, "and your name is", ret.name);        
  } else {
    console.log("ERROR!", err)
  }
});

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



// var opts = {
//   name: "TestGroup1",
//   description: "trolololol!"
// }
// API.Groups.create(ACCESS_TOKEN, opts, function(err,ret) {
//   if (!err) {
//     console.log("New Group Is", ret);        
//   } else {
//     console.log("ERROR!", err)
//   }
// })

// API.Groups.destroy(ACCESS_TOKEN, "4699307", function(err,ret) {
//   console.log(err);
// })

// API.Messages.index(ACCESS_TOKEN, "3393242", null, function(err,ret) {
//   if (!err) {
//     console.log(ret);        
//   } else {
//     console.log("ERROR!", err)
//   }
// })

// var opts = { 
//   message : {
//     source_guid: "asdfasafff" + Date.now(),
//     text: "THIS IS SPARTAAAA" + Date.now() 
//   }
// }
// API.Messages.create(ACCESS_TOKEN, "4614209", opts, function(err,ret) {
//   if (!err) {
//     console.log(ret);        
//   } else {
//     console.log("ERROR!", err)
//   } 
// })