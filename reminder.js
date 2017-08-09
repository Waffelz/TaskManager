var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var rtm = new RtmClient(process.env.SLACK_BOT_TOKEN2);
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(process.env.SLACK_BOT_TOKEN2);

var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;
var models = require('./models');

mongoose.connect(connect);
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

let channel;
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
    if (c.is_member && c.name ==='xy') { channel = c.id }
  }

});


rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
  models.Task.find({}, function(err, tasks){
    // console.log(tasks)
    console.log('recherche');
    tasks.forEach(function(item){
      if((Date.parse(item.date)-Date.now())<86400000){
        console.log(item)
        rtm.sendMessage("Remember to "+ item.subject+' today', item.requesterchannel)
      }
    })
  })
})




rtm.start()
