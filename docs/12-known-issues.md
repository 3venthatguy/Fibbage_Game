# 12 · Known Issues, Dead Code and Traps

Each entry is something that was confirmed in the code (as of this writing), with where to look. When you fix one, remove it here.

## Bugs and risky behavior

### Host disconnect orphans the room
The host socket isn't in `GameManager.socketToPlayer`, so `handleDisconnect` ([gameManager.js:246](../server/gameManager.js#L246)) returns `null` and `transferHostIfNeeded` never runs for the host. If the host tab refreshes or drops, players are stuck in a room nobody can advance: `nextQuestion`, `showLeaderboard` and `startGame` need the old host socket. Timers keep running until the voting phase ends. The room is only deleted once every player leaves.

### Timer broadcast intervals can leak and double up
When **everyone votes early**, [playerEvents.js](../server/socket/events/playerEvents.js) pauses the timer, but the broadcast interval from that phase is never cleared; it just skips ticks while paused. On `nextQuestion`, `loadQuestion` → `resetRound` → `timer.reset()` clears the pause, and `emitNextQuestion` starts **another** interval. Both now tick, so `timerUpdate` is emitted twice per second, and the count grows by one for each round that ends early. The phase transitions still happen once each (the second interval finds the phase already changed), but this is fragile. To fix it, store the interval handle on the room and clear it before starting a new one.

### Player submit input stays locked after most errors
On the player page, any submit error other than "can't fool someone with the truth" (for example "Time expired") leaves `submittedAnswer = true` and the input disabled. The handler calls `resetJoinButton()` instead ([player socketHandlers.js](../public/js/player/socketHandlers.js), `error` handler).

### The vote UI moves on before the server confirms
`showWatchScreen()` runs as soon as the player taps. If the server rejects the vote, the player never finds out.

### `showLeaderboard` has no host check
Any socket that knows the room code can trigger it ([resultsEvents.js:19](../server/socket/events/resultsEvents.js#L19)). By contrast, `startGame`, `nextQuestion` and `changePackage` check `hostId`.

### Player actions trust the client-sent `roomCode`
`submitAnswer` and `submitVote` find the player by `socket.id` but the room by the payload's `roomCode`. Using `socketData.roomCode` would be safer.

### Answers aren't sanitized on the server
Only `.toUpperCase()` is applied. There's no trim, no length cap and no empty check (`sanitizeAnswer` / `isValidAnswer` exist but aren't used). A non-string `answer` or `playerName` crashes that handler; it's caught and turned into an `error` event.

### Some server data is inserted with innerHTML
Package cards (`renderPackageCards`) and the explanation (`handleShowExplanation`) use innerHTML. That's trusted server data, but use `escapeHtml` (theme.js) or `textContent` for anything a player types. Player names in the leaderboard are already escaped.

### Rejoining players miss the round they were away for
A player who is in `leftPlayers` when `calculateResults` runs gets no points for that round (only active players get `addScore`). Their earlier score comes back when they rejoin. Fixing this means touching `calculateResults`, which mutates scores (see Traps).

### Mid-game join during reading shows the submit phase
`joinRoom` sends `phaseChange{reading}` **before** `newQuestion`, and the player's `newQuestion` handler calls `showPlayerSubmitPhase()`, so a brand-new joiner during reading sees the answer box early. The rejoin path (`rejoinSuccess`) doesn't have this problem.

### Answers can be overwritten
`GameRoom.submitAnswer` has no "already submitted" guard. The player UI prevents a second submit, but the server would accept one.

## Stale comments and docs
- The `GameState.getCurrentMultiplier` / `shouldShowMultiplierAnnouncement` comments and the `config.js` multiplier comments describe an 8-question game (2× on Q4–7, 3× on Q8). The real schedule is Q4–5 2× and Q6 3×.
- The default text in host.html and player.html says "Question 1 of 8"; it's overwritten at runtime.
- Root `README.md`, `FILE_STRUCTURE.md`, `HOST_HTML_STRUCTURE.md` and `STARTUP_GUIDE.md` are outdated. `docs/` is the source of truth.

## Dead code (safe to delete, or reuse)
| Item | Location |
|---|---|
| `getPlayerBySocket` | server/gameManager.js |
| `Player.disconnect`, the `connected` flag (always true) | server/game/Player.js |
| `GameState.currentMultiplier` field, `getCurrentQuestion`, `getPlayerName`, `resumeTimer` | server/game/GameState.js |
| `sanitizeAnswer`, `isValidPlayerName`, `isValidAnswer` | server/utils/validation.js |
| `server/data/questions.js` | legacy |
| `getPackages` / `availablePackages` event | roomEvents.js (the host never asks) |
| `TOTAL_QUESTIONS`, `AUTO_ADVANCE_DELAY`, `DEFAULT_PACKAGE`, `MAX_ANSWER_LENGTH`, `particlesDuration`, `correctVoterAppearStagger`, `scoreboardAnimation` | server/config.js |
| `resultsReady` / `displayResults` / `displayPlayerResults` (only a fallback) | both clients |
| `public/js/host/animations/particles.js` (never loaded) | host |
| Unused exports in `host/animations/resultsAnimations.js` (`animateScore`, `correctAnswerZoom`, `countUpScore`, `shakeElement`) and the empty `playSound()` | host |
| `updateLeaderboard` (targets the missing `#leaderboard`), `showLobbyScreen`, `playSoundEffectWithCallback`, `isSfxEnabled`, `isMusicEnabled` | host |
| `hideMultiplierAnnouncement` | shared/roundCard.js |
| `public/js/player/animations/resultsAnimations.js` (never loaded; its stylesheet was removed), `updateMiniLeaderboard`, `showVotingWaiting`, all the `handlePlayer*` stubs, the `results:correctAnswerReveal` listener | player |

## Repo hygiene
- `node_modules/` (about 1,000 files) and `.DS_Store` files are **committed**, and there's no `.gitignore`.
- `public/sounds/` is about 120 MB and contains possibly copyrighted music.

## Traps when editing
- **The voting transition is copy-pasted 3×**: playerEvents.js, timerBroadcast.js, connectionEvents.js. Change all three.
- **`calculateResults` mutates scores.** Calling it twice double-awards points.
- **Comma-joined answer ids.** Any vote or answer logic must handle `'correct'`, single ids, `'a,b'` and `null`.
- **The host's `#nextButton` is created at runtime.** Attach handlers in `handleShowNextButton`, not at load.
- **`position: fixed` inside the host `#stage` isn't viewport-fixed** (it's under a transformed ancestor).
- **Results CSS lives only in host-animations.css** ([11-styling.md](11-styling.md)). Don't add results rules to host.css.
- **`[data-player-id]` is not unique.** Status tags, voter tags and scorecard points all carry it. Scope selectors (for example `.author-table-points[data-player-id=…]`).
- **Avatars come from list order.** Host and player both use `avatarFor(index in players)`. If the server ever reorders `players`, avatars change.
- **Classic-script globals.** All host scripts share one global scope (so do all player scripts). A top-level `let`/`const` whose name is already declared in an earlier script throws `SyntaxError: Identifier has already been declared`. **That whole script then doesn't run**, so none of its functions exist, which usually shows up as an unrelated "X is not defined" error. Use distinctive names, or wrap new code in a function.
