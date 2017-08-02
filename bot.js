
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var rtm = new RtmClient(process.env.SLACK_BOT_TOKEN2);
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(process.env.SLACK_BOT_TOKEN2); // export rtm and web


var axios = require('axios');

let channel;
var userMsg;
var userId;

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
    if (c.is_member && c.name ==='swetha') { channel = c.id }
  }
});

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
    console.log('message: ', message);
})
// rtm.sendMessage = function sendMessage(text, channel) {
//   return this.send({
//     text: 'hi',
//     channel: channel,
//     type: RTM_API_EVENTS.MESSAGE
//   });
// };


rtm.on(RTM_EVENTS.MESSAGE, function (message) {
  userMsg = message.text;
  userId = message.user;
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
    //console.log("this is your data");
  //  if (payload.data.result.actionIncomplete)
    rtm.sendMessage(payload.data.result.fulfillment.speech, message.channel)
    // else {
    //   rtm.sendMessage("I'm creating a reminder for you about " + payload.data.result.parameters.subject+ "on" + payload.data.result.parameters.date)
    // }

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
    console.log(payload);
  }).catch(function(err) {
    console.log('eerrrrr', err)
  })
});
// var slackUser = rtm.dataStore.getUserById(msg.user) // ALL STILL IN THE RTM ON FUNCTION
// if (!slackUser) {
//   throw error
// }

// create a route called interactive where we get a message


rtm.start();
