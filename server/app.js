/**
 *Module dependencies
 */

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const config = require('./config/config');
const mongoose = require('mongoose');
const handlebars = require('express-handlebars');
const mongodbStore = require('connect-mongo')(session);


//==============================================================================

/**
 *Create app instance
 */

const app = express();

//==============================================================================

/**
 *Module Variables
 */

const port = process.env.PORT || 3030;
const env = config.env;
app.locals.errMsg = app.locals.errMsg || null;

//==============================================================================

/**
 *Module Settings and Config
 */

app.set('port', port);
app.set('env', env);

/**
 *DB Config
 */
mongoose.connect(config.dbURL);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('connected', function () {
    return console.log('Successfully connected to ' + config.dbURL);
});
db.once('disconnected', function () {
    return console.error('Successfully disconnected from ' + config.dbURL);
});

//==============================================================================

/**
 *App Middlewares
 */

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session(
    {
        name: config.sessionName,
        store: new mongodbStore({
            mongooseConnection: mongoose.connection,
            touchAfter: 24 * 3600
        }),
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 15 // 15 minutes
        }
    }));


//==============================================================================

/**
 *Passport configuration
 */

/*const User = require('./models/user');
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new LocalStrategy(User.authenticate()));*/

//==============================================================================

/**
 *Routes
 */

const googleRoutes = require('./api/data');

app.use('/api/v1/', googleRoutes);

//==============================================================================

/**
 *Error Handling
 */


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

//==============================================================================

/**
 *Export Module
 */

module.exports = app;

//==============================================================================
