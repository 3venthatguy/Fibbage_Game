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

  // Show winner(s)
  if (winners.length > 1) {
    const winnerNames = winners.map(w => w.name).join(' & ');
    winnerCelebration.textContent = `🎉 ${winnerNames} Tie for 1st! 🎉`;
  } else if (winners.length === 1) {
    winnerCelebration.textContent = `🎉 ${winners[0].name} Wins! 🎉`;
  }

  // Show final leaderboard
  finalLeaderboard.innerHTML = '';
  finalScores.forEach((player, index) => {
    const playerRank = ranks[index];
    const item = document.createElement('div');
    // Apply rank-1 class to all first place players (including ties)
    item.className = `final-leaderboard-item rank-${playerRank}`;

    const rank = document.createElement('span');
    rank.className = 'rank-badge';
    rank.textContent = `#${playerRank}`;

    const name = document.createElement('span');
    name.textContent = player.name;
    name.style.flex = '1';
    name.style.textAlign = 'left';
    name.style.marginLeft = '20px';

    const score = document.createElement('span');
    score.textContent = `${player.score.toLocaleString()} pts`;
    score.style.fontWeight = 'bold';

    item.appendChild(rank);
    item.appendChild(name);
    item.appendChild(score);
    finalLeaderboard.appendChild(item);
  });
}
