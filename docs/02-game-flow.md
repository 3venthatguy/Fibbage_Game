# 02 · Game Flow and Phase State Machine

`gameState.phase` is one of `'lobby' | 'reading' | 'submit' | 'voting' | 'results' | 'gameOver'`. Only the server changes it. Clients learn about it from `phaseChange` (and `newQuestion` / `gameOver`).

## State diagram

```
           createRoom
               │
               ▼
           ┌───────┐  host startGame (≥ MIN_PLAYERS)
           │ lobby │──────────────────────────────┐
           └───────┘                              ▼
                                            ┌─────────┐
           ┌───────────────────────────────►│ reading │  8s (READING_PHASE_DURATION)
           │                                └────┬────┘
           │                    timer expiry     │ (timerBroadcast only)
           │                                     ▼
           │                                ┌────────┐
           │                                │ submit │  40s (SUBMIT_PHASE_DURATION)
           │                                └────┬───┘
           │   all players submitted  OR  timer expiry  OR  last non-submitter disconnects
           │                                     ▼
           │                                ┌────────┐
           │                                │ voting │  20s (VOTING_PHASE_DURATION)
           │                                └────┬───┘
           │      all players voted  OR  timer expiry  OR  last non-voter disconnects
           │                                     ▼
           │                                ┌─────────┐   server-timed reveal (ResultsAnimator),
           │       host nextQuestion        │ results │   then waits for host clicks
           └────────────────────────────────┴────┬────┘
                                                 │ host showLeaderboard on LAST question
                                                 ▼
                                          gameOver event (phase stays 'results', see note)
```

## Transition details

Each row says **what triggers it**, **where the code is**, and **what is emitted**.

