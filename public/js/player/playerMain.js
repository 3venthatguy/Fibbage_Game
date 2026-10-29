/**
 * Main initialization and state management for the player screen.
 */

// Player state
const playerState = {
  roomCode: null,
  playerName: null,
  playerId: null,
  reconnectToken: null,
  currentPhase: 'join',
  submittedAnswer: false,
  submittedVote: false,
  selectedAnswerId: null,
  replaced: false // True when this tab was taken over by another tab with the same session
};

// Make state globally accessible for screen modules
window.playerState = playerState;

const PLAYER_SESSION_KEY = 'fibbageSession';

/**
 * Saves this player's identity so a refresh or dropped connection can rejoin the same seat.
 * Storage can be unavailable (private mode); the game still works, just without rejoin.
 */
function savePlayerSession() {
  try {
    localStorage.setItem(PLAYER_SESSION_KEY, JSON.stringify({
      roomCode: playerState.roomCode,
      playerName: playerState.playerName,
      playerId: playerState.playerId,
      reconnectToken: playerState.reconnectToken
    }));
  } catch (e) {
    // Ignore: rejoin just won't survive a refresh
  }
}

/**
 * Loads the saved session, if any.
 * @returns {object|null} {roomCode, playerName, playerId, reconnectToken} or null
 */
function loadPlayerSession() {
  try {
    const session = JSON.parse(localStorage.getItem(PLAYER_SESSION_KEY));
    if (session && session.roomCode && session.playerId && session.reconnectToken) {
      return session;
    }
  } catch (e) {
    // Ignore: treat as no session
  }
  return null;
}

/**
 * Forgets the saved session (it no longer matches a live game).
 */
function clearPlayerSession() {
  playerState.reconnectToken = null;
  try {
    localStorage.removeItem(PLAYER_SESSION_KEY);
  } catch (e) {
    // Ignore
  }
}

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

  // Phone-sized wavy divider (a narrower viewBox keeps the line chunky)
  buildWavyDivider(document.getElementById('playerWave'), 600, 90);

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

  setupReconnect();
}

/**
 * Rejoins the saved seat on every (re)connect, so a refresh, a dropped
 * connection or a phone waking from sleep picks the game back up.
 */
function setupReconnect() {
  const session = loadPlayerSession();
  if (session) {
    Object.assign(playerState, session);
  }

  const rejoin = () => {
    if (!playerState.reconnectToken || playerState.replaced) return;
    showConnectionBanner('Rejoining…');
    const joinButton = document.getElementById('joinButton');
    joinButton.disabled = true;
    joinButton.textContent = 'Rejoining...';
    socket.emit('rejoinRoom', {
      roomCode: playerState.roomCode,
      playerId: playerState.playerId,
      reconnectToken: playerState.reconnectToken,
      playerName: playerState.playerName
    });
  };

  // 'connect' fires on the first connection and after every automatic reconnect
  socket.on('connect', rejoin);
  if (socket.connected) rejoin();

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      // The server only does this when the same player rejoined from another tab or device
      playerState.replaced = true;
      showConnectionBanner('Playing in another tab. Refresh to play here.');
    } else if (playerState.reconnectToken) {
      showConnectionBanner('Reconnecting…');
    }
  });

  // Phones often pause the socket in the background; reconnect as soon as the page is visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !socket.connected && !playerState.replaced) {
      socket.connect();
    }
  });
}
