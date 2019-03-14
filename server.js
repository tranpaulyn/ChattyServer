const express = require('express');
const SocketServer = require('ws').Server;
const uuidv1 = require('uuid/v1');
const WebSocketServer = require('ws');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.

let onlineUsers = 0;

let userColors = ['#3d51e2', '#2CA3DD', '#7536E1', '#6070E8'];

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Sending & Displaying number of online users & assign color
  onlineUsers += 1;
  ws.uniqueColor = userColors[onlineUsers % 4];

  let numberOfUsers = JSON.stringify({
    type: "userCountChanged",
    userCount: onlineUsers,
  })

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocketServer.OPEN) {
      client.send(numberOfUsers);
    }
  });

  // Receiving a message/notification from the front end
  // Send it back with unique ID
  ws.on('message', (message) => {
    let obj = JSON.parse(message)

    switch(obj.type) {
      case "postMessage":
        let uniqueMessage = JSON.stringify({
          id: uuidv1(), 
          username: obj.username, 
          content: obj.content, 
          type: "incomingMessage",
          color: ws.uniqueColor});

        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocketServer.OPEN) {
            client.send(uniqueMessage);
          }
        });
        break;
      case "postNotification":
        let uniqueNotification = JSON.stringify({
          id: uuidv1(), 
          username: obj.username, 
          content: obj.content, 
          type: "incomingNotification"});
      
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocketServer.OPEN) {
            client.send(uniqueNotification);
          }
        });
        break;
    }


  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected');
    onlineUsers -= 1;
    console.log(onlineUsers);
  });

});