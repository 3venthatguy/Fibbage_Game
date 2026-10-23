# 09 · Question Packages

## Where they live

```
server/data/packages/
  index.js            registry + helpers
  economics.js        101 questions  (default)
  architecture.js      33 questions
  bioinformatics.js    29 questions
server/data/questions.js   legacy re-export of economics (nothing uses it)
```

## Package file format

```js
module.exports = {
  id: 'economics',               // must match the registry key in index.js
  name: 'Economics',             // card title on the host lobby
  description: '…',              // card subtitle
  icon: '📈',                    // card icon (inserted with innerHTML)
  questions: [
    {
      question: "The Dutch _____ Mania bubble of 1637 …",  // must contain "_____" (5 underscores)
      answer: "TULIP",                                      // UPPERCASE by convention
      explanation: "…"                                      // shown after the truth reveal
    },
    // …
  ]
};
```

**Rules every question should follow:**
- `question` contains `_____`. The blank is only shown, never filled in by code.
- `answer` is **UPPERCASE**. Player lies are uppercased before they're stored, and the duplicate grouping and the results display compare exact text, so a mixed-case truth would look different on the cards. The truth check itself (`isAnswerValid`) is case-insensitive.
- Keep answers short (1–3 words). The voting cards are about 300px wide, and players can only type 100 characters.
- `explanation` is put into the host page with `innerHTML`, so HTML would render. Don't put user content there.
- A package needs at least `QUESTIONS_PER_GAME` (6) questions, or games will be shorter.

## Validate after editing

All packages currently pass this check. Run it from the repo root:

```bash
node -e "
const p=require('./server/data/packages');
for (const [id,pkg] of Object.entries(p.packages)){
  const bad=pkg.questions.flatMap((q,i)=>[
    !q.question||!q.answer||!q.explanation ? i+': missing field' : null,
    q.question&&!q.question.includes('_____') ? i+': no blank' : null,
    q.answer&&q.answer!==q.answer.toUpperCase() ? i+': answer not uppercase' : null,
  ].filter(Boolean));
  console.log(id, pkg.questions.length, bad.length?bad:'OK');
}"
```

Duplicate keys in an object literal (for example two `answer:` lines) can't be caught at runtime, because the last one silently wins. To check for them, compare `grep -c '^\s*answer:'` with `grep -c '^\s*question:'` for each file.

## How a package gets used

1. The host page emits `createRoom` with no package, so `getDefaultPackageId()` returns `'economics'`.
2. `GameManager.createRoom` picks 6 random **indices** into `questions` and keeps a `questionLoader` closure.
3. When the host clicks a different card, `changePackage` swaps `gameRoom.questionLoader`, re-picks the indices and sets `gameRoom.packageId`. This only works in the lobby.
4. `GameRoom.loadQuestion(i)` calls `questionLoader(selectedQuestionIds[i])`.

The question objects are shared module data. Don't modify them at runtime.

## Adding a package

See [13-recipes.md](13-recipes.md#add-a-question-package).
