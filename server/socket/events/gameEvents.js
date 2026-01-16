/**
 * Socket event handlers for game progression (start, next question).
 */

const config = require('../../config');
const { logError } = require('../../utils/logger');
const { startTimerBroadcast } = require('../timerBroadcast');

/**
 * Sets up game progression event handlers.
 * @param {object} io - Socket.io server instance
 * @param {object} socket - Socket instance
 * @param {GameManager} gameManager - Game manager instance
 */
function setupGameEvents(io, socket, gameManager) {
  // Start the game
  socket.on('startGame', ({ roomCode }) => {
    try {
      const gameState = gameManager.startGame(roomCode, socket.id);

      // Broadcast game started
      io.to(roomCode).emit('gameStarted');

      // Start first question
      setTimeout(() => {
        const currentState = gameManager.getGameState(roomCode);
        if (currentState && currentState.currentQuestion) {
          // Restart the timer NOW (after the delay) so it syncs with the client
          currentState.startTimer(config.READING_PHASE_DURATION);

          io.to(roomCode).emit('newQuestion', {
            question: currentState.currentQuestion.question,
            questionIndex: currentState.currentQuestionIndex,
            totalQuestions: currentState.selectedQuestionIds.length
          });

          console.log('[GameEvents] Emitting phaseChange to reading (startGame)');
          io.to(roomCode).emit('phaseChange', {
            phase: 'reading',
            timeRemaining: config.READING_PHASE_DURATION
          });

          // Start timer broadcasts
          startTimerBroadcast(io, roomCode, gameManager);
        }
      }, config.GAME_START_DELAY);
    } catch (error) {
      socket.emit('error', error.message);
      logError('starting game', error);
    }
  });

  // Next question (host only)
  socket.on('nextQuestion', ({ roomCode }) => {
    try {
      const gameState = gameManager.nextQuestion(roomCode, socket.id);

      if (gameState.phase === 'gameOver') {
        // Game over
        const finalScores = gameState.players
          .map(p => p.toClientData())
          .sort((a, b) => b.score - a.score);

        io.to(roomCode).emit('gameOver', { finalScores });
      } else {
        // Check if we should show a multiplier announcement
        const multiplierAnnouncement = gameState.shouldShowMultiplierAnnouncement();

        const emitNextQuestion = () => {
          // Restart the timer NOW so it syncs with the client
          gameState.startTimer(config.READING_PHASE_DURATION);

          io.to(roomCode).emit('newQuestion', {
            question: gameState.currentQuestion.question,
            questionIndex: gameState.currentQuestionIndex,
            totalQuestions: gameState.selectedQuestionIds.length,
            multiplier: gameState.getCurrentMultiplier()
          });

          console.log('[GameEvents] Emitting phaseChange to reading (nextQuestion)');
          io.to(roomCode).emit('phaseChange', {
            phase: 'reading',
            timeRemaining: config.READING_PHASE_DURATION
          });

          startTimerBroadcast(io, roomCode, gameManager);
        };

        if (multiplierAnnouncement) {
          // Calculate total announcement duration from config
          const announcementDuration =
            config.MULTIPLIER_ANIMATION_TIMINGS.fadeToBlack +
            config.MULTIPLIER_ANIMATION_TIMINGS.textZoomIn +
            config.MULTIPLIER_ANIMATION_TIMINGS.holdDuration +
            config.MULTIPLIER_ANIMATION_TIMINGS.fadeOut;

          console.log(`[GameEvents] Showing multiplier announcement: ${multiplierAnnouncement.type} (${multiplierAnnouncement.multiplier}x)`);

          // Emit the multiplier announcement event
          io.to(roomCode).emit('multiplierAnnouncement', {
            type: multiplierAnnouncement.type,
            multiplier: multiplierAnnouncement.multiplier
          });

          // Wait for announcement to complete before showing next question
          setTimeout(emitNextQuestion, announcementDuration);
        } else {
          // No announcement needed - proceed immediately
          const delay = config.NEXT_QUESTION_DELAY || 0;
          if (delay > 0) {
            setTimeout(emitNextQuestion, delay);
          } else {
            emitNextQuestion();
          }
        }
      }
    } catch (error) {
      socket.emit('error', error.message);
      logError('advancing question', error);
    }
  });
}

module.exports = {
  setupGameEvents
};
