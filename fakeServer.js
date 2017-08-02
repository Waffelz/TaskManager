var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//var { rtm, web } = require('./bot');

app.post('/interactive', function(req, res) {
  var b0dy = JSON.parse(req.body.payload);
  var wutDidTheySay = b0dy.actions[0].name;
  if (wutDidTheySay === 'yes') {
    var event = {
      summary: 'task',
      start: {
        'date':
      }
    }
  }
  res.end();

// if they clicked yes, get the json object with the subject and date and send it to the server so this can be sent
// to google calendar

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
