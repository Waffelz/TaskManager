var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var bot_token = process.env.BOT_USER_OAUTH_TOKEN || '';
var slack_token = process.env.SLACK_BOT_TOKEN || '';
var rtm = new RtmClient(bot_token);

let channel;

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
	  if (c.is_member && c.name ==='general') { channel = c.id }
  }
  // console.log(channel)
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  rtm.sendMessage("Hello!", channel);
});

// TODO: OAuth the rtm.connect request
// TODO: once connected, must post the text of the latest message to api.ai
//       then, get the return message url using axios and split between google cal
//       and server render for a message on slack
console.log(rtm.connect(slack_token))


//
// // on new event, or when a message is sent
// rtm.on(event, function() {
//   axios.get("https://slack.com/api/channels.history")
//   .then((response) => {
//     if (response.latest) {
//       // Save this text to post it later on axios.post
//       console.log(response.messages[0].text)
//     }
//     return axios.post("api.ai url given once processed")
//   })
//   .then((res) => {
//     console.log(res)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
// })
//
//
//   // Once we get the text from the latest message, we post it to api.ai to process
//
// })
//
rtm.start();
