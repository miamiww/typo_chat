//set up express
let express = require("express");
let app = express();
let server = app.listen(8000);
app.use(express.static("public"));


//file system
let fs = require('fs');
const url = require('url');
var Datastore = require('nedb');

/*email begin*/

const nodemailer = require('nodemailer');
var config = require('./email_config.js');

// async..await is not allowed in global scope, must use a wrapper
async function maildaemon(room,user) {
  let recipients = 'rivendalejones@gmail.com, aqdinh@gmail.com';
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'yahoo', // no need to set host or port etc.
    auth: {
      user: config.user, 
      pass: config.password
    }
  });
  if(user == "alden"){
    recipients = 'aqdinh@gmail.com';
  }
  if(user == "amelie"){
    recipients = 'rivendalejones@gmail.com';
  }
  // send mail with defined transport object
  let info = await transporter.sendMail({
      from: '"Clubhouse Chat 👻" <typochat@yahoo.com>', // sender address
      to: recipients, // list of receivers
      subject: 'new message from ' + user+ ' in '+room, // Subject line
      text: 'check http://prototypes.alden.website:8000/'+room, // plain text body
      html: '<b>check <a href="http://prototypes.alden.website:8000/'+room+'">here</a></b>' // html body
  });
}

/* email end */


//build routes
app.get("/", function (request, response) {
	  response.sendFile(__dirname +'/views'+'/index.html');
});

app.get("/chat", function (request, response) {
  response.sendFile(__dirname +'/views'+'/public-chat.html');
});

app.get("/about", function (request, response) {
  response.sendFile(__dirname +'/views'+'/about.html');
});


//setting up secure route
var secureconfig = require('./secure_config.js');
var securedRoutes = require('express').Router()

securedRoutes.use((req, res, next) => {

  // -----------------------------------------------------------------------
  // authentication middleware

  const auth = {login: secureconfig.user, password: secureconfig.password} 

  // parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')

  // Verify login and password are set and correct
  if (login && password && login === auth.login && password === auth.password) {
    // Access granted...
    return next()
  }

  // Access denied...
  res.set('WWW-Authenticate', 'Basic realm="401"') // change this
  res.status(401).send('Authentication required.') // custom message

  // -----------------------------------------------------------------------

});

app.use('/chat-therealdeal', securedRoutes)
app.get('/chat-therealdeal', function (request, response) {
  response.sendFile(__dirname +'/views'+'/secret-chat.html');

});

/*routes end*/

//set up sockets
let socket = require("socket.io");
let io = socket(server);


// when new client connects
io.sockets.on("connection", function (socket) {
  console.log("new connection: " + socket.id);

  let room;

  //get url to get name of room
  socket.on('url', function (data) {
    room = data.substring(1);
    console.log(socket.id + " in " + room);

    //create simple database
    let db = new Datastore({
      filename: "convo-" + room + ".db",
      autoload: true
    });

    socket.join(room);

    //query database all messages, sorted by time
    db.find({}).sort({ time: 1 }).exec(function (err, docs) {
      if (err != null) {
        console.log("err:" + err);
      } else if (docs.length < 2) {

      } else {
        //send conversatino history to newly connected client
        console.log("message history retreived");
        socket.emit('convoHistory', docs);
      }
    });
  

  //when server receives a message
  socket.on('chatmsg', function (data) {
    //reload database
    let db = new Datastore({
      filename: "convo-" + room + ".db",
      autoload: true
    });

    let errMsg = {
      timeErr: false,
      timeDifference: null,
      lengthErr: false,
      lengthDifference: null
    }
    emitMessage(data, db,room);
    //send out email
    let userName = data.user;
    maildaemon(room,userName).catch(console.error);
  });

  


  //notify when user disconnects
  socket.on('disconnect', function () {
    console.log("Client has disconnected " + socket.id);
  });

});

});

function emitMessage(data, db,room) {
  //send text message to all users (including the sender)
  io.to(room).emit('chatmsg', data);
  // add to database
  db.insert(data, function (err, newDocs) {
    if (err != null) {
      console.log("err:" + err);
    } else {
      console.log("incoming msg: " + newDocs.msg);
    }
  });
}
