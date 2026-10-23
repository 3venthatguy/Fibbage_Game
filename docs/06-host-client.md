# 06 · Host Client (`public/host.html`)

The host page is the shared TV or projector screen. It **creates the room on page load**, shows the join code, lets the host pick a question pack, and runs the visual results reveal. It has no inputs apart from buttons.

## Page structure

```
body.theme-*               background theme class, switched by setTheme() (theme.js)
├── .bg-layer              fixed gradient + drifting topographic lines (outside the stage)
├── .audio-controls        #musicToggleButton #sfxToggleButton  (fixed, bottom-left)
├── #stage.stage           1920×1080 canvas, scaled to fit the window by stageScaler.js
│   ├── .room-code-lockup  #persistentRoomCodeBox > #persistentRoomCode  (top-left of the stage)
│   └── .container
│       ├── #lobbyScreen.lobby-screen(.active)
│       │     .lobby-left:  #gameTitle #roomCodeDisplay #gameRules
│       │     .lobby-right: #packageSelector>#packageCards #playerCount #playersGrid #startButton
│       ├── #gameScreen.game-screen
│       │     .question-header > #questionMascot, #questionNumber, #questionDisplay
│       │     #timerDisplay   #questionWave (wavy divider, also the phase timer)
│       │     #readingPhase  > .arc-text callout
│       │     #submitPhase   > .arc-text callout, #submitStatus, #submitCheckmarks (player status tags)
│       │     #votingPhase   > .arc-text callout, #answersGrid, .voting-footer > #votingStatus #votingCheckmarks
│       │     #resultsPhase  (filled at runtime: #answersRevealArea #correctAnswerArea
│       │                     #explanationArea #leaderboardArea #nextButton)
│       ├── #gameOverScreen.game-over-screen  .game-over-title #winnerCelebration #finalLeaderboard #playAgainButton
│       └── #errorMessage.error-message(.show)
└── #multiplierOverlay.round-card  (fixed full-window round card; deliberately OUTSIDE the stage)
```

**Background themes:** `theme-title` (lobby, game over), `theme-play` (reading/submit/voting), `theme-results` (results). Set from `socketHandlers.js` (`newQuestion`, `phaseChange`) and `showGameOverScreen`. The round card has its own lime/green background.

**How screens and phases switch:**
- **Screens** (`lobbyScreen`, `gameScreen`, `gameOverScreen`) switch by toggling the `.active` class.
- **Phases** inside `#gameScreen` switch by setting `element.style.display` (`'block'` or `'none'`). Each `show*Phase()` function hides its sibling phases.

## Script load order and globals

Everything is a **classic `<script>`**, so each file's top-level `function` and `let`/`const` become page globals. Order matters, and a file can only *call* functions that exist by the time the call runs:

