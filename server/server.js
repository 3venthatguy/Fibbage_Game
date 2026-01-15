/**
 * Fibbage Game Server
 * Main entry point for the server application.
 */

console.log('Loading modules...');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');

console.log('Loading config...');
const config = require('./config');
console.log('Loading GameManager...');
const GameManager = require('./gameManager');
console.log('Loading routes...');
const { setupRoutes } = require('./routes');
console.log('Loading socket handlers...');
const { setupSocketHandlers } = require('./socket/socketHandler');

console.log('Initializing Express and Socket.io...');
// Initialize Express and Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: config.CORS_ORIGIN,
    methods: ["GET", "POST"]
  }
});

console.log('Creating GameManager instance...');
// Initialize game manager
const gameManager = new GameManager();

console.log('Setting up routes...');
// Setup routes
setupRoutes(app);

console.log('Setting up socket handlers...');
// Setup socket.io handlers
setupSocketHandlers(io, gameManager);

console.log('Setting up cleanup interval...');
// Cleanup empty rooms periodically
setInterval(() => {
  gameManager.cleanupEmptyRooms();
}, config.CLEANUP_INTERVAL);

console.log('Starting server...');

// Get local network IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Start server
server.listen(config.PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`Fibbage server running on port ${config.PORT}`);
  console.log(`\n📱 Access from this computer:`);
  console.log(`   Host screen:   http://localhost:${config.PORT}/host.html`);
  console.log(`   Player screen: http://localhost:${config.PORT}/player.html`);
  console.log(`\n📱 Access from phone/other devices (same WiFi):`);
  console.log(`   Host screen:   http://${localIP}:${config.PORT}/host.html`);
  console.log(`   Player screen: http://${localIP}:${config.PORT}/player.html`);
});
