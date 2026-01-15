/**
 * Main socket.io event handler setup.
 * Coordinates all socket event handlers.
 */

const { setupConnectionEvents } = require('./events/connectionEvents');
const { setupRoomEvents } = require('./events/roomEvents');
const { setupGameEvents } = require('./events/gameEvents');
const { setupPlayerEvents } = require('./events/playerEvents');
const { setupResultsEvents } = require('./events/resultsEvents');

/**
 * Sets up all socket.io event handlers.
 * @param {object} io - Socket.io server instance
 * @param {GameManager} gameManager - Game manager instance
 */
function setupSocketHandlers(io, gameManager) {
  io.on('connection', (socket) => {
    setupConnectionEvents(io, socket, gameManager);
    setupRoomEvents(io, socket, gameManager);
    setupGameEvents(io, socket, gameManager);
    setupPlayerEvents(io, socket, gameManager);
    setupResultsEvents(io, socket, gameManager);
  });
}

module.exports = {
  setupSocketHandlers
};
