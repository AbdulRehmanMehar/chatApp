const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chatSchema = new Schema({
  users: {
    userOneID: String,
    userTwoID: String
  },
  chatData: [
    {
      message: String,
      userID: String
    }
  ]
});

const Chat = mongoose.model('chat',chatSchema);

module.exports = Chat;