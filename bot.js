
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var rtm = new RtmClient(process.env.SLACK_BOT_TOKEN2);

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
    rtm.sendMessage(payload.data.result.fulfillment.speech, message.channel)
    console.log(payload);
  }).catch(function(err) {
    console.log(err)
  })

  //rtm.sendMessage('ok', message.channel) //move this into then
});

rtm.start();
