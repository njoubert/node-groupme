#!/usr/bin/env node

var Stateless = require('../../lib/Stateless');

var ACCESS_TOKEN = "02f19310adac0130ac394ea6b36c8247";

var API = Stateless.makeAPI(ACCESS_TOKEN);

// API.Bots.index(function(err,ret) {
//   if (!err) {
//     console.log(ret);  
//   } else {
//     console.log("ERROR!", err)
//   }
// });

API.Bots.post("ffc85c66b80c5356b566397edf", "fuck this shit", {}, function(err,ret) {
  if (!err) {
    console.log(ret);  
  } else {
    console.log("ERROR!", err)
  }
})

// API.Bots.create("BASBOT", "4614209", null, function(err,ret) {
//   if (!err) {
//     console.log(ret);  
//   } else {
//     console.log("ERROR!", err)
//   }
// })

// API.Bots.destroy("e4ae230db6efb98112088e85fd",function(err,ret) {
//   if (!err) {
//     console.log(ret);     
//   } else {
//     console.log("ERROR!", err)
//   }
// });