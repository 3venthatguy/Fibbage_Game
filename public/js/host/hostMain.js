/**
 * Main initialization and state management for the host screen.
 */

// Host state
const hostState = {
  roomCode: null,
  currentPhase: 'lobby',
  players: []
};

// Initialize socket connection
const socket = io();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initializeHost();
});

/**
 * Initializes the host screen.
 */
function initializeHost() {
  // Setup socket handlers
  setupHostSocketHandlers(socket, hostState);

  // Setup button handlers
  setupButtonHandlers();

  // Initialize audio button states
  updateMusicButton();
  updateSfxButton();

  // Try to start music (will likely fail due to autoplay policy, user can click button)
  playRandomIntroMusic();

  // Create room
  createRoom();
}

/**
 * Creates a new game room.
 */
function createRoom() {
  console.log('Emitting createRoom event...');
  socket.emit('createRoom');
}

/**
 * Sets up button event handlers.
 */
function setupButtonHandlers() {
  const startButton = document.getElementById('startButton');
  const nextButton = document.getElementById('nextButton');
  const playAgainButton = document.getElementById('playAgainButton');
  const musicToggleButton = document.getElementById('musicToggleButton');
  const sfxToggleButton = document.getElementById('sfxToggleButton');

  if (startButton) {
    startButton.addEventListener('click', () => {
      // Stop ticking timer sound if playing
      stopTickingSound();
      // Stop intro music when starting game
      stopGameMusic();
      // Play time to vote sound when starting game
      playSoundEffect('timeToVote', AUDIO_CONFIG.SFX_TIME_TO_VOTE_VOLUME);
      socket.emit('startGame', { roomCode: hostState.roomCode });
      startButton.disabled = true;
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      socket.emit('nextQuestion', { roomCode: hostState.roomCode });
    });
  }

  if (playAgainButton) {
    playAgainButton.addEventListener('click', () => {
      location.reload();
    });
  }

  if (musicToggleButton) {
    musicToggleButton.addEventListener('click', () => {
      toggleMusic();
    });
  }

  if (sfxToggleButton) {
    sfxToggleButton.addEventListener('click', () => {
      toggleSoundEffects();
    });
  }
}
