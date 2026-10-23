# 11 · Styling

Plain CSS with no preprocessor or framework. The look follows **Fibbage 4**: saturated gradients with drifting topographic lines, black "tape" labels with white uppercase text, condensed display type, wavy dividers, and emoji avatars on white cut-out badges.

## Files

| File | Loaded by | Contents |
|---|---|---|
| [public/css/theme.css](../public/css/theme.css) | host.html and player.html (1st) | fonts, color tokens, background themes, shared components, round card |
| [public/css/host.css](../public/css/host.css) | host.html (2nd) | base reset, `html/body` no-scroll, `.stage`, room code lockup, lobby, game screen (question, timer, wave, reading/submit/voting), game over, error toast, package cards, audio toggles |
| [public/css/host-animations.css](../public/css/host-animations.css) | host.html (3rd) | **all** results styles: reveal layout, stamps, voters, scorecards, confetti, explanation, leaderboard rows (also reused by game over), Next/Show Leaderboard buttons |
| [public/css/player.css](../public/css/player.css) | player.html (2nd) | mobile layout: name badge, join, lobby, game, phases, watch screen, game over, error toast |

Assets: [public/fonts/](../public/fonts/) (self-hosted **Anton** for display text, **Archivo** 700/800/900 for everything else; SIL OFL, licenses alongside) and [public/img/topo.svg](../public/img/topo.svg) (tileable contour lines, generated once; used only as a CSS mask).

## Tokens and themes (theme.css)

- Colors are CSS variables on `:root`: `--ink`, `--paper`, `--white`, `--lime`, `--yellow`, `--truth`, `--lie`, `--teal-1/2`, … plus `--font-display` / `--font-body` and `--shadow-hard`.
- Background themes are classes on `<body>`, switched with `setTheme(name)` from [theme.js](../public/js/shared/theme.js): `theme-title`, `theme-play`, `theme-results`, `theme-round`. Each sets `--bg-gradient` and `--topo-color`.
- `.bg-layer` (a fixed div outside the stage) paints the gradient; its `::after` masks a solid `--topo-color` with `topo.svg` and drifts slowly.

## Shared components (theme.css)

| Class | What it is |
|---|---|
| `.tape` | black strip, white uppercase Archivo 900, torn edges via `clip-path`, rotated by `--tilt` |
| `.tape--light` | paper variant (black text) |
| `.tape-button` | hover/press feedback for tape buttons |
| `.display-title` | Anton, uppercase, tight leading |
| `.avatar-badge` | white irregular circle holding an emoji; size via `--size` |
| `.player-tag` | avatar badge + tape name (built by `createPlayerTag`) |
| `.blank` | the underline that replaces `_____` in questions (`formatQuestion`) |
| `.wavy-divider` | SVG built by `buildWavyDivider`; `.wave-progress` is drawn over time by `drawWave` |
| `.arc-text` | letters fanned on an arc (built by `makeArcText`) |
| `.sticker` | small rotated yellow label (points, counters) |
| `.slap-in` | entrance: label slapped down (uses `--tilt`, `--delay`) |
| `.round-card` | full-window round card overlay (portrait layout via a media query) |

**Tilts:** most labels rotate by `--tilt`. Use `tiltFor(seed)` for a stable random-looking tilt so labels don't jump when re-rendered.

## Host layout model

- All host UI sits inside `#stage`, a **1920×1080 design canvas** scaled to fit the window ([06-host-client.md](06-host-client.md#stage-scaling-no-scrolling)). Size host elements in px at 1080p. Don't use `vw`/`vh` inside the stage.
- `.container` is the full 1920px. The game screen places the question header, timer, wave and phase areas with `position: absolute` at fixed stage coordinates; the results phase flows normally so tall reveals grow the stage.
- `.bg-layer`, `.audio-controls` and `.round-card` sit **outside** the stage and use real viewport positioning (so `vw`/`vh` are fine there).
- Voting answers: `.voting-phase .answer-card` (tape chips). Results cards: `.results-phase .answer-card` with an inner `.answer-text.tape`.
- The results reveal uses `:has()` to show only the card being revealed. All results styles are in host-animations.css; host.css has none.

## Screen and phase toggles

- `.lobby-screen`, `.game-screen` and `.game-over-screen` are `display:none` until `.active`.
- Phase containers start with inline `style="display:none"` and get toggled by JS.
- `.error-message` shows when it has `.show`.
- `.timer-warning` (red, shaking) applies when 10 seconds or fewer remain.
- `.results-mode` on `#questionDisplay` and `#questionNumber` shrinks them during results.
- `.status-tag.submitted` lights up a player's tag; `.just-done` plays the pop once.
- Player: `.watching` on `#gameScreen` hides the question header and wave.

## Player layout

Mobile-first, single column, inside `.container` (max 520px). The only media query is the portrait layout of the round card in theme.css. The host relies on the stage scaler.

## Reduced motion

`prefers-reduced-motion: reduce` stops the background drift, wobbles and bobbing, and shortens the entrances. Reveal timings still come from the server.
