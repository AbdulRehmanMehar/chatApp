const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  userId: String,
  name: String,
  gender: String,
  photo: String,
  provider: String,
  status: String
});

const User = mongoose.model('user',userSchema);

module.exports = User;