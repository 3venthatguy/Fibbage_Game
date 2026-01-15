/**
 * GameRoom class managing a single game room.
 * Coordinates game state, players, and game flow.
 */

const GameState = require('./GameState');
const Player = require('./Player');
const config = require('../config');
const { sanitizePlayerName } = require('../utils/validation');
const { logPlayerJoined, logGameStarted, logPhaseTransition, logAnswerSubmitted, logVoteSubmitted, logVoteForCorrect, logResults, logHostTransfer, logPlayerRemoved } = require('../utils/logger');
const { getShuffledAnswers, isAnswerValid } = require('./AnswerManager');
const { calculateResults } = require('./ScoreCalculator');

class GameRoom {
  constructor(roomCode, hostId, selectedQuestionIds, questionLoader) {
    this.gameState = new GameState(roomCode, hostId, selectedQuestionIds);
    this.questionLoader = questionLoader;
  }

  /**
   * Adds a player to the room.
   * @param {string} playerName - Player's name
   * @param {string} socketId - Player's socket ID
   * @returns {Player} Created player object
   */
  addPlayer(playerName, socketId) {
    if (this.gameState.phase !== 'lobby') {
      throw new Error('Game already in progress');
    }

    const sanitizedName = sanitizePlayerName(playerName);

    if (this.gameState.hasPlayerName(sanitizedName)) {
      throw new Error('Player name already taken');
    }

    const playerId = Player.generateId();
    const player = new Player(playerId, sanitizedName, socketId);

    this.gameState.addPlayer(player);
    logPlayerJoined(sanitizedName, this.gameState.roomCode);

    return player;
  }

  /**
   * Starts the game.
   * @param {string} hostSocketId - Socket ID of the host
   * @returns {GameState} Updated game state
   */
  startGame(hostSocketId) {
    if (this.gameState.hostId !== hostSocketId) {
      throw new Error('Only host can start the game');
    }

    if (this.gameState.players.length < config.MIN_PLAYERS) {
      throw new Error(`Need at least ${config.MIN_PLAYERS} players to start`);
    }

    if (this.gameState.phase !== 'lobby') {
      throw new Error('Game already started');
    }

    this.loadQuestion(0);
    logGameStarted(this.gameState.roomCode);

    return this.gameState;
  }

  /**
   * Loads a question by index.
   * @param {number} index - Question index
   */
  loadQuestion(index) {
    if (index >= this.gameState.selectedQuestionIds.length) {
      this.gameState.setPhase('gameOver');
      return;
    }

    const questionId = this.gameState.selectedQuestionIds[index];
    const question = this.questionLoader(questionId);

    this.gameState.setQuestion(question, index);
    this.gameState.setPhase('reading');
    this.gameState.startTimer(config.READING_PHASE_DURATION);
  }

  /**
   * Transitions from reading phase to submit phase.
   */
  transitionToSubmit() {
    this.gameState.setPhase('submit');
    this.gameState.startTimer(config.SUBMIT_PHASE_DURATION);
    logPhaseTransition(this.gameState.roomCode, 'submit');
  }

  /**
   * Submits an answer for a player.
   * @param {string} playerId - Player ID
   * @param {string} answer - Answer text
   * @returns {GameState} Updated game state
   */
  submitAnswer(playerId, answer) {
    if (this.gameState.phase !== 'submit') {
      throw new Error('Not in submit phase');
    }

    if (this.gameState.getTimeRemaining() <= 0) {
      throw new Error('Time expired');
    }

    const player = this.gameState.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    if (!isAnswerValid(answer, this.gameState.currentQuestion.answer)) {
      throw new Error("You can't fool someone with the truth!");
    }

    // Capitalize the answer
    const capitalizedAnswer = answer.toUpperCase();

    this.gameState.submitAnswer(playerId, capitalizedAnswer);
    logAnswerSubmitted(player.name, this.gameState.roomCode);

    // Check if all players have submitted
    if (this.gameState.isSubmitPhaseComplete()) {
      this.transitionToVoting();
    }

    return this.gameState;
  }

  /**
   * Transitions to voting phase.
   */
  transitionToVoting() {
    this.gameState.setPhase('voting');
    this.gameState.startTimer(config.VOTING_PHASE_DURATION);
    logPhaseTransition(this.gameState.roomCode, 'voting');
  }

