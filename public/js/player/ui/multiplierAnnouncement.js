/**
 * Multiplier Announcement Module
 * Handles the dramatic full-screen announcement when points are doubled or tripled.
 * Animation timings are configured in config.js (MULTIPLIER_CONFIG)
 */

/**
 * Shows the multiplier announcement overlay with animation.
 * Uses timing values from window.MULTIPLIER_CONFIG (defined in config.js)
 * @param {object} data - Announcement data
 * @param {string} data.type - 'double' or 'triple'
 * @param {number} data.multiplier - 2 or 3
 * @returns {Promise} Resolves when the announcement is complete
 */
function showMultiplierAnnouncement(data) {
  return new Promise((resolve) => {
    // Get animation config from global config (set in config.js)
    const config = window.MULTIPLIER_CONFIG;

    if (!config) {
      console.error('MULTIPLIER_CONFIG not found. Make sure config.js is loaded first.');
      resolve();
      return;
    }

    const overlay = document.getElementById('multiplierOverlay');
    const emojisTop = document.getElementById('multiplierEmojis');
    const subtitle = document.getElementById('multiplierSubtitle');
    const title = document.getElementById('multiplierTitle');
    const description = document.getElementById('multiplierDescription');
    const emojisBottom = document.getElementById('multiplierEmojisBottom');
    const particlesContainer = document.getElementById('multiplierParticles');

    if (!overlay) {
      console.error('Multiplier overlay element not found');
      resolve();
      return;
    }

    // Reset classes
    overlay.className = 'multiplier-overlay';
    emojisTop.className = 'multiplier-emojis';
    subtitle.className = 'multiplier-subtitle';
    title.className = 'multiplier-title';
    description.className = 'multiplier-description';
    emojisBottom.className = 'multiplier-emojis';
    particlesContainer.innerHTML = '';

    // Set content based on type
    if (data.type === 'double') {
      emojisTop.textContent = '🔥 🔥 🔥';
      emojisBottom.textContent = '🔥 🔥 🔥';
      subtitle.textContent = '';
      title.textContent = 'POINTS DOUBLED!';
      title.classList.add('double');
      description.textContent = 'From now on, all points are worth 2x as much!';
      overlay.classList.add('double-bg');
    } else if (data.type === 'triple') {
      emojisTop.textContent = '⚡ ⚡ ⚡';
      emojisBottom.textContent = '⚡ ⚡ ⚡';
      subtitle.textContent = 'FINAL QUESTION!';
      title.textContent = 'POINTS TRIPLED!';
      title.classList.add('triple');
      description.textContent = 'All points are now 3x!';
      overlay.classList.add('triple-bg');
    }

    // Show overlay
    overlay.style.display = 'flex';
    overlay.classList.add('active');

    // Play sound effect
    if (typeof playSoundEffect === 'function') {
      playSoundEffect('multiplierFanfare', window.AUDIO_CONFIG?.SFX_MULTIPLIER_FANFARE_VOLUME);
    }

    // Step 1: Fade to black
    overlay.classList.add('fade-in-black');

    // Step 2: After fade, show emojis and create particles
    setTimeout(() => {
      emojisTop.classList.add('show');
      emojisBottom.classList.add('show');
      createMultiplierParticles(particlesContainer, data.type, config);
    }, config.fadeToBlack);

    // Step 3: Show subtitle (for triple only)
    setTimeout(() => {
      if (data.type === 'triple') {
        subtitle.classList.add('show');
      }
    }, config.fadeToBlack + config.subtitleDelay);

    // Step 4: Show main title with zoom
    setTimeout(() => {
      title.classList.add('show');
    }, config.fadeToBlack + config.titleDelay);

    // Step 5: Show description
    setTimeout(() => {
      description.classList.add('show');
    }, config.fadeToBlack + config.textZoomIn);

    // Step 6: Start pulse animation
    setTimeout(() => {
      title.classList.remove('show');
      title.classList.add('pulse');
    }, config.fadeToBlack + config.textZoomIn + config.pulseStartDelay);

    // Step 7: Fade out and resolve
    const totalHoldTime = config.fadeToBlack + config.textZoomIn + config.holdDuration;
    setTimeout(() => {
      overlay.classList.remove('fade-in-black');
      overlay.classList.add('fade-out');

      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.classList.remove('active', 'fade-out', 'double-bg', 'triple-bg');
        resolve();
      }, config.fadeOut);
    }, totalHoldTime);
  });
}

/**
 * Creates particle effects for the multiplier announcement.
 * Uses particle settings from MULTIPLIER_CONFIG.
 * @param {HTMLElement} container - Container element for particles
 * @param {string} type - 'double' or 'triple'
 * @param {object} config - MULTIPLIER_CONFIG object with particle settings
 */
function createMultiplierParticles(container, type, config) {
  const particleClass = type === 'double' ? 'fire' : 'lightning';
  const count = config.particleCount;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = `multiplier-particle ${particleClass}`;

    // Random horizontal position
    particle.style.left = `${Math.random() * 100}%`;

    // Random start position (above viewport)
    particle.style.top = `${-20 - Math.random() * 100}px`;

    // Random delay for staggered effect (using config value)
    particle.style.animationDelay = `${Math.random() * config.particleStaggerMax}s`;

    // Random size variation (using config values)
    const size = config.particleSizeMin + Math.random() * config.particleSizeVariation;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    container.appendChild(particle);

    // Start animation after brief delay
    setTimeout(() => {
      particle.classList.add('animate');
    }, 100);
  }
}

/**
 * Hides the multiplier announcement immediately (for cleanup).
 */
function hideMultiplierAnnouncement() {
  const overlay = document.getElementById('multiplierOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.className = 'multiplier-overlay';
  }
}

// Make functions globally available
if (typeof window !== 'undefined') {
  window.showMultiplierAnnouncement = showMultiplierAnnouncement;
  window.hideMultiplierAnnouncement = hideMultiplierAnnouncement;
}
