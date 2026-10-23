/**
 * Shared theme helpers for host and player screens.
 * Background themes, player avatars, label tilts, question formatting,
 * arced text and the wavy divider.
 */

/** Emoji avatars assigned to players by join order */
const AVATARS = ['🐡', '🦉', '🐙', '🦩', '🐌', '🦔', '🐸', '🦀', '🐢', '🦜', '🐝', '🦊', '🐳', '🦒', '🐞', '🦦'];

const THEME_CLASSES = ['theme-title', 'theme-play', 'theme-results', 'theme-round'];

/**
 * Switches the page background theme.
 * @param {string} name - 'title', 'play', 'results' or 'round'
 */
function setTheme(name) {
  document.body.classList.remove(...THEME_CLASSES);
  document.body.classList.add(`theme-${name}`);
}

/**
 * Returns the avatar emoji for a player position.
 * @param {number} index - Player's join-order index
 * @returns {string} Emoji
 */
function avatarFor(index) {
  if (index < 0) return '❓';
  return AVATARS[index % AVATARS.length];
}

/**
 * Returns the avatar for a player ID, based on their position in the players list.
 * @param {Array} players - Players in join order
 * @param {string} playerId - Player ID
 * @returns {string} Emoji
 */
function avatarForPlayer(players, playerId) {
  return avatarFor((players || []).findIndex(p => p.id === playerId));
}

/**
 * Deterministic rotation so labels keep the same tilt across re-renders.
 * @param {string|number} seed - Anything stable (name, id, index)
 * @param {number} maxDeg - Maximum rotation either way
 * @returns {string} CSS angle, e.g. '-2.1deg'
 */
function tiltFor(seed, maxDeg = 3) {
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  const unit = ((hash >>> 0) % 1000) / 999; // 0..1
  return `${((unit * 2 - 1) * maxDeg).toFixed(1)}deg`;
}

/**
 * Escapes text for safe use in innerHTML.
 * @param {string} text - Raw text
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Formats question text as HTML, turning '_____' into an underline blank.
 * @param {string} text - Question text
 * @returns {string} HTML
 */
function formatQuestion(text) {
  return escapeHtml(text).replace(/_{3,}/g, '<span class="blank"></span>');
}

/**
 * Builds an avatar badge + tape name tag.
 * @param {string} name - Player name
 * @param {string} avatar - Emoji
 * @param {object} options - { size: avatar px size, className: extra classes }
 * @returns {HTMLElement} Tag element
 */
function createPlayerTag(name, avatar, options = {}) {
  const tag = document.createElement('div');
  tag.className = `player-tag ${options.className || ''}`.trim();
  tag.style.setProperty('--tilt', tiltFor(name, 2.5));

  const badge = document.createElement('span');
  badge.className = 'avatar-badge';
  badge.textContent = avatar;
  if (options.size) {
    badge.style.setProperty('--size', `${options.size}px`);
  }

  const label = document.createElement('span');
  label.className = 'tape';
  label.textContent = name;

  tag.appendChild(badge);
  tag.appendChild(label);
  return tag;
}

/**
 * Lays text out letter-by-letter along an arc.
 * @param {HTMLElement} element - Container with class 'arc-text'
 * @param {string} text - Text to render
 * @param {number} radius - Arc radius in px (larger = flatter)
 * @param {number} letterAngle - Degrees between letters
 */
function makeArcText(element, text, radius, letterAngle) {
  element.innerHTML = '';
  element.setAttribute('aria-label', text);
  const start = -((text.length - 1) * letterAngle) / 2;

  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.setAttribute('aria-hidden', 'true');
    span.style.setProperty('--arc-radius', `${radius}px`);
    span.style.setProperty('--arc-angle', `${start + i * letterAngle}deg`);
    element.appendChild(span);
  });
}

/**
 * Fills an <svg class="wavy-divider"> with a hand-drawn-looking wave:
 * a dark base line and a light progress line drawn on top.
 * @param {SVGElement} svg - Target SVG element
 * @param {number} width - ViewBox width
 * @param {number} height - ViewBox height
 */
function buildWavyDivider(svg, width = 1920, height = 120) {
  const mid = height / 2;
  const points = [];
  for (let x = 0; x <= width; x += 8) {
    const t = x / width;
    // Amplitude and frequency wander so it looks drawn by hand
    const amp = (height * 0.38) * (0.25 + 0.75 * Math.sin(t * Math.PI * 0.9 + 0.3));
    const y = mid + amp * Math.sin(t * 34 + Math.sin(t * 5) * 2);
    points.push(`${x} ${y.toFixed(1)}`);
  }
  const d = `M${points.join(' L')}`;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.innerHTML = `
    <path class="wave-base" pathLength="1" d="${d}"></path>
    <path class="wave-progress" pathLength="1" d="${d}"></path>
  `;
}

/**
 * Restarts the wave's progress line, drawing it over the given duration.
 * @param {SVGElement} svg - Wavy divider SVG
 * @param {number} seconds - Draw duration
 */
function drawWave(svg, seconds) {
  const progress = svg.querySelector('.wave-progress');
  if (!progress) return;
  svg.classList.remove('drawing');
  progress.style.animationDuration = `${seconds}s`;
  void svg.getBoundingClientRect();
  svg.classList.add('drawing');
}
