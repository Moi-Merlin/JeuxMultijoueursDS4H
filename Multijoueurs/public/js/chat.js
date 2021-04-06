let username;
let conversation, data, datasend, users;
let artificialLatencyDelay=0;
let socket;

let numberPerSecond;
let nbClientUpdatesPerSeconds = 12;


// on load of page
window.onload = init;

function init() {
  username = prompt("Quel est votre nom?");

  // initialize socket.io client-side
  socket = io.connect();

  // get handles on various GUI components
  conversation = document.querySelector("#conversation");
  data = document.querySelector("#data");
  datasend = document.querySelector("#datasend");
  users = document.querySelector("#users");

  // Listener for send button
  datasend.onclick = (evt) => {
    sendMessage();
  };

  // detect if enter key pressed in the input field
  data.onkeypress = (evt) => {
    // if pressed ENTER, then send
    if (evt.keyCode == 13) {
      this.blur();
      sendMessage();
    }
  };

  data.onblur = (event) => {
    console.log("Input field lost focus");
    canvas.focus(); // gives the focus to the canvas
  }

  // sends the chat message to the server
  function sendMessage() {
    let message = data.value;
    data.value = "";
    // tell server to execute 'sendchat' and send along one parameter
    socket.emit("sendchat", message);
  }
  // on connection to server, ask for user's name with an anonymous callback
  socket.on("connect", () => {
    clientStartTimeAtConnection = Date.now();

    // call the server-side function 'adduser' and send one parameter (value of prompt)
    socket.emit("adduser", username);
  });

  // listener, whenever the server emits 'updatechat', this updates the chat body
  socket.on("updatechat", (username, data) => {
    let chatMessage = "<b>" + username + ":</b> " + data + "<br>";
    conversation.innerHTML += chatMessage;
  });

  // just one player moved
  socket.on("updatepos", (username, newPos) => {
    updatePlayerNewPos(newPos);
  });

  socket.on("updateColor", (username, newColor) =>{
    updatePlayerNewColor(newColor);
  })

  // listener, whenever the server emits 'updateusers', this updates the username list
  socket.on("updateusers", (listOfUsers) => {
    writePlayerNames(listOfUsers)
  });

  function writePlayerNames(listOfUsers){
    users.innerHTML = "";
    for (let name in listOfUsers) {
      let userLineOfHTML = "<div>" + name + "</div>";
      users.innerHTML += userLineOfHTML;
    }
  }
  // update the whole list of players, useful when a player
  // connects or disconnects, we must update the whole list
  socket.on("updatePlayers", (listOfplayers) => {
    updatePlayers(listOfplayers);
  });

  // Latency, ping etc.
  socket.on("ping", () => {
    send("pongo");
  });

  //heartbeat
  socket.on("heartbeat",()=>{
    if (numberPerSecond === undefined){
      socket.emit("initHeartbeat");
    }
    else {socket.emit("heart",numberPerSecond);}
  });

  socket.on("globalHeartbeat", (nbUpdatesPerSeconds)=>{
    console.log("New Heartbeat emmits by the server");
    changeHeartbeatValue(nbUpdatesPerSeconds);
  });

  socket.on("hearbeatPerSecond",(nbUpdatesPerSeconds)=>{
    console.log("hearbeat change by players");
    changeHeartbeatValue(nbUpdatesPerSeconds);
  });  

  //Sending status to the server every (1000/nbClientUpdatesPerSeconds) ms
  setInterval(()=>{
    updateClient();
	},1000/nbClientUpdatesPerSeconds); 

  //listen for compute pos by the server
  socket.on("computePos",(newComputePos)=>{
    //display the computated position within the html
    let spanXPos = document.querySelector("#xPos");
    spanXPos.innerHTML = newComputePos[0];

    let spanYPos = document.querySelector("#yPos");
    spanYPos.innerHTML = newComputePos[1];
  });

  socket.on("data", (timestamp, rtt, serverTime) => {
    //console.log("rtt time received from server " + rtt);

    let spanRtt = document.querySelector("#rtt");
    spanRtt.innerHTML = rtt;

    let spanPing = document.querySelector("#ping");
    spanPing.innerHTML = (rtt/2).toFixed(1);

    let spanServerTime = document.querySelector("#serverTime");
    spanServerTime.innerHTML = (serverTime/1000).toFixed(2);

    let clientTime = Date.now() - clientStartTimeAtConnection;

    let spanClientTime = document.querySelector("#clientTime");
    spanClientTime.innerHTML = (serverTime/1000).toFixed(2);
  
  });

  // we start the Game
  startGame();
}

function changeHeartbeatValue(value) {
  numberPerSecond = parseInt(value);

  let spanHeartbeat = document.querySelector("#heartbeat");
  spanHeartbeat.innerHTML = numberPerSecond;
  
  document.querySelector("#heartbeatRange").value = hbPerSecond;
}

// PERMET D'ENVOYER SUR WEBSOCKET en simulant une latence (donnée par la valeur de delay)
function send(typeOfMessage, data) {
  setTimeout(() => {
      socket.emit(typeOfMessage, data)
  }, artificialLatencyDelay);
}

function changeArtificialLatency(value) {
  artificialLatencyDelay = parseInt(value);

  let spanDelayValue = document.querySelector("#delay");
  spanDelayValue.innerHTML = artificialLatencyDelay;
}

function changeNbUpdateSec(value) {
  nbUpdatesPerSeconds = parseInt(value);

  let spanUpdateValue = document.querySelector("#nbUpdates");
  spanUpdateValue.innerHTML = nbUpdatesPerSeconds;
}

function updateClient(){
  socket.emit("status",[getStatusPlayers(username),parseFloat(document.querySelector("#clientTime").textContent)]);
}