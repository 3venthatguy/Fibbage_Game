# Host HTML File Structure and Contents

## File Location
`public/host.html`

## Overall Structure

### HTML Document Structure
- **DOCTYPE**: HTML5 (`<!DOCTYPE html>`)
- **Language**: English (`lang="en"`)
- **Title**: "Fibbage - Host"
- **CSS**: Links to [css/host.css](css/host.css) and [css/host-animations.css](css/host-animations.css)
- **Socket.IO**: Loads from `/socket.io/socket.io.js`

### Audio Controls (New Feature)
- **Fixed Position Controls**: Top right corner
- Music toggle button (`#musicToggleButton`)
- Sound effects toggle button (`#sfxToggleButton`)

## Main Container Structure

### Root Container
- **Element**: `<div class="container">`
- Contains all screen components and error messaging

## Screen Components

### 1. Lobby Screen
- **ID**: `lobbyScreen`
- **Class**: `lobby-screen active`
- **Purpose**: Initial screen for room setup and player waiting

**Child Elements**:
- `<h1 id="gameTitle">`: "Fibbage" (48px font, 20px bottom margin) - customizable game title
- `<div id="roomCodeDisplay" class="room-code-display">`: Displays room code (default: "----")
- `<div id="gameRules" class="game-rules">`: Displays game rules and instructions
- `<div id="playerCount" class="player-count">`: Shows player count (default: "Waiting for players...")
- `<div id="playersGrid" class="players-grid">`: Grid container for player list
- `<button id="startButton" class="start-button" disabled>`: Start game button (initially disabled)

### 2. Game Screen
- **ID**: `gameScreen`
- **Class**: `game-screen`
- **Purpose**: Main game interface during gameplay

**Child Elements**:
- `<div id="questionNumber" class="question-number">`: Displays current question (e.g., "Question 1 of 8")
- `<div id="timerDisplay" class="timer-display">`: Timer countdown display (default: "30")
- `<div id="questionDisplay" class="question-display">`: Displays the current question text

**Game Screen Sub-Phases**:

#### Reading Phase (New)
- **ID**: `readingPhase`
- **Class**: `reading-phase`
- **Display**: Initially hidden (`style="display: none;"`)
- **Purpose**: Gives players time to read the question
- **Child Elements**:
  - `<div id="readingProgressBar" class="reading-progress-bar">`: Visual progress bar
  - `<div class="reading-message">`: "Read the question..." message

#### Submit Phase
- **ID**: `submitPhase`
- **Class**: `submit-phase`
- **Display**: Initially hidden (`style="display: none;"`)
- **Child Elements**:
  - `<div id="submitStatus" class="submit-status">`: Status text (default: "Players are submitting answers...")
  - `<div id="submitCheckmarks" class="submit-checkmarks">`: Visual indicators for player submissions

#### Voting Phase
- **ID**: `votingPhase`
- **Class**: `voting-phase`
- **Display**: Initially hidden (`style="display: none;"`)
- **Child Elements**:
  - `<h2>`: "Vote for the correct answer!" (36px font, 30px bottom margin)
  - `<div id="votingStatus" class="voting-status">`: "Players are voting..." status text
  - `<div id="votingCheckmarks" class="voting-checkmarks">`: Visual indicators for player votes
  - `<div id="answersGrid" class="answers-grid">`: Grid container for answer options

#### Results Phase
- **ID**: `resultsPhase`
- **Class**: `results-phase`
- **Display**: Initially hidden (`style="display: none;"`)
- **Child Elements**: Dynamically created by [public/js/host/screens/resultsScreen.js](public/js/host/screens/resultsScreen.js)
  - Correct answer reveal with animations
  - Explanation display
  - Voting breakdown (who fooled whom)
  - Current leaderboard
  - Next question button

### 3. Game Over Screen
- **ID**: `gameOverScreen`
- **Class**: `game-over-screen`
- **Purpose**: Final screen showing game results

**Child Elements**:
- `<h1>`: "Game Over!" (64px font, 20px bottom margin)
- `<div id="winnerCelebration" class="winner-celebration">`: Winner announcement/celebration
- `<div id="finalLeaderboard" class="final-leaderboard">`: Final scores/leaderboard
- `<button id="playAgainButton" class="play-again-button">`: "Play Again" button

### 4. Error Message
- **ID**: `errorMessage`
- **Class**: `error-message`
- **Purpose**: Displays error notifications

## JavaScript Dependencies (Load Order)

### Configuration (Loaded First)
1. [js/config.js](js/config.js) - Audio and game configuration

