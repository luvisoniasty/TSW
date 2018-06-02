//jshint node: true, esversion: 6
//Express
const express = require('express');
//Path
const path = require('path');
//Parsers
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//Session
var session = require('express-session');
//Handlebars
const hbs = require('express-handlebars');
// Passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// Socket.io
const socketIo = require('socket.io');
const passportSocketIo = require('passport.socketio');
//Mongo/Mongoose
var mongo = require('mongodb');
var mongoose = require('mongoose');
//Express validator
var expressValidator = require('express-validator');
//Flash
var flash = require('connect-flash');
//Webpack
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

//Mongoose connect
mongoose.connect('mongodb://localhost:27017/microebaydb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Connected to MongoDB");
});

var users = require('./routes/users');

//Express in
const app = express();


// Passport.js Configuration
passport.serializeUser( (user, done) => {
  done(null, user);
});

passport.deserializeUser( (obj, done) => {
  done(null, obj);
});

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'),
      root    = namespace.shift(),
      formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

//Webpack
const compiler = webpack(webpackConfig);

// Passport.js init
app.use(passport.initialize());
app.use(passport.session());

//Static folder
app.use(express.static(path.join(__dirname + 'public')));

//Handlebars view engine
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: path.join(__dirname + '/public/hbs/layouts')}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname + '/public/hbs'));


// Connect Flash
app.use(flash());
//Global vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});
//Routing
app.route('/')
  .get((req, res) => {
    res.render('./index', {title: 'micro eBay'});
  });

app.use('/', users);

app.use(webpackDevMiddleware(compiler, {
  hot: true,
  filename: 'bundle.js',
  publicPath: '/',
  stats: {
    colors: true,
  },
  historyApiFallback: true,
}));

const server = app.listen(4000, function() {
  console.log('App listening at port 4000');
});