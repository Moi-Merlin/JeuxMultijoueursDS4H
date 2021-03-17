let canvas, ctx, mousePos;

// Autres joueurs
let allPlayers = {};
let canv = document.getElementsByTagName("canvas")
let target = {x:400, y:225, radius:40, color:'rgba(152, 222, 217, .5)'};

let obstacles = [];

// for time based animation
// for time based animation
let delta, oldTime;
let playerSpeed = 100; // 100 pixels/s

function startGame() {
  console.log("init");
  canvas = document.querySelector("#myCanvas");
  ctx = canvas.getContext("2d");

  // Les écouteurs
  canvas.onkeydown = processKeydown;
  canvas.onkeyup = processKeyup;

  createObstacles();

  requestAnimationFrame(animationLoop);
}

function createObstacles() {
  let o1 = {x:300, y:50, width:50, height:50, color:"goldenrod", v:50, range:10, movement:'V'}
  let o2 = {x:150, y:50, width:20, height:50, color:"orange", v:30, range:100, movement:'V'}
  let o3 = {x:50, y:50, width:60, height:20, color:"yellowgreen", v:40, range:100, movement:'H'}
  obstacles.push(o1);
  obstacles.push(o2);
  obstacles.push(o3);
}

function processKeydown(event) {
  event.preventDefault();
  event.stopPropagation(); // avoid scrolling with arri-ow keys

  switch (event.key) {
    case "ArrowRight":
      allPlayers[username].vx = playerSpeed;
      break;
    case "ArrowLeft":
      allPlayers[username].vx = -playerSpeed;
      break;
    case "ArrowUp":
      allPlayers[username].vy = -playerSpeed;
      break;
    case "ArrowDown":
      allPlayers[username].vy = playerSpeed;
      break;
  }

  //console.log('keydown key = ' + event.key);
}

function processKeyup(event) {
  switch (event.key) {
    case "ArrowRight":
    case "ArrowLeft":
      allPlayers[username].vx = 0;
      break;
    case "ArrowUp":
    case "ArrowDown":
      allPlayers[username].vy = 0;
      break;
  }
}


function updatePlayerNewPos(newPos) {
  allPlayers[newPos.user].x = newPos.pos.x;
  allPlayers[newPos.user].y = newPos.pos.y;
}

// Mise à jour du tableau quand un joueur arrive
// ou se deconnecte
function updatePlayers(listOfPlayers) {
  allPlayers = listOfPlayers;
}

function drawPlayer(player) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillRect(0, 0, 10, 10);
  ctx.restore();
}

function drawAllPlayers() {
  for (let name in allPlayers) {
    drawPlayer(allPlayers[name]);
  }
}

function moveCurrentPlayer() {
  if (allPlayers[username] !== undefined) {
    allPlayers[username].x += calcDistanceToMove(delta, allPlayers[username].vx);
    allPlayers[username].y += calcDistanceToMove(delta, allPlayers[username].vy);

    socket.emit("sendpos", { user: username, pos: allPlayers[username]});
  }
}

function drawTarget() {
  ctx.save();
  ctx.fillStyle = target.color;
  ctx.arc(target.x, target.y, target.radius, 0, 2 * Math.PI);
  ctx.lineWidth="4";
  ctx.strokeStyle = 'black';
  ctx.fill(); ctx.stroke(); ctx.restore();
}

// Collisions between rectangle and circle
function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
  var testX=cx; 
  var testY=cy; 
  
  if (testX < x0) testX=x0; 
  if (testX > (x0+w0)) testX=(x0+w0); 
  if (testY < y0) testY=y0; 
  if (testY > (y0+h0)) testY=(y0+h0); 

  return (((cx-testX)*(cx-testX)+(cy-testY)*(cy-testY))<r*r); 
}

function checkIfPlayerHitTarget(player) {
  if(player === undefined) return;

  if(circRectsOverlap(player.x, player.y, 10, 10, target.x, target.y, target.radius)) {
    console.log("COLLISION TARGET REACHED BY PLAYER");
    target.color = "red";
    player.x = 10;
    player.y = 10;
  } else {
    target.color = 'rgba(152, 222, 217, .5)'
  }
}

function drawObstacles() {
  ctx.save();

  obstacles.forEach(o => {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.width, o.height);

    let movement = o.movement
    switch(movement){
      case 'V':
        o.y += calcDistanceToMove(delta,o.v);
        if(o.y > (449-o.height)) {
          o.y = 448-o.height;
          o.v = -o.v;
        } 
        if(o.y <1) {
          o.y = 2;
          o.v = -o.v;
        }
      break;

      case 'H':
        o.x += calcDistanceToMove(delta,o.v);
        if(o.x > (449-o.width)) {
          o.x = 448-o.width;
          o.v = -o.v
        } 
        if(o.x <1) {
          o.x = 2;
          o.v = -o.v;
        }
      break;
      default:
      break;
    }
  });
  ctx.restore();
}


// returns the time elapsed since last frame has been drawn, in seconds
function timer(currentTime) {
  var delta = currentTime - oldTime;
  oldTime = currentTime;
  return delta/1000;
}

function animationLoop(time) {
  if(!oldTime) {
    oldTime = time;
    requestAnimationFrame(animationLoop);
  }

  delta = timer(time); // delta is in seconds
  

  if (username != undefined) {
    // 1 On efface l'écran
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2 On dessine des objets
    drawAllPlayers();

    drawTarget();
    drawObstacles();

    moveCurrentPlayer();
    checkIfPlayerHitTarget(allPlayers[username]);

    //checkCollisionsPlayerWithObstacles()
  }

  // 3 On rappelle la fonction d'animation à 60 im/s
  requestAnimationFrame(animationLoop);
}

// Delta in seconds, speed in pixels/s
var calcDistanceToMove = function(delta, speed) {
  //console.log("#delta = " + delta + " speed = " + speed);
  return (speed * delta); 
};