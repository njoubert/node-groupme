#!/usr/bin/env node

var API = require('../../index').Stateless;


if (process.argv.length < 3) {
    console.log("Usage: node Promises.js ACCESS_TOKEN");
    process.exit(1);
} 
var ACCESS_TOKEN = process.argv[2];

API.Users.me.Q(ACCESS_TOKEN)
    .then(
        function(da) { 
            var id = da.id;
            API.Groups.index.Q(ACCESS_TOKEN).then (
                function(groups) {
                    console.log("Your id is", id, "and you have", groups.length, "groups");
                });
        });


API.Users.me.Q("gibbbbbbb")
    .then(
        function(da) { 
            var id = da.id;
            return API.Groups.index.Q(ACCESS_TOKEN); 
        })
    .then(
        function(da) {
            console.log(da);
        },function(err) {
            console.log("As expected, an error occured, because we passed a gibberish access token.")
        });