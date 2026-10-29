# 08 · Configuration

There are two config files: one for the server, one for the client.

## Server: [server/config.js](../server/config.js)

Loaded with `require('../config')`. Changes take effect after a server restart.

| Key | Default | Used by | Notes |
|---|---|---|---|
| `PORT` | `process.env.PORT \|\| 3000` | server.js | |
| `CORS_ORIGIN` | `"*"` | server.js | |
| `ROOM_CODE_LENGTH` / `ROOM_CODE_CHARS` | 4 / `A–Z` | roomCodeGenerator.js | The player input also allows digits, but codes never contain them |
| `CLEANUP_INTERVAL` | 5 min | server.js | Deletes rooms with 0 active players (see `REJOIN_GRACE_PERIOD`) |
| `REJOIN_GRACE_PERIOD` | 5 min | GameRoom.isEmpty | A room whose players have all left mid-game is kept this long (counted from the first sweep that sees it) so they can rejoin |
| `MIN_PLAYERS` | 2 | GameRoom.startGame | The host button has its own **hard-coded** `< 2` |
| `QUESTIONS_PER_GAME` | 6 | GameManager.generateRandomQuestionIds | **The real question count** |
| `TOTAL_QUESTIONS` | 6 | **unused** | |
| `MAX_PLAYER_NAME_LENGTH` | 20 | sanitizePlayerName | The client also caps at 20 |
| `MAX_ANSWER_LENGTH` | 100 | **unused** (only in the unused `sanitizeAnswer`) | The client caps at 100 |
| `READING_PHASE_DURATION` | 8 s | GameRoom, gameEvents, roomEvents | |
| `SUBMIT_PHASE_DURATION` | 40 s | GameRoom, timerBroadcast | |
| `VOTING_PHASE_DURATION` | 20 s | GameRoom, playerEvents, timerBroadcast, connectionEvents | |
| `GAME_START_DELAY` | 4000 ms | gameEvents (start) | Gap between `gameStarted` and the first `newQuestion`. Sent as `gameStarted{duration}`; the clients show the ROUND ONE card for that long |
| `NEXT_QUESTION_DELAY` | 0 | gameEvents | |
| `VOTING_TRANSITION_DELAY` | 1000 ms | 3 copies of the voting transition | |
| `RESULTS_TRANSITION_DELAY` | 3000 ms | before `startResultsAnimation` | Leaves time for the `time_to_vote.mp3` sting |
| `AUTO_ADVANCE_DELAY` | 3000 | **unused** | |
| `CORRECT_VOTE_POINTS` / `FOOL_PLAYER_POINTS` / `DUPLICATE_FOOL_POINTS` | 1000 / 500 / 250 | ScoreCalculator | See [05-scoring.md](05-scoring.md) |
| `QUESTIONS_BEFORE_DOUBLE` / `QUESTIONS_BEFORE_TRIPLE` | 3 / 5 | GameState | 2× on Q4–5, 3× on Q6. The comments in the file are stale |
| `DEFAULT_PACKAGE` | `'economics'` | **unused** | `packages/index.js` `getDefaultPackageId()` hard-codes `'economics'` |
| `GAME_TITLE` | `'INTRO TO MISINFORMATION'` | roomCreated, gameState | Shown on host and player |
| `GAME_RULES` | multi-line string | roomCreated, gameState | Host lobby, rendered with `white-space: pre-line`. It says "6 questions", so update it if the count changes |
| `TIMER_BROADCAST_INTERVAL` | 1000 ms | timerBroadcast | |
| `MULTIPLIER_ANIMATION_TIMINGS` | fade 500, zoom 800, hold 3500, fadeOut 500, particles 3500 | gameEvents | Only used to work out **how long the server waits** (5300ms); must match the client `MULTIPLIER_CONFIG` sum. `particlesDuration` is unused |
| `RESULTS_ANIMATION_TIMINGS` | see the file | ResultsAnimator | `correctVoterAppearStagger` and `scoreboardAnimation` are unused. The whole object is also sent to clients in `results:startSequence`, which ignore it |

## Client: [public/js/config.js](../public/js/config.js)

A classic script that sets `window.AUDIO_CONFIG` and `window.MULTIPLIER_CONFIG`. Changes take effect on browser refresh.

**`AUDIO_CONFIG`**: volumes from 0 to 1. Host only, except for the multiplier fanfare.

| Key | Default | Where it's used |
|---|---|---|
| `INTRO_MUSIC_VOLUME` | 0.5 | lobby music |
| `GAMEPLAY_MUSIC_VOLUME` | 0.4 | submit and voting music |
| `ENDING_MUSIC_VOLUME` | 0.1 | results music start |
| `RESULTS_MUSIC_LOWERED_VOLUME` | 0.1 | ducked during the reveal |
| `GAME_OVER_MUSIC_VOLUME` | 0.4 | raised again on game over |
| `SFX_PLAYER_JOIN_VOLUME`, `SFX_ANSWER_SUBMIT_VOLUME`, `SFX_VOTE_CAST_VOLUME` | 1 | pop sounds |
| `SFX_TIME_TO_VOTE_VOLUME` | 0.6 | on Start and before results |
| `SFX_TICKING_TIMER_VOLUME` | 0.5 | last 5 seconds of submit and voting |
| `SFX_DRUM_ROLL_VOLUME` | 0.8 | answer highlight |
| `SFX_LIE_REVEAL_VOLUME` / `SFX_TRUTH_REVEAL_VOLUME` | 1 | error and success stings |
| `SFX_SUCCESS_ENDING_VOLUME` | 0.7 | game over |
| `SFX_MULTIPLIER_FANFARE_VOLUME` | 0.6 | double/triple announcement (host **and** player) |

**`MULTIPLIER_CONFIG`** (round card timings, [shared/roundCard.js](../public/js/shared/roundCard.js)): `fadeToBlack 500`, `textZoomIn 800`, `holdDuration 3500`, `fadeOut 500`, `roundOneDuration 4000`.
- The ROUND TWO / FINAL ROUND card lasts the sum of the first four (5300ms). **Keep that equal to the server's `MULTIPLIER_ANIMATION_TIMINGS` sum**, which is how long the server waits before the next question.
- `roundOneDuration` is only a fallback: the ROUND ONE card uses the `duration` the server sends with `gameStarted` (`GAME_START_DELAY`). Change `GAME_START_DELAY` for a longer or shorter card.

## Client vs server mismatches

| Thing | Server | Client | Effect |
|---|---|---|---|
| Round card length | `MULTIPLIER_ANIMATION_TIMINGS` sum (5300ms) | `MULTIPLIER_CONFIG` sum (5300ms) | In sync today. If they drift apart, the reading phase starts under the card (or the card ends early). ROUND ONE no longer has this problem: its length comes from the server's `GAME_START_DELAY` via `gameStarted{duration}` |
| Min players to start | `MIN_PLAYERS` | hard-coded `2` in host `updateStartButton` | Change both |
| Max name / answer length | 20 / (none enforced) | 20 / 100 in the inputs and JS | The server doesn't enforce the answer limit |

## Text shown to players

- Title and rules: `GAME_TITLE` and `GAME_RULES` (server).
- The `<h1>` text in `player.html` (`INTRO TO MISINFORMATION`) and the `<title>`s are placeholders that get overwritten at runtime.
- Errors are the `throw new Error('...')` strings in GameRoom.js and roomEvents.js.
