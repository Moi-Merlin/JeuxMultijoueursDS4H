const express = require('express')
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);

http.listen(8082, () => {
	console.log("Web server écoute sur http://localhost:8082");
})

// Indicate where static files are located. Without this, no external js file, no css...  
app.use(express.static(__dirname + '/public'));    


// routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// nom des joueurs connectés sur le chat
var playerNames = {};
var listOfPlayers = {};
var playerStatus = {};
let nbUpdatesPerSeconds;
let xSpeed = 0;
let ySpeed = 0;

io.on('connection', (socket) => {
	let emitStamp;
	let connectionStamp = Date.now();

	// Pour le ping/pong mesure de latence
	setInterval(() => {
        emitStamp = Date.now();
        socket.emit("ping");
    },500);

	socket.on("pongo", () => { // "pong" is a reserved event name
		let currentTime = Date.now();
		let timeElapsedSincePing = currentTime - emitStamp;
		let serverTimeElapsedSinceClientConnected = currentTime - connectionStamp;

		//console.log("pongo received, rtt time = " + timeElapsedSincePing);

		socket.emit("data", currentTime, timeElapsedSincePing, serverTimeElapsedSinceClientConnected);
	});

	//listen for movement of the client
	socket.on("movesRight",()=>{
		xSpeed = 100;
	});
	socket.on("movesLeft",()=>{
		xSpeed = -100;
	});
	socket.on("movesUp",()=>{
		ySpeed = -100
	});
	socket.on("movesDown",()=>{
		ySpeed = 100;
	});
	socket.on("stopMovingHorizontaly",()=>{
		xSpeed = 0;
	});
	socket.on("stopMovingVerticaly",()=>{
		ySpeed = 0;
	});

	//Heartbeat
	setInterval(()=>{
		socket.emit("heartbeat");
		socket.emit("computePos",animateServerSide(socket.username));
	},1000/nbUpdatesPerSeconds);

	socket.on("heart", (numberPerSecond)=> {
		if (numberPerSecond && numberPerSecond != nbUpdatesPerSeconds){
			nbUpdatesPerSeconds = numberPerSecond;
			socket.broadcast.emit("hearbeatPerSecond", nbUpdatesPerSeconds);
			console.log("IMPORTANT : Heartbeat changes, it is now ="+nbUpdatesPerSeconds);
		}
	});

	socket.on("initHeartbeat",()=>{
		if(nbUpdatesPerSeconds <0){ nbUpdatesPerSeconds = 0;}
		socket.emit("globalHeartbeat",nbUpdatesPerSeconds);
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', (data) => {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendpos', (newPos) => {
		// we tell the client to execute 'updatepos' with 2 parameters
		//console.log("recu sendPos");
		socket.broadcast.emit('updatepos', socket.username, newPos);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', (username) => {
		// we store the username in the socket session for this client
		// the 'socket' variable is unique for each client connected,
		// so we can use it as a sort of HTTP session
		socket.username = username;
		// add the client's username to the global list
		// similar to usernames.michel = 'michel', usernames.toto = 'toto'
		playerNames[username] = username;
		// echo to the current client that he is connected
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo to all client except current, that a new person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// tell all clients to update the list of users on the GUI
		io.emit('updateusers', playerNames);

		var player = {x:10, y:10, vx:0, vy:0, color:'red'};
		listOfPlayers[username] = player;
		io.emit('updatePlayers',listOfPlayers);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', () => {
		// remove the username from global usernames list
		delete playerNames[socket.username];
				// update list of users in chat, client-side
		io.emit('updateusers', playerNames);

		// Remove the player too
		delete listOfPlayers[socket.username];		
		io.emit('updatePlayers',listOfPlayers);
		
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});

	socket.on("colorChange",(newColor)=>{
		socket.broadcast.emit('updateColor', socket.username, newColor, listOfPlayers);
	})

});

function animateServerSide(username){
	if (playerStatus[username]!==undefined ){
		if (playerStatus[username][0],playerStatus[username][1] !== null){
			//console.log(playerStatus[username]);
			var newXPos = playerStatus[username][0][0] + xSpeed;
			var newYPos = playerStatus[username][0][1]+ ySpeed;
		}
	}
	return [newXPos,newYPos];
}