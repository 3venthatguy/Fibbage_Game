/**
 * Player class representing a single player in the game.
 */

const crypto = require('crypto');

class Player {
  constructor(id, name, socketId, joinOrder = 0) {
    this.id = id;
    this.name = name;
    this.socketId = socketId;
    this.score = 0;
    this.connected = true;
    this.joinOrder = joinOrder; // Keeps list order (and avatars) stable when a player rejoins
    this.reconnectToken = crypto.randomUUID(); // Secret sent only to this player, never in toClientData
  }

  /**
   * Updates the player's score.
   * @param {number} points - Points to add to the player's score
   */
  addScore(points) {
    this.score += points;
  }

  /**
   * Marks the player as disconnected.
   */
  disconnect() {
    this.connected = false;
  }

  /**
   * Reconnects the player with a new socket ID.
   * @param {string} socketId - New socket ID
   */
  reconnect(socketId) {
    this.socketId = socketId;
    this.connected = true;
  }

  /**
   * Returns a serialized version of the player for client transmission.
   * @returns {object} Player data for client
   */
  toClientData() {
    return {
      id: this.id,
      name: this.name,
      score: this.score,
      connected: this.connected
    };
  }

  /**
   * Generates a unique player ID.
   * @returns {string} Unique player ID
   */
  static generateId() {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = Player;
