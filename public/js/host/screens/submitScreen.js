/**
 * Submit phase screen logic for the host.
 */

/**
 * Shows the reading phase UI.
 * The wavy divider's light line draws across over the reading time.
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

  drawWave(document.getElementById('questionWave'), duration);
}

/**
 * Shows the submit phase UI.
 * @param {Array} players - Players in join order
 */
function showSubmitPhase(players) {
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

  updateSubmitStatus(players, []);
}

/**
 * Updates the submit status text and lights up players who have submitted.
 * Also used to re-render after a disconnect or mid-game join.
 * @param {Array} players - Players in join order
 * @param {Array} submittedPlayerIds - IDs of players who have submitted
 */
function updateSubmitStatus(players, submittedPlayerIds) {
  renderPlayerStatus('submitCheckmarks', players, submittedPlayerIds);

  const submitStatus = document.getElementById('submitStatus');
  if (!submitStatus) return;

  const submittedCount = submittedPlayerIds.length;
  if (submittedCount === players.length && players.length > 0) {
    submitStatus.textContent = 'All answers submitted!';
  } else {
    submitStatus.textContent = `${submittedCount} of ${players.length} lies are in`;
  }
}

/**
 * Shows all answers submitted message.
 */
function showAllAnswersSubmitted() {
  const submitStatus = document.getElementById('submitStatus');
  submitStatus.textContent = 'All answers submitted!';
}
