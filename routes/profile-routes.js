const router = require('express').Router();
const bodyParser = require('body-parser');
const User = require('../models/user-model');
const Chat = require('../models/chat-model');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
// Midleware to check if user is logged in
const restrict = (req,res,next) => {
  if(!req.user){
    // if user is not logged in
    res.redirect('/auth/login');
  }else{
    next();
  }
};



router.get('/', restrict ,(req,res) => {
  User.findOneAndUpdate(
    {
      provider: req.user.provider, 
      userId: req.user.userId
    },
    {status: "online"}
  ).then(() => {
    res.render('profile', { user: req.user });
  });
});

// Edit Profile
router.get('/edit', restrict , (req,res) => {
  res.render('edit-profile', {user: req.user});
});

// chat app
router.get('/chat', restrict , (req,res) => {
  // Fetch All User Information from DB
  User.find({}, (err,userdata) => {
    Chat.find({}, (err, chatData) => {
      if(userdata && chatData){
        res.render('chat', { user: req.user , clientList: userdata , chatList: chatData });
      }else{
        res.render('chat', { user: req.user});
      }
    });
  });
});

// handle form to update profile
router.post('/updateProfile', urlencodedParser, (req,res) => {
  User.findOneAndUpdate(
    {
      provider: req.user.provider, 
      userId: req.user.userId
    },
    {
      name: req.body.name,
      gender: req.body.gender,
      photo: req.body.img
    }
  ).then(() => {
      User.findById({_id: req.user._id}).then((result) => {
        (result) ? res.redirect('/profile') : res.redirect('/');
      });
    }
  );
});


module.exports = router;