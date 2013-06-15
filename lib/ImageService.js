var querystring     = require('querystring');

var request         = require('request');           //Easy http requests
var _               = require('underscore');        //Javascript functional programming helpers
var Q               = require('q');

var Constants       = require('./Constants');

var https = require('https');
var fs    = require('fs');
var util  = require('util');

/************************************************************************
 * Helper functions for requests
 ***********************************************************************/



api = {};

// Upload the given image to the 
api.post = function(path, callback) {

  var stat = fs.statSync(path);
  var readstream = fs.createReadStream(path);

  var post_options = {
    host:    "image.groupme.com",
    port:    443,
    path:    "/upload",
    method:  "POST",
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': stat.size,
      'Accept-Encoding': 'gzip,deflate,sdch'
    }
  };

  var req = https.request(post_options, function(res) {
    res.setEncoding('utf8');

    if (res.statusCode != 201) {
      return callback(res, null);
    }

    var data = "";
    res.on('data', function(d) {
      data += d;
    });


    res.on('end', function() {
      if (data.length > 0) {
        try {

          json = JSON.parse(data);
          if (!json.payload) {
            return callback("No payload returned from image upload", null);
          } else {
            return callback(null, json.payload);
          }

        } catch(err) {
          callback(err, null);
        }

      } else {
        callback("No data received.", null);
      }
    })

  }); 

  readstream.pipe(req);

  req.on('error', function(e) {
    return callback(err, null);
  });


}



module.exports = api;