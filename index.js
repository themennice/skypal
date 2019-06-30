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

				res.render("login", { 'user' : uname } );
			
			
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
  .get('/users', function (req, res) {
    console.log('Hello');
  	pool.query('select * from users', function(error, result){
  		var results = { 'results': (result) ? result.rows : [] };
  		res.render('profile',results);
  	})
  })
  .get('/login', (req, res) => res.render('login'))
  .get('/', (req, res) => res.render('pages/index'))
  .get('/db', async (req, res) => {
      try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM test_table');
        const results = { 'results': (result) ? result.rows : null};
        res.render('pages/db', results );
        client.release();
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
    })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
