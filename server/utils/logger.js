/**
 * Logging utilities for consistent console output.
 */

/**
 * Logs room-related events.
 */
function logRoomCreated(roomCode, hostId) {
  console.log(`Room created: ${roomCode} by host ${hostId}`);
}

function logPlayerJoined(playerName, roomCode) {
  console.log(`Player ${playerName} joined room ${roomCode}`);
}

function logGameStarted(roomCode) {
  console.log(`Game started in room ${roomCode}`);
}

function logPhaseTransition(roomCode, phase) {
  console.log(`Room ${roomCode} transitioned to ${phase} phase`);
}

function logAnswerSubmitted(playerName, roomCode) {
  console.log(`Answer submitted by ${playerName} in room ${roomCode}`);
}

function logVoteSubmitted(voterName, votedForName, roomCode) {
  console.log(`Vote submitted by ${voterName} for ${votedForName}'s answer in room ${roomCode}`);
}

function logVoteForCorrect(voterName, roomCode) {
  console.log(`Vote submitted by ${voterName} for correct answer in room ${roomCode}`);
}

function logResults(roomCode) {
  console.log(`Results calculated for room ${roomCode}`);
}

function logHostTransfer(newHostName, roomCode) {
  console.log(`Host transferred to ${newHostName} in room ${roomCode}`);
}

function logRoomCleanup(roomCode) {
  console.log(`Cleaning up empty room: ${roomCode}`);
}

function logConnection(socketId) {
  console.log(`Client connected: ${socketId}`);
}

function logDisconnection(socketId) {
  console.log(`Client disconnected: ${socketId}`);
}

function logPlayerRemoved(playerName, roomCode) {
  console.log(`Player ${playerName} removed from room ${roomCode} (name now available)`);
}

function logError(context, error) {
  console.error(`Error in ${context}:`, error);
}

function logQuestionsSelected(questionIds) {
  console.log(`Question IDs selected: [${questionIds.join(', ')}]`);
}

module.exports = {
  logRoomCreated,
  logPlayerJoined,
  logGameStarted,
  logPhaseTransition,
  logAnswerSubmitted,
  logVoteSubmitted,
  logVoteForCorrect,
  logResults,
  logHostTransfer,
  logRoomCleanup,
  logConnection,
  logDisconnection,
  logPlayerRemoved,
  logError,
  logQuestionsSelected
};
