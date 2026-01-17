/**
 * ResultsAnimator - Orchestrates the progressive results reveal animation sequence.
 * Controls timing and emits socket events to synchronize animations across all clients.
 */

const config = require('../config');

class ResultsAnimator {
  constructor(gameState, io, roomCode) {
    this.gameState = gameState;
    this.io = io;
    this.roomCode = roomCode;
    this.timings = config.RESULTS_ANIMATION_TIMINGS;
    this.sequenceId = Date.now();
  }

  /**
   * Delays execution by specified milliseconds.
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Plays the complete results animation sequence.
   * @param {object} results - Results data from ScoreCalculator
   */
  async playResultsSequence(results) {
    const { correctAnswer, explanation, roundScores, totalScores, votes, voteCounts, multiplier, baseFoolPlayerPoints, foolPlayerPoints, correctVotePoints, duplicateFoolPoints } = results;

    // Store multiplier info for use in other methods
    this.multiplier = multiplier || 1;
    this.baseFoolPlayerPoints = baseFoolPlayerPoints || 500;
    this.foolPlayerPoints = foolPlayerPoints || 500;
    this.correctVotePoints = correctVotePoints || 1000;
    this.duplicateFoolPoints = duplicateFoolPoints || 250;

    // Group all submitted answers to handle duplicates (includes left players)
    const answerGroups = new Map(); // answer text -> {playerIds: [], playerNames: [], text: string, leftPlayerIds: []}

    // Process all submitted answers (from both active and left players)
    Object.entries(this.gameState.submittedAnswers).forEach(([playerId, answer]) => {
      if (answer && answer !== correctAnswer) {
        if (!answerGroups.has(answer)) {
          answerGroups.set(answer, {
            playerIds: [],
            playerNames: [],
            text: answer,
            leftPlayerIds: [] // Track which players left
          });
        }
        const group = answerGroups.get(answer);
        group.playerIds.push(playerId);

        // Get player name - check active players first, then left players
        const activePlayer = this.gameState.getPlayer(playerId);
        const leftPlayer = this.gameState.getLeftPlayer(playerId);

        if (activePlayer) {
          group.playerNames.push(activePlayer.name);
        } else if (leftPlayer) {
          group.playerNames.push(leftPlayer.name + ' (left)');
          group.leftPlayerIds.push(playerId);
        }
      }
    });

    // Prepare fake answers with vote information
    // For duplicate answers, use comma-separated player IDs as the combined ID
    const allFakeAnswers = Array.from(answerGroups.values()).map(group => {
      const combinedId = group.playerIds.length === 1 ? group.playerIds[0] : group.playerIds.join(',');
      const combinedName = group.playerNames.join(' & ');

      // Calculate total points for all active players who submitted this answer (left players don't get points)
      const activePlayerIds = group.playerIds.filter(pid => !group.leftPlayerIds.includes(pid));
      const totalPoints = activePlayerIds.reduce((sum, playerId) => sum + (roundScores[playerId] || 0), 0);

      return {
        playerId: combinedId,
        playerName: combinedName,
        playerIds: group.playerIds, // Store individual player IDs for display
        playerNames: group.playerNames, // Store individual names (with "(left)" suffix for left players)
        leftPlayerIds: group.leftPlayerIds, // Track which players left
        answerText: group.text,
        voters: this.getVotersForAnswer(combinedId, votes),
        pointsEarned: totalPoints,
        pointsPerPlayer: activePlayerIds.length > 0 ? roundScores[activePlayerIds[0]] || 0 : 0 // For showing split points
      };
    });

    // Show ALL fake answers (including those with zero votes) to keep players on edge
    console.log(`[ResultsAnimator] Total fake answers: ${allFakeAnswers.length}, With votes: ${allFakeAnswers.filter(a => a.voters.length > 0).length}`);

    // Separate voted and unvoted fake answers
    const votedFakeAnswers = allFakeAnswers.filter(fa => fa.voters.length > 0);
    const unvotedFakeAnswers = allFakeAnswers.filter(fa => fa.voters.length === 0);

    // Randomize voted fake answers
    const shuffledVotedFakes = this.shuffleArray(votedFakeAnswers);

    // Create reveal sequence: voted fakes first, then correct answer
    // Unvoted answers are displayed but never revealed
    const revealSequence = [
      ...shuffledVotedFakes.map(fa => ({ type: 'fake', data: fa })),
      {
        type: 'correct',
        data: {
          correctAnswer,
          explanation,
          votes,
          roundScores
        }
      }
    ];

    console.log(`[ResultsAnimator] Reveal sequence: ${votedFakeAnswers.length} voted fakes (randomized) + 1 correct answer. ${unvotedFakeAnswers.length} unvoted answers will be skipped.`);

    // Prepare all answers data for client (ALL answers for display, in random order)
    // Mix all answers together for initial display only
    const allAnswersForDisplay = this.shuffleArray([
      ...allFakeAnswers.map(fa => ({
        id: fa.playerId,
        text: fa.answerText,
        isCorrect: false
      })),
      {
        id: 'correct',
        text: correctAnswer,
        isCorrect: true
      }
    ]);

    // Emit start sequence event with answer data
    this.io.to(this.roomCode).emit('results:startSequence', {
      sequenceId: this.sequenceId,
      fakeAnswerCount: allFakeAnswers.length,
      timings: this.timings,
      answers: allAnswersForDisplay
    });

    // Wait for clients to prepare and display all answers before highlighting
    const initialDelay = this.timings.initialAnswerDelay || 2000;
    await this.delay(initialDelay);

    // Reveal each answer: voted fakes first (randomized), then correct answer
    // Unvoted fakes are never revealed (revealFakeAnswer will skip them)
    for (let i = 0; i < revealSequence.length; i++) {
      const item = revealSequence[i];

      if (item.type === 'fake') {
        await this.revealFakeAnswer(item.data, i);
      } else {
        // Reveal correct answer after all voted fakes
        await this.revealCorrectAnswer(
          item.data.correctAnswer,
          item.data.explanation,
          item.data.votes,
          item.data.roundScores
        );
      }

      // Brief pause between answers (except after the last one)
      if (i < revealSequence.length - 1) {
        await this.delay(this.timings.betweenAnswers);
      }
    }

    // Show explanation AFTER all answers (including correct) have been revealed
    await this.showExplanation(explanation);

    // Update scoreboard
    await this.showScoreboard(totalScores, roundScores);

    // Complete
    this.io.to(this.roomCode).emit('results:complete', {
      sequenceId: this.sequenceId
    });
  }

