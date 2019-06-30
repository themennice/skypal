//const { Pool } = require('pg');

//   const pool = new Pool({
//  connectionString: process.env.DATABASE_URL,
//  ssl: true
//});
const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000


const app = express()
const { Pool } = require('pg');
var pool = new Pool({
database: 'postgres'
});

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({extended:false}));

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/users', function (req, res) {
    console.log('Hello');
  	pool.query('select * from users', function(error, result){
  		var results = { 'results': (result) ? result.rows : [] };
  		res.render('profile',results);
  	})
  })
  //.get('/', (req, res) => res.render('pages/index'))
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
