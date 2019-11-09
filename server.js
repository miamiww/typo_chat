//set up express
let express = require("express");
let app = express();
//demo local
// let server = app.listen(8000);
let server = app.listen(8000);
app.use(express.static("public"));


//file system
let fs = require('fs');
const url = require('url');
var Datastore = require('nedb');

/*email begin*/

const nodemailer = require('nodemailer');
var config = require('./email_config.js');
console.log(config.user)

// async..await is not allowed in global scope, must use a wrapper
async function maildaemon(room,user) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport

  let transporter = nodemailer.createTransport({
    service: 'yahoo', // no need to set host or port etc.
    auth: {
      user: config.user, 
      pass: config.password
    }
  });
  // send mail with defined transport object
  let info = await transporter.sendMail({
      from: '"Typo Chat 👻" <typochat@yahoo.com>', // sender address
      to: 'rivendalejones@gmail.com, aqdinh@gmail.com', // list of receivers
      subject: 'new message from ' + user+ ' in '+room, // Subject line
      text: 'check http://prototypes.alden.website:8000/'+room, // plain text body
      html: '<b>check <a href="http://prototypes.alden.website:8000/'+room+'">here</a></b>' // html body
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
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

app.get("/chat-therealdeal", function (request, response) {
  response.sendFile(__dirname +'/views'+'/secret-chat.html');
});

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
