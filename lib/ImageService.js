var mime            = require('mime');

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

  var mime_type = mime.lookup(path);

  var post_options = {
    host:    Constants.IMAGESERVICE_BASEURL,
    port:    443,
    path:    Constants.IMAGESERVICE_UPLOADPATH,
    method:  "POST",
    headers: {
      'Content-Type': mime_type,
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
    return callback(e, null);
  });

}

module.exports = api;