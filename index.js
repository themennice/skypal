const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  //ssl: true
});
const PORT = process.env.PORT || 5000
const express = require('express')
var session = require('express-session')
var flash = require('connect-flash');
var passport = require('passport');
var request = require('request');
var bodyParser = require('body-parser');
const path = require('path')

var app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(require('cookie-parser')())
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(flash())
app.use(session({
    secret: "bulky keyboard",
    resave: true,
    saveUninitialized: true
    }))
app.use(passport.initialize())
app.use(passport.session())

app.set('view options', { layout: false }) // may be omitted
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.post('/reg', async function(req, res)
  {
    var emailAddr = req.body.email;
    console.log(emailAddr);
    var uName = req.body.username;
    var pass = req.body.password;

    try {
        const client = await pool.connect();
		// VALIDATE AND REDIRECT
        console.log("message here");
        const result = await client.query("SELECT * FROM users where username='" + uName + "'");

		console.assert(!result.rows[0], { result : result.rows[0], error : "User already exists" } );

		if (result.rows[0]) {
			  res.send("User Already Exists Try Logigng in"); }
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
app.post("/loginem", async (req, res) => { // what is loginem?
  	var email = req.body.key;
    console.log("login attempt 12");
  	try {
          const client = await pool.connect()
          const result = await client.query("SELECT * FROM users where email='" + email + "'");

  		console.assert(result.rows[0], { result : result.rows[0], error : "database error, user not found or is returning null" } );
      console.log("login attempt 14");
  		res.send(result.rows[0]);
  		client.release();
        } catch (err) {
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

    // app.post("/login", async (req, res) => {
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
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/login', (req, res) => {
  //alert(1);
  res.render('login');
  })
//app.get('/', (req, res) => res.render('pages/index'))
require('./routes.js')(app);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
