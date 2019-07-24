const PORT = process.env.PORT || 5000
const express = require('express')
const request = require('request');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

var app = express();
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json());
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('cookie-parser')())
app.use(cookieParser('secretString'));

var server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
const http = require('http').Server(app);
var io = require('socket.io').listen(server) || require('socket.io')(http)

io.on('connection', function(socket) {
    console.log('Client connected.');
    socket.on('username', function(username) {
        socket.username = username;
        io.emit('is_online', '🔵 <i>' + socket.username + ' joined the chat..</i>');
    });

    socket.on('disconnect', function(username) {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('chat_message', function(message) {
        io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
    });

});

app.set('view options', { layout: false })
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
global.users = false;
require('./routes.js')(app);
