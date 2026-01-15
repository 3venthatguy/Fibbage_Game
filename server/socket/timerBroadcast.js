/**
 * Timer broadcast functionality for game phases.
 */

const config = require('../config');
const { logError } = require('../utils/logger');

/**
 * Starts broadcasting timer updates to a room.
 * @param {object} io - Socket.io server instance
 * @param {string} roomCode - Room code
 * @param {GameManager} gameManager - Game manager instance
 */
function startTimerBroadcast(io, roomCode, gameManager) {
  const timerInterval = setInterval(() => {
    const gameState = gameManager.getGameState(roomCode);
    if (!gameState) {
      clearInterval(timerInterval);
      return;
    }

    // Skip broadcasting if timer is paused
    if (gameState.timer.isPaused()) {
      return;
    }

    const timeRemaining = gameManager.getTimeRemaining(gameState);

    if (timeRemaining > 0) {
      io.to(roomCode).emit('timerUpdate', { timeRemaining });
    } else {
      // Timer expired, handle auto-transition based on current phase
      const currentPhase = gameState.phase;

      if (currentPhase === 'reading') {
        handleReadingPhaseExpiry(io, roomCode, gameState, gameManager, timerInterval);
      } else if (currentPhase === 'submit') {
        handleSubmitPhaseExpiry(io, roomCode, gameState, gameManager, timerInterval);
      } else if (currentPhase === 'voting') {
        handleVotingPhaseExpiry(io, roomCode, gameState, gameManager, timerInterval);
      }
    }
  }, config.TIMER_BROADCAST_INTERVAL);
}

/**
 * Handles timer expiry during reading phase.
 */
function handleReadingPhaseExpiry(io, roomCode, gameState, gameManager, timerInterval) {
  console.log('[TimerBroadcast] Reading phase expired, transitioning to submit');

  // Get the game room to call transitionToSubmit
  const gameRoom = gameManager.getGameRoom(roomCode);
  if (gameRoom) {
    gameRoom.transitionToSubmit();
  }

  console.log('[TimerBroadcast] Emitting phaseChange to submit (reading phase expired)');
  io.to(roomCode).emit('phaseChange', {
    phase: 'submit',
    timeRemaining: config.SUBMIT_PHASE_DURATION
  });

  startTimerBroadcast(io, roomCode, gameManager);
  clearInterval(timerInterval);
}

/**
 * Handles timer expiry during submit phase.
 */
function handleSubmitPhaseExpiry(io, roomCode, gameState, gameManager, timerInterval) {
  // Transition to voting
  gameManager.transitionToVoting(gameState);
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

    console.log('[TimerBroadcast] Emitting phaseChange to voting (submit phase expired)');
    io.to(roomCode).emit('phaseChange', {
      phase: 'voting',
      timeRemaining: config.VOTING_PHASE_DURATION
    });

    startTimerBroadcast(io, roomCode, gameManager);
  }, config.VOTING_TRANSITION_DELAY);

  clearInterval(timerInterval);
}

/**
 * Handles timer expiry during voting phase.
 */
function handleVotingPhaseExpiry(io, roomCode, gameState, gameManager, timerInterval) {
  console.log('[TimerBroadcast] Voting phase expired, transitioning to results');

  // Record null votes for players who didn't vote
  gameState.players.forEach(player => {
    if (!gameState.hasVoted(player.id)) {
      console.log(`[TimerBroadcast] Player ${player.name} did not vote, recording null vote`);
      gameState.submitVote(player.id, null);
    }
  });

  // Transition to results phase
  gameState.setPhase('results');

  // Emit transition sound event before results
  io.to(roomCode).emit('playTransitionSound');

  // Always start results animation sequence after a delay for the sound
  const { startResultsAnimation } = require('./events/resultsEvents');
  setTimeout(() => {
    startResultsAnimation(io, roomCode, gameManager);
  }, config.RESULTS_TRANSITION_DELAY);

  clearInterval(timerInterval);
}

module.exports = {
  startTimerBroadcast
};
