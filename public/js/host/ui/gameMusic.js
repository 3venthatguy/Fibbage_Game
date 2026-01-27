/**
 * Unified music manager for all game music (lobby + gameplay).
 * Controls music from both intro and playing folders.
 */

// Audio element for current music
let currentMusic = null;
let musicEnabled = false;
let musicPlaying = false;

// Available intro music files (lobby)
const introMusicFiles = [
  'sounds/intro/CASIOPEA.mp3',
  'sounds/intro/Monogatari.mp3',
  'sounds/intro/a_birds_last_look.mp3',
  'sounds/intro/abandoned_plaza.mp3'
];

// Available playing phase music files (gameplay)
const playingMusicFiles = [
  'sounds/playing/BotanicPanic.mp3',
  'sounds/playing/Caravan.mp3',
  'sounds/playing/CoconutMall.mp3',
  'sounds/playing/Forcast.mp3',
  'sounds/playing/GreatPretender.mp3',
  'sounds/playing/Loonboon.mp3',
  'sounds/playing/PedestriansCrossing.mp3',
  'sounds/playing/Piano_Black.mp3',
  'sounds/playing/PumpItUp.mp3',
  'sounds/playing/Sepia.mp3',
  'sounds/playing/Windmill_Isle.mp3'
];

// Available ending music files (game over)
const endingMusicFiles = [
  'sounds/endings/AquaticGroove.mp3',
  'sounds/endings/FunkMagic.mp3',
  'sounds/endings/SmoothJazz.mp3',
  'sounds/endings/GoldenWhisper.mp3',
  'sounds/endings/HitsJazz.mp3',
  'sounds/endings/SomeJazz.mp3'
];

/**
 * Plays a random music track from a given list.
 * @param {Array} musicFiles - Array of music file paths
 * @param {number} volume - Volume level (0-1)
 */
function playRandomMusic(musicFiles, volume = 0.4) {
  if (!musicEnabled) {
    console.log('Music is disabled');
    return;
  }

  // Stop any currently playing music
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }

  // Select a random track
  const randomIndex = Math.floor(Math.random() * musicFiles.length);
  const selectedTrack = musicFiles[randomIndex];

  // Create and play the audio
  currentMusic = new Audio(selectedTrack);
  currentMusic.loop = true;
  currentMusic.volume = volume;

  // Play the music
  currentMusic.play()
    .then(() => {
      musicPlaying = true;
      console.log('Music started:', selectedTrack);
      updateMusicButton();
    })
    .catch(() => {
      console.log('Could not autoplay music (expected). Click Music button or Start Game to enable.');
      musicPlaying = false;
      updateMusicButton();
    });
}

/**
 * Plays random lobby music (intro folder).
 */
function playRandomIntroMusic() {
  playRandomMusic(introMusicFiles, AUDIO_CONFIG.INTRO_MUSIC_VOLUME);
}

/**
 * Plays random game music (playing folder).
 */
function playRandomGameMusic() {
  playRandomMusic(playingMusicFiles, AUDIO_CONFIG.GAMEPLAY_MUSIC_VOLUME);
}

/**
 * Plays random ending music (endings folder).
 */
function playRandomEndingMusic() {
  playRandomMusic(endingMusicFiles, AUDIO_CONFIG.ENDING_MUSIC_VOLUME);
}

/**
 * Stops all music.
 */
function stopGameMusic() {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
    musicPlaying = false;
    console.log('Music stopped');
  }
}

/**
 * Toggles music on/off globally.
 * Plays phase-appropriate music when re-enabled.
 */
function toggleMusic() {
  musicEnabled = !musicEnabled;

  if (!musicEnabled && currentMusic) {
    // Music disabled, stop current music
    currentMusic.pause();
    musicPlaying = false;
  } else if (musicEnabled && !musicPlaying) {
    // Music enabled but nothing playing - play appropriate music for current phase
    console.log('Music enabled - attempting to start phase-appropriate music');
    playMusicForCurrentPhase();
  }

  updateMusicButton();
}

/**
 * Plays the appropriate music for the current game phase.
 * Uses hostState.currentPhase to determine which music to play.
 */
function playMusicForCurrentPhase() {
  // Check if hostState exists and has currentPhase
  const currentPhase = (typeof hostState !== 'undefined' && hostState.currentPhase)
    ? hostState.currentPhase
    : 'lobby';

  console.log('Playing music for phase:', currentPhase);

  switch (currentPhase) {
    case 'lobby':
      playRandomIntroMusic();
      break;
    case 'reading':
      // No music during reading phase (just came from lobby or between questions)
      break;
    case 'submit':
    case 'voting':
      playRandomGameMusic();
      break;
    case 'results':
    case 'gameOver':
      playRandomEndingMusic();
      break;
    default:
      // Default to intro music if phase unknown
      playRandomIntroMusic();
      break;
  }
}

/**
 * Updates the music toggle button appearance.
 */
function updateMusicButton() {
  const musicButton = document.getElementById('musicToggleButton');
  if (musicButton) {
    if (musicEnabled) {
      musicButton.textContent = '🎵 Music';
      musicButton.classList.remove('muted');
    } else {
      musicButton.textContent = '🔇 Music';
      musicButton.classList.add('muted');
    }
  }
}

/**
 * Checks if game music is currently playing.
 * @returns {boolean} True if music is playing
 */
function isGameMusicPlaying() {
  return musicPlaying && musicEnabled;
}

/**
 * Checks if music is enabled.
 * @returns {boolean} True if music is enabled
 */
function isMusicEnabled() {
  return musicEnabled;
}

/**
 * Lowers the music volume (for results/scoring phase).
 * @param {number} volume - New volume level (0-1), default 0.15
 */
function lowerMusicVolume(volume = 0.15) {
  if (currentMusic && musicPlaying) {
    currentMusic.volume = volume;
    console.log('Music volume lowered to:', volume);
  }
}

/**
 * Restores normal music volume.
 * @param {number} volume - Normal volume level (0-1), default 0.4
 */
function restoreMusicVolume(volume = 0.4) {
  if (currentMusic && musicPlaying) {
    currentMusic.volume = volume;
    console.log('Music volume restored to:', volume);
  }
}
