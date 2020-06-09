const express = require('express');
const passport = require('passport');
const authRoutes = require('./routes/auth-routes'); // Self Created Auth Routes File
const profileRoutes = require('./routes/profile-routes'); // Self Created Profile Routes File
const passportSetup = require('./config/passport-setup'); // Self Created Passport Config File
const keys = require('./config/keys'); // Self Created Key  File
const mongoose = require('mongoose');
const session = require('express-session');
const socket = require('socket.io');
const path = require('path');
const app = express();
const Chat = require('./models/chat-model');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passportSocketIo = require('passport.socketio');
const server = require('http').createServer(app);
const io = socket(server);

/*
------ Mongoose Setup
*/
mongoose.connect(keys.mongoDB.uri, { useNewUrlParser: true } , () => console.log('Connected to MongoDB'));

let theStore = new MongoStore({
  mongooseConnection: mongoose.connection
});

app.set('view engine','ejs');
app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.use(session({
  resave: false,
  key: 'express.sid',
  saveUninitialized: false,
  secret: keys.session.enctryptionkey,
  store: theStore,
  cookie: { maxAge: 60000 }
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

passportSetup(passport);

app.get('/', (req, res) => res.render('home', { user: req.user }));
app.get('/privacy-policy', (req, res) => res.render('privacy-policy'));
server.listen(keys.app.PORT, () => console.log('app is running on PORT:'+ keys.app.PORT));

/*
------- Self Created Routes Setup
*/

app.use('/auth',authRoutes); // use authRoutes in "/auth"

app.use('/profile', profileRoutes );


/*
------ Socket.io Setup
*/

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'express.sid',
  secret: process.env.encKey || keys.session.enctryptionkey,
  store: theStore,
  passport: passport,
  success: (data, accept) => {
    accept();
  },
  fail: (data, message, error, accept) => {
    if (error)
      throw new Error(message);
    accept(null, false);
  },  

}));

let socks = [];

io.on('connection', (socket) => {

  socks.push({
    socket: socket.id,
    uid: socket.request.user._id,
    user: socket.request.user
  });
  
  io.emit('users', socks);

  socket.on('message', (data) => {
    if(data.to && data.message){
      let to = socks.filter(sock => sock.uid == data.to)[0].socket;
      let chat = new Chat({
        to: data.to,
        from: socket.request.user._id,
        message: data.message
      });
      chat.save()
        .then(_ => io.to(to).emit('message', { from: socket.request.user._id, message: data.message }));
    }
  });

  socket.on('get-conversation', (uid) => {
    let qry = {
      $or: [
        {to: uid, from: socket.request.user._id},
        {to: socket.request.user._id, from: uid}
      ]
    };
    Chat.find(qry).exec()
      .then(results => {
        socket.emit('conversation', results);
      })
  });

  socket.on('disconnect', () => {
    socks = socks.filter(sock => sock.socket !== socket.id);
  });

});