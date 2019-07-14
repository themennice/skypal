const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  //ssl: true
});
const express = require('express')
var session = require('express-session')
var flash = require('connect-flash');
var passport = require('passport');
var request = require('request');
var bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Julian, do we need this? -> for storing passwords in a hashed format.
const uuidv4 = require('uuid');// uuid/v4? //used for generating universal unique IDs
const LocalStrategy = require('passport-local').Strategy; // strategy for authenticating with a username and password
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .use(express.urlencoded({extended:false}))
  .use(require('cookie-parser')())
  .use(require('body-parser').urlencoded({ extended: true }))
  //require('./node_modules/passport/config/file')(passport)
  .use(flash())
  .use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
    }))
  .use(passport.initialize())
  .use(passport.session())
  .use(bodyParser())
  .set('view options', { layout: false }) // may be omitted
  //require(‘./lib/routes.js’)(app)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res, next) => { res.render('pages/index', {title: "Homepage",
      userData: req.user, messages: {danger: req.flash('danger'),
      warning: req.flash('warning'), success: req.flash('success')}});
      console.log(req.user); })
  .post('/reg', async function(req, res)
  {
    var emailAddr = req.body.email;
    //console.log(emailAddr);
    var uName = req.body.username;
    var pass = req.body.password;

    try {
        const client = await pool.connect();
		// VALIDATE AND REDIRECT
        const result = await client.query("SELECT * FROM users where username='" + uName + "'");

		console.assert(!result.rows[0], { result : result.rows[0], error : "User already exists" } );

		if (result.rows[0]) {
			  res.send('public/register.html', true); }
    else {
        const emailAdded = await client.query("INSERT INTO users (username, password, email) VALUES ('" + uName + "', '" + pass + "', '" + emailAddr + "')");
        res.redirect('login');}

      client.release();
      }
      catch (err)
      {
        console.error(err);
        res.send("Error " + err);
      }
    })
    .post("/loginem", async (req, res) => { // what is loginem?
  	var email = req.body.key;
  	try {
          const client = await pool.connect()
          const result = await client.query("SELECT * FROM users where email='" + email + "'");

  		console.assert(result.rows[0], { result : result.rows[0], error : "database error, user not found or is returning null" } );

  		res.send(result.rows[0]);
  		client.release();
        } catch (err) {
          console.error(err);
          res.send("Error " + err);
        }
     })
  //    .get('/profile', function (req, res, next) {
	// 	if(req.isAuthenticated()){
	// 		res.render('account', {title: "Account", userData: req.user, userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
	// 	}
	// 	else{
	// 		res.redirect('/login');
	// 	}
	// })
    .post("/profile", async (req, res) => {
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

    .post('/login', passport.authenticate('local', {
       successRedirect: '/profile',
       failureRedirect: '/login',
       failureFlash: true
     }), async function(req, res) {
         if (req.body.remember) {
           req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
         }
         else {
         req.session.cookie.expires = false; // Cookie expires at end of session
         }
         var uname = req.body.username;
         var upass = req.body.password;
         	//console.log(uname);

         	try {
                 const client = await pool.connect()
                 const result = await client.query("SELECT * FROM users where username='" + uname + "'");

         		console.assert( uname != "" && upass != "", { username: uname, password: upass, error : "username and password can't be empty" } );

         		if ( (uname != "" && upass != "") && result.rows[0]) {
         			if (result.rows[0].password == upass) {
         				// ** Load main page here ** //
         				res.render('profile', { 'r': result.rows[0] });
         				// ** ******************* ** //
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
            //res.redirect(‘/’);
            })

    // .post("/login", async (req, res) => {
  	// var uname = req.body.username;
  	// var upass = req.body.password;
  	// //console.log(uname);
    //
  	// try {
    //       const client = await pool.connect()
    //       const result = await client.query("SELECT * FROM users where username='" + uname + "'");
    //
  	// 	console.assert( uname != "" && upass != "", { username: uname, password: upass, error : "username and password can't be empty" } );
    //
  	// 	if ( (uname != "" && upass != "") && result.rows[0]) {
  	// 		if (result.rows[0].password == upass) {
  	// 			// ** Load main page here ** //
  	// 			res.render('profile', { 'r': result.rows[0] });
  	// 			// ** ******************* ** //
  	// 		} else {
  	// 			res.send("Wrong password");
  	// 		}
  	// 	} else {
  	// 		res.send("User not found");
  	// 	}
    //
  	// 	client.release();
    //     } catch (err) {
    //       console.error(err);
    //       res.send("Error " + err);
    //     }
    //  })
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/login', (req, res) => {
      if (req.isAuthenticated()) {
        res.redirect('/profile');}
      else { res.render('login', {title: "Log in", userData: req.user,
        messages: {danger: req.flash('danger'),
        warning: req.flash('warning'), success: req.flash('success')}});
      }
    })

  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
