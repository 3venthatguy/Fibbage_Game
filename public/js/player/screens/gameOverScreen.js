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
  setTheme('title');

  const players = window.playerState.players || [];

  // Show final leaderboard as tape bars
  finalLeaderboard.innerHTML = '';
  finalScores.forEach((player, index) => {
    const item = document.createElement('div');
    item.className = `final-leaderboard-item rank-${index + 1}${player.id === playerId ? ' is-me' : ''}`;
    item.style.setProperty('--tilt', index % 2 ? '0.8deg' : '-0.8deg');

    const rank = document.createElement('span');
    rank.className = 'rank-badge';
    rank.textContent = index + 1;

    const name = document.createElement('span');
    name.className = 'final-name';
    name.textContent = player.name;

    const score = document.createElement('span');
    score.className = 'final-score';
    score.textContent = player.score.toLocaleString();

    item.appendChild(rank);
    item.appendChild(createAvatarBadge(avatarForPlayer(players, player.id), 36));
    item.appendChild(name);
    item.appendChild(score);
    finalLeaderboard.appendChild(item);
  });

  // Big sticker with this player's placement
  const ourRank = finalScores.findIndex(p => p.id === playerId) + 1;
  thanksMessage.innerHTML = '';
  if (ourRank > 0) {
    const label = document.createElement('div');
    label.className = 'thanks-label';
    label.textContent = 'You finished';

    const place = document.createElement('div');
    place.className = 'thanks-place sticker';
    place.textContent = getOrdinal(ourRank);

    thanksMessage.appendChild(label);
    thanksMessage.appendChild(place);
  }
}
