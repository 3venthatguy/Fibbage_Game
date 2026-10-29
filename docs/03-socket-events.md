# 03 · Socket Event Reference

This is the full contract between the server and the two clients. Handler locations:

- Server: `server/socket/events/*.js`, `server/socket/timerBroadcast.js`, `server/game/ResultsAnimator.js`
- Host: [public/js/host/socketHandlers.js](../public/js/host/socketHandlers.js)
- Player: [public/js/player/socketHandlers.js](../public/js/player/socketHandlers.js)

Delivery: **room** means `io.to(roomCode)`, which reaches the host and all players. **host** means `io.to(gameState.hostId)`. **sender** means `socket.emit`. **each player** means `io.to(player.socketId)`.

## Client → Server

| Event | Payload | Sent by | Server handler | Checks | Results |
|---|---|---|---|---|---|
| `createRoom` | `{packageId?}` (host sends none) | host on load | [roomEvents.js:27](../server/socket/events/roomEvents.js#L27) | none | sender: `roomCreated`; host socket joins the room |
| `getPackages` | none | **nobody** (unused) | roomEvents.js:16 | none | sender: `availablePackages{packages}` |
| `changePackage` | `{roomCode, packageId}` | host clicks a package card | roomEvents.js:51 | host only, lobby only, package must exist | re-picks question ids; sender: `packageChanged{packageId}` |
| `joinRoom` | `{roomCode, playerName}` | player | roomEvents.js:94 | room exists; phase ∈ lobby/reading/submit; name not taken (case-insensitive, includes `leftPlayers`) | room: `playerJoined`; sender: `gameState`, plus `phaseChange` and `newQuestion` when joining mid-game |
| `rejoinRoom` | `{roomCode, playerId, reconnectToken, playerName}` | player, on every socket `connect` while it has a saved session | roomEvents.js (`rejoinRoom`) | room exists; token matches the player (active or in `leftPlayers`). In the lobby an unknown player is re-added with `joinRoom` under `playerName` | room: `playerJoined` (with phase and submitted/voted ids); sender: `rejoinSuccess` or `rejoinFailed`. A still-connected old socket for that player is disconnected |
| `startGame` | `{roomCode}` | host Start button | [gameEvents.js:17](../server/socket/events/gameEvents.js#L17) | host only; ≥2 players; phase lobby | see [02-game-flow.md](02-game-flow.md) |
| `submitAnswer` | `{roomCode, answer}` | player | [playerEvents.js:16](../server/socket/events/playerEvents.js#L16) | sender is a player; phase submit; time > 0; answer ≠ truth (case-insensitive, trimmed) | room: `answerSubmitted`; may start the voting transition |
| `submitVote` | `{roomCode, votedForId}` | player taps an answer | playerEvents.js:81 | phase voting; time > 0; not own answer; target exists (active or left); not already voted | room: `voteSubmitted`; may start the results transition |
| `showLeaderboard` | `{roomCode}` | host "Show Leaderboard" button | [resultsEvents.js:19](../server/socket/events/resultsEvents.js#L19) | **no host check** | `results:showLeaderboard` (+3s `results:showNextButton`), or `gameOver` on the last question |
| `nextQuestion` | `{roomCode}` | host "Next Question" button | gameEvents.js:54 | host only; ignored unless phase is results | `multiplierAnnouncement`?, `newQuestion`, `phaseChange{reading}` |
| `disconnect` | built-in | any | [connectionEvents.js:16](../server/socket/events/connectionEvents.js#L16) | handles players only (host isn't tracked) | room: `playerJoined` (refreshed list), `playerDisconnected`; may auto-advance the phase |

The `submitAnswer` and `submitVote` handlers look up the player from `socket.id` but use the **client-supplied `roomCode`** to find the room.

## Server → Client: lobby and setup

| Event | Delivery | Payload | Host handles | Player handles |
|---|---|---|---|---|
| `roomCreated` | sender | `{roomCode, packageId, gameTitle, gameRules, availablePackages:[{id,name,description,icon,questionCount}]}` | sets the room code, title, rules and package cards | none |
| `packageChanged` | sender | `{packageId}` | highlights the selected card | none |
| `playerJoined` | room | `{players:[{id,name,score,connected}], phase?, totalPlayers?, submittedCount?, submittedPlayerIds?, voteCount?, votedPlayerIds?}` (from a disconnect: only `{players}`; vote fields only from a rejoin) | redraws the player grid and Start button, pop sound, redraws the submit status tags (reading/submit) or voted marks (voting) | stores `players` (avatars come from list order), updates the player list and name badge; **finds its own id by matching its name** |
| `gameState` | sender (joiner) | `{phase, currentQuestionIndex, totalQuestions, playerId, reconnectToken, gameTitle, gameRules, currentQuestion?, timeRemaining?, joinedMidGame?}` | none | stores `playerId`, saves the session (`reconnectToken`), shows lobby and name badge, sets title |
| `rejoinSuccess` | sender (rejoiner) | `{roomCode, playerId, playerName, reconnectToken, players, phase, gameTitle, timeRemaining, hasSubmitted, hasVoted, question?, questionIndex?, totalQuestions?, votingAnswers?:[{id,text}] (voting), finalScores? (gameOver)}` | none | saves the session, hides the banner, redraws the screen for `phase` |
| `rejoinFailed` | sender (rejoiner) | `{reason}` | none | clears the session, back to the join screen with code and name filled in, toast |
| `playerDisconnected` | room | `{phase:'submit', submittedCount, submittedPlayerIds, totalPlayers}` or `{phase:'voting', voteCount, votedPlayerIds, totalPlayers}` | redraws the status tags from the id list | none |
| `error` | sender | a **string** message | toast | toast; on the "truth" error it unlocks the answer input, otherwise it resets the Join button |

## Server → Client: round flow

| Event | Delivery | Payload | Emitted from |
|---|---|---|---|
| `gameStarted` | room | `{ duration }` (= `GAME_START_DELAY` ms) | gameEvents.js (start). Both clients show the ROUND ONE card for `duration` |
| `newQuestion` | room (or sender on mid-join; a rejoin gets the question inside `rejoinSuccess` instead) | `{question, questionIndex, totalQuestions, multiplier?}` | gameEvents.js, roomEvents.js |
| `phaseChange` | room (or sender on mid-join) | `{phase, timeRemaining}` | gameEvents, timerBroadcast, playerEvents, connectionEvents, resultsEvents |
| `timerUpdate` | room | `{timeRemaining}` (whole seconds) | timerBroadcast.js, every 1s while > 0 and not paused |
| `answerSubmitted` | room | `{submittedCount, submittedPlayerIds, totalPlayers}` | playerEvents.js. The host lights up each id's name tag |
| `allAnswersSubmitted` | room | none | playerEvents / timerBroadcast / connectionEvents |
| `votingReady` | host gets all answers; each player gets the list without their own lie | `{answers:[{id, text}]}` | same three places |
| `voteSubmitted` | room | `{voteCount, votedPlayerIds, totalPlayers, votedForId}` | playerEvents.js. The host lights up each id's avatar |
| `playTransitionSound` | room | none | before results (3s ahead) |
| `multiplierAnnouncement` | room | `{type:'double'|'triple', multiplier:2|3}` | gameEvents.js (nextQuestion). Clients show it as the ROUND TWO / FINAL ROUND card |
| `gameOver` | room | `{finalScores:[{id,name,score,connected}]}` sorted by score descending | ResultsAnimator.showLeaderboardNow (last question) or gameEvents.js |
| `resultsReady` | room | full results object | **only a fallback** if the animator throws (legacy) |

Answer `id` values in `votingReady` and `results:*`: a player id, `'correct'`, or a comma-joined list of player ids for a lie that several players wrote. See [05-scoring.md](05-scoring.md).

## Server → Client: results timeline (`results:*`)

All of these are sent to the room by [ResultsAnimator.js](../server/game/ResultsAnimator.js) and all carry a `sequenceId` (`Date.now()` when the animator was created). The **host ignores any event whose `sequenceId` doesn't match the latest `results:startSequence`**. The player handlers are no-ops ("Look at the TV!").

| Event | Extra payload | Host handler (resultsScreen.js) |
|---|---|---|
| `results:startSequence` | `fakeAnswerCount, timings, answers:[{id,text,isCorrect}]` | `handleResultsStartSequence`: builds the cards and dims them all |
| `results:highlightAnswer` | `answerId, answerText, index` | `handleHighlightAnswer`: undims and enlarges the card, drum roll |
| `results:revealLie` | `answerId, authorName, authorNames, isDuplicate, voters, pointsEarned` | `handleRevealLie`: "IT'S A LIE!" and error sound |
| `results:showVoters` | `answerId, voters:[{id,name}]` | `handleShowVoters`: voter chips |
| `results:revealAuthor` | `answerId, authorId, authorIds, authorName, authorNames, isDuplicate, isDuplicateTwoOrMore, pointsEarned, pointsPerPlayer, voterCount, multiplier, baseFoolPlayerPoints, foolPlayerPoints, duplicateFoolPoints` | `handleRevealAuthor`: "Fooled By / Won" table |
| `results:updateScore` | `playerId, pointsEarned, newTotalScore` | `handleUpdateScore`: **no-op** |
| `results:transitionNext` | `answerId` | `handleTransitionNext`: fades out the card |
| `results:highlightCorrectAnswer` | `answerText` | highlights and shakes the `'correct'` card, drum roll |
| `results:revealTruth` | `answerText` | "THE TRUTH!", green card, success sound |
| `results:showCorrectVoters` | `voters:[{id,name}]` | "Knew The Truth" table, or "Everyone was fooled!" |
| `results:updateCorrectScores` | `voters:[{id,name,pointsEarned,newTotalScore}], multiplier, correctVotePoints` | fills in `+points` cells |
| `results:showExplanation` | `explanation` | explanation box (innerHTML) |
| `results:showLeaderboardButton` | none | renders the "Show Leaderboard" button |
| `results:showLeaderboard` | `sortedPlayers, roundScores, totalScores` | hides everything else and shows the leaderboard |
| `results:showNextButton` | none | shows the "Next Question" button |
| `results:complete` | none | no-op |

The player handler also listens for `results:correctAnswerReveal`, which the server **never emits**.

## Adding a new event

See [13-recipes.md](13-recipes.md#add-a-socket-event). Briefly: add the server `socket.on` in the right `events/*.js` file, add `socket.on` in the client's `socketHandlers.js`, put the rendering in that client's `screens/` or `ui/` file, and document it in this file.
