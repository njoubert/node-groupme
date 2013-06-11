#!/usr/bin/env node

var Stateless = require('../../lib/Stateless');

var ACCESS_TOKEN = "";

var API = Stateless.makeAPI(ACCESS_TOKEN);

// API.Bots.index(function(err,ret) {
//   if (!err) {
//     console.log(ret);  
//   } else {
//     console.log("ERROR!", err)
//   }
// });

API.Bots.post("", "Hello, this is bot", {}, function(err,ret) {
  if (!err) {
    console.log(ret);  
  } else {
    console.log("ERROR!", err)
  }
})

// API.Bots.create("", "", null, function(err,ret) {
//   if (!err) {
//     console.log(ret);  
//   } else {
//     console.log("ERROR!", err)
//   }
// })

// API.Bots.destroy("",function(err,ret) {
//   if (!err) {
//     console.log(ret);     
//   } else {
//     console.log("ERROR!", err)
//   }
// });