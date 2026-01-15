/**
 * Socket connection and disconnection event handlers.
 */

const { logConnection, logDisconnection } = require('../../utils/logger');

/**
 * Sets up connection event handlers.
 * @param {object} io - Socket.io server instance
 * @param {GameManager} gameManager - Game manager instance
 */
function setupConnectionEvents(io, socket, gameManager) {
  logConnection(socket.id);

  socket.on('disconnect', () => {
    logDisconnection(socket.id);
    const disconnectInfo = gameManager.handleDisconnect(socket.id);

    if (disconnectInfo) {
      const { roomCode } = disconnectInfo;
      const gameState = gameManager.getGameState(roomCode);

      if (gameState) {
        // Notify remaining players
        io.to(roomCode).emit('playerJoined', {
          players: gameState.getPlayersClientData()
        });
      }
    }
  });
}

module.exports = {
  setupConnectionEvents
};
