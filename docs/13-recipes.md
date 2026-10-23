# 13 · Recipes for Common Changes

Each recipe lists the files to touch, in order. After any change, run through the checks in [14-running-and-testing.md](14-running-and-testing.md).

## Add or edit questions
1. Edit `server/data/packages/<pack>.js` → `questions[]`. Follow the rules in [09-question-packages.md](09-question-packages.md): a `_____` blank, an UPPERCASE answer, and an explanation.
2. Run the validation one-liner from that doc.
3. Restart the server.

## Add a question package
1. Create `server/data/packages/<id>.js` with `{id, name, description, icon, questions:[…]}`, with at least 6 questions.
2. Register it in `server/data/packages/index.js`: `require` it and add `<id>: pkg` to `packages`.
3. Nothing else is needed. The host receives `availablePackages` in `roomCreated` and draws a card. The cards are 200px wide in a 700px-wide selector. The inline `flex-wrap: wrap` in host.html overrides `nowrap` in host.css, so a 4th card wraps onto a second row, and the lobby gets taller (the stage scaler absorbs that).
4. To make it the default, change `getDefaultPackageId()` in index.js. The `DEFAULT_PACKAGE` config key is **not** read.

## Change the number of questions or the multiplier schedule
1. `server/config.js`: `QUESTIONS_PER_GAME`. Set `QUESTIONS_BEFORE_DOUBLE` / `QUESTIONS_BEFORE_TRIPLE` so the triple lands on the last question. `shouldShowMultiplierAnnouncement` always calls the triple question "FINAL QUESTION!".
2. Update the `GAME_RULES` text ("You'll play through 6 …").
3. Make sure every package has at least that many questions.

## Change phase durations or points
Edit `server/config.js` only (`*_PHASE_DURATION`, `*_POINTS`). Clients get durations from `phaseChange.timeRemaining`. The ticking sound starts at 5s and the timer turns red at 10s; both are hard-coded in `updateTimer` on the host and `updatePlayerTimer` on the player.

## Change the results reveal
- The **pace and order** are on the server: `RESULTS_ANIMATION_TIMINGS` in config, plus the sequence in `ResultsAnimator.playResultsSequence` and `revealFakeAnswer` / `revealCorrectAnswer`.
- The **visuals** are on the host: the matching `handle*` in `public/js/host/screens/resultsScreen.js`, the helpers in `public/js/host/animations/resultsAnimations.js`, and CSS in **host-animations.css**.
- For a new step: emit `results:<name>` with `sequenceId` from the animator and `await this.delay(...)`. Add `socket.on('results:<name>')` in host `socketHandlers.js` that calls a new `handle<Name>` in resultsScreen.js, and start that handler with the `sequenceId` guard. Document it in [03-socket-events.md](03-socket-events.md).

## Add a socket event
1. **Server:** add `socket.on('<event>', (payload) => { try { … } catch (e) { socket.emit('error', e.message); logError('…', e); } })` to the `server/socket/events/*.js` file for that area. Put rules (validation, state changes) in a `GameRoom` method that throws on invalid input. For host-only actions, compare `gameState.hostId === socket.id`.
2. **Clients:** add `socket.on('<event>', …)` in `public/js/<host|player>/socketHandlers.js`, and put the DOM work in that client's `screens/` or `ui/` files.
3. **Docs:** add a row to [03-socket-events.md](03-socket-events.md).

## Add a new phase
1. Add the phase name to the transitions in GameRoom, a duration in config, and an expiry handler in `timerBroadcast.js` if it's timed.
2. Emit `phaseChange{phase, timeRemaining}`.
3. Add a branch for it in **both** clients' `phaseChange` handler and a `show*Phase` function that hides the other phases. Add a container `<div style="display:none">` in both HTML files.
4. Check the music mapping in `playMusicForCurrentPhase` (host gameMusic.js).
5. Update [02-game-flow.md](02-game-flow.md).

## Add a host or player script file
1. Create the file in the right `ui/` or `screens/` folder as a classic script with top-level `function`s and a JSDoc header comment (match the existing files).
2. Add a `<script>` tag in `host.html` / `player.html` in dependency order (see [06-host-client.md](06-host-client.md#script-load-order-and-globals)).
3. Avoid top-level `const`/`let` names that might collide with other scripts.

## Add a sound effect or music track
- **SFX:** put the MP3 in `public/sounds/effects/`, add `name: 'sounds/effects/<file>.mp3'` to `soundEffects` in host `soundEffects.js`, add a volume key to `AUDIO_CONFIG` in `public/js/config.js`, then call `playSoundEffect('name', AUDIO_CONFIG.X)`.
- **Music:** put the MP3 in `intro/`, `playing/` or `endings/` **and** add its path to the matching array in host `gameMusic.js`.

## Change host layout
- Design at **1920×1080**. The stage scales automatically. Don't add `vw`/`vh` or `position: fixed` inside `#stage` for full-window effects. Put full-window overlays next to `#multiplierOverlay` instead.
- Check for inline styles in host.html and duplicate selectors in host-animations.css before editing host.css.

## Fix the host-disconnect problem (suggested approach)
Track the host socket in `GameManager` (for example in `socketToRoom` with a role). On disconnect, either keep the room alive for a grace period and let a host page **reclaim** it (send the room code from `sessionStorage` on reconnect, then reassign `hostId`), or end the game for all players with a message. `transferHostIfNeeded` (give host to a player) doesn't fit, because players have phone UIs with no host controls.

## Deploy online
1. Add a `.gitignore` (`node_modules/`, `.DS_Store`) and run `git rm -r --cached node_modules`.
2. Deploy to a Node host that supports WebSockets (Render, Railway or Fly.io). The start command is `npm start`, and `PORT` comes from the environment.
3. Players open `https://<app>/player.html`; the host opens `https://<app>/host.html` (or `/`).
4. Consider re-encoding `public/sounds/` to lower the bandwidth.
