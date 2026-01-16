/**
 * Score calculation logic for the game.
 */

const config = require('../config');

/**
 * Calculates results and scores for the current round.
 * Handles duplicate answers by splitting points among players who submitted the same lie.
 * Also handles answers from players who left mid-game (they don't get score but their lies still fool people).
 * Applies point multiplier based on the current question number.
 * @param {object} gameState - Current game state
 * @returns {object} Results data including scores, vote counts, and multiplier info
 */
function calculateResults(gameState) {
  const correctAnswer = gameState.currentQuestion.answer;
  const roundScores = {};
  const voteCounts = {};

  // Get the current multiplier (1x, 2x, or 3x)
  const multiplier = gameState.getCurrentMultiplier();

  // Calculate multiplied point values
  const correctVotePoints = config.CORRECT_VOTE_POINTS * multiplier;
  const foolPlayerPoints = config.FOOL_PLAYER_POINTS * multiplier;

  // Initialize scores and vote counts for active players
  gameState.players.forEach(player => {
    roundScores[player.id] = 0;
    voteCounts[player.id] = 0;
  });

  // Also initialize for left players who submitted answers (for vote count tracking)
  gameState.leftPlayers.forEach((leftPlayer, playerId) => {
    if (gameState.submittedAnswers[playerId]) {
      roundScores[playerId] = 0; // They won't get points but we track for display
      voteCounts[playerId] = 0;
    }
  });

  // Group all submitted answers by text to identify duplicates (includes left players)
  const answerGroups = new Map(); // answer text -> array of player IDs
  Object.entries(gameState.submittedAnswers).forEach(([playerId, answer]) => {
    if (!answerGroups.has(answer)) {
      answerGroups.set(answer, []);
    }
    answerGroups.get(answer).push(playerId);
  });

  // Calculate scores for each player
  gameState.players.forEach(player => {
    const votedFor = gameState.votes[player.id];

    // Award points for voting for correct answer (with multiplier)
    if (votedFor === 'correct') {
      roundScores[player.id] += correctVotePoints;
    } else if (votedFor) {
      const votedForPlayer = gameState.players.find(p => p.id === votedFor);
      if (votedForPlayer && gameState.submittedAnswers[votedFor] === correctAnswer) {
        roundScores[player.id] += correctVotePoints;
      }
    }
  });

  // Count votes received and award points for fooling others
  // For duplicate answers, split the points among all players who submitted that answer
  Object.entries(gameState.votes).forEach(([voterId, votedForId]) => {
    if (votedForId && votedForId !== 'correct') {
      // Handle comma-separated player IDs (duplicate answers)
      // Extract the first player ID to get the answer text
      const firstPlayerId = votedForId.includes(',') ? votedForId.split(',')[0] : votedForId;
      const votedForAnswer = gameState.submittedAnswers[firstPlayerId];

      // Skip if this is the correct answer
      if (votedForAnswer === correctAnswer) {
        return;
      }

      // Find all players who submitted this same answer
      const playersWithThisAnswer = answerGroups.get(votedForAnswer) || [firstPlayerId];
      const numberOfDuplicates = playersWithThisAnswer.length;

      // Split points among all players who submitted this answer (with multiplier)
      const pointsPerPlayer = foolPlayerPoints / numberOfDuplicates;

      playersWithThisAnswer.forEach(playerId => {
        voteCounts[playerId]++;
        roundScores[playerId] += pointsPerPlayer;
      });
    }
  });

  // Update total scores
  gameState.players.forEach(player => {
    player.addScore(roundScores[player.id]);
  });

  return {
    correctAnswer,
    explanation: gameState.currentQuestion.explanation,
    roundScores,
    totalScores: gameState.players.map(p => p.toClientData()),
    votes: gameState.votes,
    voteCounts,
    multiplier,
    baseCorrectVotePoints: config.CORRECT_VOTE_POINTS,
    baseFoolPlayerPoints: config.FOOL_PLAYER_POINTS,
    correctVotePoints,
    foolPlayerPoints
  };
}

module.exports = {
  calculateResults
};
