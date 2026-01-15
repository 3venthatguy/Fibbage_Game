/**
 * Lobby screen logic for the player.
 */

/**
 * Shows the lobby screen.
 * @param {string} roomCode - Room code to display
 */
function showPlayerLobbyScreen(roomCode) {
  const lobbyScreen = document.getElementById('lobbyScreen');
  const roomCodeDisplay = document.getElementById('roomCodeDisplay');

  hideJoinScreen();
  lobbyScreen.classList.add('active');
  roomCodeDisplay.textContent = roomCode;
}

/**
 * Hides the lobby screen.
 */
function hidePlayerLobbyScreen() {
  const lobbyScreen = document.getElementById('lobbyScreen');
  lobbyScreen.classList.remove('active');
}