  /**
   * Gets list of voters for a specific answer.
   * Handles both single player IDs and comma-separated player IDs (for duplicate answers).
   * @param {string} answerPlayerId - Player ID or comma-separated player IDs who wrote the answer
   * @param {object} votes - All votes
   * @returns {Array} Array of voter player IDs
   */
  getVotersForAnswer(answerPlayerId, votes) {
    // Split the answerPlayerId in case it's a comma-separated list (duplicate answers)
    const playerIds = answerPlayerId.includes(',') ? answerPlayerId.split(',') : [answerPlayerId];

    return Object.entries(votes)
      .filter(([voterId, votedForId]) => {
        if (!votedForId || votedForId === 'correct') return false;

        // Check if votedForId matches any of the playerIds
        // votedForId could be single ID or comma-separated IDs
        if (votedForId.includes(',')) {
          const votedForIds = votedForId.split(',');
          return votedForIds.some(id => playerIds.includes(id));
        }

        return playerIds.includes(votedForId);
      })
      .map(([voterId]) => {
        const player = this.gameState.getPlayer(voterId);
        return player ? { id: player.id, name: player.name } : null;
      })
      .filter(Boolean);
  }

  /**
   * Reveals a single fake answer with full animation sequence.
   * If the answer has no votes, it's skipped (no highlight, no animation, no points).
   * @param {object} fakeAnswer - Fake answer data
   * @param {number} index - Index in sequence
   */
  async revealFakeAnswer(fakeAnswer, index) {
    const { playerId, playerName, answerText, voters, pointsEarned, playerIds, playerNames, pointsPerPlayer, leftPlayerIds = [] } = fakeAnswer;

    // Skip animation for answers with no votes - they just sit on the board
    if (voters.length === 0) {
      console.log(`[ResultsAnimator] Skipping animation for answer with no votes: "${answerText}"`);
      return;
    }

    // Phase 1: Highlight Answer
    this.io.to(this.roomCode).emit('results:highlightAnswer', {
      sequenceId: this.sequenceId,
      answerId: playerId,
      answerText: answerText,
      index: index
    });
    await this.delay(this.timings.answerHighlight);

    // Phase 2: Suspense Pause (NEW - Jackbox flow)
    await this.delay(this.timings.suspensePause);

    // Phase 3: Reveal "IT'S A LIE!" + Show Fooled Players
    this.io.to(this.roomCode).emit('results:revealLie', {
      sequenceId: this.sequenceId,
      answerId: playerId,
      authorName: playerName,
      authorNames: playerNames, // For duplicate answers
      isDuplicate: playerIds && playerIds.length > 1,
      voters: voters,
      pointsEarned: pointsEarned
    });
    await this.delay(this.timings.lieRevealDuration);

    // Phase 4: Show Voters (fooled players fly in)
    this.io.to(this.roomCode).emit('results:showVoters', {
      sequenceId: this.sequenceId,
      answerId: playerId,
      voters: voters
    });
    // Wait for voters to appear (staggered)
    await this.delay(this.timings.voterAppearStagger * voters.length + 500);

    // Phase 5: Reveal Author(s)
    // Determine if this is a duplicate (2+ players get reduced fixed points)
    const isDuplicateTwoOrMore = playerIds && playerIds.length >= 2;
    const actualFoolPoints = isDuplicateTwoOrMore ? this.duplicateFoolPoints : this.foolPlayerPoints;

    this.io.to(this.roomCode).emit('results:revealAuthor', {
      sequenceId: this.sequenceId,
      answerId: playerId,
      authorId: playerId,
      authorIds: playerIds, // Array of all player IDs who submitted this answer
      authorName: playerName,
      authorNames: playerNames, // Array of all player names
      isDuplicate: playerIds && playerIds.length > 1,
      isDuplicateTwoOrMore: isDuplicateTwoOrMore,
      pointsEarned: pointsEarned,
      pointsPerPlayer: pointsPerPlayer, // Points each player gets
      voterCount: voters.length,
      multiplier: this.multiplier,
      baseFoolPlayerPoints: this.baseFoolPlayerPoints,
      foolPlayerPoints: actualFoolPoints, // Use actual points based on duplicate status
      duplicateFoolPoints: this.duplicateFoolPoints
    });
    await this.delay(this.timings.authorRevealDuration);

    // Phase 6: Score Update - update each active player's score individually (skip left players)
    if (pointsEarned > 0 && playerIds && playerIds.length > 0) {
      // For duplicate answers, emit score updates for each active player
      for (const pid of playerIds) {
        // Skip left players - they don't get points
        if (leftPlayerIds.includes(pid)) continue;

        const player = this.gameState.getPlayer(pid);
        if (player) {
          this.io.to(this.roomCode).emit('results:updateScore', {
            sequenceId: this.sequenceId,
            playerId: pid,
            pointsEarned: pointsPerPlayer,
            newTotalScore: player.score
          });
        }
      }
      await this.delay(this.timings.scoreAnimationDuration);
    }

    // Phase 7: Reaction Pause
    await this.delay(this.timings.reactionPause);

    // Phase 8: Transition
    this.io.to(this.roomCode).emit('results:transitionNext', {
      sequenceId: this.sequenceId,
      answerId: playerId
    });
    await this.delay(this.timings.transitionDuration);
  }

