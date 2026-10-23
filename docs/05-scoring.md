# 05 · Scoring

Source: [server/game/ScoreCalculator.js](../server/game/ScoreCalculator.js). Called once per round from `startResultsAnimation`, after which `player.score` already includes the round. The reveal animation only *shows* points that have already been awarded.

## Rules

Let `m` = `gameState.getCurrentMultiplier()` (1, 2 or 3; see [02-game-flow.md](02-game-flow.md#multiplier-schedule)).

| Event | Points to whom | Base (config key) | With multiplier |
|---|---|---|---|
| You vote for the truth | you | 1000 (`CORRECT_VOTE_POINTS`) | 1000 / 2000 / 3000 |
| Someone votes for your lie (you wrote it alone) | you, **per voter** | 500 (`FOOL_PLAYER_POINTS`) | 500 / 1000 / 1500 |
| Someone votes for a lie that 2+ players wrote | **each** author, **per voter** | 250 (`DUPLICATE_FOOL_POINTS`) | 250 / 500 / 750 |
| You don't vote (timer ran out) | nothing | (the vote is stored as `null`) | none |

- Duplicate points are a **fixed reduced amount per author**, not a split. Two authors fooling 3 people get 3 × 250 × m **each**.
- You can't vote for a lie you wrote: the server checks this, and players never see their own lie.
- You can't submit the truth: `isAnswerValid` rejects it with "You can't fool someone with the truth!".

## Answer and vote ID forms

Every vote target (`votes[voterId]`) and answer card id is one of:

| Form | Example | Meaning |
|---|---|---|
| `'correct'` | `'correct'` | the true answer |
| single player id | `'player_1712_ab12cd'` | a lie written by one player |
| comma-joined ids | `'player_a,player_b'` | the same lie (exact uppercase text) written by several players |
| `null` | `null` | didn't vote before the timer ran out |

When a vote targets a comma id, the calculator takes the **first** id, looks up that player's answer text, and credits **every** player in `answerGroups.get(text)`.

## Players who left mid-game

- Their answer stays in `submittedAnswers`, so it can still be voted for and still appears in results as "NAME (left)".
- They're added to `roundScores` and `voteCounts` for display, but `addScore` only runs for **active** `players`, so **they get nothing**.
- In a duplicate group, the active co-authors still get the full duplicate amount.

## Return value (`results`)

```js
{
  correctAnswer, explanation,
  roundScores: {playerId: pointsThisRound},
  totalScores: [{id,name,score,connected}],   // after this round
  votes: {voterId: votedForId|null},
  voteCounts: {playerId: timesVotedFor},
  multiplier,
  baseCorrectVotePoints, baseFoolPlayerPoints, baseDuplicateFoolPoints,
  correctVotePoints, foolPlayerPoints, duplicateFoolPoints   // already multiplied
}
```

## Where points are shown

- Host "Fooled By / Won" table: `public/js/host/animations/resultsAnimations.js` → `revealAuthor`. It shows `+<per-voter points>` with `x<voterCount>` when 2 or more people were fooled.
- Host "Knew The Truth" table: `handleUpdateCorrectScores` in `public/js/host/screens/resultsScreen.js`.
- Leaderboard and game over: from `sortedPlayers` / `finalScores`. Ties share a rank on the host game-over screen (`calculateRanksWithTies`) but **not** on the player game-over screen.

## Unreachable branch

ScoreCalculator gives correct-vote points if a voter picked a *player's* answer whose text equals the truth. That can't happen, because truthful answers are rejected at submit time. You can leave it alone.
