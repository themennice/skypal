const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  //ssl: true
});
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .use(express.urlencoded({extended:false}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/reg', async function(req, res){
    var emailAddr = req.body.email;
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport(
    {
      service: 'gmail',
      auth: { user: 'noreply.skypal@gmail.com',pass: 'SkyPal*0*'}   
    });

    var mailOptions = {
      from: 'noreply.skypal@gmail.com',
      to: emailAddr,
      subject: 'Welcome to SkyPal',
      text: 'Thank you for joining SkyPal. Start finding your fly-mate on SkyPal!'
    };

    transporter.sendMail(mailOptions, function(error, info)
    {
      if (error) 
        console.log(error);
      else 
        console.log('Email sent: ' + info.response);
      
    });

    var uName = req.body.username;
    var pass = req.body.password;

      try {
        const client = await pool.connect();
		// VALIDATE AND REDIRECT
        const result = await client.query("SELECT * FROM users where username='" + uName + "'");

		console.assert(!result.rows[0], { result : result.rows[0], error : "User already exists" } );

		if (result.rows[0]) {
			res.send("User Already Exists Try Logigng in");
		} else {
        const emailAdded = await client.query("INSERT INTO users (username, password, email) VALUES ('" + uName + "', '" + pass + "', '" + emailAddr + "')");
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
        var transporter = nodemailer.createTransport(
        {
          service: 'gmail',
          auth: { user: 'chloechan.chy@gmail.com',pass: '2383015238781'}   
        });

        var mailOptions = {
          from: 'chloechan.chy@gmail.com',
          to: 'chc70@sfu.ca',
          subject: 'Sending Email using Node.js',
          text: 'That was easy!'
        };

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
