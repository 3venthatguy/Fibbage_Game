/**
 * Socket connection and disconnection event handlers.
 */

const { logConnection, logDisconnection } = require('../../utils/logger');
const config = require('../../config');

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
      const gameRoom = gameManager.getGameRoom(roomCode);

      if (gameState) {
        // Notify remaining players of updated player list
        io.to(roomCode).emit('playerJoined', {
          players: gameState.getPlayersClientData()
        });

        // If in active phase, emit playerDisconnected with updated counts
        const playerCount = gameState.players.length;
        if (gameState.phase === 'submit' || gameState.phase === 'reading') {
          const submittedCount = gameState.players.filter(p => gameState.submittedAnswers[p.id]).length;
          io.to(roomCode).emit('playerDisconnected', {
            phase: 'submit',
            submittedCount,
            totalPlayers: playerCount
          });

          // Check if phase should auto-complete after disconnect
          if (gameState.phase === 'submit' && gameState.isSubmitPhaseComplete()) {
            gameRoom.transitionToVoting();
            const shuffledAnswers = gameRoom.getShuffledAnswers();
            io.to(roomCode).emit('allAnswersSubmitted');

            setTimeout(() => {
              gameState.startTimer(config.VOTING_PHASE_DURATION);

              // Send voting answers to host
              io.to(gameState.hostId).emit('votingReady', {
                answers: shuffledAnswers.map(a => ({ id: a.id, text: a.text }))
              });

              // Send filtered answers to each player
              gameState.players.forEach(player => {
                const filteredAnswers = shuffledAnswers.filter(answer => {
                  if (answer.id === 'correct') return true;
                  if (answer.playerIds && answer.playerIds.includes(player.id)) {
                    return false;
                  }
                  return true;
                });

                io.to(player.socketId).emit('votingReady', {
                  answers: filteredAnswers.map(a => ({ id: a.id, text: a.text }))
                });
              });

              io.to(roomCode).emit('phaseChange', {
                phase: 'voting',
                timeRemaining: config.VOTING_PHASE_DURATION
              });
            }, config.VOTING_TRANSITION_DELAY);
          }
        } else if (gameState.phase === 'voting') {
          const votedCount = gameState.players.filter(p => gameState.votes[p.id]).length;
          io.to(roomCode).emit('playerDisconnected', {
            phase: 'voting',
            voteCount: votedCount,
            totalPlayers: playerCount
          });

          // Check if voting phase should auto-complete after disconnect
          if (gameState.isVotingPhaseComplete()) {
            gameState.setPhase('results');
            gameState.pauseTimer();

            const { startResultsAnimation } = require('./resultsEvents');

            io.to(roomCode).emit('playTransitionSound');

            setTimeout(() => {
              startResultsAnimation(io, roomCode, gameManager);
            }, config.RESULTS_TRANSITION_DELAY);
          }
        }
      }
    }
  });
}

module.exports = {
  setupConnectionEvents
};
