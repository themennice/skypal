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
    var uName = req.body.username;
    var pass = req.body.password;

      try {
        const client = await pool.connect();
		// VALIDATE AND REDIRECT
        const result = await client.query("SELECT * FROM users where username='" + uName + "'");
		if (result.rows[0]) {
			res.send("User Already Exists Try Logigng in");
		} else {
        const emailAdded = await client.query("INSERT INTO users (username, password, email) VALUES ('" + uName + "', '" + pass + "', '" + emailAddr + "')");
        var results = { 'results': (result) ? result.rows : [] };
				res.render('profile',results);

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
		console.log("test");
		res.send(result.rows[0]);
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
		if ( (uname != "" && upass != "") && result.rows[0]) {
			if (result.rows[0].password == upass) {
				// ** Load main page here ** //
				var results = { 'results': (result) ? result.rows : [] };
				res.render('profile',results);
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
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/login', (req, res) => res.render('login'))
  .get('/', (req, res) => res.render('pages/index'))
  // .get('/users', function (req, res) {
  //   console.log('Hello');
  // 	pool.query('select * from users', function(error, result){
  // 		var results = { 'results': (result) ? result.rows : [] };
  // 		res.render('profile',results);
  // 	})

  //})
 /* .post('/ticket',function(req,res){
      var fname = req.body.fname;
      var lname = req.body.lname;
      var flightno = req.body.flightno;
      var countryfrom = req.body.countryfrom;
      var countryto = req.body.countryto;
      var airline = req.body.airline;
      var date = req.body.date;
      var time = req.body.time;
      pool.connect();
      pool.query("INSERT INTO tickets (fname,lname,flightno,countryfrom,countryto,airline,date,time) VALUES '"+fname+"','"+lname+"','"+flightno+"','"+countryfrom+"','"+countryto+"','"+airline+"','"+date+"','"+time+"')", function(error,result){
        if (error)
          res.send("Error " + error);
        else
          res.send("ticket added");
        res.render('pages/index');
      })
  })*/
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
