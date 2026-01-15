/**
 * Animation functions for player results screen.
 * Simplified version focused on personal results.
 */

/**
 * Shows personal celebration if player fooled others.
 * @param {HTMLElement} container - Container element
 * @param {number} fooledCount - Number of players fooled
 * @param {number} pointsEarned - Points earned
 */
export function showFooledCelebration(container, fooledCount, pointsEarned) {
  if (!container) return;

  container.innerHTML = '';
  
  if (fooledCount > 0) {
    const celebration = document.createElement('div');
    celebration.className = 'player-celebration';
    
    const message = document.createElement('div');
    message.className = 'celebration-message';
    message.textContent = `You fooled ${fooledCount} player${fooledCount > 1 ? 's' : ''}!`;
    
    const points = document.createElement('div');
    points.className = 'celebration-points';
    points.textContent = `+${pointsEarned.toLocaleString()} points`;
    
    celebration.appendChild(message);
    celebration.appendChild(points);
    container.appendChild(celebration);
    
    celebration.classList.add('celebration-appear');
  }
}

/**
 * Shows personal celebration if player got correct answer.
 * @param {HTMLElement} container - Container element
 * @param {number} pointsEarned - Points earned
 */
export function showCorrectCelebration(container, pointsEarned) {
  if (!container) return;

  container.innerHTML = '';
  
  const celebration = document.createElement('div');
  celebration.className = 'player-celebration correct';
  
  const message = document.createElement('div');
  message.className = 'celebration-message';
  message.textContent = 'You got it right!';
  
  const points = document.createElement('div');
  points.className = 'celebration-points';
  points.textContent = `+${pointsEarned.toLocaleString()} points`;
  
  celebration.appendChild(message);
  celebration.appendChild(points);
  container.appendChild(celebration);
  
  celebration.classList.add('celebration-appear');
}

/**
 * Shows message if player was fooled.
 * @param {HTMLElement} container - Container element
 * @param {string} authorName - Name of player who fooled them
 */
export function showFooledMessage(container, authorName) {
  if (!container) return;

  container.innerHTML = '';
  
  const message = document.createElement('div');
  message.className = 'fooled-message';
  message.textContent = `You were fooled by ${authorName}!`;
  container.appendChild(message);
  
  message.classList.add('fooled-appear');
}

/**
 * Animates score update.
 * @param {HTMLElement} element - Score display element
 * @param {number} startScore - Starting score
 * @param {number} endScore - Ending score
 * @param {number} duration - Animation duration
 * @returns {Promise} Promise that resolves when animation completes
 */
export function animatePlayerScore(element, startScore, endScore, duration = 1000) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const range = endScore - startScore;

    const update = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startScore + range * eased);
      
      element.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = endScore.toLocaleString();
        resolve();
      }
    };

    update();
  });
}

/**
 * Shows round score animation.
 * @param {HTMLElement} container - Container element
 * @param {number} points - Points earned this round
 */
export function showRoundScore(container, points) {
  if (!container) return;

  const scoreDisplay = document.createElement('div');
  scoreDisplay.className = 'round-score-display';
  scoreDisplay.textContent = `+${points.toLocaleString()}`;
  container.appendChild(scoreDisplay);
  
  scoreDisplay.classList.add('round-score-appear');
  
  // Animate flying up
  setTimeout(() => {
    scoreDisplay.classList.add('round-score-fly');
  }, 500);
}
