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

window.addEventListener('load', function () {
  //get dom elements
  chatWindow = document.getElementById('chatbody');
  msgInput = document.getElementById('msgInput');
  let nameInput = document.getElementById('nameInput');
  let nameAlert = document.getElementById('nameAlert');
  let chatbody = document.getElementById('chatbody');
  let sendButton = document.getElementById('sendButton');

});

function setup() {
  noCanvas();
  //username input
  nameInput = createInput('');
  nameInput.id('nameInput');
  nameInput.size(400, 30);
  nameInput.changed(updateName);
  //text conversation dom
  chatbody = select('chatbody');

  //request username
  userReq = createP('Submit your name to continue.');
  userReq.id('namealert');
  //load initial JSONObject
  loadJSON('convo.json', getOldConvo);
  // socket io script
  socket = io.connect("http://localhost:8000");
  //get broadcasted text & post to browser
  socket.on('chatmsg', function(data) {
    let posttext = data.user + " (" + convertDate(data.time) + "): " + data.msg;
    let p = createP(posttext);
    chatbody.child(p);
    chatWindow.scrollTo(0, chatWindow.scrollHeight);
  });
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
      chatbody.child(p);
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
  chatbody.child(p);
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
    chatbody.child(p);
  }
  chatWindow.scrollTo(0, chatWindow.scrollHeight);
}


function updateName() {
    urUsername = nameInput.value();
    nameSubmitted = true;
    nameInput.remove();
    userReq.remove();
    //create msg input
    msgInput.style.visibility = "visible";
    //create msg send button
    // sendButton = createButton('send');
    // sendButton.mouseClicked(newText);
    // sendButton.id('sendButton');
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
        typoMessage = textStream(typoMessage,key)
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