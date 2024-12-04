#!/usr/bin/env node
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

var game = new chess();

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
              
            } else if (json.type == 'game started') {
              
            }
        }
    });
    
    function joinGame() {
      if 
        json = {
          "type" = "joinGame"
        }
        connection.sendUTF(json);
    }
    sendNumber();
});

client.connect('ws://localhost:8080/', 'echo-protocol');
