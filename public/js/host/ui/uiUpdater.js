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
  // Only newly joined players get the entrance animation
  const shownNames = new Set([...playersGrid.querySelectorAll('.player-card .tape')].map(el => el.textContent));
  playersGrid.innerHTML = '';
  playersGrid.classList.toggle('crowded', players.length > 8);

  players.forEach((player, index) => {
    const isNew = !shownNames.has(player.name);
    const card = createPlayerTag(player.name, avatarFor(index), { size: 72, className: `player-card${isNew ? ' slap-in' : ''}` });
    if (player.connected === false) {
      card.classList.add('disconnected');
    }
    playersGrid.appendChild(card);
  });

  // Empty slots so the lobby looks ready to fill
  const LOBBY_SLOTS = 8;
  for (let i = players.length; i < LOBBY_SLOTS; i++) {
    const slot = document.createElement('div');
    slot.className = 'player-slot-empty';
    slot.innerHTML = '<span class="avatar-badge" style="--size: 72px">?</span><span class="slot-line"></span>';
    playersGrid.appendChild(slot);
  }

  const playerCount = document.getElementById('playerCount');
  if (playerCount) {
    if (players.length === 0) {
      playerCount.textContent = 'Waiting for players…';
    } else {
      playerCount.textContent = `${players.length} player${players.length === 1 ? '' : 's'} in`;
    }
  }
}

/**
 * Renders a row of player tags that light up once each player is done
 * (submitted an answer or cast a vote).
 * @param {string} containerId - Row container ID
 * @param {Array} players - Players in join order
 * @param {Array} doneIds - IDs of players who are done
 */
function renderPlayerStatus(containerId, players, doneIds) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Players who were already lit don't replay the pop animation
  const alreadyDone = new Set([...container.querySelectorAll('.status-tag.submitted')].map(el => el.dataset.playerId));
  const done = new Set(doneIds || []);
  container.innerHTML = '';

  players.forEach((player, index) => {
    const tag = createPlayerTag(player.name, avatarFor(index), { size: 64, className: 'status-tag' });
    tag.dataset.playerId = player.id;
    if (done.has(player.id)) {
      tag.classList.add('submitted');
      if (!alreadyDone.has(player.id)) {
        tag.classList.add('just-done');
      }
    }
    container.appendChild(tag);
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
