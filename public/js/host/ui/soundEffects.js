/**
 * Sound effects manager for game events.
 * Controls SFX from the effects folder.
 */

// Sound effects enabled state
let sfxEnabled = false;

// Available sound effect files
const soundEffects = {
  pop: 'sounds/effects/pop-sound.mp3',
  success: 'sounds/effects/success.mp3',
  ticking: 'sounds/effects/ticking_timer.mp3',
  timeToVote: 'sounds/effects/time_to_vote.mp3',
  drumRoll: 'sounds/effects/drum_roll.mp3',
  error: 'sounds/effects/error.mp3',
  successEnding: 'sounds/effects/Success_Ending.mp3'
};

// Cache for sound effect Audio objects
const sfxCache = {};

// Currently playing looping sounds
let currentTickingSound = null;

/**
 * Plays a sound effect.
 * @param {string} effectName - Name of the effect (fail, pop, success, ticking, timeToVote, drumRoll, error)
 * @param {number} volume - Volume level (0-1), default 0.5
 * @param {boolean} loop - Whether to loop the sound, default false
 * @returns {Audio|null} The audio object if created, null otherwise
 */
function playSoundEffect(effectName, volume = 0.5, loop = false) {
  if (!sfxEnabled) {
    console.log('SFX is disabled');
    return null;
  }

  const effectPath = soundEffects[effectName];
  if (!effectPath) {
    console.error('Unknown sound effect:', effectName);
    return null;
  }

  // Create new audio instance (allows multiple overlapping sounds)
  const audio = new Audio(effectPath);
  audio.volume = volume;
  audio.loop = loop;

  audio.play()
    .then(() => {
      console.log('SFX played:', effectName);
    })
    .catch(error => {
      console.log('Could not play SFX:', effectName, error);
    });

  return audio;
}

/**
 * Stops a currently playing sound effect.
 * @param {Audio} audio - The audio object to stop
 */
function stopSoundEffect(audio) {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/**
 * Toggles sound effects on/off globally.
 */
function toggleSoundEffects() {
  sfxEnabled = !sfxEnabled;
  console.log('SFX', sfxEnabled ? 'enabled' : 'disabled');
  updateSfxButton();
}

/**
 * Updates the SFX toggle button appearance.
 */
function updateSfxButton() {
  const sfxButton = document.getElementById('sfxToggleButton');
  if (sfxButton) {
    if (sfxEnabled) {
      sfxButton.textContent = '🔊 SFX';
      sfxButton.classList.remove('muted');
    } else {
      sfxButton.textContent = '🔇 SFX';
      sfxButton.classList.add('muted');
    }
  }
}

/**
 * Checks if sound effects are enabled.
 * @returns {boolean} True if SFX is enabled
 */
function isSfxEnabled() {
  return sfxEnabled;
}

/**
 * Plays a sound effect and returns a promise that resolves when it finishes.
 * @param {string} effectName - Name of the effect
 * @param {number} volume - Volume level (0-1), default 0.5
 * @returns {Promise} Promise that resolves when sound finishes playing
 */
function playSoundEffectWithCallback(effectName, volume = 0.5) {
  return new Promise((resolve, reject) => {
    if (!sfxEnabled) {
      console.log('SFX is disabled');
      resolve(); // Resolve immediately if SFX is disabled
      return;
    }

    const effectPath = soundEffects[effectName];
    if (!effectPath) {
      console.error('Unknown sound effect:', effectName);
      reject(new Error('Unknown sound effect'));
      return;
    }

    const audio = new Audio(effectPath);
    audio.volume = volume;

    // Resolve when sound finishes playing
    audio.addEventListener('ended', () => {
      console.log('SFX finished:', effectName);
      resolve();
    });

    // Handle errors
    audio.addEventListener('error', (error) => {
      console.log('Could not play SFX:', effectName, error);
      reject(error);
    });

    // Start playing
    audio.play()
      .then(() => {
        console.log('SFX started:', effectName);
      })
      .catch(error => {
        console.log('Could not play SFX:', effectName, error);
        reject(error);
      });
  });
}
