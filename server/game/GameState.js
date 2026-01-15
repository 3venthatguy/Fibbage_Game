/**
 * GameState class managing the state of a single game session.
 */

const Timer = require('./Timer');
const config = require('../config');

class GameState {
  constructor(roomCode, hostId, selectedQuestionIds) {
    this.roomCode = roomCode;
    this.hostId = hostId;
    this.players = [];
    this.leftPlayers = new Map(); // playerId -> {name, id} for players who left mid-game
    this.phase = 'lobby';
    this.currentQuestionIndex = -1;
    this.currentQuestion = null;
    this.selectedQuestionIds = selectedQuestionIds;
    this.submittedAnswers = {};
    this.votes = {};
    this.timer = new Timer();
  }

  /**
   * Gets the current question.
   * @returns {object|null} Current question object
   */
  getCurrentQuestion() {
    return this.currentQuestion;
  }

  /**
   * Checks if all active players have submitted answers.
   * @returns {boolean} True if all submitted, false otherwise
   */
  isSubmitPhaseComplete() {
    if (this.players.length === 0) return false;
    const submittedCount = this.players.filter(p => this.submittedAnswers[p.id]).length;
    return submittedCount === this.players.length;
  }

  /**
   * Checks if all active players have voted.
   * @returns {boolean} True if all voted, false otherwise
   */
  isVotingPhaseComplete() {
    if (this.players.length === 0) return false;
    const votedCount = this.players.filter(p => this.votes[p.id]).length;
    return votedCount === this.players.length;
  }

  /**
   * Adds a player to the game.
   * @param {Player} player - Player to add
   */
  addPlayer(player) {
    this.players.push(player);
  }

  /**
   * Finds a player by ID.
   * @param {string} playerId - Player ID to find
   * @returns {Player|undefined} Player object or undefined
   */
  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  /**
   * Checks if a player name already exists (including players who left mid-game).
   * @param {string} name - Name to check
   * @returns {boolean} True if exists, false otherwise
   */
  hasPlayerName(name) {
    const lowerName = name.toLowerCase();
    // Check active players
    if (this.players.some(p => p.name.toLowerCase() === lowerName)) {
      return true;
    }
    // Check players who left mid-game (name is blocked)
    for (const leftPlayer of this.leftPlayers.values()) {
      if (leftPlayer.name.toLowerCase() === lowerName) {
        return true;
      }
    }
    return false;
  }

  /**
   * Submits an answer for a player.
   * @param {string} playerId - Player ID
   * @param {string} answer - Answer text
   */
  submitAnswer(playerId, answer) {
    this.submittedAnswers[playerId] = answer;
  }

  /**
   * Submits a vote for a player.
   * @param {string} playerId - Player ID who is voting
   * @param {string} votedForId - ID of answer/player voted for
   */
  submitVote(playerId, votedForId) {
    this.votes[playerId] = votedForId;
  }

  /**
   * Checks if a player has already voted.
   * @param {string} playerId - Player ID to check
   * @returns {boolean} True if already voted, false otherwise
   */
  hasVoted(playerId) {
    return !!this.votes[playerId];
  }

  /**
   * Resets round data for a new question.
   */
  resetRound() {
    this.submittedAnswers = {};
    this.votes = {};
    this.timer.reset();
  }

  /**
   * Advances to the next question.
   * @param {object} question - Next question object
   */
  setQuestion(question, index) {
    this.currentQuestion = question;
    this.currentQuestionIndex = index;
    this.resetRound();
  }

  /**
   * Changes the current phase.
   * @param {string} phase - New phase ('lobby', 'reading', 'submit', 'voting', 'results', 'gameOver')
   */
  setPhase(phase) {
    this.phase = phase;
  }

  /**
   * Starts the timer for the current phase.
   * @param {number} duration - Duration in seconds
   */
  startTimer(duration) {
    this.timer.start(duration);
  }

  /**
   * Pauses the timer.
   */
  pauseTimer() {
    this.timer.pause();
  }

  /**
   * Resumes the timer.
   */
  resumeTimer() {
    this.timer.resume();
  }

  /**
   * Gets remaining time on the timer.
   * @returns {number} Remaining time in seconds
   */
  getTimeRemaining() {
    return this.timer.getTimeRemaining();
  }

  /**
   * Gets connected players (now returns all players since we remove disconnected ones).
   * @returns {Array} Array of players
   */
  getConnectedPlayers() {
    return this.players;
  }

  /**
   * Removes a player from the game.
   * @param {string} playerId - Player ID to remove
   * @param {boolean} keepAnswer - If true, keep their submitted answer (for mid-game disconnects)
   * @returns {boolean} True if player was removed, false otherwise
   */
  removePlayer(playerId, keepAnswer = false) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      const player = this.players[index];
      this.players.splice(index, 1);

      if (!keepAnswer) {
        // Clean up player's submitted answer if any (lobby disconnect)
        delete this.submittedAnswers[playerId];
      }
      // Always clean up player's vote
      delete this.votes[playerId];
      return true;
    }
    return false;
  }

  /**
   * Marks a player as having left mid-game.
   * Removes from active players but keeps their name blocked and answer preserved.
   * @param {string} playerId - Player ID
   * @returns {object|null} The left player info or null
   */
  markPlayerLeft(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return null;

    // Store in leftPlayers map for name blocking and results display
    this.leftPlayers.set(playerId, {
      id: player.id,
      name: player.name,
      score: player.score
    });

    // Remove from active players but keep their answer
    this.removePlayer(playerId, true);

    // Clean up their vote (they can't vote anymore)
    delete this.votes[playerId];

    return this.leftPlayers.get(playerId);
  }

  /**
   * Gets info about a player who left mid-game.
   * @param {string} playerId - Player ID
   * @returns {object|null} Left player info or null
   */
  getLeftPlayer(playerId) {
    return this.leftPlayers.get(playerId) || null;
  }

  /**
   * Gets player name by ID, checking both active and left players.
   * @param {string} playerId - Player ID
   * @returns {string|null} Player name or null
   */
  getPlayerName(playerId) {
    const activePlayer = this.getPlayer(playerId);
    if (activePlayer) return activePlayer.name;

    const leftPlayer = this.leftPlayers.get(playerId);
    if (leftPlayer) return leftPlayer.name + ' (left)';

    return null;
  }

  /**
   * Transfers host to another player.
   * @param {string} newHostSocketId - Socket ID of new host
   */
  transferHost(newHostSocketId) {
    this.hostId = newHostSocketId;
  }

  /**
   * Gets all players as client data.
   * @returns {Array} Array of player client data
   */
  getPlayersClientData() {
    return this.players.map(p => p.toClientData());
  }
}

module.exports = GameState;
