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
  .post("/loginem", async (req, res) => {	
	var email = req.body.key;
	try {
        const client = await pool.connect()
        const result = await client.query("SELECT * FROM users where email='" + email + "'");
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
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
