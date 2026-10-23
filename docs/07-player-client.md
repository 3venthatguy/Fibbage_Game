# 07 · Player Client (`public/player.html`)

A phone controller. The player enters a room code and name, writes a lie, votes, then gets told to "Look at the TV!" during results. It plays **no music or SFX**, apart from the multiplier announcement sounds (see below).

## Page structure

```
body.theme-*                  background theme (title on join/lobby/game over, play in game, results while watching)
├── .bg-layer                 fixed gradient + topographic lines
├── #playerNameBadge          (fixed; avatar + name tag, shown after joining)
└── .container
    ├── #joinScreen           #joinGameTitle #roomCodeInput #playerNameInput #joinButton
    ├── #lobbyScreen(.active) #lobbyGameTitle #roomCodeDisplay #playersList
    ├── #gameScreen(.active, .watching)
    │     .question-top > #questionNumber #timerDisplay;  #questionDisplay;  #playerWave (wavy divider / phase timer)
    │     #readingPhase  > .reading-message
    │     #submitPhase   > #answerInput #charCounter #submitButton #submitWaiting
    │     #votingPhase   > .voting-heading #answersList #votingWaiting
    │     #watchScreen   (#watchAvatar + "Look at the TV!", shown right after voting and during results)
    ├── #gameOverScreen(.active) #thanksMessage #finalLeaderboard
    ├── #errorMessage(.show)
    └── #multiplierOverlay.round-card  (same markup and JS as the host)
```

The join screen is hidden with `style.display='none'`. The other screens use `.active`, and the phases use `style.display`, the same as the host. `.watching` on `#gameScreen` hides the question header and wave while the watch screen shows.

Avatars match the host: `avatarFor(index in the players list)`. `playerState.players` keeps the latest list from `playerJoined`, and the name badge and `#watchAvatar` refresh whenever it changes.

## Script load order (classic globals)

`/socket.io/socket.io.js` → `js/config.js` → `js/shared/theme.js` (shared helpers, see [06-host-client.md](06-host-client.md#script-load-order-and-globals)) → `js/player/ui/uiUpdater.js` (`updatePlayersList`, `myAvatar`, `updatePlayerTimer`, `showPlayerError`, `updateCharCounter`, `showPlayerNameBadge`, `updateMiniLeaderboard` (dead)) → `ui/timer.js` (`showPlayerTimer`, `hidePlayerTimer`) → `js/shared/roundCard.js` (shared with the host) → `screens/joinScreen.js` → `lobbyScreen.js` → `submitScreen.js` → `votingScreen.js` → `resultsScreen.js` → `gameOverScreen.js` → `socketHandlers.js` → `playerMain.js` (`playerState`, `socket`).

`js/player/animations/resultsAnimations.js` is an ES module that is **never loaded**. It's dead code from an earlier per-player results view.

Function names are prefixed (`showPlayerSubmitPhase`, `hidePlayerTimer`, …) to tell them apart from the host versions. The two pages never share a JS scope, but keep the convention.

## playerState
```js
{ roomCode, playerName, playerId, players, currentPhase:'join', submittedAnswer, submittedVote, selectedAnswerId }
```
(`players` is added by the `playerJoined` handler.)
It's also exposed as `window.playerState` for the screen modules.

## Lifecycle

1. **Join** ([joinScreen.js](../public/js/player/screens/joinScreen.js)): the room code is forced to uppercase alphanumerics, 4 characters; the name is capped at 20. Join is enabled when the code has 4 characters and the name isn't empty. Clicking it emits `joinRoom` and the button shows "Joining...".
2. **Identify self:** `gameState{playerId}` is the main path. The `playerJoined` handler also tries to find its own id by **name match**, which works because names are unique within a room. Either path shows the lobby and the name badge.
3. **Error while joining** (room not found, name taken, game in progress): a toast, and `resetJoinButton()` re-enables Join.
4. `newQuestion` resets the submit state, shows the game screen and hides the watch screen. `phaseChange` drives `showPlayerReadingPhase` / `showPlayerSubmitPhase` / `showPlayerVotingPhase` / `showPlayerResultsPhase`.
5. **Submit** ([submitScreen.js](../public/js/player/screens/submitScreen.js)): the input is uppercased live and capped at 100 characters. Submitting emits `submitAnswer`, sets `submittedAnswer = true` and locks the input ("Waiting for other players...").
   - The **"can't fool someone with the truth"** error is the only one that unlocks the input again. For any other submit error, such as "Time expired", the handler calls `resetJoinButton()` (wrong screen) and the input **stays locked**.
6. **Vote** ([votingScreen.js](../public/js/player/screens/votingScreen.js)): `votingReady` renders one button per answer. The server already removed this player's lie, and the client filters `answer.id !== playerId` as well, which only catches single-author ids. Tapping emits `submitVote`, then `showWatchScreen()` runs **immediately**, before the server confirms. If the vote is rejected, the player still sees the watch screen.
7. **Results**: every `results:*` handler is a no-op ([resultsScreen.js](../public/js/player/screens/resultsScreen.js)). The player stays on the watch screen.
8. **gameOver** → `showPlayerGameOverScreen`: plain `index+1` ranks (no tie handling), a "You finished Nth" sticker, and tape-bar rows with avatars (own row outlined).

## No reconnect

Refreshing or locking the phone (if the browser drops the socket) gives a **new** socket with no saved identity:
- In the lobby, the old player is removed and they can rejoin with the same name.
- Mid-game, the old player moves to `leftPlayers` and **the name is blocked** until a new room is made. They have to rejoin under a different name, and only during reading or submit.

## Round cards on phones

ROUND ONE / ROUND TWO / FINAL ROUND use the same code as the host ([06-host-client.md](06-host-client.md#round-cards)), with a portrait layout from `@media (orientation: portrait)` in theme.css. The ROUND TWO / FINAL ROUND cards play `RevealSound.mp3` / `EvilString.mp3` with `new Audio()` (so they ignore any toggle). Mobile autoplay rules usually block this unless the user has already interacted with the page.
