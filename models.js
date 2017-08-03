var mongoose = require('mongoose');

//creating users
var userSchema = mongoose.Schema({
  slack_id: String,
  slack_username: String,
  slack_email: String,
  slack_dmid: String,
  google: Object,
  pendingAction: Object
});
//creating tasks
var taskSchema =mongoose.Schema({
  date: String,
  subject: String,
  user_id: String,
  pending: Boolean
 })



User = mongoose.model('User', userSchema);
 Task = mongoose.model('Task', taskSchema);


module.exports = {
    User:User,
    Task:Task,

};
