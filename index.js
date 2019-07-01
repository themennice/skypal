const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/reg', async function(req, res){
      var emailAddr = req.body.email;
      var uName = req.body.email;
      var pass = req.body.password;

      try {
        const client = await pool.connect();
        const emailAdded = await client.query("INSERT INTO users [(username, password, email)] VALUES ('" + uName + "', '" + pass + "', '" + emailAddr + "')");
        res.send("User Added");
        client.release();
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
  })
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
