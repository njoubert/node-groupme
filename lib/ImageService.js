var querystring     = require('querystring');

var request         = require('request');           //Easy http requests
var _               = require('underscore');        //Javascript functional programming helpers
var Q               = require('q');

var Constants       = require('./Constants');



/************************************************************************
 * Helper functions for requests
 ***********************************************************************/

api = {};
api.post = function(readstream, callback) {

    var url = Constants["IMAGESERVICE_BASEURL"] + "/pictures";
    console.log("posting", url);
    //console.log(readstream);

    console.log(readstream.read());

    var r = request.post(url, 
      function(err,res,body) {
            console.log("callback")
            console.log(body);
          // if (!err) {
          //   callback(null,JSON.parse(body));    
          // } else  {
          //   callback(res)
          // }
      });
    var form = r.form();
    form.append('file', readstream);



}



module.exports = api;