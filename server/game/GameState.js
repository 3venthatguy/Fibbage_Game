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
   * Checks if all players have submitted answers.
   * @returns {boolean} True if all submitted, false otherwise
   */
  isSubmitPhaseComplete() {
    return Object.keys(this.submittedAnswers).length === this.players.length;
  }

  /**
   * Checks if all players have voted.
   * @returns {boolean} True if all voted, false otherwise
   */
  isVotingPhaseComplete() {
    return Object.keys(this.votes).length === this.players.length;
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
   * Checks if a player name already exists.
   * @param {string} name - Name to check
   * @returns {boolean} True if exists, false otherwise
   */
  hasPlayerName(name) {
    return this.players.some(p => p.name.toLowerCase() === name.toLowerCase());
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
   * Gets connected players.
   * @returns {Array} Array of connected players
   */
  getConnectedPlayers() {
    return this.players.filter(p => p.connected);
  }

  /**
   * Removes a player from the game.
   * @param {string} playerId - Player ID to remove
   * @returns {boolean} True if player was removed, false otherwise
   */
  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
      // Clean up player's submitted answer if any
      delete this.submittedAnswers[playerId];
      // Clean up player's vote if any
      delete this.votes[playerId];
      return true;
    }
    return false;
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
