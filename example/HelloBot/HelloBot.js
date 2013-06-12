#!/usr/bin/env node

var GroupMe = require('../../index');
var API = GroupMe.Stateless;

if (process.argv.length < 3) {
    console.log("Usage: node HelloBot.js ACCESS_TOKEN");
    process.exit(1);
} 
var ACCESS_TOKEN = process.argv[2];


// API.Bots.index(ACCESS_TOKEN, function(err,ret) {
//   if (!err) {
//     console.log(ret);  
//   } else {xw
//     console.log("ERROR!", err)
//   }
// });

API.Bots.post(ACCESS_TOKEN, "", "Hello, this is bot", {}, function(err,ret) {
  if (!err) {
    console.log(ret);  
  } else {
    console.log("ERROR!", err)
  }
})

// API.Bots.create(ACCESS_TOKEN, "", "", null, function(err,ret) {
//   if (!err) {
//     console.log(ret);  
//   } else {
//     console.log("ERROR!", err)
//   }
// })

// API.Bots.destroy(ACCESS_TOKEN, "",function(err,ret) {
//   if (!err) {
//     console.log(ret);     
//   } else {
//     console.log("ERROR!", err)
//   }
// });