/**
 * Client-side configuration for audio volumes.
 * All volume values range from 0.0 (silent) to 1.0 (full volume).
 */

const AUDIO_CONFIG = {
  // ============================================
  // MUSIC VOLUMES
  // ============================================

  /** Volume for lobby/intro music (plays before game starts) */
  INTRO_MUSIC_VOLUME: 0.5,

  /** Volume for gameplay music (plays during answer submission and voting phases) */
  GAMEPLAY_MUSIC_VOLUME: 0.4,

  /** Initial volume for ending music (plays during results/scoring phase) */
  ENDING_MUSIC_VOLUME: 0.1,

  /** Lowered volume for music during results animation (so sound effects are clearer) */
  RESULTS_MUSIC_LOWERED_VOLUME: 0.1,

  /** Volume for music on final game over screen */
  GAME_OVER_MUSIC_VOLUME: 0.4,

  // ============================================
  // SOUND EFFECT VOLUMES
  // ============================================

  /** Pop sound when player joins lobby */
  SFX_PLAYER_JOIN_VOLUME: 1,

  /** Pop sound when player submits an answer */
  SFX_ANSWER_SUBMIT_VOLUME: 1,

  /** Pop sound when player casts a vote */
  SFX_VOTE_CAST_VOLUME: 1,

  /** "Time to Vote" announcement sound (plays when game starts and before voting) */
  SFX_TIME_TO_VOTE_VOLUME: 0.6,

  /** Ticking timer sound (last 5 seconds of answer/voting phases) */
  SFX_TICKING_TIMER_VOLUME: 0.5,

  /** Drum roll during suspenseful answer reveals in scoring phase */
  SFX_DRUM_ROLL_VOLUME: 0.8,

  /** Error/buzzer sound when a lie is revealed */
  SFX_LIE_REVEAL_VOLUME: 1,

  /** Success/chime sound when truth is revealed */
  SFX_TRUTH_REVEAL_VOLUME: 1,

  /** Success ending celebration sound on final game over screen */
  SFX_SUCCESS_ENDING_VOLUME: 0.7,

  /** Multiplier announcement fanfare sound */
  SFX_MULTIPLIER_FANFARE_VOLUME: 0.8
};

/**
 * Multiplier Announcement Animation Settings.
 * Edit these values to customize the dramatic announcement screens.
 * All timing values are in milliseconds.
 */
const MULTIPLIER_CONFIG = {
  // ============================================
  // ANIMATION DURATIONS
  // ============================================

  /** Duration for screen fade to black */
  fadeToBlack: 500,

  /** Duration for text zoom entrance (scale 0 → 1.2 → 1.0) */
  textZoomIn: 800,

  /** How long to hold the announcement on screen */
  holdDuration: 3500,

  /** Duration for fade out transition */
  fadeOut: 500,

  // ============================================
  // ANIMATION TIMING OFFSETS (relative to fadeToBlack completion)
  // ============================================

  /** Delay after fade before showing subtitle (for triple announcement) */
  subtitleDelay: 200,

  /** Delay after fade before showing main title */
  titleDelay: 400,

  /** Delay after title zoom before starting pulse animation */
  pulseStartDelay: 500,

  // ============================================
  // TEXT PULSE ANIMATION
  // ============================================

  /** Scale factor for gentle text pulse (1.0 = no scale, 1.05 = 5% larger) */
  pulseScale: 1.05,

  /** Duration of one pulse cycle */
  pulseDuration: 1000,

  // ============================================
  // PARTICLE SETTINGS
  // ============================================

  /** Number of confetti particles to create */
  particleCount: 50,

  /** How long particles take to fall across the screen */
  particleFallDuration: 3000,

  /** Maximum random delay for staggered particle start (seconds) */
  particleStaggerMax: 2,

  /** Base particle size in pixels */
  particleSizeMin: 8,

  /** Additional random size variation in pixels */
  particleSizeVariation: 8
};

// Make config available globally
if (typeof window !== 'undefined') {
  window.AUDIO_CONFIG = AUDIO_CONFIG;
  window.MULTIPLIER_CONFIG = MULTIPLIER_CONFIG;
}
