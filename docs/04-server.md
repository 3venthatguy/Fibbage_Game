# 04 · Server Modules

CommonJS (`require` / `module.exports`), with JSDoc on every function. Dependencies are `express` and `socket.io` only. There are no tests.

## server.js: entry point
[server/server.js](../server/server.js)
- Creates Express, an http server and Socket.io (`cors.origin = config.CORS_ORIGIN`).
- `setupRoutes(app)` serves `public/` statically and sends `host.html` for `/`.
- `setupSocketHandlers(io, gameManager)`: on each connection it registers the five event modules ([socket/socketHandler.js](../server/socket/socketHandler.js)).
- Runs `setInterval(gameManager.cleanupEmptyRooms, CLEANUP_INTERVAL)`.
- Listens on `0.0.0.0:PORT` and logs localhost and LAN URLs.

## GameManager: room registry
[server/gameManager.js](../server/gameManager.js). Created once in server.js.

| Field | Meaning |
|---|---|
| `rooms: Map<roomCode, GameRoom>` | every live room |
| `socketToRoom: Map<socketId, roomCode>` | host and player sockets |
| `socketToPlayer: Map<socketId, {roomCode, playerId}>` | **player sockets only** (the host isn't in here) |

Key methods:
- `createRoom(hostSocketId, packageId?)` (line 25): generates a code, loads the package's questions, and picks `QUESTIONS_PER_GAME` random **indices** without repeats (`generateRandomQuestionIds`, line 90). It builds a `questionLoader = index => questions[index]` and stores `gameRoom.packageId`.
- `joinRoom`, `startGame`, `submitAnswer`, `submitVote`, `nextQuestion`: look up the room (throwing `'Room not found'` if missing) and delegate to GameRoom.
- `transitionToVoting(gameState)`, `calculateResults(gameState)`, `getShuffledAnswers(gameState)`: take a GameState and look up the room by `gameState.roomCode`. This is legacy style.
- `handleDisconnect(socketId)` (line 246): returns `null` for any socket not in `socketToPlayer`, **which includes the host**. For players it calls `gameRoom.handleDisconnect(playerId)` and `transferHostIfNeeded(socketId)`, then deletes the mappings.
- `cleanupEmptyRooms()`: deletes rooms where `gameRoom.isEmpty()` (see GameRoom below).
- `reconnectPlayer(socketId, roomCode, playerId, reconnectToken)`: used by `rejoinRoom`. Calls `gameRoom.rejoinPlayer`, **deletes the old socket's map entries first** (so the stale socket's late `disconnect` is a no-op), then maps the new socket. Returns `{player, previousSocketId}`.
- **Dead code**: `getPlayerBySocket`.

## GameRoom: rules for one room
[server/game/GameRoom.js](../server/game/GameRoom.js). Throws `Error(message)` for invalid actions. The message is shown to the user.

