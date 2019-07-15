const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  //ssl: true
});
const PORT = process.env.PORT || 5000
const express = require('express')

var flash = require('connect-flash');
var passport = require('passport');
var request = require('request');
var session = require('express-session')
var request = require('request');
var bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path')

var app = express()
app.use(passport.initialize())
app.use(passport.session())
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
app.set('view options', { layout: false }) // may be omitted
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

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
          res.send("Error is " + err);
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

app.get('*', function (req, res, next) { // universal access variable, keep working
  res.locals.user = req.user || null;
  next();
})

require('./routes.js')(app);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
