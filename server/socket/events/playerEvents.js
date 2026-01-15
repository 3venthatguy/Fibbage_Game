/**
 * Socket event handlers for player actions (submit answer, submit vote).
 */

const config = require('../../config');
const { logError } = require('../../utils/logger');

/**
 * Sets up player action event handlers.
 * @param {object} io - Socket.io server instance
 * @param {object} socket - Socket instance
 * @param {GameManager} gameManager - Game manager instance
 */
function setupPlayerEvents(io, socket, gameManager) {
  // Submit an answer
  socket.on('submitAnswer', ({ roomCode, answer }) => {
    try {
      const socketData = gameManager.socketToPlayer.get(socket.id);
      if (!socketData) {
        socket.emit('error', 'Not a player in this room');
        return;
      }

      const gameState = gameManager.submitAnswer(roomCode, socketData.playerId, answer);

      // Notify all players of submission count
      const playerCount = gameState.players.length;
      const submittedCount = gameState.players.filter(p => gameState.submittedAnswers[p.id]).length;
      io.to(roomCode).emit('answerSubmitted', {
        submittedCount,
        totalPlayers: playerCount
      });

      // If all submitted, notify transition
      if (gameState.phase === 'voting') {
        const shuffledAnswers = gameManager.getShuffledAnswers(gameState);
        io.to(roomCode).emit('allAnswersSubmitted');

        setTimeout(() => {
          // Restart the timer NOW (after the delay) so it syncs with the client
          gameState.startTimer(config.VOTING_PHASE_DURATION);

          // Send voting answers to host (shows all answers)
          io.to(gameState.hostId).emit('votingReady', {
            answers: shuffledAnswers.map(a => ({ id: a.id, text: a.text }))
          });

          // Send filtered answers to each player (exclude their own answer)
          gameState.players.forEach(player => {
            const filteredAnswers = shuffledAnswers.filter(answer => {
              // Keep the correct answer
              if (answer.id === 'correct') return true;

              // For duplicate answers, check if this player is in the playerIds array
              if (answer.playerIds && answer.playerIds.includes(player.id)) {
                return false; // Exclude this answer - player submitted it
              }

              return true; // Show all other answers
            });

            io.to(player.socketId).emit('votingReady', {
              answers: filteredAnswers.map(a => ({ id: a.id, text: a.text }))
            });
          });

          console.log('[PlayerEvents] Emitting phaseChange to voting (all answers submitted)');
          io.to(roomCode).emit('phaseChange', {
            phase: 'voting',
            timeRemaining: config.VOTING_PHASE_DURATION
          });
        }, config.VOTING_TRANSITION_DELAY);
      }
    } catch (error) {
      socket.emit('error', error.message);
      logError('submitting answer', error);
    }
  });

  // Submit a vote
  socket.on('submitVote', ({ roomCode, votedForId }) => {
    try {
      const socketData = gameManager.socketToPlayer.get(socket.id);
      if (!socketData) {
        socket.emit('error', 'Not a player in this room');
        return;
      }

      const gameState = gameManager.submitVote(roomCode, socketData.playerId, votedForId);

      // Notify all players of vote count
      const playerCount = gameState.players.length;
      const voteCount = gameState.players.filter(p => gameState.votes[p.id]).length;
      io.to(roomCode).emit('voteSubmitted', {
        voteCount,
        totalPlayers: playerCount,
        votedForId: votedForId
      });

      // If all voted, pause timer and start results animation
      if (gameState.phase === 'results') {
        console.log('[PlayerEvents] All votes submitted, pausing timer and transitioning to results phase');

        // Pause the timer since all votes are in
        gameState.pauseTimer();

        const { startResultsAnimation } = require('./resultsEvents');

        // Emit transition sound event before results
        io.to(roomCode).emit('playTransitionSound');

        setTimeout(() => {
          console.log('[PlayerEvents] Starting results animation after delay');
          // Start animated results sequence
          startResultsAnimation(io, roomCode, gameManager);
        }, config.RESULTS_TRANSITION_DELAY);
      }
    } catch (error) {
      socket.emit('error', error.message);
      logError('submitting vote', error);
    }
  });
}

module.exports = {
  setupPlayerEvents
};
