#!/usr/bin/env node

var Stateless = require('../../lib/Stateless');

var ACCESS_TOKEN = "";

var API = Stateless.makeAPI(ACCESS_TOKEN);

API.Users.me(function(err,ret) {
  if (!err) {
    console.log("Your user id is", ret.id, "and your name is", ret.name);        
  } else {
    console.log("ERROR!", err)
  }
});

// API.Groups.index(function(err,ret) {
//   if (!err) {
//     var names = [];
//     for (var i = 0; i < ret.length; i++) {
//       names.push({"name":ret[i].name, "id":ret[i].id});
//     }
//     console.log(names); 
//     //console.log(ret);
//   } else {
//     console.log("ERROR!", err)
//   }
// });

// API.Groups.show("3393242",function(err,ret) {
//   if (!err) {
//     console.log("Group info is", ret);        
//   } else {
//     console.log("ERROR!", err)
//   }
// });


// var opts = {
//   name: "TestGroup1",
//   description: "trolololol!"
// }
// API.Groups.create(opts, function(err,ret) {
//   if (!err) {
//     console.log("New Group Is", ret);        
//   } else {
//     console.log("ERROR!", err)
//   }
// })

// API.Groups.destroy("4699307", function(err,ret) {
//   console.log(err);
// })

// API.Messages.index("3393242", null, function(err,ret) {
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
// API.Messages.create("4614209", opts, function(err,ret) {
//   if (!err) {
//     console.log(ret);        
//   } else {
//     console.log("ERROR!", err)
//   } 
// })