#!/usr/bin/env node

var API = require('../../index').Stateless;
var Q   = require('Q');


if (process.argv.length < 3) {
    console.log("Usage: node Promises.js ACCESS_TOKEN");
    process.exit(1);
} 
var ACCESS_TOKEN = process.argv[2];

var qfunc = function() {
    var args = Array.prototype.slice.call(arguments);
    return Q.nfapply(this, args);
}


for (g in API) {
    for (f in API[g]) {
        API[g][f].Q = qfunc;
    }
}


API.Users.me.Q(ACCESS_TOKEN)
    .then(
        function(da) { 
            var id = da.id;
            return API.Groups.index.Q(ACCESS_TOKEN); 
        })
    .then (
        function(da) {
            console.log(da);
        });


API.Users.me.Q("gibbbbbbb")
    .then(
        function(da) { 
            var id = da.id;
            return API.Groups.index.Q(ACCESS_TOKEN); 
        })
    .then (
        function(da) {
            console.log(da);
        },function(err) {
            console.log("As expected, an ERROR occured:", err)
        });