#!/usr/bin/env node
const socket = new WebSocket('wss://shorthaired-rainbow-tartan.glitch.me', 'echo-protocol');
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
    if (color === game.turn) return 'snapback';
    if (!isInGame ) return 'snapback';
    move(move);
  
}
socket.onopen = () => {
  console.log('Connected to the server');
  socket.send('Hello Server');
};

socket.onmessage = event => {
  console.log(`Message from server: ${event.data}`);
  var json = JSON.parse(event.data);
  if (json.type === "move") {
              game.load(json.move);
              board.position(json.move);
            } else if (json.type === 'gameStarted') {
              color = json.color;
              isInGame = true;
            }
};

socket.onclose = () => {
  console.log('Disconnected from the server');
};

socket.onerror = error => {
  console.error(`WebSocket error: ${error}`);
};

    function joinGame() {
        
        var json = {
          "type":"joinGame"
        }
        socket.send(JSON.stringify(json));
    }
    function move(move) {
        
            var json = {
                "type":"move",
                "move": move
            }
            socket.send(JSON.stringify(json))
    }
