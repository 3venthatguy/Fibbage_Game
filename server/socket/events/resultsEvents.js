/**
 * Socket event handlers for results animation sequence.
 */

const ResultsAnimator = require('../../game/ResultsAnimator');
const { logError } = require('../../utils/logger');

// Store active animators by room code
const activeAnimators = new Map();

/**
 * Sets up results animation event handlers.
 * @param {object} io - Socket.io server instance
 * @param {object} socket - Socket instance
 * @param {GameManager} gameManager - Game manager instance
 */
function setupResultsEvents(io, socket, gameManager) {
  // Handle host clicking "Show Leaderboard" button
  socket.on('showLeaderboard', ({ roomCode }) => {
    console.log('[ResultsEvents] Host requested leaderboard for room:', roomCode);
    const animator = activeAnimators.get(roomCode);
    if (animator) {
      animator.showLeaderboardNow();

      // Show next button after a delay
      setTimeout(() => {
        io.to(roomCode).emit('results:showNextButton', {
          sequenceId: animator.sequenceId
        });
      }, 3000); // 3 second delay
    }
  });
}

/**
 * Starts the results animation sequence for a room.
 * @param {object} io - Socket.io server instance
 * @param {string} roomCode - Room code
 * @param {GameManager} gameManager - Game manager instance
 */
async function startResultsAnimation(io, roomCode, gameManager) {
  try {
    console.log('[ResultsEvents] ========== START RESULTS ANIMATION ==========');
    console.log('[ResultsEvents] Room:', roomCode);
    console.log('[ResultsEvents] Active animators before:', activeAnimators.size);

    const gameState = gameManager.getGameState(roomCode);
    if (!gameState) {
      console.error('[ResultsEvents] No game state found for room:', roomCode);
      return;
    }
    if (gameState.phase !== 'results') {
      console.error('[ResultsEvents] Game not in results phase:', gameState.phase);
      return;
    }

    console.log('[ResultsEvents] Current question index:', gameState.currentQuestionIndex);
    console.log('[ResultsEvents] Calculating results...');
    const results = gameManager.calculateResults(gameState);
    console.log('[ResultsEvents] Results calculated:', results);

    // IMPORTANT: Tell clients to transition to results phase UI first
    console.log('[ResultsEvents] Emitting phaseChange to results');
    io.to(roomCode).emit('phaseChange', {
      phase: 'results',
      timeRemaining: 0
    });

    // Wait a moment for clients to set up results UI
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('[ResultsEvents] Creating NEW ResultsAnimator...');
    const animator = new ResultsAnimator(gameState, io, roomCode);
    console.log('[ResultsEvents] New animator sequenceId:', animator.sequenceId);

    // Store animator for button click handling
    console.log('[ResultsEvents] Storing animator in activeAnimators Map');
    activeAnimators.set(roomCode, animator);
    console.log('[ResultsEvents] Active animators after:', activeAnimators.size);

    // Start animation sequence (non-blocking)
    console.log('[ResultsEvents] Starting animation sequence...');
    animator.playResultsSequence(results).catch(error => {
      console.error('[ResultsEvents] Animation sequence error:', error);
      logError('results animation sequence', error);
      // Fallback: send instant results if animation fails
      io.to(roomCode).emit('resultsReady', results);
    });
  } catch (error) {
    console.error('[ResultsEvents] Error starting results animation:', error);
    logError('starting results animation', error);
    // Fallback: send instant results
    const gameState = gameManager.getGameState(roomCode);
    if (gameState) {
      const results = gameManager.calculateResults(gameState);
      io.to(roomCode).emit('resultsReady', results);
    }
  }
}

module.exports = {
  setupResultsEvents,
  startResultsAnimation
};
