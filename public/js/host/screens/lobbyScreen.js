/**
 * Lobby screen logic for the host.
 * Music is now handled by the unified gameMusic.js manager.
 */

/**
 * Shows the lobby screen.
 */
function showLobbyScreen() {
  const lobbyScreen = document.getElementById('lobbyScreen');
  const gameScreen = document.getElementById('gameScreen');
  const gameOverScreen = document.getElementById('gameOverScreen');

  lobbyScreen.classList.add('active');
  gameScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');

  // Play random intro music when lobby is shown (handled by gameMusic.js)
  playRandomIntroMusic();
}

/**
 * Hides the lobby screen.
 */
function hideLobbyScreen() {
  const lobbyScreen = document.getElementById('lobbyScreen');
  lobbyScreen.classList.remove('active');

  // Music transition handled by phase change logic
}
