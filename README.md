# TM

A slack bot that allows team members to actively schedule tasks onto google calendar.
This project used slack API, google's API.AI, and google calendar api.
Once the user messages the slack bot asking to create a reminder for a certain task on a certain date, api ai parses for the particular task and date and ultimately adds it to the user's calendar after the authentication process is allowed.

Runs ok on localhost&ngrok
To remian ok on heroku:
1. in env.sh update domain and redirect url
2. on google api update auth redirect url
3. on slack api update interactive message request url
4. update all config variables on heroku
5. (optional) reminder.js reminds user some time before the event (depends on heroku scheduler cycle) takes place, to get it working consult https://devcenter.heroku.com/articles/scheduler
6. bon chance:)
