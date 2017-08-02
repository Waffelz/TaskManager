var connect = process.env.MONGODB_URI;
var mongoose = require('mongoose');
mongoose.connect(connect);
var schema = mongoose.Schema;

var Userschema = schema({
  SlackId: {
    type: String
  },
  SlackEmail: {
    type: String
  },
  SlackUsername: {
    type: String
  }
})

var Taskschema = schema({
  Subject: {
    type: String,
    required: true
  },
  Date: {
    type: String,
    required: true
  },
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  }
})

var User = mongoose.model('User', Userschema);
var Task = mongoose.model('Task', Taskschema);

module.exports = {
  User: User,
  Task: Task
}
