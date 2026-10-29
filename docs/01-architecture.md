# 01 · Architecture

## Runtime model

```
 Phones (player.html) ──┐                      ┌── TV / projector (host.html)
                         │   Socket.io (WS)    │
                         ▼                     ▼
                ┌──────────────────────────────────────┐
                │  Node process: server/server.js       │
                │  Express  → serves public/ as static  │
                │  Socket.io → all game traffic         │
                │  GameManager (in-memory Map of rooms) │
                └──────────────────────────────────────┘
```

- **One Node process, one port** (`PORT` env or 3000). Express serves `public/` statically, and `/` serves `host.html` ([server/routes/index.js](../server/routes/index.js)).
- Socket.io serves its own client at `/socket.io/socket.io.js`. Both HTML pages load it from there, which is why the frontend **can't be hosted separately as static files** (for example on GitHub Pages) without changes.
- **All state is in memory.** There's no database, so restarting the server ends every game.
- The server listens on `0.0.0.0` and prints the LAN IP, so phones on the same Wi-Fi can join ([server/server.js](../server/server.js)).
- An empty-room sweep runs every `CLEANUP_INTERVAL` (5 min).

## Directory map

```
server/
  server.js                 Entry point: Express + Socket.io + cleanup interval
  config.js                 Gameplay constants (durations, points, multipliers, text, animation timings)
  gameManager.js            GameManager: registry of rooms; socketId → room/player maps; thin delegation layer
  routes/index.js           Static file serving + "/" → host.html
  game/
    GameRoom.js             Per-room game rules: add player, start, submit, vote, next question, disconnect
    GameState.js            Per-room data: players, phase, current question, answers, votes, timer, leftPlayers
    Player.js               Player model (id, name, socketId, score)
    Timer.js                Wall-clock countdown with pause/resume
    AnswerManager.js        Build the shuffled voting list (groups duplicate lies) + "is this the truth?" check
    ScoreCalculator.js      Round scoring (mutates player scores)
    ResultsAnimator.js      Server-timed results reveal; emits results:* events
  socket/
    socketHandler.js        Wires all event modules onto each connection
    timerBroadcast.js       1s interval: emits timerUpdate, handles timer-expiry transitions
    events/
      roomEvents.js         getPackages, createRoom, changePackage, joinRoom
      gameEvents.js         startGame, nextQuestion (+ multiplier announcement)
      playerEvents.js       submitAnswer, submitVote
      resultsEvents.js      showLeaderboard; startResultsAnimation()
      connectionEvents.js   disconnect handling (incl. auto-advancing a phase)
  data/
    packages/index.js       Package registry (economics, architecture, bioinformatics)
    packages/*.js           Question data
    questions.js            Legacy re-export of economics questions (unused)
  utils/
    validation.js           sanitizePlayerName (used); sanitizeAnswer/isValid* (unused)
    logger.js               console.log wrappers
    roomCodeGenerator.js    Random 4-letter A–Z code, unique among live rooms

public/
  host.html / player.html   The two clients
  js/config.js              Client config: AUDIO_CONFIG volumes, MULTIPLIER_CONFIG round card timings
  js/shared/                theme.js (themes, avatars, question formatting, wave) and roundCard.js, used by both clients
  js/host/                  Host client (see 06-host-client.md)
  js/player/                Player client (see 07-player-client.md)
  css/                      theme.css (shared), host.css, host-animations.css, player.css (see 11-styling.md)
  fonts/                    Self-hosted Anton + Archivo (.woff2, SIL OFL)
  img/                      topo.svg background contour lines
  sounds/                   intro/, playing/, endings/, effects/ MP3s (~120 MB)
```

## Layering on the server

```
socket/events/*.js  ──►  GameManager  ──►  GameRoom  ──►  GameState / Player / Timer
        │                                     │
        │                                     ├─► AnswerManager
        │                                     └─► ScoreCalculator
        └─► timerBroadcast.js, ResultsAnimator (emit directly via io)
```

- **Event handlers own sequencing**: emits, `setTimeout` delays and restarting timers. **GameRoom owns rules**: validation, phase changes and throwing errors.
- Errors thrown by GameRoom are caught in the handlers and sent back as `socket.emit('error', message)`. Clients show the message as a toast.
- The handlers often reach past GameManager straight into `gameState` (`gameState.startTimer`, `gameState.players`, `gameState.setPhase`). That's the existing style; there's no strict encapsulation.

## Identity model

- **Host**: whichever socket emitted `createRoom`. Its socket id is `gameState.hostId`, and it is **not** a `Player`. Host-only actions (`startGame`, `nextQuestion`, `changePackage`) compare `socket.id === hostId`.
- **Player**: created on `joinRoom`, with an id like `player_<timestamp>_<rand>`. `GameManager.socketToPlayer` maps the socket id to `{roomCode, playerId}`.
- **Reconnect** is by token, not socket id. Each player gets a secret `reconnectToken`; the phone keeps `{roomCode, playerId, playerName, reconnectToken}` in `localStorage` and sends `rejoinRoom` on every connect, which rebinds the player to the new socket (see [07-player-client.md](07-player-client.md#reconnect-and-rejoin)). The host has no reconnect.
- Rooms are addressed with Socket.io rooms named by the room code: `io.to(roomCode)` reaches the host and every player. Per-player messages use `io.to(player.socketId)`.

## Deployment constraints

- Needs a host that runs Node and supports WebSockets: Render, Railway, Fly.io, or a VPS. `npm start` runs `node server/server.js`.
- GitHub Pages alone won't work: there's no server, and `/socket.io/socket.io.js` would return 404.
- `node_modules/` is committed to git, and the audio is about 120 MB. Both slow down deploys (see [12-known-issues.md](12-known-issues.md)).
- CORS is `*` ([server/config.js](../server/config.js)).
