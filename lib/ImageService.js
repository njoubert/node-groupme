var mime            = require('mime');

var https = require('https');
var fs    = require('fs');
var util  = require('util');

var Q               = require('q');

var Constants       = require('./Constants');
var Promisify       = require('./Promisify');

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
      'Accept':'*/*',
      'Accept-Language':'en-US,en;q=0.8',
      'Connection':'keep-alive',
      'Content-Type': mime_type,
      'Content-Length': stat.size,
      'Accept-Encoding': 'gzip,deflate,sdch',
      'Origin': 'https://web.groupme.com',
      'Referer': 'https://web.groupme.com/profile',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
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

/************************************************************************
* Adding Promises for all the Stateless functions
***********************************************************************/

Promisify.promisify(api);

module.exports = api;