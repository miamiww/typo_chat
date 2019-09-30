//** */ GLOBAL VARIABLES **//
let canvas;
//dom elements
let nameInput, msgInput;
let sendButton;
let userReq;
//element selection
let chatbody;
let chatWindow;
//msg attributes
let urUsername;
let msgCount = 0;
//boolean checks
let nameSubmitted = false;
//sockets
let socket;
//data for loading past conversation
let newinfo;
let messagecount;
//info for incoming messages
let newMsgData;
let typoMessage = "";

//msg attributes
let username;
//load message history once
let historyLoaded = false;
//text area


//setting up the socket for local testing
socket = io.connect("http://localhost:8000");
//setting up socket for remote testing
// socket = io.connect("http://prototypes.alden.website:8000")

//get broadcasted text & post to browser


window.addEventListener('load', function () {
  //get dom elements
  chatWindow = document.getElementById('chatbody');
  msgInput = document.getElementById('msgInput');
  let nameInput = document.getElementById('nameInput');
  let nameAlert = document.getElementById('nameAlert');
  chatbody = document.getElementById('chatbody');
  let sendButton = document.getElementById('sendButton');


  nameInput.addEventListener('keyup', function (e) {
    e.preventDefault();
    if (e.keyCode === 13) {
      if (nameInput.value != "") {
        username = nameInput.value;
        console.log('you are ' + username);
        //remove username input field
        nameInput.remove();
        nameAlert.remove();
        //show text areas
        msgInput.style.visibility = "visible";
        sendButton.style.visibility = "visible";
      } else {
        console.log("must submit text");
      }
    }

    msgInput.addEventListener('keyup', function (e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        //remove extra new line
        msgInput.value = msgInput.value.replace(/\n/g, '');
        newMessage();
      }
    });
    sendButton.addEventListener('click', newMessage, false);
  })

  socket.on('chatmsg', function(data) {
    let posttext = data.user + " (" + convertDate(data.time) + "): " + data.msg;
    let p = createP(posttext);
    chatbody.child(p);
    chatWindow.scrollTo(0, chatWindow.scrollHeight);
  });
});

function setup() {
  noCanvas();
  loadJSON('convo.json', getOldConvo);

}

// newText adds to the chat body any new text that is in the message input form. this allows in our functioning the pasting of links or of other texts
function newText() {
  if (trim(msgInput.value()) != "") {
    loadJSON('convo.json', updateJSON);
    let message = msgInput.value();
    //create object of msg data
    newMsgData = {
      time: new Date().getTime() / 1000,
      msg: message,
      length: message.length,
      user: urUsername
    }
    //   //emit to other viewers
      socket.emit('chatmsg', newMsgData);
    //   //post to chat
      let posttext = newMsgData.user + " (" + convertDate(newMsgData.time) + "): " + newMsgData.msg;
      let p = createP(posttext);
      chatbody.appendChild(p);
      cleartext();
    // }
  }
  return false;
}

function newMessage(message){
  loadJSON('convo.json', updateJSON);
  newMsgData = {
    time: new Date().getTime() / 1000,
    msg: message,
    length: message.length,
    user: urUsername
  }
  socket.emit('chatmsg', newMsgData);
  let posttext = newMsgData.user + " (" + convertDate(newMsgData.time) + "): " + newMsgData.msg;
  let p = createP(posttext);
  chatbody.appendChild(p);
  cleartext();
  chatWindow.scrollTo(0, chatWindow.scrollHeight);
}

function textStream(message,singleChar) {
    message = message+singleChar//msgInput.value();
    //create object of msg data
    return message;
}

function updateJSON(data) {
  newinfo = data;
  messagecount = Object.keys(newinfo).length;
  lastInterval = newinfo[messagecount - 1].time - newinfo[messagecount - 2].time;
  lastLength = newinfo[messagecount -1].length;
  console.log('json file loaded');
}

function getOldConvo(data) {
  //pass data to newinfo
  newinfo = data;
  messagecount = Object.keys(newinfo).length;
  //show all old messages
  for (let i = 1; i < messagecount; i++) {
    let posttext = newinfo[i].user + " (" + convertDate(newinfo[i].time) + "): " + newinfo[i].msg;
    let p = createP(posttext);
    chatbody.appendChild(p);
  }
  chatWindow.scrollTo(0, chatWindow.scrollHeight);
}



  //enter key will trigger send
function keyPressed() {
    if (keyCode == ENTER && nameSubmitted == true&& typoMessage !="") {
      // newText();
      newMessage(typoMessage);
      return false;
    } 
}

function keyTyped(){
  if(nameSubmitted==true){
    // newText_stream(key);
    ypoMessage = textStream(typoMessage,key)
  }
}
  
  //clear text/make new text area after sending text
function cleartext() {
  msgInput.remove();
  msgInput = createElement('textarea', '')
  msgInput.id('msgInput');
  typoMessage = "";
}

  //convert to date & time
function convertDate(epochdate) {
    let myDate = new Date(epochdate * 1000);
    return myDate.toLocaleString();
}


function sendMessage() {
  //check if empty white space
  if (msgInput.value.replace(/^\s+|\s+$|\s+(?=\s)/g, "") == "") {
    console.log("error: cannot submit empty enter text!");
  } else {
    //create object w/ new message info
    let newMessage = {
      time: new Date().getTime() / 1000,
      msg: msgInput.value,
      length: msgInput.value.length,
      user: username
    }
    // console.log(newMessage);
    //send message to server
    socket.emit('chatmsg', newMessage);
  }
}