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
        const emailAdded = await client.query("INSERT INTO users (username, password, email) VALUES ('" + uName + "', '" + pass + "', '" + emailAddr + "')");

		// VALIDATE AND REDIRECT
        const result = await client.query("SELECT * FROM users where username='" + uName + "'");
		if (result.rows[0]) {
			if (result.rows[0].password == pass) {
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

		//

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
		if (result.rows[0]) {
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
  .get('/users', function (req, res) {
    console.log('Hello');
  	pool.query('select * from users', function(error, result){
  		var results = { 'results': (result) ? result.rows : [] };
  		res.render('profile',results);
  	})
  })
  .post('/ticket',function(req,res){
      console.log(req.body.fname);
      console.log(req.body.lname);
      console.log(req.body.flightno);
      console.log(req.body.countryfrom);
      console.log(req.body.countryto);
      console.log(req.body.airline);
      console.log(req.body.date);
      console.log(req.body.time);
      var sql = "INSERT INTO tickets (fname,lname,flightno,countryfrom.countryto,airline,date,time) VALUES '"+req.body.fname+"','"+req.body.lname+"','"+req.body.flightno+"','"+req.body.countryfrom+"','"+req.body.countryto+"','"+req.body.airline+"','"+req.body.date+"','"+req.body.time+"')";
      pool.query(sql, function(error,result){
        if (error) throw error;
        console.log("ticket added");
  })
})
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
