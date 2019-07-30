const PORT = process.env.PORT || 5000
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const {OAuth2Client} = require('google-auth-library');
const express = require('express')
const request = require('request');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const util = require('util');
const fs = require('fs');
const { Pool, Client } = require('pg')
const uuidv4 = require('uuid/v4');

const app = express();
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json());
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('cookie-parser')())
app.use(cookieParser('secretString'));

global.users = false;

var server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
const http = require('http').Server(app);
var io = require('socket.io').listen(server) || require('socket.io')(http)

io.on('connection', function(socket) {
    console.log('Client connected.');
    socket.on('username', function(username) {
        socket.username = username;
        io.emit('is_online', '🔵 <i>' + socket.username + ' joined the chat..</i>');
    });

    socket.on('disconnect', function(username) {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('chat_message', function(message) {
        io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
    });

});

const LocalStrategy = require('passport-local').Strategy; // strategy for authenticating with a username and password

var currentAccountsData = [];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

  app.use(express.static(path.join(__dirname, 'public')))
  app.use(express.json())
  app.use(express.urlencoded({extended:false}))
  app.use(bodyParser.json());
  app.use(require('cookie-parser')())
  app.use(require('body-parser').urlencoded({ extended: true }))

  app.use(cookieParser('secretString'));


  app.use(session({
      secret: 'bulky keyboard',
      resave: true,
      cookie: { maxAge: 120000 },
      saveUninitialized: true
      }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())

  app.use(function(req, res, next){
      res.locals.success_messages = req.flash('success_messages');
      res.locals.error_messages = req.flash('error_messages');
      res.locals.warning = req.flash('warning'); // how to make it work?
      next();
  });

  //Access Control
  function authcheck(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    else {
      res.render('login', {message: 'Not authorized, redirect to login'});
    }
  }

  app.get('*', function (req, res, next) { // universal access variable, keep working
     console.log("THE USER IS currently " + req.isAuthenticated());
     global.uname = null;
     if(req.user){
     uname = req.user[0].username;}
     //console.log(req.session.passport.user);
     //console.log(req.user.username);
     res.locals.user = req.user || null;
     if(res.locals.user != null){console.log(res.locals.user);}
     next();})

     app.get('/', (req, res, next) => {
       dummy_array = [];
       res.render('pages/index', {title: "Home", userData: req.user, n: dummy_array, message: false});
       console.log("The user  in '/' is "+ req.user); })
   //Search & Display Tickets
     app.post('/', async(req, res) =>{
       var initialLocation = req.body.origin;
       var destinationLocation = req.body.destination;
       var day = req.body.date;
       try{
         const client = await pool.connect();
         dummy_array = [];
         await client.query("SELECT * FROM tickets where countryfrom='" + initialLocation + "' AND countryto='" + destinationLocation + "' AND date='" + day + "'", function(err, tktRes){
           if (tktRes.rows[0]) {
             console.log(tktRes.rows);
             res.render('pages/index', { 'n': tktRes.rows, message: false} );
           }
           else {
             res.render('pages/index', {message: 'no tickets found', n: dummy_array});
           }
           client.release();
         });

       }
       catch(err)
       {
         console.error(err);
         res.send("Error " + err);
       }
     }
   )

  app.get('/chat', authcheck, function(req, res) {
      console.log(req.user);
      res.render('chat');
  });

  app.get('/register', (req, res) => res.render('register', {title: "Register", userData: req.user, message: ''}))

  app.get('/add-ticket', authcheck, (req, res) => res.render('add-ticket', {username: req.user[0].username}))

  app.get('/profile', authcheck, async function (req, res, next) {
        console.log("GOOOOOOOOOOOOOD?");
        console.log(req.user);
        console.log(req.user[0].username); // WHY IS THIS UNDEFINED???
        if(req.isAuthenticated()){
          console.log("I am here");
          try {
              const client = await pool.connect()
          	  const result = await client.query("SELECT * FROM users where username='" + req.user[0].username + "'"); // CANNOT ACCESS req.user.username and can get req.user as an object, cannot get specific features within the object
              const result_ticket = await client.query("SELECT * FROM tickets where username='" + req.user[0].username + "'"); // fix this so it matches username
          	  console.assert(result.rows[0], { result : result.rows[0], error : "database error, user not found or is returning null" } );
          	  res.render('profile', { 'c': result_ticket.rows,'r': result.rows[0] } );
          	  client.release();
            } catch (err) {
              console.error(err);
              res.send("Error " + err);
            }
        }
        else{
		  console.log("login failed")
          res.redirect('/login');
        }
        });

  app.get('/login', (req, res, next) => {

      if (req.isAuthenticated()) {
        users = req.isAuthenticated();
        console.log("isAuthenticated returned true");
        res.redirect('/profile');}
      else { res.render('login', {title: "Log in", userData: req.user, message: req.session.success});
        //delete res.session.success;
        console.log("Not logged in, render the login page")}})

  app.get('/logout', authcheck, function(req, res){
       req.isAuthenticated();
       req.logout();
       users = req.isAuthenticated();
       console.log("Upon logout user status is " + users);
       res.redirect('/'); })

  app.post('/ticket',function(req,res){
           var fname = req.body.fname;
           var lname = req.body.lname;
           var flightno = req.body.flightno;
           var countryfrom = req.body.countryfrom;
           var countryto = req.body.countryto;
           var airline = req.body.airline;
           var date = req.body.date;
           var time = req.body.time;
           var uname = req.body.uname;

           pool.connect();
           var sql = "INSERT INTO tickets (fname,lname,flightno,countryfrom,countryto,airline,date,time,username) VALUES ('"+fname+"','"+lname+"','"+flightno+"','"+countryfrom+"','"+countryto+"','"+airline+"','"+date+"','"+time+"','"+uname+"')";
           pool.query(sql, function(error,result){
             if (error){
               console.log(error);
             }
             else {
               console.log("ticket added");
               res.redirect('/');
             }
           })
       })

	app.get('/googlelogin:t', async function(req, res) {
		var token = req.params.t.toString();
		token = token.replace(':', '');

		const CLIENT_ID = "915733896108-03kb0m46abmrm4qq59vvu650rp86fulm.apps.googleusercontent.com";
		const client = new OAuth2Client(CLIENT_ID);
		async function verify() {
		  const ticket = await client.verifyIdToken({
			  idToken: token,
			  audience: CLIENT_ID
		  });
		  const payload = ticket.getPayload();
		  const userid = payload['sub'];
		}
		verify().catch(console.error);
		//res.send(token);

		// 1. Send HTTP request to google for verification
		let xhr = new XMLHttpRequest();

		// 2. Configure it: GET-request for the URL /article/.../load
		xhr.open('GET', 'https://oauth2.googleapis.com/tokeninfo?id_token=' + token);

		// 3. Send the request over the network
		xhr.send();

		// 4. This will be called after the response is received
		xhr.onload = async function() {
		  if (xhr.status != 200) { // analyze HTTP status of the response
			console.error("Error: " + xhr.status + ": " + xhr.statusText) // e.g. 404: Not Found
		  } else {

			const responseObject = JSON.parse(xhr.responseText);
			if (responseObject.email_verified) {
				const client = await pool.connect();
				await client.query("SELECT * from users where username='GOOGLE#AUTH#USER:" + responseObject.email + "'", async function(error, result) {
					if (result.rows[0]) {
						// Google user already exists:
						console.warn("In DB")
						console.warn("About to try login");
						var v = [{'email' : responseObject.email, 'username' : "GOOGLE#AUTH#USER:" + responseObject.email, 'password' : ''}]
						req.login(v, function(err){
							if(err) return err;
							res.redirect('/login');
						});
					} else {
						// Signing in with google for the first time:
						var sqlString = "(username, password, email, name) VALUES ('GOOGLE#AUTH#USER:" + responseObject.email + "', '' ,'" + responseObject.email + "', '" + responseObject.name + "')";
						console.warn("Not in DB")
						await client.query("INSERT INTO users " + sqlString);
						console.warn("About to try login");
						var v = [{'email' : responseObject.email, 'username' : "GOOGLE#AUTH#USER:" + responseObject.email, 'password' : ''}]
						req.login(v, function(err){
							if(err) return err;
							res.redirect('/login');
						});
					}
				})
				client.release();
			}
		  }
		};

		xhr.onerror = function() {
		  console.error("Request failed");
		};
	})
  app.post('/register', async function(req, res)
    {
      var emailAddr = req.body.email;
      console.log("The email address is " + emailAddr);
      var uName = req.body.username;

      try {
          const client = await pool.connect();
          var pwd = await bcrypt.hash(req.body.password, 5);

          const result = await client.query("SELECT * FROM users where username='" + uName + "'");

  		console.assert(!result.rows[0], { result : result.rows[0], error : "User already exists" } );

  		if (result.rows[0] || (uName.includes("GOOGLE#AUTH#USER:") == true )) {
          req.flash('warning', "This email address is already registered. <a href='/login'>Log in!</a>");
  			  res.render('register', {message: 'User Already Exists Try Logigng In'}); }
      else {
          client.query("INSERT INTO users (username, password, email) VALUES ('" + uName + "', '" + pwd + "', '" + emailAddr + "')");
          var nodemailer = require('nodemailer');
            /*rand=Math.floor((Math.random() * 100) + 54);
            host=req.get('host');
            link="http://"+req.get('host')+"/verify?id="+rand;*/
            var transporter = nodemailer.createTransport(
            {
              service: 'gmail',
              auth: { user: 'noreply.skypal@gmail.com',pass: 'SkyPal*0*'}
            });

            var mailOptions = {
              from: 'noreply.skypal@gmail.com',
              to: emailAddr,
              subject: 'Welcome to Skypal',
              text: 'Hello!',
              html: 'Hello, <br><br> Thank you for registring SkyPal! <br><br>Best, <br> Team SkyPal'
            };//<a href="+link+">Click here to verify</a>

            transporter.sendMail(mailOptions, function(error, info)
            {
              if (error)
                console.log(error);
              else
                console.log('Email sent: ' + info.response);

            });
          req.session.success = "Registered successfully, log in"
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
          console.log("kk"+req.body.pic);

      	  try {
              const client = await pool.connect()

            		var test = "update users set name = '"+ req.body.Name + "', email = '"+ req.body.email + "', age = '"+ req.body.Age +"', description = '" + req.body.description +"', q_1 = '" + req.body.sos +"', q_2 = '" + req.body.dri +"', q_3 = '" + req.body.smo + "'where username = '" + req.body.Username + "'";

              const update = await client.query(test);
      		//{"Name":"Julian","Usename":"jbiedka","password":"123","email":"jbiedka@sfu.ca","Age":"19"}
      		const result = await client.query("SELECT * FROM users where username='" + req.body.Username + "'");
          const result_ticket = await client.query("SELECT * FROM tickets where username='" + req.body.Username + "'"); // fix this so it matches username
          var a = "arash";
          var b = "Denys";
          const checking_a = await client.query("SELECT * FROM users where username='" + a + "'");
          const checking_b = await client.query("SELECT * FROM users where username='" + b + "'");
      		console.assert(result.rows[0], { result : result.rows[0], error : "database error, user not found or is returning null" } );
          console.log("WE ARE HERE!!!!!!!!!!!!!!!!!!!")
          var match_percent = 80;
          q1_a = checking_b.rows[0].q_1;
          q1_b = checking_a.rows[0].q_1;
          if(q1_a == q1_b){
            match_percent += 1;
            console.log("THE QUESTIONS MATCHED");
          }
          else {
            console.log("THE QUESTION 1 DID NOT MATCH");
          }

          console.log("WE ARE HERE DONE !!!!!!!!!!!!!!!!!!!")
      		res.render('profile', { 'c': result_ticket.rows,'r': result.rows[0] } );

      		client.release();
            } catch (err) {
              console.error(err);
              res.send("Error " + err);
            }
        })

     app.post('/login', passport.authenticate('local'),//, {
    // successRedirect: '/profile',
    // failureRedirect: '/',
    // failureFlash: true}),
    async function(req, res) {
		if (req.body.username.toString().includes("GOOGLE#AUTH#USER:")) {
			  res.send("Error with google authentication");
			  return "error with google auth";
		}

      console.log(req.isAuthenticated());
      console.log("The user is currently " + req.session.passport.user);
      if (req.body.remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
      }
      else {
        req.session.cookie.expires = false; // Cookie expires at end of session
        }
      console.log(req.body.username);
      var uname = req.body.username;
      var upass = req.body.password;
      	try {
              const client = await pool.connect()
              const result = await client.query("SELECT * FROM users where username='" + uname + "'");
              const result_ticket = await client.query("SELECT * FROM tickets where username='" + uname + "'"); // fix this so it matches username
      		console.assert( uname != "" && upass != "", { username: uname, password: upass, error : "username and password can't be empty" } );
      		if ( (uname != "" && upass != "") && result.rows[0]) {
      			if (bcrypt.compare(upass, result.rows[0].password)) {
              users = req.isAuthenticated();
              res.render('profile', { 'c': result_ticket.rows,'r': result.rows[0] });
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
       });

// idea for using session based login came from a medium article https://medium.com/@timtamimi/getting-started-with-authentication-in-node-js-with-passport-and-postgresql-2219664b568c
      passport.use('local', new  LocalStrategy({passReqToCallback : true}, (req, username, password, done) => {

      	loginAttempt();
      	async function loginAttempt() {
			if (username.toString().includes("GOOGLE#AUTH#USER:")) {
				return done(null, false);
			}

      		const client = await pool.connect()
      		try{
      			await client.query('BEGIN')
            console.log("CURRENT USERNAME IS " + username);
            // currentAccountsData array is empty, see in console.log. Why?
      			var currentAccountsData = await JSON.stringify(client.query('SELECT username, name, email, password FROM users WHERE username=$1', [username], function(err, result) {
      				if(err) {
      					return done(err)}
      				if(result.rows[0] == null){
      					req.flash('danger', "Oops. Incorrect login details.");
      					return done(null, false, {message: 'No user found'});}
      				else{
      					bcrypt.compare(password, result.rows[0].password, function(err, isMatch) {
      						if (err) throw err;
      						else if (isMatch){
                    console.log("Passwords matched!");
                    return done(null, [{email: result.rows[0].email, name: result.rows[0].name, username: result.rows[0].username}]);}
      						else{
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
        //console.log(user);
      	done(null, user);
      });

      passport.deserializeUser(function(user, done) {
        //console.log("deserial" + user);
      	done(null, user);
      });

app.set('view options', { layout: false })
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
