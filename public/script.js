//GLOBAL VARIABLES
let canvas;
//dom elements
let nameInput, msgInput;
let sendButton;
let userReq;
//element selection
let chatbody;
//msg attributes
let urUsername;
let msgCount = 0;
//boolean checks
let nameSubmitted = false;
let timeLonger = false;
let lastInterval, newInterval;
let msgLonger = false;
let lastLength, newLength;
//sockets
let socket;
//data for loading past conversation
let newinfo;
let messagecount;
//info for incoming messages
let newMsgData;

function setup() {
  noCanvas();
  //username input
  nameInput = createInput('');
  nameInput.id('nameInput');
  nameInput.size(120, 18);
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
    let posttext = data.user + " (" + convertDate(data.time) + "): " + data.msg
    let p = createP(posttext);
    chatbody.child(p);
  });
}

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

function newText_stream(singleChar) {
    if (singleChar != "") {
      loadJSON('convo.json', updateJSON);
      let message = singleChar//msgInput.value();
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
  //calculate necessary info
  lastInterval = newinfo[messagecount - 1].time - newinfo[messagecount - 2].time;
  lastLength = newinfo[messagecount -1].length;
}


function updateName() {
    urUsername = nameInput.value();
    nameSubmitted = true;
    nameInput.remove();
    userReq.remove();
    //create msg input
    msgInput = createElement('textarea', '')
    msgInput.id('msgInput');
    //create msg send button
    sendButton = createButton('send');
    sendButton.mouseClicked(newText);
    sendButton.id('sendButton');
  }
  //enter key will trigger send
  function keyPressed() {
    if (keyCode == ENTER && nameSubmitted == true) {
      newText();
      return false;
    } 
 
  }

  function keyTyped(){
      if(nameSubmitted==true){
        newText_stream(key);
      }
  }
  
  //clear text/make new text area after sending text
  function cleartext() {
    msgInput.remove();
    msgInput = createElement('textarea', '')
    msgInput.id('msgInput');
  }

  //convert to date & time
function convertDate(epochdate) {
    let myDate = new Date(epochdate * 1000);
    return myDate.toLocaleString();
  }
  
  //convert seconds to appropriate time metric
  function convertTime(seconds) {
    let words;
    if (seconds < 60) {
      words = roundplace(seconds) + " seconds";
    } else if (seconds >= 60 && seconds < 60 * 60) {
      let minutes = seconds / 60;
      words = roundplace(minutes) + " minutes";
    } else if (seconds >= 60 * 60 && seconds < 60 * 60 * 24) {
      let hours = seconds / 3600;
      words = roundplace(hours) + " hours";
    } else {
      let days = seconds / (3600 * 24);
      words = roundplace(days) + " days";
    }
    return words;
  }
  
  //round to second decimal place
  function roundplace(number){
    return round(100*number)/100;
  }