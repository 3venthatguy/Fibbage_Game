/**
 * Room code generation utilities.
 * Generates unique alphanumeric room codes.
 */

const config = require('../config');

/**
 * Generates a unique room code.
 * @param {Map} existingRooms - Map of existing room codes to check uniqueness
 * @returns {string} A unique 4-character room code
 */
function generateRoomCode(existingRooms) {
  const chars = config.ROOM_CODE_CHARS;
  let code;

  do {
    code = '';
    for (let i = 0; i < config.ROOM_CODE_LENGTH; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (existingRooms.has(code));

  return code;
}

module.exports = {
  generateRoomCode
};
