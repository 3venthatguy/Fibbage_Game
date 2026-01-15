/**
 * Host UI update functions.
 * Handles all DOM manipulation for the host screen.
 */

/**
 * Updates the players display in the lobby.
 * @param {Array} players - Array of player objects
 */
function updatePlayersDisplay(players) {
  const playersGrid = document.getElementById('playersGrid');
  playersGrid.innerHTML = '';

  players.forEach(player => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.textContent = player.name;
    playersGrid.appendChild(card);
  });
}

/**
 * Updates the start button state.
 * @param {number} playerCount - Number of players
 */
function updateStartButton(playerCount) {
  const startButton = document.getElementById('startButton');
  startButton.disabled = playerCount < 2;
}

// Track if ticking sound is playing
let tickingSoundPlaying = false;
let tickingAudioInstance = null;

/**
 * Updates the timer display.
 * @param {number} seconds - Remaining seconds
 */
function updateTimer(seconds) {
  const timerDisplay = document.getElementById('timerDisplay');
  timerDisplay.textContent = seconds;

  if (seconds <= 10) {
    timerDisplay.classList.add('timer-warning');
  } else {
    timerDisplay.classList.remove('timer-warning');
  }

  // Play ticking sound during last 5 seconds of submit and voting phases
  if (seconds === 5 && !tickingSoundPlaying) {
    // Check if we're in submit or voting phase
    if (typeof hostState !== 'undefined' &&
        (hostState.currentPhase === 'submit' || hostState.currentPhase === 'voting')) {
      tickingAudioInstance = playSoundEffect('ticking', AUDIO_CONFIG.SFX_TICKING_TIMER_VOLUME, true);
      tickingSoundPlaying = true;
    }
  }

  // Stop ticking sound when timer reaches 0 or phase changes
  if (seconds === 0 && tickingSoundPlaying) {
    stopSoundEffect(tickingAudioInstance);
    tickingSoundPlaying = false;
    tickingAudioInstance = null;
  }
}

/**
 * Stops the ticking timer sound if it's playing.
 */
function stopTickingSound() {
  if (tickingSoundPlaying && tickingAudioInstance) {
    stopSoundEffect(tickingAudioInstance);
    tickingSoundPlaying = false;
    tickingAudioInstance = null;
  }
}

/**
 * Updates the leaderboard display.
 * @param {Array} totalScores - Array of player scores
 * @param {object} roundScores - Round scores by player ID
 */
function updateLeaderboard(totalScores, roundScores) {
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = '<div class="leaderboard-title">Current Scores</div>';

  const sorted = [...totalScores].sort((a, b) => b.score - a.score);
  sorted.forEach((player, index) => {
    const item = document.createElement('div');
    item.className = `leaderboard-item rank-${index + 1}`;

    const name = document.createElement('span');
    name.textContent = player.name;

    const scoreContainer = document.createElement('span');
    scoreContainer.style.display = 'flex';
    scoreContainer.style.alignItems = 'center';
    scoreContainer.style.gap = '10px';

    const score = document.createElement('span');
    score.textContent = `${player.score.toLocaleString()} pts`;

    if (roundScores[player.id] > 0) {
      const change = document.createElement('span');
      change.className = 'score-change';
      change.textContent = `+${roundScores[player.id]}`;
      scoreContainer.appendChild(change);
    }

    scoreContainer.appendChild(score);
    item.appendChild(name);
    item.appendChild(scoreContainer);
    leaderboard.appendChild(item);
  });
}

/**
 * Shows an error message.
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  setTimeout(() => {
    errorMessage.classList.remove('show');
  }, 5000);
}
