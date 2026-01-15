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

  players.forEach(player => {
    const item = document.createElement('div');
    item.className = 'player-item';
    item.textContent = player.name;
    playersList.appendChild(item);
  });
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
 * Updates the character counter for answer input.
 * @param {number} length - Current answer length
 */
function updateCharCounter(length) {
  const charCounter = document.getElementById('charCounter');
  if (charCounter) {
    charCounter.textContent = `${length}/100 characters`;
  }
}

/**
 * Shows the player name badge at the top left corner.
 * @param {string} playerName - The player's name
 */
function showPlayerNameBadge(playerName) {
  const badge = document.getElementById('playerNameBadge');
  if (badge) {
    badge.textContent = playerName;
    badge.style.display = 'block';
  }
}
