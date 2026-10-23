/**
 * Game over screen logic for the host.
 */

/**
 * Calculates ranks with proper tie handling.
 * Players with the same score get the same rank.
 * @param {Array} sortedScores - Array of scores sorted descending
 * @returns {Array} Array of rank numbers corresponding to each player
 */
function calculateRanksWithTies(sortedScores) {
  const ranks = [];
  let currentRank = 1;

  for (let i = 0; i < sortedScores.length; i++) {
    if (i === 0) {
      ranks.push(currentRank);
    } else if (sortedScores[i].score === sortedScores[i - 1].score) {
      // Same score as previous player, same rank
      ranks.push(ranks[i - 1]);
    } else {
      // Different score, rank is position + 1
      currentRank = i + 1;
      ranks.push(currentRank);
    }
  }

  return ranks;
}

/**
 * Shows the game over screen with final scores.
 * @param {Array} finalScores - Array of final scores sorted by rank
 */
function showGameOverScreen(finalScores) {
  const gameScreen = document.getElementById('gameScreen');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const winnerCelebration = document.getElementById('winnerCelebration');
  const finalLeaderboard = document.getElementById('finalLeaderboard');

  gameScreen.classList.remove('active');
  gameOverScreen.classList.add('active');
  setTheme('title');

  // Play success ending sound effect
  if (typeof playSoundEffect !== 'undefined') {
    playSoundEffect('successEnding', AUDIO_CONFIG.SFX_SUCCESS_ENDING_VOLUME);
  }

  // Restore ending music volume (already playing from results phase)
  if (typeof restoreMusicVolume !== 'undefined') {
    restoreMusicVolume(AUDIO_CONFIG.GAME_OVER_MUSIC_VOLUME);
  }

  // Calculate ranks with tie handling
  const ranks = calculateRanksWithTies(finalScores);

  // Find all first-place winners (could be ties)
  const firstPlaceScore = finalScores.length > 0 ? finalScores[0].score : 0;
  const winners = finalScores.filter(p => p.score === firstPlaceScore);

  // Show winner(s): big avatar badge(s), names on a tape stripe, and WINS! / TIE!
  winnerCelebration.innerHTML = '';
  if (winners.length > 0) {
    const avatars = document.createElement('div');
    avatars.className = 'winner-avatars';
    winners.forEach((winner, index) => {
      const badge = createAvatarBadge(avatarForPlayer(hostState.players, winner.id));
      badge.style.setProperty('--tilt', index % 2 ? '7deg' : '-6deg');
      avatars.appendChild(badge);
    });

    const names = document.createElement('div');
    names.className = 'winner-names tape';
    names.textContent = winners.map(w => w.name).join(' & ');

    const verdict = document.createElement('div');
    verdict.className = 'winner-verdict display-title';
    verdict.textContent = winners.length > 1 ? 'Tie for 1st!' : 'Wins!';

    winnerCelebration.appendChild(avatars);
    winnerCelebration.appendChild(names);
    winnerCelebration.appendChild(verdict);
  }

  // Show final leaderboard (same tape-bar rows as the round leaderboard)
  finalLeaderboard.innerHTML = '';
  finalScores.forEach((player, index) => {
    const playerRank = ranks[index];
    const item = document.createElement('div');
    // Apply rank-1 class to all first place players (including ties)
    item.className = `final-leaderboard-item leaderboard-entry rank-${playerRank}`;
    item.style.animationDelay = `${0.4 + index * 0.1}s`;
    item.style.setProperty('--tilt', tiltFor(player.id, 1.2));

    const rank = document.createElement('div');
    rank.className = 'leaderboard-rank';
    rank.textContent = playerRank;

    const name = document.createElement('div');
    name.className = 'leaderboard-name';
    name.textContent = player.name;

    const score = document.createElement('div');
    score.className = 'leaderboard-score';
    score.textContent = player.score.toLocaleString();

    item.appendChild(rank);
    item.appendChild(createAvatarBadge(avatarForPlayer(hostState.players, player.id)));
    item.appendChild(name);
    item.appendChild(score);
    finalLeaderboard.appendChild(item);
  });
}
