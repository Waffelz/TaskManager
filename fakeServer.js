var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

//var { rtm, web } = require('./bot');

app.post('/interactive', function(req, res) {
  console.log("HEEEEYYYY");
  res.end();
  // if (!req.body.payload)
  // return res.status(400)
  //
  // var payload = JSON.parse(req.body.payload)
  //
  // if (payload.callback_id === "reminder.confirm") {
  //   var response = payload.actions[0].value
  //
  //   if (response === "yes")
  //   res.send(yes)
  //   //add to calednar
  //   else {
  //     var prev = payload.original_message;
  //     prev.attachments.pop();
  //     prev.attachments.push
  //   }
  // }
})

app.listen(3000);
