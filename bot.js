var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var rtm = new RtmClient(process.env.SLACK_BOT_TOKEN2);
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(process.env.SLACK_BOT_TOKEN2); // export rtm and web


var models = require('./models');

var axios = require('axios');

let channel;
var userMsg;
var userId;


rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
    if (c.is_member && c.name ==='xy') { channel = c.id }
  }
  console.log('something');
  return;
});

// rtm.on(RTM_EVENTS.MESSAGE, function(message) {
//   console.log('message: ', message);
// })


rtm.on(RTM_EVENTS.MESSAGE, function (message) {
  var dm = rtm.dataStore.getDMByUserId(message.user);
  if (!dm || dm.id !== message.channel || message.type !== 'message') {
    return;
  }
  var userMsg = message.text;
  var userId = message.user;

  var userobj=rtm.dataStore.getUserById(userId)

  models.User.findOne({slack_id: userId}, function(err, user) {
    if (err) {
      console.log('err', err);
    } else if (!user) {
      //do anything you need to do knowing you have no user

        var u = new models.User({
          slack_id: userId,
          slack_username: userobj.name,
          slack_email: userobj.profile.email,
          slack_dmid: message.channel,
        });
        u.save(function(err, user) {
          if (err) {
            console.log('CHECK', err);
          } else {
            var authlink= process.env.DOMAIN + '/connect?auth_id='+user._id
            rtm.sendMessage('Grant me access '+ authlink, message.channel)
          }
        });
    } else if (!user.google) {// Check if Google Key exists
        console.log('checking google key')
        var authlink= process.env.DOMAIN + '/connect?auth_id='+user._id
        rtm.sendMessage('Grant me access '+ authlink, message.channel)
      } else {
        //proceed to api.ai
        if (user.pendingAction) {
          rtm.sendMessage("Sorry! You have to first tell me if you want me to or not!", message.channel)
        }
        else {
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

            // console.log('**** ACTIONNNN ****', payload.data.result);
            // if (payload.data.result.action.split('.')[0] === "smalltalk")
            //   rtm.sendMessage(payload.data.result.fulfillment.speech, message.channel)
            if (payload.data.result.actionIncomplete) {
              rtm.sendMessage(payload.data.result.fulfillment.speech, message.channel)
            }  else {
              models.User.findOne({
                slack_id: userId
              }, function(err, user){
                if (err) {
                  console.log(err);
                }
                else if (! payload.data.result.actionIncomplete) {
                  user.pendingAction = {
                    date: payload.data.result.parameters.date,
                    subject: payload.data.result.parameters.subject,
                    channel: message.channel
                  }
                  user.save(function(err, user) {
                    if (err) {
                      console.log('omg')
                    }
                    else {
                      console.log('pending action updated')
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
                  })
                  // interactive message code
  //post message
                }//pending action does not exist else close
                // console.log(payload);
              })//inner findone close
            }

          })
          .catch(function(err) {
            console.log('eerrrrr', err)
            rtm.sendMessage('oops', message.channel)
          })// payload then close
        }
      };//google authed close else
    });//findone close
});//onmessage close




//rtm.start();

module.exports = {
  rtm,
  web
}
