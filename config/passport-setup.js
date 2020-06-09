const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const TwitterStrategy = require('passport-twitter');
const keys = require('./keys');
const User = require('../models/user-model');

let getImg4mGp = (urI) => { // Get Full Size Image From G+
  return urI.replace(/sz=50/, '');
};

let getImg4mTwitter = (urI) => { // Get Full Size Image From G+
  return urI.replace(/_normal/, '');
};


module.exports = (passport) => {

  /*
  ---------- serialize & deserialize process
  */

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
      done(null, user);
    });
  });

  /*
  ---------- Twitter Strategy
  */

  passport.use(new TwitterStrategy({
    consumerKey: keys.twitter.consumerKey,
    consumerSecret: keys.twitter.consumerSecret,
    callbackURL: keys.twitter.callbackURL
  }, (token, tokenSecret, profile, done) => {
    User.findOne({ provider: profile.provider, userId: profile.id }).then((userExsists) => {
      if (userExsists) {
        done(null, userExsists);
      } else {
        new User({
          userId: profile.id,
          name: profile.displayName,
          gender: "undefined",
          photo: getImg4mTwitter(profile.photos[0].value),
          provider: profile.provider,
          status: "online"
        }).save().then((newUser) => {
          done(null, newUser);
        });
      }
    });
  }
  ));


  /*
  ---------- Facebook Strategy
  */

  // passport.use(new FacebookStrategy({
  //   clientID: process.env.facebookKey || keys.facebook.clientID,
  //   clientSecret: process.env.facebookSecret || keys.facebook.clientSecret,
  //   callbackURL: process.env.facebookCb || keys.facebook.callbackURL
  // }, (accessToken, refreshToken, profile, done) => {
  //   User.findOne({ provider: profile.provider, userId: profile.id }).then((userExsists) => {
  //     if (userExsists) {
  //       done(null, userExsists);
  //     } else {
  //       let gender, photo;
  //       (profile.gender) ? gender = profile.gender : gender = "undefined";
  //       (profile.photos[0].value) ? photo = profile.photos[0].value : photo = "../img/person/dummy.jpg";
  //       new User({
  //         userId: profile.id,
  //         name: profile.displayName,
  //         gender: gender,
  //         photo: photo,
  //         provider: profile.provider,
  //         status: "online"
  //       }).save().then((newUser) => {
  //         done(null, newUser);
  //       });
  //     }
  //   });
  // }
  // ));

  /*
  ---------- Google plus Strategy
  */

  passport.use(new GoogleStrategy({
    clientID:  keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: keys.google.callbackURL
  }, (accessToken, refreshToken, profile, done) => {
    User.findOne({ provider: profile.provider, userId: profile.id }).then((userExsists) => {
      if (userExsists) {
        done(null, userExsists);
      } else {
        new User({
          userId: profile.id,
          name: profile.displayName,
          gender: profile.gender,
          photo: getImg4mGp(profile.photos[0].value),
          provider: profile.provider,
          status: "online"
        }).save().then((newUser) => {
          done(null, newUser);
        });
      }
    });
  }));

}