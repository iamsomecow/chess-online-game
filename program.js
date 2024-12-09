#!/usr/bin/env node
var playerElo = 1500
var opElo;
var elo = new Elo();
if (elo === undefined) {
    console.log("elo is undefined")
}
if (localStorage.getItem("elo" !== null)) {
    playerElo = parseInt(localStorage.getItem("elo"))
}
document.getElementById('playerElo').innerHTML = "your elo: " + playerElo.toString();
const socket = new WebSocket('wss://shorthaired-rainbow-tartan.glitch.me', 'echo-protocol');
document.getElementById('status').innerHTML = 'connecting to server';
var $board = $('#Board')
var moveSound = document.getElementById('moveSound');
var board = null;
var config = {
    position: 'start',
    draggable: true,
    dropOffBoard: 'snapback',
    onDrop: onDrop,
  }
board = ChessBoard('board', config);

var game = new Chess();
var color;
var isInGame = false;
var isWaitingForGame = false;
function onDrop(source, target, piece, newPos, oldPos, orientation) {
    var mOove = {
      from: source,
      to: target,
      promotion: 'q' // promote to a queen for example
    };
  
    // Attempt to make the move in chess.js
    var result = game.move(mOove);
  
    // If the move is illegal, snap the piece back to its original square
    if (result === null)  return 'snapback';
    if (color === game.turn()) {
        game.undo()
        return 'snapback';
    } else if (!isInGame ) {
        game.undo();
        alert("join a game to move");
        return 'snapback';
    }  
    var move2 = game.undo().san;
    move(move2);
    game.move(move2);
    moveSound.play();
    if (game.game_over()) {
        isInGame = false;
        if (game.in_checkmate()) {
            alert("Checkmate! you won")
            setElo(game)
        } else {
            alert("its a draw")
            setElo(game)
        }
    }
  
}
socket.onopen = () => {
  console.log('Connected to the server');
  document.getElementById('status').innerHTML = 'Connected to the server';
  alert('Connected to the server');
};

socket.onmessage = event => {
  console.log(`Message from server: ${event.data}`);
  var json = JSON.parse(event.data);
  if (json.type === "move") {
              game.move(json.move);
              board.position(game.fen());
              moveSound.play();
              if (game.game_over()) {
                isInGame = false;
                if (game.in_checkmate()) {
                    alert("Checkmate! you lost")
                    setElo(game)
                } else {
                    alert("its a draw")
                    setElo(game)
                }
            }
              
            } else if (json.type === 'gameStarted') {
                setBoard(json.color);
              color = json.color;
              isInGame = true;
              isWaitingForGame = false;
              opElo = parseInt(json.elo);
              document.getElementById('opElo').innerHTML = `oponents elo: ${opElo.toString()}`;
              game.reset();
              board.position(game.fen());
              alert("game started")
                
            } else if (json.type === 'resign' && isInGame) {
                isInGame = false;
                var newElo = elo.ifWins(playerElo, opElo)
                playerElo = newElo;
                localStorage.setItem("elo",playerElo.toString())
                alert("oponent resigned! you won") ;
            } else if (json.type === 'disconnect' && isInGame) {
                isInGame = false;
                
                
                alert("oponent disconnected! you won")
            }
};

socket.onclose = () => {
  console.log('Disconnected from the server');
  document.getElementById('status').innerHTML = 'disconected from the server refresh the page';
  alert('disconected from the server refresh the page');
};

socket.onerror = error => {
  console.error(`WebSocket error: ${error}`);
};

    function joinGame() {
        if (!isInGame && !isWaitingForGame) {
            isWaitingForGame = true;
        var json = {
          "type":"joinGame",
          "elo":playerElo.toString()
        }
        socket.send(JSON.stringify(json));
    } else {
        alert("in a game or already looking for a game, can not start a new game")
    }
    }
    function move(move) {
        if (isInGame) {
            var json = {
                "type":"move",
                "move": move
            }
            socket.send(JSON.stringify(json))
        } else {
            alert("join a game to move") 
        }
    }
    function setBoard(newColor) {
        if (newColor === "w")
        {
            board.orientation('white')
        } else {
            board.orientation('black')
        }
    }
    function resign() {
        var json = {
            "type":"resign"
        }
        isInGame = false;
        socket.send(JSON.stringify(json));
        setElo(game);
        alert("you resigned");
    }
    function setElo(game){
        if (game.in_draw()) {
            var newElo = elo.ifTies(PlayerElo, opElo)
        } else if(game.turn === color) {
            var newElo = elo.ifWins(playerElo, opElo)
        } else {
            var newElo = elo.ifLoses(playerElo, opElo)
        }
        playerElo = newElo;
        localStorage.setItem("elo",playerElo.toString())

    }
    window.onbeforeunload = function() { 
        if(isInGame){
            var newElo = elo.ifLoss(playerElo, opElo)
            playerElo = newElo;
            localStorage.setItem("elo",playerElo.toString())
        }
    };
