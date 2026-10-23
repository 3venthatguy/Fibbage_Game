# 14 · Running and Testing

## Run

```bash
npm install        # only if node_modules is missing (it is currently committed)
npm start          # = node server/server.js, port 3000 (or $PORT)
```

- Host: `http://localhost:3000/host.html` (or `/`)
- Players: `http://localhost:3000/player.html`. From phones on the same Wi-Fi, use `http://<LAN-IP>:3000/player.html`; the server prints the IP.
- **Multiple players on one machine:** open several `player.html` tabs or windows. Each tab is its own socket and player.
- No hot reload. Restart the server after server changes, and refresh the browser after client changes.
- If port 3000 is busy (`EADDRINUSE`), stop the other process or run `PORT=3001 npm start`.

## Automated tests

**There aren't any.** There's no test runner, linter or CI. Verification is manual. Useful quick checks:

```bash
# Server modules load without syntax errors
node -e "require('./server/gameManager'); require('./server/socket/socketHandler'); console.log('ok')"

# Question data is well-formed
#   → see the one-liner in 09-question-packages.md

# Static files are served
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/host.html
```

## Manual test checklist (one full game)

Use 1 host tab and at least 2 player tabs.

1. **Lobby:** the room code shows big and in the top-left lockup; package cards switch the selection; each player gets an avatar tag (the same avatar appears on their phone badge); Start stays disabled until 2 players join; names are uppercased; a duplicate name is rejected.
2. **Start:** the ROUND ONE card covers host and phones for about 2s.
3. **Reading:** the wave's light line draws across for about 8s; there's no number timer on the host. `_____` in the question shows as an underline.
4. **Submit:** typing the true answer gets "You can't fool someone with the truth!" and the input unlocks; each player's name tag lights up when **they** submit; everyone submitting skips the rest of the timer.
5. **Voting:** players don't see their own lie; the host sees every answer as a tape chip; two players writing the **same** lie produces one chip; voters' avatars light up under the timer.
6. **Results:** voted lies are revealed one by one with the IT'S A LIE! stamp, unvoted lies stay dimmed, then THE TRUTH!, the "Knew the truth" points, the explanation and the Show Leaderboard button. Next Question appears 3s after the leaderboard.
7. **Question 4:** the ROUND TWO card (1000 / 2000 points) covers the whole window. **Question 6:** FINAL ROUND (1500 / 3000). The reading phase starts just as the card fades.
8. **After Q6:** Show Leaderboard goes straight to Game Over on host and players; ties share a rank on the host.
9. **Disconnects:** close a player tab mid-submit and the status tags update. If everyone left has submitted, the game moves on to voting.
10. **Layout:** resize the host window (1366×768, 1024×768, 1920×1080) and check there's never a scrollbar (`document.documentElement.scrollHeight <= innerHeight`).

## Visual checks without a person (headless Chrome)

This works on this Windows machine (Chrome is at `C:/Program Files/Google/Chrome/Application/chrome.exe`). Start the server first, then run:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars \
  --user-data-dir="<scratch>/chrome-profile-<unique>" --virtual-time-budget=4000 \
  --window-size=1366,768 --screenshot="<scratch>/host.png" http://localhost:3000/host.html
```

- Use a **new `--user-data-dir` for each run**. Reusing one while a previous headless Chrome still holds it silently produces no screenshot.
- This only captures the lobby, because you can't join players from the command line. Mid-game screens need real player tabs (or a Socket.io client script; `socket.io-client` isn't installed).

## Debugging tips

- The server logs every room, join, phase transition, vote and results step with prefixes like `[GameEvents]`, `[TimerBroadcast]` and `[ResultsAnimator]`.
- The host browser console is very chatty during results (`[ResultsScreen]`). A `SEQUENCE ID MISMATCH - IGNORING EVENT` message means an event arrived for an old sequence.
- "Game stuck" usually means the host socket changed (a refresh), or a timer interval was lost. See [12-known-issues.md](12-known-issues.md).
