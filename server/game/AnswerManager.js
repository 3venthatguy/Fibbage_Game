/**
 * Answer management utilities.
 * Handles answer shuffling and validation.
 */

/**
 * Shuffles answers with the correct answer for voting.
 * Groups duplicate answers together.
 * Includes answers from players who left mid-game.
 * @param {object} gameState - Current game state
 * @returns {Array} Shuffled array of answers
 */
function getShuffledAnswers(gameState) {
  const answerMap = new Map(); // text -> {ids: [], text, isCorrect}

  // Process all submitted answers (includes answers from left players)
  Object.entries(gameState.submittedAnswers).forEach(([playerId, answerText]) => {
    if (answerMap.has(answerText)) {
      // Duplicate answer - add this player's ID to the group
      answerMap.get(answerText).ids.push(playerId);
    } else {
      // New unique answer
      answerMap.set(answerText, {
        ids: [playerId],
        text: answerText,
        isCorrect: false
      });
    }
  });

  // Convert map to array
  const answers = Array.from(answerMap.values()).map(group => ({
    id: group.ids.length === 1 ? group.ids[0] : group.ids.join(','), // Comma-separated IDs for duplicates
    playerIds: group.ids, // Store all player IDs who submitted this answer
    text: group.text,
    isCorrect: false
  }));

  // Add correct answer
  answers.push({
    id: 'correct',
    playerIds: ['correct'],
    text: gameState.currentQuestion.answer,
    isCorrect: true
  });

  // Fisher-Yates shuffle
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }

  return answers;
}

/**
 * Validates that an answer is not the same as the correct answer.
 * @param {string} answer - Submitted answer
 * @param {string} correctAnswer - The correct answer
 * @returns {boolean} True if valid (different from correct), false otherwise
 */
function isAnswerValid(answer, correctAnswer) {
  const submitted = answer.toLowerCase().trim();
  const correct = correctAnswer.toLowerCase().trim();
  return submitted !== correct;
}

module.exports = {
  getShuffledAnswers,
  isAnswerValid
};
