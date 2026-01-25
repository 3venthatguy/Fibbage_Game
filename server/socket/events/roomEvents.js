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
  // Send available packages to host
  socket.on('getPackages', () => {
    try {
      const packages = gameManager.getAvailablePackages();
      socket.emit('availablePackages', { packages });
    } catch (error) {
      socket.emit('error', error.message);
      logError('getting packages', error);
    }
  });

  // Create a new room with optional package selection
  socket.on('createRoom', (data = {}) => {
    try {
      console.log('createRoom event received from socket:', socket.id);
      const packageId = data.packageId || null;
      const roomCode = gameManager.createRoom(socket.id, packageId);
      const gameRoom = gameManager.getGameRoom(roomCode);
      console.log('Room created with code:', roomCode, 'package:', gameRoom.packageId);
      socket.emit('roomCreated', {
        roomCode,
        packageId: gameRoom.packageId,
        gameTitle: config.GAME_TITLE,
        gameRules: config.GAME_RULES,
        availablePackages: gameManager.getAvailablePackages()
      });
      console.log('roomCreated event emitted with code:', roomCode);
      socket.join(roomCode);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', error.message);
      logError('creating room', error);
    }
  });

  // Change question package (only in lobby phase)
  socket.on('changePackage', ({ roomCode, packageId }) => {
    try {
      const gameRoom = gameManager.getGameRoom(roomCode);
      if (!gameRoom) {
        socket.emit('error', 'Room not found');
        return;
      }

      const gameState = gameRoom.getGameState();
      if (gameState.phase !== 'lobby') {
        socket.emit('error', 'Cannot change package after game has started');
        return;
      }

      // Verify this is the host
      if (gameRoom.hostSocketId !== socket.id) {
        socket.emit('error', 'Only the host can change the question package');
        return;
      }

      // Update the package
      const questionPackages = require('../../data/packages');
      const questions = questionPackages.getQuestions(packageId);
      if (questions.length === 0) {
        socket.emit('error', 'Invalid package selected');
        return;
      }

      // Regenerate question IDs for the new package
      const selectedQuestionIds = gameManager.generateRandomQuestionIds(questions);
      gameRoom.packageId = packageId;
      gameRoom.questionLoader = (index) => questions[index];
      gameState.selectedQuestionIds = selectedQuestionIds;

      console.log('Package changed to:', packageId, 'for room:', roomCode);
      socket.emit('packageChanged', { packageId });
    } catch (error) {
      socket.emit('error', error.message);
      logError('changing package', error);
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