### lobby → reading (game start)
- Trigger: host emits `startGame`. [gameEvents.js:17](../server/socket/events/gameEvents.js#L17)
- `GameRoom.startGame` checks that the sender is the host, that there are `players.length >= MIN_PLAYERS` (2), and that the phase is still lobby. It then calls `loadQuestion(0)`, which sets the question, resets answers, votes and timer, sets phase `reading` and starts an 8s timer.
- Emits `gameStarted{duration: GAME_START_DELAY}` right away. After `GAME_START_DELAY` (4000ms) it **restarts the timer** (so the countdown matches the client), then emits `newQuestion`, then `phaseChange{reading}`, and calls `startTimerBroadcast`.

### reading → submit
- Trigger: **only timer expiry**, in `handleReadingPhaseExpiry`. [timerBroadcast.js:49](../server/socket/timerBroadcast.js#L49)
- `GameRoom.transitionToSubmit()` sets phase `submit` and starts a 40s timer, then emits `phaseChange{submit}`. A new broadcast interval starts and the old one is cleared.

### submit → voting
There are three triggers, and all of them do the same emits:
1. **Everyone submitted.** `GameRoom.submitAnswer` calls `transitionToVoting()` itself, inside the rules layer. The handler in [playerEvents.js:16](../server/socket/events/playerEvents.js#L16) sees `phase === 'voting'` and runs the emits. The existing broadcast interval keeps running; no new one is started.
2. **Timer expiry.** `handleSubmitPhaseExpiry` [timerBroadcast.js:71](../server/socket/timerBroadcast.js#L71). It starts a new interval after the delay.
3. **A disconnect leaves everyone remaining as already submitted.** [connectionEvents.js](../server/socket/events/connectionEvents.js)

Emits: `allAnswersSubmitted` first. After `VOTING_TRANSITION_DELAY` (1000ms) it restarts the voting timer (20s), sends `votingReady` to the host with **all** answers and to each player with **their own lie removed**, then emits `phaseChange{voting}`.

Players who never submit still vote; they simply have no lie on the board.

### voting → results
1. **Everyone voted.** `GameRoom.submitVote` sets phase `results`. The handler [playerEvents.js:81](../server/socket/events/playerEvents.js#L81) **pauses** the timer, emits `playTransitionSound`, and calls `startResultsAnimation` after `RESULTS_TRANSITION_DELAY` (3000ms).
2. **Timer expiry.** `handleVotingPhaseExpiry` [timerBroadcast.js:120](../server/socket/timerBroadcast.js#L120) records a **`null` vote** for each non-voter, sets phase `results`, emits `playTransitionSound`, and starts results after 3000ms.
3. **A disconnect leaves everyone remaining as already voted.** Same as path 1.

### Inside results
`startResultsAnimation` [resultsEvents.js:41](../server/socket/events/resultsEvents.js#L41):
1. Bails out unless the phase is `results`.
2. `calculateResults()` **applies the round's points to `player.score` immediately** (see [05-scoring.md](05-scoring.md)).
3. Emits `phaseChange{results}`, waits 200ms, creates a `ResultsAnimator` and stores it in `activeAnimators[roomCode]`.
4. Calls `animator.playResultsSequence(results)`. This is the timeline below. If it throws, the server falls back to emitting the legacy `resultsReady`.

Reveal timeline (defaults from `RESULTS_ANIMATION_TIMINGS`):

```
results:startSequence (all answer cards, shuffled)              wait 2000
for each fake answer that got ≥1 vote (random order):
  results:highlightAnswer                                        1000
  (suspense)                                                     1500
  results:revealLie                                              1500
  results:showVoters                                             1000 × voters + 500
  results:revealAuthor                                           1000
  results:updateScore (one per active author, if points > 0)     1300
  (reaction)                                                     1500
  results:transitionNext                                         1000
  (between answers)                                              500
results:highlightCorrectAnswer                                   1000
(suspense)                                                       1500
results:revealTruth                                              1500
results:showCorrectVoters                                        500
results:updateCorrectScores                                      1300
results:showExplanation                                          4000
results:showLeaderboardButton  → server now WAITS for the host
results:complete
```

Fake answers that got **no votes** stay on screen dimmed and are never revealed.

### results → next question, or game over
- Host clicks **Show Leaderboard**, which emits `showLeaderboard` and calls `animator.showLeaderboardNow()` [ResultsAnimator.js:422](../server/game/ResultsAnimator.js#L422):
  - On a question that **isn't the last**: emits `results:showLeaderboard`. The handler then emits `results:showNextButton` 3000ms later.
  - On the **last question**: emits `gameOver{finalScores}` directly. `gameState.phase` is **not** set to `gameOver`; it stays `results`. The 3s `results:showNextButton` still fires but does nothing visible, because the host is on the game-over screen.
- Host clicks **Next Question**, which emits `nextQuestion` [gameEvents.js:54](../server/socket/events/gameEvents.js#L54). `GameRoom.nextQuestion` does nothing unless the phase is `results` (this guards against double clicks). It then calls `loadQuestion(i+1)`.
  - If `i+1` is past the end, it sets phase `gameOver` and the handler emits `gameOver`. Normally this is unreachable, because the last question goes through `showLeaderboard`.
  - If `shouldShowMultiplierAnnouncement()` matches (questions 4 and 6 with the defaults), it emits `multiplierAnnouncement{type, multiplier}` and waits `fadeToBlack + textZoomIn + holdDuration + fadeOut` from the **server** `MULTIPLIER_ANIMATION_TIMINGS` (5300ms) before the next question.
  - The next question restarts the timer at 8s and emits `newQuestion{…, multiplier}`, `phaseChange{reading}` and `startTimerBroadcast`.

## Multiplier schedule

From `GameState.getCurrentMultiplier()` [GameState.js:31](../server/game/GameState.js#L31), with `QUESTIONS_BEFORE_DOUBLE = 3` and `QUESTIONS_BEFORE_TRIPLE = 5`:

| Question # (1-based) | Multiplier | Announcement before it |
|---|---|---|
| 1–3 | 1× | ROUND ONE card at game start (client-only, on `gameStarted`) |
| 4–5 | 2× | ROUND TWO card |
| 6 | 3× | FINAL ROUND card |

The comments in `GameState.js` and `config.js` still describe the old 8-question layout (4–7 doubled, 8 tripled). Trust the numbers.

## Joining and leaving mid-game

- **Join**: allowed in `lobby`, `reading` and `submit` (checked in both [roomEvents.js:94](../server/socket/events/roomEvents.js#L94) and `GameRoom.addPlayer`). A mid-game joiner gets `gameState{joinedMidGame:true, …}`, then `phaseChange` and `newQuestion` for the current phase. Everyone gets `playerJoined`, and the host redraws its submit status tags.
- **Leave in the lobby**: the player is removed completely and the name becomes free again.
- **Leave mid-game**: `GameState.markPlayerLeft`. The player is removed from `players` but goes into `leftPlayers`. Their **submitted lie stays** in voting and results (shown as "NAME (left)"), they get **no points**, their vote is deleted, and **the name stays taken** for the rest of the game. The handler then checks whether the current phase is now complete (see the triggers above).
- **Host leaves**: nothing reacts to it. See [12-known-issues.md](12-known-issues.md#host-disconnect-orphans-the-room).

## Play Again

The host's **Play Again** button runs `location.reload()`. That creates a **brand-new room with a new code**. Players are left on their game-over screens and have to rejoin with the new code.
