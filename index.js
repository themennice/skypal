//const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// });
const PORT = process.env.PORT || 5000
<<<<<<< HEAD
const express = require('express')
const request = require('request');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

var app = express()
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json());
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('cookie-parser')())
app.use(cookieParser('secretString'));
app.use(session({
    secret: 'bulky keyboard',
    resave: true,
    cookie: { maxAge: 120000 },
    saveUninitialized: true
    }))
app.use(flash())

app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.warning = req.flash('warning'); // how to make it work?
    next();
});

app.set('view options', { layout: false })
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
global.users = false;
require('./routes.js')(app);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
=======
var rand,host,link;

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .use(express.urlencoded({extended:false}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/ticket',function(req,res){
      var fname = req.body.fname;
      var lname = req.body.lname;
      var flightno = req.body.flightno;
      var countryfrom = req.body.countryfrom;
      var countryto = req.body.countryto;
      var airline = req.body.airline;
      var date = req.body.date;
      var time = req.body.time;
      pool.connect();
      var sql = "INSERT INTO tickets (fname,lname,flightno,countryfrom,countryto,airline,date,time) VALUES ('"+fname+"','"+lname+"','"+flightno+"','"+countryfrom+"','"+countryto+"','"+airline+"','"+date+"','"+time+"')";
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
  .post('/reg', async function(req, res){
    var emailAddr = req.body.email;
    var uName = req.body.username;
    var pass = req.body.password;

      try {
        const client = await pool.connect();
		// VALIDATE AND REDIRECT
        const result = await client.query("SELECT * FROM users where username='" + uName + "'");

		console.assert(!result.rows[0], { result : result.rows[0], error : "User already exists" } );

		if (result.rows[0]) {
			res.send("User Already Exists Try Logigng in");
		} 
    else {
      const emailAdded = await client.query("INSERT INTO users (username, password, email) VALUES ('" + uName + "', '" + pass + "', '" + emailAddr + "')");
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
      res.render('login');

		}

        client.release();
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }

  })
  .post("/loginem", async (req, res) => {
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
  .post("/login", async (req, res) => {
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
   })
  /*.post("/sendEmail",function sendEmail() 
    {
        var nodemailer = require('nodemailer');
        /*rand=Math.floor((Math.random() * 100) + 54);
        host=req.get('host');
        link="http://"+req.get('host')+"/verify?id="+rand;
        var transporter = nodemailer.createTransport(
        {
          service: 'gmail',
          auth: { user: 'noreply.skypal@gmail.com',pass: 'SkyPal*0*'}   
        });

        var mailOptions = {
          from: 'noreply.skypal@gmail.com',
          to: 'chc70@sfu.ca',
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
    })*/
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/login', (req, res) => res.render('login'))
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
>>>>>>> email-validate