### UI Utilities (Loaded Second)
2. [js/host/ui/uiUpdater.js](js/host/ui/uiUpdater.js) - UI update utilities
3. [js/host/ui/timer.js](js/host/ui/timer.js) - Timer functionality
4. [js/host/ui/gameMusic.js](js/host/ui/gameMusic.js) - Background music management
5. [js/host/ui/soundEffects.js](js/host/ui/soundEffects.js) - Sound effects management

### Screen Modules (Loaded Third)
6. [js/host/screens/lobbyScreen.js](js/host/screens/lobbyScreen.js) - Lobby screen logic
7. [js/host/screens/submitScreen.js](js/host/screens/submitScreen.js) - Submit phase logic
8. [js/host/screens/votingScreen.js](js/host/screens/votingScreen.js) - Voting phase logic
9. [js/host/screens/resultsScreen.js](js/host/screens/resultsScreen.js) - Results phase logic with animations
10. [js/host/screens/gameOverScreen.js](js/host/screens/gameOverScreen.js) - Game over screen logic

### Socket Handlers (Loaded Fourth)
11. [js/host/socketHandlers.js](js/host/socketHandlers.js) - Socket.IO event handlers

### Main Initialization (Loaded Last)
12. [js/host/hostMain.js](js/host/hostMain.js) - Main initialization and orchestration

## Element ID Reference

### Lobby Screen
- `lobbyScreen` - Main lobby container
- `roomCodeDisplay` - Room code display
- `playerCount` - Player count display
- `playersGrid` - Players list container
- `startButton` - Start game button

### Game Screen
- `gameScreen` - Main game container
- `questionNumber` - Question number display
- `timerDisplay` - Timer display
- `questionDisplay` - Question text display

### Reading Phase
- `readingPhase` - Reading phase container
- `readingProgressBar` - Progress bar for reading time

### Submit Phase
- `submitPhase` - Submit phase container
- `submitStatus` - Submission status text
- `submitCheckmarks` - Submission indicators

### Voting Phase
- `votingPhase` - Voting phase container
- `votingStatus` - Voting status text
- `votingCheckmarks` - Voting indicators
- `answersGrid` - Answer options grid

### Results Phase
- `resultsPhase` - Results phase container (content dynamically created)

### Game Over Screen
- `gameOverScreen` - Game over container
- `winnerCelebration` - Winner display
- `finalLeaderboard` - Final leaderboard
- `playAgainButton` - Play again button

### Error Handling
- `errorMessage` - Error message container

### Audio Controls
- `musicToggleButton` - Music on/off toggle
- `sfxToggleButton` - Sound effects on/off toggle

## CSS Classes Reference

### Screen Classes
- `container` - Main container
- `lobby-screen` - Lobby screen styling
- `game-screen` - Game screen styling
- `game-over-screen` - Game over screen styling

### Phase Classes
- `reading-phase` - Reading phase styling
- `submit-phase` - Submit phase styling
- `voting-phase` - Voting phase styling
- `results-phase` - Results phase styling

### Component Classes
- `audio-controls` - Audio control buttons container
- `audio-toggle-button` - Individual audio toggle button styling
- `room-code-display` - Room code display
- `game-rules` - Game rules display box
- `player-count` - Player count display
- `players-grid` - Players grid layout
- `start-button` - Start button styling
- `question-number` - Question number display
- `timer-display` - Timer display
- `question-display` - Question text display
- `reading-progress-bar` - Reading phase progress bar
- `reading-message` - Reading phase message
- `submit-status` - Submit status text
- `submit-checkmarks` - Submission checkmarks
- `voting-status` - Voting status text
- `voting-checkmarks` - Voting checkmarks
- `answers-grid` - Answers grid layout
- `winner-celebration` - Winner celebration display
- `final-leaderboard` - Final leaderboard display
- `play-again-button` - Play again button styling
- `error-message` - Error message styling

## State Management Notes

- Only one screen is active at a time (controlled by `active` class and `display: none` styles)
- The lobby screen starts with `active` class
- Game screen phases are controlled via `display: none` style attribute
- Start button is initially disabled (`disabled` attribute)

## External Dependencies

1. **Socket.IO Client**: Loaded from `/socket.io/socket.io.js`
2. **CSS Stylesheets**: [css/host.css](css/host.css) and [css/host-animations.css](css/host-animations.css)
3. **JavaScript Modules**: 12 separate JS files in specific load order

## Recent Updates

### Audio System
- Added background music support with toggle controls
- Added sound effects for game events
- Audio controls fixed in top-right corner
- Persistent audio preferences

### Animation System
- Added reading phase with progress bar
- Enhanced results phase with animations
- Improved visual feedback for player actions

### UI Enhancements
- Game rules display in lobby
- Customizable game title
- Enhanced voting phase with checkmarks
- Improved player status indicators
