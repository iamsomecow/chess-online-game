#!/usr/bin/env node
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();
var config = {
    position: 'start',
    draggable: true,
    dropOffBoard: 'snapback',
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
  }
var board = ChessBoard('Board', config);

var game = new chess();
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
    move(result);
}
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            json = json.parse(message.utf8);
            if (json.type === move) {
              game.move(json.move);
              board.position(game.fen);
            } else if (json.type === 'gameStarted') {
              color = json.color;
              isInGame = true;
            }
        }
    });
    
    function joinGame() {
        if (connection.connected) {
        var json = {
          "type":"joinGame"
        }
        connection.sendUTF(json);
    }
    }
    function move(move) {
        if (connection.connected ) {
            var json = {
                "type":"move",
                "move": move
            }
            connection.sendUTF(json);
        }
    }
});

client.connect('ws://localhost:8080/', 'echo-protocol');
