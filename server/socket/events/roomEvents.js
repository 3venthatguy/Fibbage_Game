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
      if (gameState.hostId !== socket.id) {
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

      // Allow joining during lobby, reading, or submit phases
      const allowedPhases = ['lobby', 'reading', 'submit'];
      if (!allowedPhases.includes(gameState.phase)) {
        socket.emit('error', 'Game in progress! Wait for the next question to appear on the host screen, then try again.');
        return;
      }

      // Join the room
      const player = gameManager.joinRoom(roomCode, playerName, socket.id);
      socket.join(roomCode);

      // Notify all players in room (including host)
      // Include phase info and counts so host can update checkmarks
      const playerJoinedData = {
        players: gameState.getPlayersClientData(),
        phase: gameState.phase,
        totalPlayers: gameState.players.length
      };

      // Add submitted/voted counts for mid-game joins
      if (gameState.phase === 'submit' || gameState.phase === 'reading') {
        playerJoinedData.submittedCount = Object.keys(gameState.submittedAnswers).length;
        console.log(`[RoomEvents] Player joined mid-game. Total players: ${playerJoinedData.totalPlayers}, Submitted: ${playerJoinedData.submittedCount}`);
      }

      io.to(roomCode).emit('playerJoined', playerJoinedData);

      // Send current game state AND player ID to the new player
      const gameStateData = {
        phase: gameState.phase,
        currentQuestionIndex: gameState.currentQuestionIndex,
        totalQuestions: gameState.selectedQuestionIds.length || 8,
        playerId: player.id,
        gameTitle: config.GAME_TITLE,
        gameRules: config.GAME_RULES
      };

      // If joining mid-game, send the current question too
      if (gameState.phase !== 'lobby' && gameState.currentQuestion) {
        gameStateData.currentQuestion = gameState.currentQuestion.question;
        gameStateData.timeRemaining = gameState.getTimeRemaining();
        gameStateData.joinedMidGame = true;
      }

      socket.emit('gameState', gameStateData);

      // If in submit phase, also send phase change so player can start answering
      if (gameState.phase === 'submit') {
        socket.emit('phaseChange', {
          phase: 'submit',
          timeRemaining: gameState.getTimeRemaining()
        });
        socket.emit('newQuestion', {
          question: gameState.currentQuestion.question,
          questionIndex: gameState.currentQuestionIndex,
          totalQuestions: gameState.selectedQuestionIds.length
        });
      } else if (gameState.phase === 'reading') {
        socket.emit('phaseChange', {
          phase: 'reading',
          timeRemaining: gameState.getTimeRemaining()
        });
        socket.emit('newQuestion', {
          question: gameState.currentQuestion.question,
          questionIndex: gameState.currentQuestionIndex,
          totalQuestions: gameState.selectedQuestionIds.length
        });
      }
    } catch (error) {
      socket.emit('error', error.message);
      logError('joining room', error);
    }
  });
}

module.exports = {
  setupRoomEvents
};