  /**
   * Submits a vote for a player.
   * @param {string} playerId - Player ID who is voting
   * @param {string} votedForId - ID of answer voted for
   * @returns {GameState} Updated game state
   */
  submitVote(playerId, votedForId) {
    if (this.gameState.phase !== 'voting') {
      throw new Error('Not in voting phase');
    }

    if (this.gameState.getTimeRemaining() <= 0) {
      throw new Error('Time expired');
    }

    // Check if player is voting for their own answer
    // For duplicate answers, votedForId might be comma-separated IDs
    if (votedForId !== 'correct') {
      if (votedForId.includes(',')) {
        // For duplicate answers, check if player's ID is in the comma-separated list
        const playerIds = votedForId.split(',');
        if (playerIds.includes(playerId)) {
          throw new Error('Cannot vote for your own answer');
        }
      } else if (playerId === votedForId) {
        // Single answer case
        throw new Error('Cannot vote for your own answer');
      }
    }

    const player = this.gameState.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Validate voted for player exists (active or left) if not 'correct'
    // For duplicate answers, votedForId might be comma-separated IDs
    if (votedForId !== 'correct') {
      // Check if it's a comma-separated list (duplicate answer)
      if (votedForId.includes(',')) {
        const playerIds = votedForId.split(',');
        const allExist = playerIds.every(id =>
          this.gameState.getPlayer(id) !== undefined ||
          this.gameState.getLeftPlayer(id) !== null
        );
        if (!allExist) {
          throw new Error('Player not found');
        }
      } else {
        // Single player ID - check both active and left players
        const votedFor = this.gameState.getPlayer(votedForId) || this.gameState.getLeftPlayer(votedForId);
        if (!votedFor) {
          throw new Error('Player not found');
        }
      }
    }

    if (this.gameState.hasVoted(playerId)) {
      throw new Error('Already voted');
    }

    this.gameState.submitVote(playerId, votedForId);

    if (votedForId === 'correct') {
      logVoteForCorrect(player.name, this.gameState.roomCode);
    } else {
      // For duplicate answers, log the first player's name
      const firstPlayerId = votedForId.includes(',') ? votedForId.split(',')[0] : votedForId;
      const votedFor = this.gameState.getPlayer(firstPlayerId);
      logVoteSubmitted(player.name, votedFor ? votedFor.name : 'unknown', this.gameState.roomCode);
    }

    // Check if all players have voted - if so, transition to results
    if (this.gameState.isVotingPhaseComplete()) {
      this.gameState.setPhase('results');
      logPhaseTransition(this.gameState.roomCode, 'results');
    }

    return this.gameState;
  }

  /**
   * Calculates results for the current round.
   * NOTE: This does NOT change the game phase. The caller is responsible for
   * transitioning to the results phase at the appropriate time.
   * @returns {object} Results data
   */
  calculateResults() {
    // Do NOT set phase here - let the caller control phase transitions
    // this.gameState.setPhase('results');
    const results = calculateResults(this.gameState);
    logResults(this.gameState.roomCode);
    return results;
  }

  /**
   * Advances to the next question.
   * @param {string} hostSocketId - Socket ID of the host
   * @returns {GameState} Updated game state
   */
  nextQuestion(hostSocketId) {
    if (this.gameState.hostId !== hostSocketId) {
      throw new Error('Only host can advance questions');
    }

    if (this.gameState.phase !== 'results') {
      // Already transitioned (likely duplicate click), silently ignore
      console.log('[GameRoom] nextQuestion called but not in results phase:', this.gameState.phase);
      return this.gameState;
    }

    this.loadQuestion(this.gameState.currentQuestionIndex + 1);
    return this.gameState;
  }

  /**
   * Gets shuffled answers for voting.
   * @returns {Array} Shuffled answers
   */
  getShuffledAnswers() {
    return getShuffledAnswers(this.gameState);
  }

  /**
   * Handles player disconnect.
   * @param {string} playerId - ID of disconnected player
   * @returns {object|null} Disconnect info including phase-specific data
   */
  handleDisconnect(playerId) {
    const player = this.gameState.getPlayer(playerId);
    if (!player) return null;

    const playerName = player.name;
    const phase = this.gameState.phase;

    if (phase === 'lobby') {
      // In lobby: remove entirely so name can be reused
      this.gameState.removePlayer(playerId, false);
      logPlayerRemoved(playerName, this.gameState.roomCode);
      return { phase, playerName };
    } else {
      // In active game: mark as left (keeps answer, blocks name, removes from active players)
      this.gameState.markPlayerLeft(playerId);
      logPlayerRemoved(playerName + ' (left mid-game)', this.gameState.roomCode);

      // Return phase info so caller can emit appropriate events
      const activePlayers = this.gameState.players;
      return {
        phase,
        playerName,
        playerCount: activePlayers.length,
        submittedCount: activePlayers.filter(p => this.gameState.submittedAnswers[p.id]).length,
        votedCount: activePlayers.filter(p => this.gameState.votes[p.id]).length
      };
    }
  }

  /**
   * Transfers host to another player.
   * @param {string} oldHostSocketId - Old host socket ID
   */
  transferHostIfNeeded(oldHostSocketId) {
    if (this.gameState.hostId === oldHostSocketId) {
      const players = this.gameState.players;
      if (players.length > 0) {
        this.gameState.transferHost(players[0].socketId);
        logHostTransfer(players[0].name, this.gameState.roomCode);
      }
    }
  }

  /**
   * Gets the game state.
   * @returns {GameState} Game state
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * Checks if room is empty.
   * @returns {boolean} True if no connected players
   */
  isEmpty() {
    return this.gameState.getConnectedPlayers().length === 0;
  }
}

module.exports = GameRoom;
