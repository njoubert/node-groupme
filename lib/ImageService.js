var querystring     = require('querystring');

var request         = require('request');           //Easy http requests
var _               = require('underscore');        //Javascript functional programming helpers
var Q               = require('q');

var Constants       = require('./Constants');



/************************************************************************
 * Helper functions for requests
 ***********************************************************************/


/*

NOTE:

I've messed with this for a while, both looking at what groupme does over wireshark 
and what 

*/
api = {};
api.post = function(readstream, callback) {

    //var url = Constants["IMAGESERVICE_BASEURL"] + "/upload";
    var url = "http://localhost:3000/"
    console.log("posting", url);
    //console.log(readstream);

    var r = request({
      url:url,
      method:"POST",
      form: {
        'file': readstream
      } 
      }, function(err,res,body) {
            console.log("callback")
            console.log(body);
          // if (!err) {
          //   callback(null,JSON.parse(body));    
          // } else  {
          //   callback(res)
          // }
      });
    // var form = r.form();
    // form.append('file', readstream);

}



module.exports = api;