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
        // Next question - immediate transition (no delay)
        const delay = config.NEXT_QUESTION_DELAY || 0;
        const emitNextQuestion = () => {
          // Restart the timer NOW so it syncs with the client
          gameState.startTimer(config.READING_PHASE_DURATION);

          io.to(roomCode).emit('newQuestion', {
            question: gameState.currentQuestion.question,
            questionIndex: gameState.currentQuestionIndex,
            totalQuestions: gameState.selectedQuestionIds.length
          });

          console.log('[GameEvents] Emitting phaseChange to reading (nextQuestion)');
          io.to(roomCode).emit('phaseChange', {
            phase: 'reading',
            timeRemaining: config.READING_PHASE_DURATION
          });

          startTimerBroadcast(io, roomCode, gameManager);
        };

        if (delay > 0) {
          setTimeout(emitNextQuestion, delay);
        } else {
          emitNextQuestion();
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
