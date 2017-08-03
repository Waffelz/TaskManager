var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  slack_id: String,
  slack_username: String,
  slack_email: String,
  slack_dmid: String,
  google: Object,
  pendingAction: Object
});

// var Task=mongoose.Schema({
//   date: String,
//   subject: String
// })
//hey


User = mongoose.model('User', userSchema);
// Task = mongoose.model('Task', taskSchema);


module.exports = {
    User:User,
    // Task:Task,

};