| Method | Line | Behavior |
|---|---|---|
| `addPlayer(name, socketId)` | 27 | phase must be lobby, reading or submit; `sanitizePlayerName` (trim, max 20, UPPERCASE); unique name (`hasPlayerName` also checks `leftPlayers`) |
| `startGame(hostSocketId)` | 54 | host only; ≥ MIN_PLAYERS; lobby only; `loadQuestion(0)` |
| `loadQuestion(index)` | 77 | past the end: phase `gameOver`. Otherwise `setQuestion` (resets answers, votes, timer), phase `reading`, timer 8s |
| `transitionToSubmit()` | 94 | phase `submit`, timer 40s |
| `submitAnswer(playerId, answer)` | 106 | phase submit; time > 0; player exists; `isAnswerValid` (not the truth); stores **`answer.toUpperCase()`**; auto `transitionToVoting()` once everyone has submitted. A player can resubmit and **overwrite** their answer (there's no "already submitted" check) |
| `transitionToVoting()` | 141 | phase `voting`, timer 20s |
| `submitVote(playerId, votedForId)` | 153 | phase voting; time > 0; not own answer (handles comma ids); target exists in players or leftPlayers; no double vote; auto phase `results` once everyone has voted |
| `calculateResults()` | 234 | delegates to ScoreCalculator. **Doesn't change the phase** |
| `nextQuestion(hostSocketId)` | 247 | host only; does nothing unless phase is results; `loadQuestion(i+1)` |
| `handleDisconnect(playerId)` | 275 | lobby: `removePlayer`. Otherwise `markPlayerLeft` |
| `transferHostIfNeeded(oldSocketId)` | 308 | if `hostId === oldSocketId`, gives host to `players[0]`. Because of how GameManager calls it, this only runs for a *player* socket, so in practice it never fires |
| `rejoinPlayer(playerId, token, socketId)` | 284 | finds the player in `players` or `leftPlayers`, checks `reconnectToken` (throws `Session expired`), `restoreLeftPlayer` if needed, `player.reconnect(socketId)`. Returns `{player, previousSocketId}` (the old socket if the player was still active) |
| `getShuffledAnswers()` | 268 | shuffles once per round and caches in `gameState.shuffledAnswers`, so a rejoiner sees the same voting order |
| `isEmpty()` | 366 | true when `players` is empty **and** either nobody is in `leftPlayers` or the room has been in that state for `REJOIN_GRACE_PERIOD` (`emptySince`) |

`questionLoader` is public and gets reassigned by `changePackage` ([roomEvents.js](../server/socket/events/roomEvents.js)).

## GameState: per-room data
[server/game/GameState.js](../server/game/GameState.js)

```js
{
  roomCode, hostId,                 // hostId = host socket id
  players: Player[],                // ACTIVE players only
  leftPlayers: Map<playerId, {id, name, score, player, vote}>,  // left mid-game; player + vote kept for rejoin
  nextJoinOrder,                    // counter for Player.joinOrder
  shuffledAnswers,                  // this round's voting order (GameRoom.getShuffledAnswers), null until voting
  phase,                            // see 02-game-flow.md
  currentQuestionIndex,             // -1 before start
  currentQuestion,                  // {question, answer, explanation}
  selectedQuestionIds: number[],    // indices into the package's questions array
  submittedAnswers: {playerId: UPPERCASED_TEXT},  // keeps left players' answers
  votes: {playerId: votedForId | null},           // null = didn't vote (timer expiry)
  timer: Timer,
  currentMultiplier                 // unused field; use getCurrentMultiplier()
}
```

Notable methods: `getCurrentMultiplier()`, `shouldShowMultiplierAnnouncement()`, `isSubmitPhaseComplete()` / `isVotingPhaseComplete()` (these count **active** players only and are false when there are 0 players), `markPlayerLeft()`, `restoreLeftPlayer()` (puts the `Player` back **sorted by `joinOrder`** so avatars don't move, and restores the vote if still in voting), `getPlayerName()` (adds "(left)"), `resetRound()` (also clears `shuffledAnswers`), `getPlayersClientData()`.

## Player
[server/game/Player.js](../server/game/Player.js): `{id, name, socketId, score, connected, joinOrder, reconnectToken}`. `reconnectToken` is a random UUID sent **only** to that player (in `gameState` / `rejoinSuccess`); `toClientData()` returns `{id,name,score,connected}` and never includes it. `generateId()` produces `player_<Date.now()>_<9 base36 chars>`. `reconnect(socketId)` rebinds the socket on rejoin; `disconnect()` is unused.

## Timer
[server/game/Timer.js](../server/game/Timer.js). A wall-clock countdown: it stores `startTime` and `duration` and doesn't tick by itself.
- `getTimeRemaining()` returns `ceil((duration − elapsed)/1000)` with a floor of 0, or the frozen value while paused.
- `pause()` / `resume()`. `reset()` clears everything, **including pause state**.
- `timerBroadcast.js` does the ticking (see below).

## AnswerManager
[server/game/AnswerManager.js](../server/game/AnswerManager.js)
- `getShuffledAnswers(gameState)`: groups `submittedAnswers` by **exact text** (all uppercased, so effectively case-insensitive), so duplicate lies become a single card. It adds the truth card `{id:'correct', playerIds:['correct'], text: answer}`, then shuffles with Fisher-Yates. Each entry is `{id, playerIds, text, isCorrect}`.
- `filterAnswersForPlayer(answers, playerId)`: drops the lies this player wrote (single or shared) and maps to `{id, text}`. Used by `rejoinRoom`; the three voting transitions still inline the same filter.
- `isAnswerValid(answer, correct)`: false when the answer equals the truth after trimming and lowercasing.
- `GameRoom.getShuffledAnswers()` caches the result for the round, so the voting order is fixed once voting starts. The results screen uses a **separate** shuffle (ResultsAnimator), so card order differs between voting and results.

## ScoreCalculator
[server/game/ScoreCalculator.js](../server/game/ScoreCalculator.js). Covered in [05-scoring.md](05-scoring.md). Side effect: it **calls `player.addScore()`**, so you must call it exactly once per round. `startResultsAnimation` is the only caller.

## ResultsAnimator
[server/game/ResultsAnimator.js](../server/game/ResultsAnimator.js). One instance per results phase, stored in `activeAnimators` (a module-level `Map` in resultsEvents.js, keyed by room code; it's never cleared).
- `playResultsSequence(results)` (line 30) rebuilds the answer groups (adding "(left)" to names) and works out `voters` for each fake answer. It reveals **only fakes that got votes**, in random order, then the truth. The full timeline is in [02-game-flow.md](02-game-flow.md#inside-results).
- `getVotersForAnswer` handles comma ids on both sides. Voters who have since left are filtered out.
- `showScoreboard` stores `leaderboardData` and emits `results:showLeaderboardButton`. After that, everything waits on the host.
- `showLeaderboardNow()` (line 422) emits `gameOver` on the last question and `results:showLeaderboard` otherwise.
- Timing constants come from `config.RESULTS_ANIMATION_TIMINGS`. `correctVoterAppearStagger` and `scoreboardAnimation` are defined there but never used.

## socket/timerBroadcast.js
[server/socket/timerBroadcast.js](../server/socket/timerBroadcast.js)
- `startTimerBroadcast(io, roomCode, gameManager)` starts a `setInterval` every `TIMER_BROADCAST_INTERVAL` (1000ms). Each tick:
  - If the room is gone, it clears the interval.
  - If the timer is paused, it skips the tick (the interval keeps running).
  - If `timeRemaining > 0`, it emits `timerUpdate`.
  - Otherwise it calls the expiry handler for the current phase (reading, submit or voting). Each handler clears its own interval, and reading and submit start a fresh one.
- No interval handle is stored per room, so intervals can't be cancelled from outside. See [12-known-issues.md](12-known-issues.md#timer-broadcast-intervals-can-leak-and-double-up).

## socket/events/*
| File | Handles |
|---|---|
| [roomEvents.js](../server/socket/events/roomEvents.js) | `getPackages`, `createRoom`, `changePackage`, `joinRoom` (with mid-game catch-up), `rejoinRoom` (restores a saved seat, drops the stale socket, sends a `rejoinSuccess` snapshot) |
| [gameEvents.js](../server/socket/events/gameEvents.js) | `startGame`, `nextQuestion` (with multiplier announcement delay) |
| [playerEvents.js](../server/socket/events/playerEvents.js) | `submitAnswer`, `submitVote`, and the emits for the transitions they cause |
| [resultsEvents.js](../server/socket/events/resultsEvents.js) | `showLeaderboard`; exports `startResultsAnimation` (required lazily by others to avoid a circular require) |
| [connectionEvents.js](../server/socket/events/connectionEvents.js) | `disconnect`: refreshed player list, `playerDisconnected`, auto-completes submit or voting |

The block that emits the voting transition (`allAnswersSubmitted`, then after a delay `votingReady` per socket and `phaseChange`) is **copy-pasted in three places**: playerEvents.js, timerBroadcast.js and connectionEvents.js. Change all three together, or extract a helper first.

## utils
- [validation.js](../server/utils/validation.js): `sanitizePlayerName` is used (it throws if the name isn't a string). `sanitizeAnswer`, `isValidPlayerName` and `isValidAnswer` are **not used**. Answers aren't length-capped or trimmed on the server (only `.toUpperCase()` is applied), so the client's 100-character limit is the only cap.
- [logger.js](../server/utils/logger.js): `console.log` wrappers. Many modules also call `console.log` directly with `[ModuleName]` prefixes.
- [roomCodeGenerator.js](../server/utils/roomCodeGenerator.js): 4 random characters from A–Z, retried until unused.
