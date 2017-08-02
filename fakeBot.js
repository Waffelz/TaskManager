

var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var rtm = new RtmClient(process.env.SLACK_BOT_TOKEN2);
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(process.env.SLACK_BOT_TOKEN2); // export rtm and web
var path = require('path');
var axios = require('axios');
var models = require('./fakeModels');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var axios = require('axios');

let channel;
let SlackId;

var userMsg;
var userId;
var date;


rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
    if (c.is_member && c.name ==='swetha') { channel = c.id }
  }
});

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
    console.log('message: ', message);
})

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
  userMsg = message.text;
  userId = message.user;
  if (message.subtype !== 'bot_message') {
    SlackId = userId;
    models.User.findOne({
      SlackId = message.user
    })
    .then(function(user) {
      if (!user) {
        new models.User({
          SlackId: message.user
        }).save(function(err, user) {
          var linkToGoTo = 'https://f15490b3.ngrok.io' + '/connect?SlackId' + SlackId;
          web.chat.postMessage(message.channel, 'Signup: ' + link);
        })
      }
    })

    axios.post(
      'https://api.api.ai/api/query?v=20150910', {
        query: userMsg,
        timezone: "America/Los_Angeles",
        lang: "en",
        sessionId: userId,
      }, {
        headers: {'Authorization': `Bearer ${process.env.API_AI_TOKEN}`}
      }
    ).then(function(payload) {
      var date = payload.data.result.parameters.date;
      //console.log("this is your data");
    //  if (payload.data.result.actionIncomplete)
      //rtm.sendMessage(payload.data.result.fulfillment.speech, message.channel)
      // else {
      //   rtm.sendMessage("I'm creating a reminder for you about " + payload.data.result.parameters.subject+ "on" + payload.data.result.parameters.date)
      // }
      if (payload.data.result.action.split('.')[0] === "smalltalk")
        rtm.sendMessage(payload.data.result.fulfillment.speech, message.channel)
      else {
        rtm.sendMessage(payload.data.result.fulfillment.speech, message.channel)

      if (! payload.data.result.actionIncomplete) {
        console.log("hey");
        web.chat.postMessage(
          message.channel,
          "Aight imma make a reminder: ",
          {
            "text": "Would you like me to set the reminder right now?",
            "attachments": [
              {
                "fallback": "You have to pick",
                "callback_id": "confirmation",
                "color": "#000",
                "attachment_type": "default",
                "actions": [
                  {
                    "name": "yes",
                    "text": "yes",
                    "type": "button",
                    "value": "yes"
                  },
                  {
                    "name": "no",
                    "text": "no",
                    "type": "button",
                    "value": "no"
                  }
                ]
              }
            ]
          }
        )
      }
    }
      console.log(payload);
      new models.Task({
        Subject: payload.data.result.parameters.subject,
        Date: payload.data.result.parameters.date,
        UserId: user._id
      }).save(function(err, task) {

      })
    }).catch(function(err) {
      console.log('eerrrrr', err)
    })
  }
});
// var slackUser = rtm.dataStore.getUserById(msg.user) // ALL STILL IN THE RTM ON FUNCTION
// if (!slackUser) {
//   throw error
// }

// create a route called interactive where we get a message


rtm.start();

app.post('/interactive', function(req, res) {
  var b0dy = JSON.parse(req.body.payload);
  var wutDidTheySay = b0dy.actions[0].name;
  if (wutDidTheySay === 'yes') {
    var event = {
      'summary': 'task',
      'start': {
        'date': date,
        'time': 'America/Los_Angeles'
      },
      'end': {
        'date': date,
        'time': 'America/Los_Angeles'
      },
      'recurrence': [],
      'attendees': [],
      'reminders': {
        'userDefault': false,
        'overrides': [],
      }
    };
    calendar.events.insert({
      auth: '',
      calendarId: 'primary',
      resource: event,
    }, function(err, event) {
      if (err) {
    console.log('There was an error contacting the Calendar service: ' + err);
    return;
  }
  console.log('Event created: %s', event.htmlLink);
});
}
  res.end();
}

app.listen(3000);

module.exports = {
  rtm,
  web
}

// rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
//   for (const c of rtmStartData.channels) {
//     if (c.is_member && c.name ==='swetha') { channel = c.id }
//   }
// });
//
// rtm.on(RTM_EVENTS.MESSAGE, function(message) {
//     //console.log('message: ', message);
// })
// rtm.on(RTM_EVENTS.MESSAGE, function (message) {
//   userMsg = message.text;
//   userId = message.user;
//   if (message.subtype !== 'bot_message') {
//     axios.post(
//       'https://api.api.ai/api/query?v=20150910', {
//         query: userMsg,
//         timezone: "America/Los_Angeles",
//         lang: "en",
//         sessionId: userId,
//       }, {
//         headers: {'Authorization': `Bearer ${process.env.API_AI_TOKEN}`}
//       }
//     ).then(function(payload) {
//       //console.log(payload);
//       models.User.find({
//         SlackId: message.user
//       })
//       .then(function(user) {
//         //console.log(user);
//         var newTask = new Task({
//           Subject: payload.data.result.parameters.subject,
//           Date: payload.data.result.parameters.date,
//           UserId: user._id
//         }).save(function(err, task) {
//           if (err)
//             console.log(err);
//           else
//             console.log("saved", task)
//         })
//         if (payload.data.result.action.split('.')[0] === "smalltalk")
//           rtm.sendMessage(payload.data.result.fulfillment.speech, message.channel)
//         else {
//           rtm.sendMessage(payload.data.result.fulfillment.speech, message.channel)
//
//         if (! payload.data.result.actionIncomplete) {
//           //console.log("hey");
//           web.chat.postMessage(
//             message.channel,
//             "Aight imma make a reminder: ",
//             {
//               "text": "Would you like me to set the reminder right now?",
//               "attachments": [
//                 {
//                   "fallback": "You have to pick",
//                   "callback_id": "confirmation",
//                   "color": "#000",
//                   "attachment_type": "default",
//                   "actions": [
//                     {
//                       "name": "yes",
//                       "text": "yes",
//                       "type": "button",
//                       "value": "yes"
//                     },
//                     {
//                       "name": "no",
//                       "text": "no",
//                       "type": "button",
//                       "value": "no"
//                     }
//                   ]
//                 }
//               ]
//             }
//           )
//         }
//       }
//       })
//
//       //console.log(payload);
//     })
//
//     .catch(function(err) {
//       console.log('eerrrrr', err)
//     })
//   }
// });
// // var slackUser = rtm.dataStore.getUserById(msg.user) // ALL STILL IN THE RTM ON FUNCTION
// // if (!slackUser) {
// //   throw error
// // }
//
// // create a route called interactive where we get a message
//
//
// rtm.start();
//
// module.exports = {
//   rtm,
//   web
// }
