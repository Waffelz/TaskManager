var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;
var models = require('./models');
var {rtm, web} =require('../bot')

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

mongoose.connect(connect);
var app = express();

// generate id: with mongoose user model
app.get('/connect', function(req, res){
  console.log('niside connect');
 if(req.query.auth_id){
   console.log('has auth id');
   var oauth2Client = new OAuth2(
     process.env.YOUR_CLIENT_ID,
     process.env.YOUR_CLIENT_SECRET,
     process.env.YOUR_REDIRECT_URL+'/connect/callback'//developer console redirect url
   );
   // generate a url that asks permissions for Google+ and Google Calendar scopes
   var url = oauth2Client.generateAuthUrl({
     // 'online' (default) or 'offline' (gets refresh_token)
     access_type: 'offline',
     prompt: 'consent',
     // If you only need one scope you can pass it as a string
     scope: [
       'https://www.googleapis.com/auth/plus.me',
       'https://www.googleapis.com/auth/calendar'
     ],
     // Optional property that passes state parameters to redirect URI
     state: encodeURIComponent(JSON.stringify({
       auth_id: req.query.auth_id}))

    // state: {
    //   auth_id: req.query.auth_id
    // }
   });
   res.redirect(url)
 }
})



// state=parse req.query.state to get auth_id

app.get('/connect/callback', function(req, res){
  var oauth2Client = new OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL+'/connect/callback'//developer console redirect url
  );

var authid=decodeURIComponent(req.query.state)
var code=req.query.code

console.log('AUTHOBJ', JSON.parse(authid).auth_id)
  oauth2Client.getToken(code, function (err, tokens) {//contain google.token
      // Now tokens contains an access_token and an optional refresh_token. Save them.

    // Add google token to Schema
    models.User.findOne({_id: JSON.parse(authid).auth_id}, function(err, user){
      user.google=tokens
      user.save(function(err, user) {
        if (err) {
          console.log('CHECK', err);
        } else {
          dbuser=user
        console.log('SAVED', user);
      }
    });

    })

    if (!err) {
      oauth2Client.setCredentials(tokens);
      res.send('gg')
    }
  });
})


app.get('/interactive', function(req, res){
  res.send('gg')
})
// new client





// rtm.start()
var port = 3000;
app.listen(port);
console.log('Express started. Listening on port %s', port);

module.exports = app;
