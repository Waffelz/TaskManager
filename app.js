var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var bot_token = process.env.BOT_USER_OAUTH_TOKEN || '';
var slack_token = process.env.SLACK_BOT_TOKEN || '';
var rtm = new RtmClient(bot_token);
var axios = require('axios')

// let channel;

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  // for (const c of rtmStartData.channels) {
	//   if (c.is_member && c.name ==='general') { channel = c.id }
  // }
  // // console.log(channel)
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// you need to wait for the client to fully connect before you can send messages
// rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
//   console.log(channel)
//   rtm.sendMessage("Hello!", channel);
// });

// TODO: OAuth the rtm.connect request
// TODO: once connected, must post the text of the latest message to api.ai
//       then, get the return message url using axios and split between google cal
//       and server render for a message on slack

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
 //  Message properties:
 //  { type: 'message',
 // channel: 'C6FGBKGE5',
 // user: 'U6GUU90J2',
 // text: '{text input on slack}',
 // ts: '1501610107.659857',
 // source_team: 'T6G6HGTAR',
 // team: 'T6G6HGTAR' }

  let userArr = [];
  var userMsg = message.text;
  var userId = message.user;
  var channelMsg = message.channel

  // axios.post('https:api.api.ai/v1/query?v=20150910', { // copy CURL from api.ai
  //     "query": userMsg, // can we just do [userMsg]?
  //     "timezone": "America/New_York",
  //     "lang": "en",
  //     "sessionId": userId
  //   }, {
  //     "headers": {
  //       "Authorization": `Bearer ${process.env.API_AI_TOKEN}`,
  //       // "Content-Type": `application/json; charset=utf-8`
  //     }
  //   }
  // ).then(function(payload) {
  //   console.log(payload); // Should be a JSON Object returned from the processed API.AI function.
  //                         // Needs to be sent to google cal and back as a message for slackbot
  // }).catch(function(err) {
  //   console.log("error was", err)
  // })

  rtm.sendMessage('Just processed it', channelMsg) //this is no doubt the lamest possible message handler, but you get the idea
});


rtm.start();
