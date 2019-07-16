// const util = require('util');
const express = require('express');
const app = express();
const passport = require('passport');
const flash = require('connect-flash');
const fs = require('fs');
const request = require('request');
const { Pool, Client } = require('pg')

const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');

const LocalStrategy = require('passport-local').Strategy; // strategy for authenticating with a username and password

var currentAccountsData = [];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = function (app) {
  console.log("The status of user is " + user);
  app.get('/', (req, res, next) => { res.render('pages/index');
        console.log("The user is "+ req.user); })

  app.get('/register', (req, res) => res.render('register', {message: ''}))

  app.get('/add-ticket', (req, res) => res.render('add-ticket'))

  app.get('/login', (req, res) => {
      console.log("Attempting to log in at /login");
      //console.log(req.session.passport.user);
      if (req.isAuthenticated()) {
        user = true;
        console.log("Get login user status is " + user);
        console.log("login attempt 11");
        res.redirect('/profile');}
      else { res.render('login'); console.log("Not logged in, render the login page")}})

  app.get('/logout', function(req, res){
       user = false;
       console.log("Upon logout user status is " + user);
       console.log(req.isAuthenticated());
       req.logout();
       console.log(req.isAuthenticated());
       req.flash('success', "Logged out. See you soon!");
       res.redirect('/');
       })

   app.get('*', function (req, res, next) { // universal access variable, keep working
     console.log(req.user);
     res.locals.user = req.user || null;
     console.log(res.locals.user);
     next();})

  app.post('/register', async function(req, res)
    {
      var emailAddr = req.body.email;
      console.log("The email address is " + emailAddr);
      var uName = req.body.username;
      var pass = req.body.password;

      try {
          const client = await pool.connect();
          var pwd = await bcrypt.hash(req.body.password, 5);
          console.log("The password is " + req.body.password);
          console.log("The hashed password is " + pwd);
          console.log(typeof(pwd));
  		// VALIDATE AND REDIRECT
          console.log("message here");
          const result = await client.query("SELECT * FROM users where username='" + uName + "'");

  		console.assert(!result.rows[0], { result : result.rows[0], error : "User already exists" } );

  		if (result.rows[0]) {
  			  res.render('register', {message: 'User Already Exists Try Logigng In'}); }
      else {
          const emailAdded = await client.query("INSERT INTO users (username, password, email) VALUES ('" + uName + "', '" + pwd + "', '" + emailAddr + "')");
          res.redirect('login');}

        client.release();
        }
        catch (err)
        {
          console.error(err);
          res.send("Error " + err);
        }
      })
    app.post("/profile", async (req, res) => {
      	  console.log(req.body);
      	  console.log(req.body.Username);

      	  try {
              const client = await pool.connect()
      		var test = "update users set name = '"+ req.body.Name + "', email = '"+ req.body.email + "', age = '"+ req.body.Age + "'where username = '" + req.body.Username + "'";
              const update = await client.query(test);
      		//{"Name":"Julian","Usename":"jbiedka","password":"123","email":"jbiedka@sfu.ca","Age":"19"}
      		const result = await client.query("SELECT * FROM users where username='" + req.body.Username + "'");

      		console.assert(result.rows[0], { result : result.rows[0], error : "database error, user not found or is returning null" } );

      		res.render('profile', { 'r': result.rows[0] } );

      		client.release();
            } catch (err) {
              console.error(err);
              res.send("Error " + err);
            }
        })

    // app.get('/profile', async function (req, res) {
    //     const client = await pool.connect()
    //     const result = await client.query("SELECT * FROM users where username='" + "arash" + "'");
    //     console.log(req.isAuthenticated());
    //     console.log("Check here");
    //     console.log(result.rows[0]);
    //     res.render('profile', { 'r': result.rows[0] })})
      // app.post('/login', (req, res) => {
      //   passport.authenticate('local', {
      //     successRedirect: '/profile',
      //     failureRedirect: '/',
      //     failureFlash: true
      //   }) (req, res);
      // })
     app.post('/login', passport.authenticate('local'),//, {
            // successRedirect: '/profile',
            // failureRedirect: '/',
            // failureFlash: true}),
            async function(req, res) {
              console.log("login attempt 8");
              if (req.body.remember) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
              }
              else {
                console.log("login attempt 9");
                req.session.cookie.expires = false; // Cookie expires at end of session
                }
              var uname = req.body.username;
              var upass = req.body.password;
              	console.log(uname);
              	try {
                      const client = await pool.connect()
                      const result = await client.query("SELECT * FROM users where username='" + uname + "'");
              		console.assert( uname != "" && upass != "", { username: uname, password: upass, error : "username and password can't be empty" } );
              		if ( (uname != "" && upass != "") && result.rows[0]) {
              			if (bcrypt.compare(upass, result.rows[0].password)) {
                      console.log("why does not flash???");
                      req.flash('danger', "Oops. Incorrect login details.");
                      user = true;
                      console.log("After login post user status is " + user);
              				res.render('profile', { 'r': result.rows[0] });
              			} else {
              				res.send("Wrong password");
              			}
              		} else {
              			res.send("User not found");
              		}
              		client.release();
                    } catch (err) {
                      console.error(err);
                      res.send("Error " + err);
                    }

                 console.log("login attempt 10");
               });

// idea for using session based login came from a medium article https://medium.com/@timtamimi/getting-started-with-authentication-in-node-js-with-passport-and-postgresql-2219664b568c
      passport.use('local', new  LocalStrategy({passReqToCallback : true}, (req, username, password, done) => {

      	loginAttempt();
        console.log("login attempt");
      	async function loginAttempt() {
      		const client = await pool.connect()
      		try{
      			await client.query('BEGIN')
            console.log(username);
            // currentAccountsData array is empty, see in console.log. Why?
      			var currentAccountsData = await (client.query('SELECT username, name, email, password FROM users WHERE username=$1', [username], function(err, result) {
      				if(err) {
      					return done(err)}
      				if(result.rows[0] == null){
      					req.flash('danger', "Oops. Incorrect login details.");
      					return done(null, false, {message: 'No user found'});}
      				else{
                console.log(result.rows[0]);
                req.flash('danger', "Oops. Incorrect login details.");
      					bcrypt.compare(password, result.rows[0].password, function(err, isMatch) {
                  console.log("Bcrypt compare login attempt");
      						if (err) throw err;
      						else if (isMatch){
                    console.log("Passwords matched!");
                    return done(null, [{email: result.rows[0].email, firstName: result.rows[0].firstName}]);}
      						else{
                    console.log("login attempt 7");
      							req.flash('danger', "Oops. Incorrect login details.");
                    return done(null, false);}
      					});
      				}
      			}))
      		}
      		catch(e){throw (e);}
      	};
      }
      ))

      passport.serializeUser(function(user, done) {
      	done(null, user);
      });

      passport.deserializeUser(function(user, done) {
      	done(null, user);
      });

      }
