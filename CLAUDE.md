# CLAUDE.md

Jackbox-style "Fibbage" trivia game: a Node.js + Express + Socket.io server (`server/`) and two vanilla-JS clients (`public/host.html` for the TV, `public/player.html` for phones). No build step, no tests.

**Before changing code, read [docs/README.md](docs/README.md).** Its routing table points to the one or two docs each kind of task needs. The root `README.md`, `FILE_STRUCTURE.md`, `HOST_HTML_STRUCTURE.md` and `STARTUP_GUIDE.md` are outdated; trust `docs/`.

- Run: `npm start` → `http://localhost:3000/host.html` (host) and `/player.html` (players; open several tabs).
- The server is authoritative for phase, timers, scores and shuffling. Clients only render socket events ([docs/03-socket-events.md](docs/03-socket-events.md)).
- Client JS is classic `<script>` globals in a fixed load order, except `host/animations/resultsAnimations.js` (an ES module, dynamic `import()`).
- The host UI is a 1920×1080 stage scaled to fit the window. Don't use `vw`/`vh` or `position: fixed` inside `#stage`.
- Check [docs/12-known-issues.md](docs/12-known-issues.md) for traps (for example, the voting transition is copy-pasted in 3 files, and `calculateResults` mutates scores).
- When behavior changes, update the matching doc in `docs/` in the same change.
