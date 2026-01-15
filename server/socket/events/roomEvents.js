/**
 * Socket event handlers for room creation and joining.
 */

const { logError } = require('../../utils/logger');
const config = require('../../config');

/**
 * Sets up room-related event handlers.
 * @param {object} io - Socket.io server instance
 * @param {object} socket - Socket instance
 * @param {GameManager} gameManager - Game manager instance
 */
function setupRoomEvents(io, socket, gameManager) {
  // Create a new room
  socket.on('createRoom', () => {
    try {
      console.log('createRoom event received from socket:', socket.id);
      const roomCode = gameManager.createRoom(socket.id);
      console.log('Room created with code:', roomCode);
      socket.emit('roomCreated', {
        roomCode,
        gameTitle: config.GAME_TITLE,
        gameRules: config.GAME_RULES
      });
      console.log('roomCreated event emitted with code:', roomCode);
      socket.join(roomCode);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', error.message);
      logError('creating room', error);
    }
  });

  // Join a room
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    try {
      const gameState = gameManager.getGameState(roomCode);
      if (!gameState) {
        socket.emit('error', 'Room not found');
        return;
      }

      // Check if game is in progress
      if (gameState.phase !== 'lobby') {
        socket.emit('error', 'Game already in progress');
        return;
      }

      // Normal lobby join
      const player = gameManager.joinRoom(roomCode, playerName, socket.id);
      socket.join(roomCode);

      // Notify all players in room
      io.to(roomCode).emit('playerJoined', {
        players: gameState.getPlayersClientData()
      });

      // Send current game state AND player ID to the new player
      socket.emit('gameState', {
        phase: gameState.phase,
        currentQuestionIndex: gameState.currentQuestionIndex,
        totalQuestions: gameState.selectedQuestionIds.length || 8,
        playerId: player.id,
        gameTitle: config.GAME_TITLE,
        gameRules: config.GAME_RULES
      });
    } catch (error) {
      socket.emit('error', error.message);
      logError('joining room', error);
    }
  });
}

module.exports = {
  setupRoomEvents
};
