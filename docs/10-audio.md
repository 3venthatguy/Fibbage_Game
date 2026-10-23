# 10 · Audio

Audio is a **host-only** feature, apart from the multiplier fanfare. Volumes are set in `AUDIO_CONFIG` ([08-config.md](08-config.md)).

## Toggles start OFF

`musicEnabled` and `sfxEnabled` both start as `false` ([gameMusic.js](../public/js/host/ui/gameMusic.js), [soundEffects.js](../public/js/host/ui/soundEffects.js)). The host has to click 🎵 and 🔊. This avoids browser autoplay errors. Every play call checks its flag and returns early when it's off.

## Music (gameMusic.js)

There's one `currentMusic` Audio element, looped, with a random track from each folder:

| Function | Folder | When |
|---|---|---|
| `playRandomIntroMusic()` | `sounds/intro/` (4 tracks) | page load (no-op while disabled); `toggleMusic` in the lobby |
| `playRandomGameMusic()` | `sounds/playing/` (13 tracks) | `phaseChange{submit}`; voting if nothing is playing |
| `playRandomEndingMusic()` | `sounds/endings/` (6 tracks) | `phaseChange{results}`, then `lowerMusicVolume(0.1)`. Continues into game over (`restoreMusicVolume(0.4)`) |
| `stopGameMusic()` | none | Start button, reading phase, `playTransitionSound`, before results |

`toggleMusic()` on → `playMusicForCurrentPhase()` picks a folder from `hostState.currentPhase`.

The track lists are **hard-coded arrays** in gameMusic.js. Adding an MP3 to a folder does nothing until you also add it to the array.

## Sound effects (soundEffects.js)

`playSoundEffect(name, volume, loop=false)` creates a **new** `Audio` each call (so sounds can overlap) and returns it so the caller can stop it.

| Name | File (`sounds/effects/`) | Trigger |
|---|---|---|
| `pop` | pop-sound.mp3 | player joins, answer submitted, vote cast |
| `timeToVote` | time_to_vote.mp3 | Start button; `playTransitionSound` before results |
| `ticking` | ticking_timer.mp3 (looped) | `updateTimer(5)` during submit or voting; stopped at 0, on any `phaseChange`, and when everyone has finished |
| `drumRoll` | drum_roll.mp3 | answer highlight and correct-answer highlight; stopped on lie or truth reveal |
| `error` | error.mp3 | "IT'S A LIE!" |
| `success` | success.mp3 | "THE TRUTH!" |
| `successEnding` | Success_Ending.mp3 | game over screen |

Played **directly**, bypassing the SFX toggle (`showMultiplierAnnouncement` in shared/roundCard.js, on host and player):
- `RevealSound.mp3` for the ROUND TWO (double) card
- `EvilString.mp3` for the FINAL ROUND (triple) card

The ROUND ONE card is silent (the host already plays `timeToVote` on Start).

`playSoundEffectWithCallback` exists but isn't used.

## File sizes and licensing

- `public/sounds/` is about 120 MB. Music files are 2.5–7 MB each, which is fine on a LAN but slow on a hosted deploy. Re-encoding at 96–128 kbps would cut that a lot.
- Many tracks appear to be copyrighted game or anime music. Keep this in mind before a public deploy or a public repo.

## Adding a sound

See [13-recipes.md](13-recipes.md#add-a-sound-effect-or-music-track).
