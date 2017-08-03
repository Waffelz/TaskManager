var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');


var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;
var models = require('./models');
var {rtm, web} =require('./fakeFakeBot')
var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;

Task = models.Task

mongoose.connect(connect);
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

// generate id: with mongoose user model
app.get('/connect', function(req, res){
  console.log('niside connect');
 if(req.query.auth_id){
   console.log('has auth id');
   var oauth2Client = new OAuth2(
     process.env.GOOGLE_CLIENT_ID,
     process.env.GOOGLE_CLIENT_SECRET,
     process.env.DOMAIN+'/connect/callback'//developer console redirect url
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
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.DOMAIN+'/connect/callback'//developer console redirect url
  );

var authid=decodeURIComponent(req.query.state)
var code=req.query.code

console.log('AUTHOBJ', JSON.parse(authid).auth_id)
  oauth2Client.getToken(code, function (err, tokens) {//contain google.token
      // Now tokens contains an access_token and an optional refresh_token. Save them.

    // Add google token to Schema
    var dbuser;
    models.User.findOne({_id: JSON.parse(authid).auth_id}, function(err, user){
      user.google=token
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
      console.log(dbuser.pendingAction.channel)
      oauth2Client.setCredentials(tokens);
      rtm.sendMessage('Ok thank you! Remind me to do something. Beware that you must give me a subject and date!', dbuser.pendingAction.channel )
      res.end();
    }
  });
})


app.post('/interactive', function(req, res) {
  var oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.DOMAIN+'/connect/callback'//developer console redirect url
  );

  var b0dy = JSON.parse(req.body.payload);
  var wutDidTheySay = b0dy.actions[0].name;
  //var slackID = b0dy.user.id;
  //var tasks = Task.find({user_id:slackID});
  //find the user in db, looking 'pending field for task info and make the event' only if action is yes
    if (wutDidTheySay === 'yes') {
      var event = {
        'summary': 'hi',
        'start': {
          'date': new Date(),
          'time': 'America/Los_Angeles'
        },
        'end': {
          'date': new Date(),
          'time': 'America/Los_Angeles'
        },
        'recurrence': [],
        'attendees': [],
        'reminders': {
          'userDefault': false,
          'overrides': [],
        }
      };
    }

    calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      resource: event,
    }, function(err, event) {
      if (err) {
        console.log('There was an error contacting the Calendar service: ' + err);
      }
      else {
        console.log('Event created: %s', event.htmlLink);
      }
    });
  rtm.sendMessage('Ok! Adding task now! ', 'D6G6F0MQU')
  res.end();
})





rtm.start()
var port = 3000;
app.listen(port);
console.log('Express started. Listening on port %s', port);

module.exports = app;
