#!/usr/bin/env node
const socket = new WebSocket('wss://shorthaired-rainbow-tartan.glitch.me', 'echo-protocol');
document.getElementById('status').innerHTML = 'connecting to server';
var $board = $('#Board')
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
        game.undo();
        return 'snapback';
    }  
    if (!isInGame ) {
        game.undo();
        alert("join a game to move");
        return 'snapback';
    }  
    move(game.fen());
    if (game.game_over()) {
        isInGame = false;
        if (game.in_checkmate()) {
            alert("Checkmate! you won")
        } else {
            alert("its a draw")
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
              game.load(json.move);
              board.position(json.move);
              if (game.game_over()) {
                isInGame = false;
                if (game.in_checkmate()) {
                    alert("Checkmate! you lost")
                } else {
                    alert("its a draw")
                }
            }
              
            } else if (json.type === 'gameStarted') {
                setBoard(json.color);
              color = json.color;
              isInGame = true;
              isWaitingForGame = false;

              game.reset();
              board.position(game.fen());
              alert("game started")
                
            } else if (json.type === 'resign') {
                isInGame = false;
                alert("oponent resigned! you won") ;
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
          "type":"joinGame"
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
        alert("you resigned");
    }
