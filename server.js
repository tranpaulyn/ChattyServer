const express = require('express');
const SocketServer = require('ws').Server;
const uuidv4 = require('uuid/v4');
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
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    let id = uuidv4();
    let obj = JSON.parse(message)
    if (obj.type === 'postMessage') {
      let uniqueMessage = JSON.stringify({id: id, username: obj.username, content: obj.content, type: "incomingMessage"});
      // console.log(obj);
      // console.log(obj.content);
      // console.log(obj.username);

      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocketServer.OPEN) {
          client.send(uniqueMessage);
        }
      });
    } else if (obj.type === 'postNotification') {
      let uniqueMessage = JSON.stringify({id: id, username: obj.username, content: obj.content, type: "incomingNotification"});
    
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocketServer.OPEN) {
          client.send(uniqueMessage);
        }
      })
    }

    // console.log(obj.content);
    // // console.log(`User ${obj.username} said ${obj.content}`);
    // console.log(obj.username);

  });

  

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
});