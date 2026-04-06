const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.WS_PORT || 3001;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const clients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = Math.random().toString(36).substring(2, 9);
  console.log(`Client ${clientId} connected`);
  
  clients.set(clientId, { ws, room: null });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'join_room') {
        clients.get(clientId).room = data.room;
        console.log(`Client ${clientId} joined room: ${data.room}`);
      }

      if (data.type === 'broadcast') {
        broadcastToRoom(data.room, {
          type: data.event,
          payload: data.payload,
        });
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clients.delete(clientId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  });

  // Send welcome message
  ws.send(JSON.stringify({ type: 'connected', clientId }));
});

function broadcastToRoom(room, message) {
  clients.forEach((client) => {
    if (client.room === room && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

module.exports = { broadcastToRoom };
