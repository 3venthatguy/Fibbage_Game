/**
 * Input validation utilities.
 * Validates and sanitizes user input.
 */

const config = require('../config');

/**
 * Validates and sanitizes a player name.
 * @param {string} name - The player name to validate
 * @returns {string} Sanitized player name (uppercase, trimmed, max length)
 */
function sanitizePlayerName(name) {
  return name.trim().substring(0, config.MAX_PLAYER_NAME_LENGTH).toUpperCase();
}

/**
 * Validates and sanitizes a player answer.
 * @param {string} answer - The answer to validate
 * @returns {string} Sanitized answer (trimmed, max length)
 */
function sanitizeAnswer(answer) {
  return answer.trim().substring(0, config.MAX_ANSWER_LENGTH);
}

/**
 * Checks if a player name is valid.
 * @param {string} name - The name to check
 * @returns {boolean} True if valid, false otherwise
 */
function isValidPlayerName(name) {
  return name && name.trim().length > 0;
}

/**
 * Checks if an answer is valid.
 * @param {string} answer - The answer to check
 * @returns {boolean} True if valid, false otherwise
 */
function isValidAnswer(answer) {
  return answer && answer.trim().length > 0;
}

module.exports = {
  sanitizePlayerName,
  sanitizeAnswer,
  isValidPlayerName,
  isValidAnswer
};
