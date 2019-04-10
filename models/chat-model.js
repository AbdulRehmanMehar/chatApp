const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chatSchema = new Schema({
  to: mongoose.Schema.Types.ObjectId,
  from: mongoose.Schema.Types.ObjectId,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Chat = mongoose.model('chat', chatSchema);

module.exports = Chat;