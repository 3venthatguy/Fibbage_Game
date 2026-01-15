/**
 * Game over screen logic for the player.
 */

/**
 * Gets the ordinal suffix for a number (1st, 2nd, 3rd, etc.).
 * @param {number} n - The number
 * @returns {string} The number with ordinal suffix
 */
function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Shows the game over screen with final scores.
 * @param {Array} finalScores - Array of final scores sorted by rank
 * @param {string} playerId - Current player's ID
 */
function showPlayerGameOverScreen(finalScores, playerId) {
  const gameScreen = document.getElementById('gameScreen');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const finalLeaderboard = document.getElementById('finalLeaderboard');
  const thanksMessage = document.getElementById('thanksMessage');

  gameScreen.classList.remove('active');
  gameOverScreen.classList.add('active');

  // Show final leaderboard
  finalLeaderboard.innerHTML = '';
  finalScores.forEach((player, index) => {
    const item = document.createElement('div');
    item.className = `final-leaderboard-item rank-${index + 1}`;

    const rank = document.createElement('span');
    rank.className = 'rank-badge';
    rank.textContent = `#${index + 1}`;

    const name = document.createElement('span');
    name.textContent = player.name;
    name.style.flex = '1';
    name.style.textAlign = 'left';
    name.style.marginLeft = '15px';

    const score = document.createElement('span');
    score.textContent = `${player.score.toLocaleString()} pts`;
    score.style.fontWeight = 'bold';

    item.appendChild(rank);
    item.appendChild(name);
    item.appendChild(score);
    finalLeaderboard.appendChild(item);
  });

  // Show thanks message
  const ourRank = finalScores.findIndex(p => p.id === playerId) + 1;
  thanksMessage.textContent = `You finished in ${getOrdinal(ourRank)} place! Thanks for playing!`;
}