  /**
   * Reveals the correct answer with special treatment.
   * @param {string} correctAnswer - Correct answer text
   * @param {string} explanation - Explanation text
   * @param {object} votes - All votes
   * @param {object} roundScores - Round scores
   */
  async revealCorrectAnswer(correctAnswer, explanation, votes, roundScores) {
    // Phase 1: Highlight Correct Answer (NEW - Jackbox flow)
    this.io.to(this.roomCode).emit('results:highlightCorrectAnswer', {
      sequenceId: this.sequenceId,
      answerText: correctAnswer
    });
    await this.delay(this.timings.correctAnswerHighlight);

    // Phase 2: Suspense Pause
    await this.delay(this.timings.suspensePause);

    // Phase 3: Reveal "THE TRUTH!" + Correct Answer
    this.io.to(this.roomCode).emit('results:revealTruth', {
      sequenceId: this.sequenceId,
      answerText: correctAnswer
    });
    await this.delay(this.timings.truthRevealDuration);

    // Phase 4: Show Correct Voters
    const correctVoters = this.getCorrectVoters(votes);
    this.io.to(this.roomCode).emit('results:showCorrectVoters', {
      sequenceId: this.sequenceId,
      voters: correctVoters
    });
    // Brief delay to let voters appear, then show scores immediately
    await this.delay(500);

    // Phase 5: Score Correct Voters
    const correctVotersWithScores = correctVoters.map(voter => ({
      ...voter,
      pointsEarned: roundScores[voter.id] || 0,
      newTotalScore: this.gameState.getPlayer(voter.id)?.score || 0
    }));

    this.io.to(this.roomCode).emit('results:updateCorrectScores', {
      sequenceId: this.sequenceId,
      voters: correctVotersWithScores,
      multiplier: this.multiplier,
      correctVotePoints: this.correctVotePoints
    });
    await this.delay(this.timings.scoreAnimationDuration);
  }

