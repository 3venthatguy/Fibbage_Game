/**
 * Round title cards (Fibbage 4 style), shared by host and player screens.
 * ROUND ONE plays on gameStarted; the server's multiplierAnnouncement
 * (double / triple) plays as ROUND TWO / FINAL ROUND.
 * Timings come from MULTIPLIER_CONFIG in config.js.
 */

const ROUND_CARDS = {
  1: { title: 'Round One', art: '🦚' },
  2: { title: 'Round Two', art: '🦑' },
  3: { title: 'Final Round', art: '🐊' }
};

// Base points before the multiplier (server config FOOL_PLAYER_POINTS / CORRECT_VOTE_POINTS)
const ROUND_BASE_FOOL_POINTS = 500;
const ROUND_BASE_TRUTH_POINTS = 1000;

/**
 * Shows a full-window round card, then hides it.
 * @param {number} round - 1, 2 or 3
 * @param {number} multiplier - Point multiplier for the round
 * @param {number} duration - Total time on screen in ms (including fade out)
 * @returns {Promise} Resolves when the card is gone
 */
function showRoundCard(round, multiplier, duration) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('multiplierOverlay');
    if (!overlay) {
      resolve();
      return;
    }

    // Prevent duplicate cards if one is already showing
    if (overlay.classList.contains('active')) {
      resolve();
      return;
    }

    const card = ROUND_CARDS[round] || ROUND_CARDS[1];
    const art = document.getElementById('roundCardArt');
    const foolStripe = document.getElementById('roundCardFool');
    const truthStripe = document.getElementById('roundCardTruth');
    const title = document.getElementById('multiplierTitle');

    art.textContent = card.art;
    foolStripe.textContent = `${ROUND_BASE_FOOL_POINTS * multiplier} for everyone you fool`;
    truthStripe.textContent = `${ROUND_BASE_TRUTH_POINTS * multiplier} for finding the truth`;
    title.textContent = card.title;

    [art, foolStripe, truthStripe, title].forEach(el => el.classList.remove('show', 'pulse'));
    overlay.classList.remove('fade-out');
    overlay.classList.add('active');

    const config = window.MULTIPLIER_CONFIG;
    const fadeOut = config ? config.fadeOut : 500;

    // Wipe in, then art, scoring stripes and title land one after another
    setTimeout(() => art.classList.add('show'), 250);
    setTimeout(() => foolStripe.classList.add('show'), 350);
    setTimeout(() => truthStripe.classList.add('show'), 500);
    setTimeout(() => title.classList.add('show'), 600);
    setTimeout(() => title.classList.add('pulse'), 1300);

    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.classList.remove('active', 'fade-out');
        resolve();
      }, fadeOut);
    }, Math.max(duration - fadeOut, 900));
  });
}

/**
 * Shows the ROUND TWO / FINAL ROUND card for a server multiplier announcement.
 * @param {object} data - Announcement data
 * @param {string} data.type - 'double' or 'triple'
 * @param {number} data.multiplier - 2 or 3
 * @returns {Promise} Resolves when the card is gone
 */
function showMultiplierAnnouncement(data) {
  const config = window.MULTIPLIER_CONFIG;
  if (!config) {
    console.error('MULTIPLIER_CONFIG not found. Make sure config.js is loaded first.');
    return Promise.resolve();
  }

  // Play sound effect based on type
  const volume = window.AUDIO_CONFIG?.SFX_MULTIPLIER_FANFARE_VOLUME || 0.8;
  const audio = new Audio(data.type === 'triple' ? 'sounds/effects/EvilString.mp3' : 'sounds/effects/RevealSound.mp3');
  audio.volume = volume;
  audio.play().catch(() => {});

  const duration = config.fadeToBlack + config.textZoomIn + config.holdDuration + config.fadeOut;
  return showRoundCard(data.type === 'triple' ? 3 : 2, data.multiplier, duration);
}

/**
 * Hides the round card immediately (for cleanup).
 */
function hideMultiplierAnnouncement() {
  const overlay = document.getElementById('multiplierOverlay');
  if (overlay) {
    overlay.classList.remove('active', 'fade-out');
  }
}
