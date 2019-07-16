//const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// });
const PORT = process.env.PORT || 5000
const express = require('express')
const request = require('request');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session')
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

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
app.set('view options', { layout: false })
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
global.user = false;
require('./routes.js')(app);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