  /**
   * Gets list of players who voted correctly.
   * @param {object} votes - All votes
   * @returns {Array} Array of correct voter data
   */
  getCorrectVoters(votes) {
    return Object.entries(votes)
      .filter(([voterId, votedForId]) => votedForId === 'correct')
      .map(([voterId]) => {
        const player = this.gameState.getPlayer(voterId);
        return player ? { id: player.id, name: player.name } : null;
      })
      .filter(Boolean);
  }

  /**
   * Shows the explanation.
   * @param {string} explanation - Explanation text
   */
  async showExplanation(explanation) {
    this.io.to(this.roomCode).emit('results:showExplanation', {
      sequenceId: this.sequenceId,
      explanation: explanation
    });
    await this.delay(this.timings.explanationDisplay);
  }

  /**
   * Shows the updated scoreboard.
   * @param {Array} totalScores - Total scores for all players
   * @param {object} roundScores - Round scores
   */
  async showScoreboard(totalScores, roundScores) {
    // Sort by score descending
    const sortedScores = [...totalScores].sort((a, b) => b.score - a.score);

    // Store scoreboard data for when button is clicked
    this.leaderboardData = {
      sequenceId: this.sequenceId,
      sortedPlayers: sortedScores,
      roundScores: roundScores,
      totalScores: totalScores
    };

    // Show the "Show Leaderboard" button instead of auto-showing
    this.io.to(this.roomCode).emit('results:showLeaderboardButton', {
      sequenceId: this.sequenceId
    });

    // Don't auto-proceed - wait for host to click the button
  }

  /**
   * Shows the leaderboard (called when host clicks the button).
   * For the last question, goes to game over instead.
   */
  showLeaderboardNow() {
    if (this.leaderboardData) {
      // Check if this is the last question
      const isLastQuestion = this.gameState.currentQuestionIndex >= this.gameState.selectedQuestionIds.length - 1;

      if (isLastQuestion) {
        // Last question - go to game over
        console.log('[ResultsAnimator] Last question - button click going to game over');

        // Sort by score descending for final results
        const finalScores = [...this.leaderboardData.totalScores].sort((a, b) => b.score - a.score);

        // Emit game over event
        this.io.to(this.roomCode).emit('gameOver', { finalScores });
      } else {
        // Not last question - show leaderboard as normal
        this.io.to(this.roomCode).emit('results:showLeaderboard', this.leaderboardData);
      }
    }
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm.
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

module.exports = ResultsAnimator;
