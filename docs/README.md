# Fibbage Game: Documentation Index

This folder describes the codebase as it actually is. It is written to be read by Claude (or a developer) before changing code. Start here, then open only the file(s) the task needs.

> The root-level `README.md`, `FILE_STRUCTURE.md`, `HOST_HTML_STRUCTURE.md` and `STARTUP_GUIDE.md` are **out of date**: they mention `host.js`, 8 questions, 30s timers and "no audio". When they disagree with `docs/`, trust `docs/` and the code.

## What this project is (30-second version)

- A Jackbox-style **"Fibbage"** party trivia game: players write fake answers to fill-in-the-blank questions, then vote on which answer is true.
- **Node.js + Express + Socket.io** server (`server/`) holds all game state in memory. The browser clients in `public/` are vanilla JS with no build step and no framework.
- Two clients:
  - **Host** (`public/host.html`): the shared TV/projector screen.
  - **Player** (`public/player.html`): each person's phone controller.
- 3 question packs (Economics 101, Architecture 33, Bioinformatics 29). Each game is **6 questions**; points are 2× on questions 4–5 and 3× on question 6.
- Run it with `npm start` and open `http://localhost:3000/host.html`. It **cannot** run on GitHub Pages because it needs the Node server.

## Routing table: which doc to read

| If the task is about… | Read |
|---|---|
| Overall structure, how the pieces connect, deployment | [01-architecture.md](01-architecture.md) |
| Phases (lobby → reading → submit → voting → results → gameOver), timers, what triggers each transition | [02-game-flow.md](02-game-flow.md) |
| Any socket event: name, payload, who sends it, who handles it | [03-socket-events.md](03-socket-events.md) |
| Server classes (GameManager, GameRoom, GameState, Timer, ResultsAnimator, …) | [04-server.md](04-server.md) |
| Points, duplicates, multipliers, players who left | [05-scoring.md](05-scoring.md) |
| Host screen: DOM, script load order, globals, results reveal, stage scaling | [06-host-client.md](06-host-client.md) |
| Player (phone) screen | [07-player-client.md](07-player-client.md) |
| Tunable settings (durations, points, volumes, animation timings) | [08-config.md](08-config.md) |
| Question packs: format, adding questions or a new pack | [09-question-packages.md](09-question-packages.md) |
| Music and sound effects | [10-audio.md](10-audio.md) |
| CSS files, layout, class collisions | [11-styling.md](11-styling.md) |
| Known bugs, dead code, traps | [12-known-issues.md](12-known-issues.md) |
| Step-by-step recipes for common changes | [13-recipes.md](13-recipes.md) |
| Running, manual testing, verifying UI changes | [14-running-and-testing.md](14-running-and-testing.md) |

## Five facts that prevent most mistakes

1. **The server is authoritative.** Phase, timers, scores and answer shuffling all live on the server. Clients only render events. Never compute game outcomes client-side.
2. **Client JS is plain global scripts**, loaded in a fixed order by `<script>` tags. Functions are shared through globals, not imports. The exception is `public/js/host/animations/resultsAnimations.js`, an ES module loaded with dynamic `import()`. See [06-host-client.md](06-host-client.md#script-load-order-and-globals).
3. **Answer IDs are player IDs.** The correct answer's ID is the literal `'correct'`. A lie written by several players has a **comma-joined ID** (`"player_a,player_b"`). Code that touches votes must handle all three forms. See [05-scoring.md](05-scoring.md).
4. **Results run on a server-driven timeline** (`ResultsAnimator`). The server emits `results:*` events on timers, and the host filters them by `sequenceId`. To change the reveal, edit the server timeline and the host handler as a pair.
5. **Config is split.** `server/config.js` drives gameplay. `public/js/config.js` drives client audio and the multiplier animation. Some values are duplicated and already disagree (see [08-config.md](08-config.md)).

## Keeping these docs accurate

- When you change behavior, update the matching doc in the same change. The routing table above says where.
- Cite code as `path:line`. Line numbers drift, so re-check with grep before relying on them.
- Put new bugs or traps in [12-known-issues.md](12-known-issues.md) rather than scattering warnings.
