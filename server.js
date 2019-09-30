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


app.get("/", function (request, response) {
	  response.sendFile(__dirname +'/views'+'/index.html');
});

app.get("/chat", function (request, response) {
  response.sendFile(__dirname +'/views'+'/public-chat.html');
});

app.get("/about", function (request, response) {
  response.sendFile(__dirname +'/views'+'/about.html');
});

app.get("/therealdeal-chat", function (request, response) {
  response.sendFile(__dirname +'/views'+'/secret-chat.html');
});

//set up sockets
let socket = require("socket.io");
let io = socket(server);


// when new client connects
io.sockets.on("connection", function (socket) {
  console.log("new connection: " + socket.id);
  //variable for this socket's database & room
  let db = new Datastore({
    filename: "convo-public.db",
    autoload: true
  });

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
      filename: "convo-public.db",
      autoload: true
    });

    let errMsg = {
      timeErr: false,
      timeDifference: null,
      lengthErr: false,
      lengthDifference: null
    }
    emitMessage(data, db);
    //query for longest message
  });

  //notify when user disconnects
  socket.on('disconnect', function () {
    console.log("Client has disconnected " + socket.id);
  });

});

function emitMessage(data, db) {
  //send text message to all users (including the sender)
  io.emit('chatmsg', data);
  // add to database
  db.insert(data, function (err, newDocs) {
    if (err != null) {
      console.log("err:" + err);
    } else {
      console.log("incoming msg: " + newDocs.msg);
    }
    //broadcast text message change to all users
    // socket.broadcast.emit('chatmsg', data);
  });
}
