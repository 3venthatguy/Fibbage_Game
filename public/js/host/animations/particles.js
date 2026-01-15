/**
 * Particle effects for celebrations and animations.
 */

/**
 * Creates a sparkle effect at a position.
 * @param {HTMLElement} parent - Parent element
 * @param {number} x - X position (relative to parent)
 * @param {number} y - Y position (relative to parent)
 */
export function createSparkle(parent, x, y) {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle-particle';
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  parent.appendChild(sparkle);

  setTimeout(() => {
    sparkle.remove();
  }, 1000);
}

/**
 * Creates a burst of particles from a point.
 * @param {HTMLElement} parent - Parent element
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} count - Number of particles
 */
export function createParticleBurst(parent, x, y, count = 15) {
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'burst-particle';
    
    const angle = (Math.PI * 2 * i) / count;
    const distance = 50 + Math.random() * 30;
    const finalX = x + Math.cos(angle) * distance;
    const finalY = y + Math.sin(angle) * distance;
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--final-x', `${finalX}px`);
    particle.style.setProperty('--final-y', `${finalY}px`);
    
    parent.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 800);
  }
}

/**
 * Creates stars around an element.
 * @param {HTMLElement} element - Element to create stars around
 * @param {number} count - Number of stars
 */
export function createStars(element, count = 8) {
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const parent = element.parentElement;
  if (!parent) return;

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star-particle';
    
    const angle = (Math.PI * 2 * i) / count;
    const radius = Math.max(rect.width, rect.height) / 2 + 30;
    const x = rect.left + rect.width / 2 + Math.cos(angle) * radius;
    const y = rect.top + rect.height / 2 + Math.sin(angle) * radius;
    
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.animationDelay = `${i * 0.1}s`;
    
    parent.appendChild(star);

    setTimeout(() => {
      star.remove();
    }, 2000);
  }
}
