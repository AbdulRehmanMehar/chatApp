const express = require('express');
const passport = require('passport');
const authRoutes = require('./routes/auth-routes'); // Self Created Auth Routes File
const profileRoutes = require('./routes/profile-routes'); // Self Created Profile Routes File
const passportSetup = require('./config/passport-setup'); // Self Created Passport Config File
const keys = require('./config/keys'); // Self Created Key  File
const Chat = require('./models/chat-model'); // Self Created Chat Model
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const socket = require('socket.io');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').createServer(app);
const io = require('socket.io')(server);


app.set('view engine','ejs');


// Static path for assets
app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.use(cookieSession({
  maxAge: 15 * 24 * 60 * 60 * 1000,
  keys: [keys.session.enctryptionkey]  
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




// cache disabling
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

// passport Intialization
app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => res.render('home', { user: req.user }));
server.listen(3000, () => console.log('app started on 3000'));

/*
------- Self Created Routes Setup
*/

app.use('/auth',authRoutes); // use authRoutes in "/auth"

app.use('/profile', profileRoutes );


/*
------ Mongoose Setup
*/
mongoose.connect(keys.mongoDB.uri , () => console.log('Connected to MongoDB'));

/*
------ Socket.io Setup
*/
io.on('connection',  (socket) => {

  socket.on('chat', (data) => {
    io.sockets.emit('chat' , data);
    Chat.findOne(
      {
        $or: [
          {users: {userOneID: data.userID ,userTwoID: "5a9415761897cf08d0403298"}}, 
          {users: {userOneID: "5a9415761897cf08d0403298", userTwoID: data.userID }}
        ]
      }
    ).then((chatExsists) => {
      if(chatExsists){
        Chat.findOneAndUpdate(
          
          {
            $or: [
              {users: {userOneID: data.userID ,userTwoID: "5a9415761897cf08d0403298"}}, 
              {users: {userOneID: "5a9415761897cf08d0403298", userTwoID: data.userID }}
            ]
          },
          
          {"$push":{"chatData":{message: data.message,userID: data.userID}}},
          { "new": true, "upsert": true },
          function (err, managerparent) {
            if (err) console.log(err);
          }
        );
      }else{
        new Chat({
          users: {
            userOneID: data.userID,
            userTwoID: "5a9415761897cf08d0403298"
          },
          chatData:[
            {
              message: data.message,
              userID: data.userID
            }
          ]
        }).save().then((newChat) => {
          
        });
      }
    });
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing',data);
  });

});
