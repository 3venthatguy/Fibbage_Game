/**
 * Results phase screen logic for the player.
 * In Jackbox Fibbage style, players watch the main screen during results.
 * This file is now minimal - player screen stays on "watch screen" during results.
 */

/**
 * Shows the results phase UI (watch screen remains).
 * Player continues watching the main screen.
 */
function showPlayerResultsPhase() {
  // During results, player should already be on watch screen from voting
  // Keep watch screen visible - don't change anything
  const watchScreen = document.getElementById('watchScreen');
  if (watchScreen && watchScreen.style.display !== 'flex') {
    // Ensure watch screen is showing
    const submitPhase = document.getElementById('submitPhase');
    const votingPhase = document.getElementById('votingPhase');

    submitPhase.style.display = 'none';
    votingPhase.style.display = 'none';
    watchScreen.style.display = 'flex';
  }
}

/**
 * Legacy function stubs - no longer used.
 * All results display now happens on host screen only.
 */
function handlePlayerResultsStart(data) {
  // Do nothing - player watches host screen
}

function handlePlayerCorrectAnswerReveal(data) {
  // Do nothing - player watches host screen
}

function handlePlayerShowExplanation(data) {
  // Do nothing - player watches host screen
}

function handlePlayerScoreUpdate(data) {
  // Do nothing - player watches host screen
}

function handlePlayerCelebration(data) {
  // Do nothing - player watches host screen
}

function handlePlayerFooled(data) {
  // Do nothing - player watches host screen
}

function handlePlayerLeaderboard(data) {
  // Do nothing - player watches host screen
}

function displayPlayerResults(data, playerId) {
  // Do nothing - player watches host screen
  // Results are shown on host display only
}
