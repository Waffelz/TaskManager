
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var rtm = new RtmClient(process.env.SLACK_BOT_TOKEN2);

let channel;

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

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  rtm.sendMessage('Hey', channel) //this is no doubt the lamest possible message handler, but you get the idea
});

rtm.start();
