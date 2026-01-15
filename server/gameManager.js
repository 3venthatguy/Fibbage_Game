/**
 * Game Manager - Manages multiple game rooms and player connections.
 * This is a simplified version that delegates to GameRoom instances.
 */

const GameRoom = require('./game/GameRoom');
const config = require('./config');
const questions = require('./data/questions');
const { generateRoomCode } = require('./utils/roomCodeGenerator');
const { logRoomCreated, logRoomCleanup, logQuestionsSelected } = require('./utils/logger');

class GameManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> GameRoom
    this.socketToRoom = new Map(); // socketId -> roomCode
    this.socketToPlayer = new Map(); // socketId -> {roomCode, playerId}
  }

  /**
   * Creates a new game room.
   * @param {string} hostSocketId - Socket ID of the host
   * @returns {string} Room code
   */
  createRoom(hostSocketId) {
    const roomCode = generateRoomCode(this.rooms);
    const selectedQuestionIds = this.generateRandomQuestionIds();

    const questionLoader = (index) => questions[index];
    const gameRoom = new GameRoom(roomCode, hostSocketId, selectedQuestionIds, questionLoader);

    this.rooms.set(roomCode, gameRoom);
    this.socketToRoom.set(hostSocketId, roomCode);

    logRoomCreated(roomCode, hostSocketId);
    logQuestionsSelected(selectedQuestionIds);

    return roomCode;
  }

  /**
   * Adds a player to a room.
   * @param {string} roomCode - Room code
   * @param {string} playerName - Player name
   * @param {string} socketId - Socket ID
   * @returns {Player} Created player
   */
  joinRoom(roomCode, playerName, socketId) {
    const gameRoom = this.rooms.get(roomCode);
    if (!gameRoom) {
      throw new Error('Room not found');
    }

    const player = gameRoom.addPlayer(playerName, socketId);

    this.socketToRoom.set(socketId, roomCode);
    this.socketToPlayer.set(socketId, { roomCode, playerId: player.id });

    return player;
  }

  /**
   * Reconnects a player.
   * @param {string} socketId - Socket ID
   * @param {string} roomCode - Room code
   * @param {string} playerId - Player ID
   * @returns {Player|null} Reconnected player or null
   */
  reconnectPlayer(socketId, roomCode, playerId) {
    const gameRoom = this.rooms.get(roomCode);
    if (!gameRoom) return null;

    const player = gameRoom.reconnectPlayer(socketId, playerId);
    if (player) {
      this.socketToRoom.set(socketId, roomCode);
      this.socketToPlayer.set(socketId, { roomCode, playerId });
    }

    return player;
  }

  /**
   * Generates random question indices for a game.
   * @returns {Array} Array of question indices
   */
  generateRandomQuestionIds() {
    const availableIndices = questions.map((_, index) => index);
    const selectedIndices = [];
    const count = Math.min(config.QUESTIONS_PER_GAME, availableIndices.length);

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      selectedIndices.push(availableIndices[randomIndex]);
      availableIndices.splice(randomIndex, 1);
    }

    return selectedIndices;
  }

  /**
   * Starts a game.
   * @param {string} roomCode - Room code
   * @param {string} hostSocketId - Host socket ID
   * @returns {GameState} Game state
   */
  startGame(roomCode, hostSocketId) {
    const gameRoom = this.rooms.get(roomCode);
    if (!gameRoom) {
      throw new Error('Room not found');
    }

    return gameRoom.startGame(hostSocketId);
  }

  /**
   * Submits an answer.
   * @param {string} roomCode - Room code
   * @param {string} playerId - Player ID
   * @param {string} answer - Answer text
   * @returns {GameState} Game state
   */
  submitAnswer(roomCode, playerId, answer) {
    const gameRoom = this.rooms.get(roomCode);
    if (!gameRoom) {
      throw new Error('Room not found');
    }

    return gameRoom.submitAnswer(playerId, answer);
  }

  /**
   * Transitions game to voting phase.
   * @param {GameState} gameState - Game state (legacy, uses room code from state)
   */
  transitionToVoting(gameState) {
    const gameRoom = this.rooms.get(gameState.roomCode);
    if (gameRoom) {
      gameRoom.transitionToVoting();
    }
  }

  /**
   * Submits a vote.
   * @param {string} roomCode - Room code
   * @param {string} playerId - Player ID
   * @param {string} votedForId - Voted for ID
   * @returns {GameState} Game state
   */
  submitVote(roomCode, playerId, votedForId) {
    const gameRoom = this.rooms.get(roomCode);
    if (!gameRoom) {
      throw new Error('Room not found');
    }

    const gameState = gameRoom.submitVote(playerId, votedForId);

    return gameState;
  }

  /**
   * Calculates results.
   * @param {GameState} gameState - Game state
   * @returns {object} Results
   */
  calculateResults(gameState) {
    const gameRoom = this.rooms.get(gameState.roomCode);
    if (!gameRoom) {
      throw new Error('Room not found');
    }

    return gameRoom.calculateResults();
  }

  /**
   * Advances to next question.
   * @param {string} roomCode - Room code
   * @param {string} hostSocketId - Host socket ID
   * @returns {GameState} Game state
   */
  nextQuestion(roomCode, hostSocketId) {
    const gameRoom = this.rooms.get(roomCode);
    if (!gameRoom) {
      throw new Error('Room not found');
    }

    return gameRoom.nextQuestion(hostSocketId);
  }

  /**
   * Gets shuffled answers.
   * @param {GameState} gameState - Game state
   * @returns {Array} Shuffled answers
   */
  getShuffledAnswers(gameState) {
    const gameRoom = this.rooms.get(gameState.roomCode);
    if (!gameRoom) return [];

    return gameRoom.getShuffledAnswers();
  }

  /**
   * Gets remaining time.
   * @param {GameState} gameState - Game state
   * @returns {number} Remaining time in seconds
   */
  getTimeRemaining(gameState) {
    return gameState.getTimeRemaining();
  }

  /**
   * Gets game state for a room.
   * @param {string} roomCode - Room code
   * @returns {GameState|null} Game state or null
   */
  getGameState(roomCode) {
    const gameRoom = this.rooms.get(roomCode);
    return gameRoom ? gameRoom.getGameState() : null;
  }

  /**
   * Gets game room for a room code.
   * @param {string} roomCode - Room code
   * @returns {GameRoom|null} Game room or null
   */
  getGameRoom(roomCode) {
    return this.rooms.get(roomCode) || null;
  }

  /**
   * Handles player disconnect.
   * @param {string} socketId - Socket ID
   * @returns {object|null} Disconnect info
   */
  handleDisconnect(socketId) {
    const socketData = this.socketToPlayer.get(socketId);
    if (!socketData) return null;

    const { roomCode, playerId } = socketData;
    const gameRoom = this.rooms.get(roomCode);
    if (!gameRoom) return null;

    gameRoom.handleDisconnect(playerId);
    gameRoom.transferHostIfNeeded(socketId);

    this.socketToRoom.delete(socketId);
    this.socketToPlayer.delete(socketId);

    return { roomCode, playerId };
  }

  /**
   * Cleans up empty rooms.
   */
  cleanupEmptyRooms() {
    for (const [roomCode, gameRoom] of this.rooms.entries()) {
      if (gameRoom.isEmpty()) {
        logRoomCleanup(roomCode);
        this.rooms.delete(roomCode);
      }
    }
  }

  /**
   * Gets player by socket ID.
   * @param {string} socketId - Socket ID
   * @returns {Player|null} Player or null
   */
  getPlayerBySocket(socketId) {
    const socketData = this.socketToPlayer.get(socketId);
    if (!socketData) return null;

    const gameState = this.getGameState(socketData.roomCode);
    if (!gameState) return null;

    return gameState.getPlayer(socketData.playerId);
  }
}

module.exports = GameManager;
