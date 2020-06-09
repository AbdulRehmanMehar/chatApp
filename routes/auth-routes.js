const router = require('express').Router();
const passport = require('passport');
const passportSetup = require('../config/passport-setup');
const User = require('../models/user-model'); //User Model

let restrict = (req,res,next) => {
  if(req.user){
    res.redirect('/profile');
  }else{
    next();
  }
}

//Auth Login
router.get('/login', restrict  ,(req,res) =>  res.render('login',{user: req.user}));

// Auth Logout

router.get('/logout', (req,res) => {
  // Handle with passport
  User.findOneAndUpdate(
    {
      provider: req.user.provider, 
      userId: req.user.userId
    },
    {status: "offline"}
  ).then(() => {
    req.logout();
    res.redirect('/');
  });
  
});

// Auth G+
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));
router.get('/google/redirect', passport.authenticate('google') , (req,res) => res.redirect('/profile'));

// Auth Facebook
// router.get('/facebook', passport.authenticate('facebook', { scope: ['profile'] }));
// router.get('/facebook/redirect', passport.authenticate('facebook'), (req, res) => res.redirect('/profile'));

// Auth Twitter
router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/redirect', passport.authenticate('twitter'), (req, res) => res.redirect('/profile'));



module.exports = router;