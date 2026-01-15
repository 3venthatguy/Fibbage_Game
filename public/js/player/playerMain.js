/**
 * Main initialization and state management for the player screen.
 */

// Player state
const playerState = {
  roomCode: null,
  playerName: null,
  playerId: null,
  currentPhase: 'join',
  submittedAnswer: false,
  submittedVote: false,
  selectedAnswerId: null
};

// Make state globally accessible for screen modules
window.playerState = playerState;

// Initialize socket connection
const socket = io();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initializePlayer();
});

/**
 * Initializes the player screen.
 */
function initializePlayer() {
  // Setup socket handlers
  setupPlayerSocketHandlers(socket, playerState);

  // Setup join screen
  setupJoinScreen((code, name) => {
    playerState.roomCode = code;
    playerState.playerName = name;
    socket.emit('joinRoom', { roomCode: code, playerName: name });
  });

  // Setup submit screen
  setupSubmitScreen((answer) => {
    socket.emit('submitAnswer', { roomCode: playerState.roomCode, answer });
    playerState.submittedAnswer = true;
    showSubmitWaiting();
  });
}