| # | File | Globals it provides |
|---|---|---|
| 0 | `/socket.io/socket.io.js` (head) | `io` |
| 1 | `js/config.js` | `AUDIO_CONFIG`, `MULTIPLIER_CONFIG` |
| 1b | `js/shared/theme.js` (shared with player) | `setTheme`, `avatarFor`, `avatarForPlayer`, `questionMascot`, `tiltFor`, `escapeHtml`, `formatQuestion`, `createAvatarBadge`, `createPlayerTag`, `makeArcText`, `buildWavyDivider`, `drawWave` |
| 2 | `js/host/ui/uiUpdater.js` | `updatePlayersDisplay`, `renderPlayerStatus`, `updateStartButton`, `updateTimer` (also starts and stops the ticking sound at 5s), `stopTickingSound`, `showError`, `updateLeaderboard` (dead: `#leaderboard` doesn't exist) |
| 3 | `js/host/ui/timer.js` | `showTimer`, `hideTimer` |
| 4 | `js/host/ui/gameMusic.js` | `playRandomIntroMusic`, `playRandomGameMusic`, `playRandomEndingMusic`, `stopGameMusic`, `toggleMusic`, `updateMusicButton`, `isGameMusicPlaying`, `lowerMusicVolume`, `restoreMusicVolume` |
| 5 | `js/host/ui/soundEffects.js` | `playSoundEffect(name, vol, loop)` (returns the Audio), `stopSoundEffect`, `toggleSoundEffects`, `updateSfxButton` |
| 6 | `js/shared/roundCard.js` (shared with player) | `showRoundCard`, `showMultiplierAnnouncement`, `hideMultiplierAnnouncement` |
| 7 | `js/host/ui/stageScaler.js` | `STAGE_WIDTH`, `STAGE_HEIGHT`, `fitStage` (runs immediately) |
| 8 | `js/host/screens/lobbyScreen.js` | `hideLobbyScreen`, `showLobbyScreen` (unused) |
| 9 | `js/host/screens/submitScreen.js` | `showReadingPhase`, `showSubmitPhase(players)`, `updateSubmitStatus(players, submittedPlayerIds)`, `showAllAnswersSubmitted` |
| 10 | `js/host/screens/votingScreen.js` | `showVotingPhase(players)`, `displayVotingAnswers`, `updateVotingStatus(players, votedPlayerIds)`, `showAllVotesSubmitted` |
| 11 | `js/host/screens/resultsScreen.js` | `showResultsPhase`, all `handle*` results handlers, `displayResults` (legacy) |
| 12 | `js/host/screens/gameOverScreen.js` | `calculateRanksWithTies`, `showGameOverScreen` |
| 13 | `js/host/socketHandlers.js` | `setupHostSocketHandlers(socket, state)` |
| 14 | `js/host/hostMain.js` | `hostState`, **`socket`**, `initializeHost`, `createRoom`, `renderPackageCards` |

- `socket` and `hostState` are created last but **used inside functions** in earlier files (for example resultsScreen.js button handlers). That works because those functions only run later.
- **ES module exception:** `js/host/animations/resultsAnimations.js` uses `export` and is loaded with `await import('../animations/resultsAnimations.js')` inside resultsScreen.js handlers. The path resolves relative to the *script file*. It exports `highlightAnswer`, `showVoters` and `revealAuthor`, which are used, plus `animateScore`, `correctAnswerZoom`, `showConfetti`, `countUpScore` and `shakeElement`, which aren't (`showConfetti` is used internally). Its `playSound()` is an empty placeholder.
- `js/host/animations/particles.js` (also an ES module) is **never loaded**.
- New host scripts must be added to `host.html` in the right position. There's no bundler.

## hostState
```js
{ roomCode, currentPhase, players: [{id,name,score,connected}], selectedPackageId, availablePackages }
```
`currentPhase` mirrors `phaseChange` and drives ticking-sound and music choices. `gameStarted` briefly sets it to `'submit'` before `phaseChange{reading}` corrects it.

## Lifecycle

1. `DOMContentLoaded` → `initializeHost()`: registers socket handlers, wires buttons, calls `playRandomIntroMusic()` (does nothing, because music starts **disabled**), then `socket.emit('createRoom')`.
2. `roomCreated` fills in the room code (big and persistent), title, rules and package cards. Clicking a card emits `changePackage`.
3. `playerJoined` redraws `#playersGrid` as avatar + name tags (avatar = `avatarFor(index in players)`), padded with empty slots up to 8; 9+ players switch to 3 columns (`.crowded`). Start is enabled once there are 2 or more players (the limit is **hard-coded** in `updateStartButton`, not taken from config).
4. **Start** stops music, plays `timeToVote`, emits `startGame` and disables itself. `gameStarted` shows the ROUND ONE card.
5. `newQuestion` shows `#gameScreen`, sets the question HTML with `formatQuestion` (`_____` becomes an underline) and the mascot. `phaseChange` sets the theme, then calls `showReadingPhase(duration)`, `showSubmitPhase(players)`, `showVotingPhase(players)` or `showResultsPhase()`. For reading, submit and voting, `drawWave(#questionWave, timeRemaining)` draws the wave's light line across over the phase time; the number timer is hidden during reading.
6. `votingReady` → `displayVotingAnswers` puts tilted tape chips in `#answersGrid` (display only; the host doesn't vote). 7+ answers get `.many` (smaller chips).
   - Submit/vote status: `renderPlayerStatus` draws one tag per player and lights up the ids in `submittedPlayerIds` / `votedPlayerIds` from the server.
7. Results: see below. **Show Leaderboard** emits `showLeaderboard`; **Next Question** emits `nextQuestion`.
8. `gameOver` → `showGameOverScreen`: ties share a rank, plus `successEnding` SFX. **Play Again** runs `location.reload()` (new room).

## Results reveal on the host

State lives in module-level `let`s in [resultsScreen.js](../public/js/host/screens/resultsScreen.js): `currentSequenceId`, `answerElements: Map<answerId, cardEl>`, `currentAnswerElement`, `currentDrumRoll`, `animationState`.

- `showResultsPhase()` (on `phaseChange{results}`) shrinks the question (`.results-mode`), builds or clears the `#resultsPhase` skeleton, and **resets `currentSequenceId = null`**.
- `results:startSequence` sets `currentSequenceId` and then, **after 100ms**, builds a card for every answer and dims them all.
- Every other `results:*` handler returns early unless `data.sequenceId === currentSequenceId`, and most also require `currentAnswerElement`. Late events from an older sequence get dropped this way.
- Fake reveal: highlight → "IT'S A LIE!" stamp → voter avatar tags → author scorecard → fade-out. Truth reveal: highlight and vibrate → "THE TRUTH!" stamp, label turns green → "Knew The Truth" scorecard → `+points`. The explanation uses **innerHTML** (question data is trusted). The leaderboard hides everything else; player names are escaped with `escapeHtml`.
- Layout is CSS-only: while a card has `.answer-highlighted` (and not `.fade-out`), `:has()` hides the other cards and the highlighted one becomes a grid (label on top, voters left, scorecard right). Each card's label is `.answer-text.tape`.
- `handleUpdateCorrectScores` finds points cells with `.author-table-points[data-player-id=…]`. Keep it scoped: status tags and voter tags also carry `data-player-id`.
- The **Next Question** button is created inside the skeleton, so `hostMain.setupButtonHandlers` can't find it at load time. `handleShowNextButton` attaches its `onclick` instead.

## Stage scaling (no scrolling)

[stageScaler.js](../public/js/host/ui/stageScaler.js) and the `.stage` rule in host.css.
- `#stage` is `position:absolute; width:1920px; min-height:1080px; transform-origin: top left`, and `html, body` are `overflow:hidden`.
- `fitStage()` computes `scale = min(innerWidth/1920, innerHeight/max(1080, stage.offsetHeight))` and centers the stage with `translate(...) scale(...)`. It runs on `resize` and from a `ResizeObserver` on `#stage`, so if content grows past 1080px (lots of players, an expanded results card) the whole stage shrinks instead of scrolling. A 0.3s `transition` smooths these changes.
- **Rules that follow from this:**
  - Anything `position: fixed` **inside** `#stage` is positioned relative to the stage, not the window, because transformed ancestors change how fixed positioning works. Put true full-window layers **outside** `#stage`, as `.bg-layer` and `#multiplierOverlay` are.
  - Screens use `min-height: 1080px` (not `height`) so a tall results reveal grows the stage and the scaler shrinks it, instead of clipping.
  - Lay host content out in 1920×1080 "design pixels". Viewport units (`vw`/`vh`) inside the stage won't match the stage.
  - `getBoundingClientRect()` returns *scaled* coordinates. Divide by the current scale before using them to position elements inside the stage.

## Round cards

[shared/roundCard.js](../public/js/shared/roundCard.js) (same file on host and player) fills `#multiplierOverlay.round-card`: an avatar "hero" badge, two black tape stripes with the round's points ("500 for everyone you fool" / "1000 for finding the truth", × multiplier) and a big title.
- `gameStarted` → `showRoundCard(1, 1, MULTIPLIER_CONFIG.roundOneDuration)`: ROUND ONE, during the server's 2s `GAME_START_DELAY`.
- `multiplierAnnouncement{type}` → `showMultiplierAnnouncement`: double = ROUND TWO with `RevealSound.mp3`, triple = FINAL ROUND with `EvilString.mp3`. It lasts `fadeToBlack + textZoomIn + holdDuration + fadeOut` = 5300ms, matching the server's wait.

The sounds play through `new Audio(...)` directly, **ignoring the SFX toggle**.
