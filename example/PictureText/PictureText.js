var ImageService = require('../../index').ImageService;
var fs   = require('fs');
var path = require('path');

if (process.argv.length < 4) {
    console.log("Usage: node HelloWorld.js ACCESS_TOKEN IMAGE");
    process.exit(1);
} 
var ACCESS_TOKEN = process.argv[2];
var IMAGE_PATH   = process.argv[3];



ImageService.post(
    fs.createReadStream(IMAGE_PATH), 
        function(err,ret) {
          console.log(ret);
        });

