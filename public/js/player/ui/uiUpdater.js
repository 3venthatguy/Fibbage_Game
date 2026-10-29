/**
 * Player UI update functions.
 * Handles all DOM manipulation for the player screen.
 */

/**
 * Updates the players list in the lobby.
 * @param {Array} players - Array of player objects
 */
function updatePlayersList(players) {
  const playersList = document.getElementById('playersList');
  playersList.innerHTML = '';

  // Same avatars as the host: assigned by join order
  players.forEach((player, index) => {
    const item = createPlayerTag(player.name, avatarFor(index), { size: 48, className: 'player-item' });
    if (player.id === window.playerState.playerId) {
      item.classList.add('is-me');
    }
    playersList.appendChild(item);
  });
}

/**
 * Returns this player's avatar emoji (by position in the players list).
 * @returns {string} Emoji
 */
function myAvatar() {
  const state = window.playerState;
  return avatarForPlayer(state.players || [], state.playerId);
}

/**
 * Updates the timer display.
 * @param {number} seconds - Remaining seconds
 */
function updatePlayerTimer(seconds) {
  const timerDisplay = document.getElementById('timerDisplay');
  timerDisplay.textContent = seconds;

  if (seconds <= 10) {
    timerDisplay.classList.add('timer-warning');
  } else {
    timerDisplay.classList.remove('timer-warning');
  }
}

/**
 * Updates the mini leaderboard during results.
 * @param {Array} totalScores - Array of player scores
 * @param {string} playerId - Current player's ID
 */
function updateMiniLeaderboard(totalScores, playerId) {
  const miniLeaderboard = document.getElementById('miniLeaderboard');
  miniLeaderboard.innerHTML = '<h3>Leaderboard</h3>';

  const sorted = [...totalScores].sort((a, b) => b.score - a.score);
  sorted.forEach((player) => {
    const item = document.createElement('div');
    item.className = `mini-leaderboard-item ${player.id === playerId ? 'highlight' : ''}`;

    const name = document.createElement('span');
    name.textContent = player.name;

    const score = document.createElement('span');
    score.textContent = `${player.score.toLocaleString()} pts`;

    item.appendChild(name);
    item.appendChild(score);
    miniLeaderboard.appendChild(item);
  });
}

/**
 * Shows an error message.
 * @param {string} message - Error message to display
 */
function showPlayerError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  setTimeout(() => {
    errorMessage.classList.remove('show');
  }, 5000);
}

/**
 * Shows the connection banner (stays until hideConnectionBanner).
 * @param {string} message - Text to show, e.g. "Reconnecting…"
 */
function showConnectionBanner(message) {
  const banner = document.getElementById('connectionBanner');
  banner.textContent = message;
  banner.classList.add('show');
}

/**
 * Hides the connection banner.
 */
function hideConnectionBanner() {
  document.getElementById('connectionBanner').classList.remove('show');
}

/**
 * Updates the character counter for answer input.
 * @param {number} length - Current answer length
 */
function updateCharCounter(length) {
  const charCounter = document.getElementById('charCounter');
  if (charCounter) {
    charCounter.textContent = `${length}/100`;
  }
}

/**
 * Shows the player name badge (avatar + name) at the top left corner,
 * and puts the same avatar on the watch screen.
 * @param {string} playerName - The player's name
 */
function showPlayerNameBadge(playerName) {
  const badge = document.getElementById('playerNameBadge');
  const avatar = myAvatar();
  if (badge) {
    badge.innerHTML = '';
    badge.appendChild(createPlayerTag(playerName, avatar, { size: 40 }));
    badge.style.display = 'block';
  }

  const watchAvatar = document.getElementById('watchAvatar');
  if (watchAvatar) {
    watchAvatar.textContent = avatar;
  }
}
