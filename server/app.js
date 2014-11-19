'use strict';

// Module dependencies.
var application_root = __dirname,
	express = require( 'express' ), //Web framework
	path = require( 'path' ), //Utilities for dealing with file paths
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	morgan = require('morgan'),
	mysql = require('mysql'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	passport = require('passport'),
	flash = require('connect-flash'),
	LocalStrategy = require('passport-local').Strategy;;
 

var PORT = 3000;


//Create server
var app = express();

//session management middleware
app.use(cookieParser());
app.use(session({secret: 'fadsfdsf', 
                 saveUninitialized: true,
                 resave: true}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//Connect to database
var connectionPool = mysql.createPool({
	host: '127.0.0.1',
	user: 'root',
	password: '12345',
	database: 'findMe',
	multipleStatements: true
});


    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
 
// used to serialize the user for the session
passport.serializeUser(function(user, done) {
	done(null, user.id);
});
 
// used to deserialize the user
passport.deserializeUser(function(id, done) {
	connectionPool.query("select * from credentials where id = " + mysql.escape(id), function(err, rows){	
		done(err, rows[0]);
	});
});

    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
 
passport.use(new LocalStrategy({
	    // by default, local strategy uses username and password, we will override with email
	    usernameField : 'phoneNum',
	    passwordField : 'password',
	    passReqToCallback : true // allows us to pass back the entire request to the callback
	},
    function(req, phoneNum, password, done) { // callback with email and password from our form
 
         connectionPool.query("SELECT * FROM `users` WHERE `phoneNum` = '" + phoneNum + "'", function(err, rows){
			if (err) {
                return done(err);
            }
			 if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            } 
			
			// if the user is found but the password is wrong
            if (!(rows[0].password == password)){
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            }
			
            // all is well, return successful user
            connectionPool.query("select * from credentials where phoneNum='" + phoneNum + "'", function(err, rows) {
            	if (err) {
            		return done(err);
            	}
            	return done(null, rows[0]);	
            });
            		
		
		});
    })
);

// Configure server
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

//parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({type: 'application/vnd.api+json'}));

app.use(methodOverride());
app.use(morgan(':remote-addr :method :url :status'));







app.get('/login', function(req, res) {
	//display login page
	res.sendFile(path.join(application_root, '../client/login.html'));
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login'
}));

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});


//works as a barrier
app.use(function(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.redirect('/login');
	}
}, express.static(path.join(application_root, '../client/clientApp1')));



app.get('/call', function(req, res) {
	//require the Twilio module and create a REST client
	// Twilio Credentials 
	var accountSid = req.user.accountSid; 
	var authToken = req.user.authToken; 
	//require the Twilio module and create a REST client 
	var client = require('twilio')(accountSid, authToken);
	client.makeCall({
	   	url: "http://demo.twilio.com/docs/voice.xml",
	    to: req.user.to,
	    from: req.user.phoneNum
	}, function(err, responseData) {
	    res.end(responseData.to); 
	});
});



/*
	Start server
*/


app.listen(PORT, function() {
	console.log('server is running on port ' + PORT);
});


