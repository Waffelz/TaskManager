var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');


var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;
var models = require('./models');
var {rtm, web} =require('./bot')
var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;

mongoose.connect(connect);
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

// generate id: with mongoose user model
app.get('/connect', function(req, res){
 if(req.query.auth_id){
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

//oauth stuff
app.get('/connect/callback', function(req, res){
  var oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.DOMAIN+'/connect/callback'//developer console redirect url
  );

var authid=decodeURIComponent(req.query.state)
var code=req.query.code


  oauth2Client.getToken(code, function (err, tokens) {//contain google.token
      // Now tokens contains an access_token and an optional refresh_token. Save them.

    // Add google token to Schema
    models.User.findOne({_id: JSON.parse(authid).auth_id}, function(err, user){
      user.google=tokens
      user.save(function(err, user) {
        if (err) {
          console.log('CHECK', err);
        } else {
          if (!err) {
            //console.log(dbuser.pendingAction.channel)
            oauth2Client.setCredentials(tokens);
            rtm.sendMessage('Ok thank you! Remind me to do something. Beware that you must give me a subject and date!', user.slack_dmid )
            res.send("You've granted me google access, congrats!");
          }
        console.log('SAVED', user);
      }
    });

    })


  });
})

// after authentication when user hits interactive message
app.post('/interactive', function(req, res) {
  console.log('ENTERED INTERACTIVE')
  var oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.DOMAIN+'/connect/callback'//developer console redirect url
  );

 var channel

  var b0dy = JSON.parse(req.body.payload);

  models.User.findOne({
    slack_id: b0dy.user.id
  }, function (err, user){
    if (err) {
      console.log('Found user err is', err);
    } else {
      oauth2Client.setCredentials(user.google)
      console.log("****", user);
      channel= user.pendingAction.channel
      var wutDidTheySay = b0dy.actions[0].name;
      //var slackID = b0dy.user.id;
      //var tasks = Task.find({user_id:slackID});
      var timeInMs = Date.now()
       if (timeInMs > user.google.expiry_date){
         oauth2Client.refreshAccessToken(function(err, tokens) {
           oauth2Client.setCredentials(tokens);
           user.google=tokens
           user.save(function(err, user) {
             if (err) {
               console.log('ERR REFRESHING TOKENS', err);
             } else {
               console.log('REFRESHed TOKENS');
             }
           });
         })
       }
        if (wutDidTheySay === 'yes') {
          console.log('INTERACTIVE YES')
          var event = {
            'summary': user.pendingAction.subject,
            'start': {
              'date': user.pendingAction.date,
              'time': 'America/Los_Angeles'
            },
            'end': {
              'date': user.pendingAction.date,
              'time': 'America/Los_Angeles'
            },
            'recurrence': [],
            'attendees': [],
            'reminders': {
              'userDefault': false,
              'overrides': [],
            }
            // save event based on google calendar api to save task
          };
          var task= models.Task({
            date: event.start.date,
            subject: event.summary,
            requesterId: user.slack_id,
            requesterchannel: user.slack_dmid,
          })
          task.save(function(err, user) {
            if (err) {
              console.log('CHECK', err);
            } else {
              console.log('NEW TASK SAVED')
            }
          })

          user.pendingAction=null
          user.save(function(err, user) {
            if (err) {
              console.log('CHECK', err);
            } else {
              console.log('cleared pending action');
            }
        })
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
      rtm.sendMessage('Ok! Adding task now! ', channel)
      }

      if (wutDidTheySay === 'no'){
        console.log('INTERACTIVE NO')
        user.pendingAction=null
        user.save(function(err, user) {
          if (err) {
            console.log('CHECK', err);
          } else {
            console.log('cleared pending action');
            rtm.sendMessage("Ok! I won't add the task!", channel)
          }
      })
    }

      res.end();
    }
  });

})

rtm.start()
var port = process.env.PORT || 3000;
app.listen(3000);
console.log('Express started. Listening on port %s', port);

module.exports = app;
