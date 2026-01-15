/**
 * Submit phase screen logic for the host.
 */

/**
 * Shows the reading phase UI.
 * @param {number} duration - Duration in seconds
 */
function showReadingPhase(duration) {
  const readingPhase = document.getElementById('readingPhase');
  const submitPhase = document.getElementById('submitPhase');
  const votingPhase = document.getElementById('votingPhase');
  const resultsPhase = document.getElementById('resultsPhase');

  readingPhase.style.display = 'block';
  submitPhase.style.display = 'none';
  votingPhase.style.display = 'none';
  resultsPhase.style.display = 'none';

  // Hide the number timer during reading phase
  hideTimer();

  // Start progress bar animation
  const progressBar = document.getElementById('readingProgressBar');
  progressBar.classList.remove('animating');
  // Set animation duration before starting
  progressBar.style.animationDuration = duration + 's';
  // Force reflow to restart animation
  void progressBar.offsetWidth;
  progressBar.classList.add('animating');
}

/**
 * Shows the submit phase UI.
 * @param {number} playerCount - Number of players
 */
function showSubmitPhase(playerCount) {
  const readingPhase = document.getElementById('readingPhase');
  const submitPhase = document.getElementById('submitPhase');
  const votingPhase = document.getElementById('votingPhase');
  const resultsPhase = document.getElementById('resultsPhase');

  readingPhase.style.display = 'none';
  submitPhase.style.display = 'block';
  votingPhase.style.display = 'none';
  resultsPhase.style.display = 'none';

  // Show the timer again for submit phase
  showTimer();

  // Initialize checkmarks
  const submitCheckmarks = document.getElementById('submitCheckmarks');
  submitCheckmarks.innerHTML = '';
  for (let i = 0; i < playerCount; i++) {
    const checkmark = document.createElement('div');
    checkmark.className = 'checkmark';
    checkmark.textContent = '✓';
    submitCheckmarks.appendChild(checkmark);
  }
}

/**
 * Updates the submit status display.
 * @param {number} submittedCount - Number of players who submitted
 * @param {number} totalPlayers - Total number of players
 */
function updateSubmitStatus(submittedCount, totalPlayers) {
  const submitStatus = document.getElementById('submitStatus');
  submitStatus.textContent = `${submittedCount}/${totalPlayers} players submitted`;

  // Update checkmarks
  const submitCheckmarks = document.getElementById('submitCheckmarks');
  const checkmarks = submitCheckmarks.querySelectorAll('.checkmark');
  for (let i = 0; i < submittedCount; i++) {
    if (checkmarks[i]) {
      checkmarks[i].classList.add('submitted');
    }
  }
}

/**
 * Shows all answers submitted message.
 */
function showAllAnswersSubmitted() {
  const submitStatus = document.getElementById('submitStatus');
  submitStatus.textContent = 'All answers submitted!';
}

/**
 * Re-renders submit checkmarks when player count changes (disconnect/reconnect).
 * @param {number} totalPlayers - Total number of connected players
 * @param {number} submittedCount - Number of players who have submitted
 */
function rerenderSubmitCheckmarks(totalPlayers, submittedCount) {
  const submitCheckmarks = document.getElementById('submitCheckmarks');
  if (!submitCheckmarks) return;

  submitCheckmarks.innerHTML = '';
  for (let i = 0; i < totalPlayers; i++) {
    const checkmark = document.createElement('div');
    checkmark.className = 'checkmark' + (i < submittedCount ? ' submitted' : '');
    checkmark.textContent = '\u2713';
    submitCheckmarks.appendChild(checkmark);
  }

  // Update the status text as well
  const submitStatus = document.getElementById('submitStatus');
  if (submitStatus) {
    if (submittedCount === totalPlayers && totalPlayers > 0) {
      submitStatus.textContent = 'All answers submitted!';
    } else {
      submitStatus.textContent = `${submittedCount}/${totalPlayers} players submitted`;
    }
  }
}
