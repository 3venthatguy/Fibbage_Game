# Economics Fibbage

A multiplayer Fibbage-style economics trivia game built with Node.js, Express, and Socket.io. Players compete by submitting fake answers to economics questions and trying to fool others into voting for their answers.

**Note:** This game is currently themed for economics topics, but can be easily customized for any subject matter.

## Features

- **Real-time multiplayer gameplay** using WebSocket communication
- **8 economics trivia questions** with fascinating facts about economic history
- **Dynamic scoring system**: 
  - +1000 points for voting for the correct answer
  - +500 points for each player who votes for your fake answer
- **Beautiful Jackbox-style UI** with vibrant gradients and smooth animations
- **Mobile-optimized player interface** for phone controllers
- **Large display host interface** for TV/projector viewing
- **Automatic timer management** with server-side synchronization
- **Room-based gameplay** with unique 4-letter room codes

## Download and Installation

### What You Need

- [Node.js](https://nodejs.org/) (version 14 or higher)
- A computer to run the server (this will be the host machine)
- All players must be on the same WiFi network

### Download Options

1. **Clone with Git:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Fibbage.git
   ```

2. **Download ZIP:**
   - Click the green "Code" button on GitHub
   - Select "Download ZIP"
   - Extract the ZIP file to your desired location

### Setup Instructions

1. **Navigate to the project directory:**
   ```bash
   cd Fibbage
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This will download all required packages (Express, Socket.io, etc.)

3. **Start the game server:**
   ```bash
   npm start
   ```
   You should see a message indicating the server is running on port 3000.

### Understanding Host vs WiFi Server

**Important:** This game requires all players to be on the same WiFi network.

- **The Host Machine**: The computer running `npm start` acts as both the game server and can display the host screen
- **WiFi Server**: When you start the game, your computer becomes a local server that other devices on your WiFi network can connect to
- **All Players Must Connect**: Every player needs to access your computer's IP address to join the game

### Accessing the Game

Once the server is running:

1. **Find your computer's local IP address:**
   - **Windows**: Open Command Prompt and type `ipconfig` (look for IPv4 Address)
   - **Mac**: Open Terminal and type `ipconfig getifaddr en0` or check System Preferences > Network
   - **Linux**: Open Terminal and type `hostname -I`

   Your IP will look something like `192.168.1.100`

2. **On the host computer (large display/TV):**
   - Open a web browser and go to: `http://localhost:3000/host.html`
   - Or use: `http://YOUR_IP_ADDRESS:3000/host.html`

3. **On player devices (phones/tablets):**
   - Make sure they're connected to the same WiFi network
   - Open a web browser and go to: `http://YOUR_IP_ADDRESS:3000/player.html`
   - Replace `YOUR_IP_ADDRESS` with the IP address from step 1
   - Example: `http://192.168.1.100:3000/player.html`

## How to Play

### For the Host

1. Open the host screen on a large display (TV, projector, or computer monitor)
2. A 4-letter room code will be automatically generated (e.g., "ABCD")
3. Share this room code with players
4. Wait for at least 2 players to join
5. Click "Start Game" when ready
6. For each question:
   - **Submit Phase**: Watch as players submit their fake answers
   - **Voting Phase**: See which answers players vote for
   - **Results Phase**: Reveal the correct answer and see scores
   - Click "Next Question" to continue
7. After all 8 questions, view the final leaderboard

### For Players

1. Open the player screen on your mobile device
2. Enter the 4-letter room code provided by the host
3. Enter your name (max 20 characters)
4. Click "Join Game"
5. Wait in the lobby until the host starts the game
6. For each question:
   - **Submit Phase (30 seconds)**: Type a convincing fake answer
   - **Voting Phase (20 seconds)**: Tap the answer you think is correct (you can't vote for your own)
   - **Results Phase**: See the correct answer, your points, and the leaderboard
7. After all questions, see your final rank!

## Game Mechanics

### Scoring System

- **Correct Answer Vote**: +1000 points for voting for the actual correct answer
- **Fooling Others**: +500 points for each player who votes for your fake answer
- Players cannot vote for their own answer

### Question Format

Each question has a blank (represented by "_____") that players must fill in. The correct answer is mixed in with all the fake answers during the voting phase.

### Timer System

- **Submit Phase**: 30 seconds to submit a fake answer
- **Voting Phase**: 20 seconds to vote for what you think is the correct answer
- Timers are synchronized across all devices via the server
- If all players complete a phase early, the game automatically advances

## Project Structure

```
economics-fibbage/
├── server/
│   ├── server.js          # Main Express + Socket.io server
│   ├── gameManager.js     # Game state management and logic
│   └── questions.js       # Question database
├── public/
│   ├── host.html          # Host display screen
│   ├── player.html        # Player mobile controller
│   ├── css/
│   │   ├── host.css       # Host screen styles
│   │   └── player.css     # Player screen styles
│   └── js/
│       ├── host.js        # Host screen logic
│       └── player.js      # Player screen logic
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Customization

### Changing the Game Name and Rules

1. **Game Title**: Edit the `<title>` tags in [public/host.html](public/host.html) and [public/player.html](public/player.html)

2. **Display Name**: Update the header in [public/host.html](public/host.html) (around line 30):
   ```html
   <h1>Your Game Name</h1>
   ```

3. **Scoring Rules**: Modify the scoring logic in [server/gameManager.js](server/gameManager.js):
   - Look for `CORRECT_ANSWER_POINTS` and `FOOL_POINTS` constants
   - Adjust the values in the `calculateScores` function

4. **Timer Duration**: Change timer lengths in [server/gameManager.js](server/gameManager.js):
   - Search for `SUBMIT_TIME` (default: 30 seconds)
   - Search for `VOTING_TIME` (default: 20 seconds)

### Changing the Questions

To customize questions for your topic:

1. Open [server/questions.js](server/questions.js)

2. Each question follows this format:
   ```javascript
   {
     question: "Your question text with _____ blank.",
     answer: "The correct answer",
     explanation: "An interesting fact or explanation."
   }
   ```

3. Replace the existing economics questions with your own:
   - Use `_____` (five underscores) where the answer should go
   - Keep answers concise (works best with 1-5 words)
   - Add engaging explanations to make the game educational

4. Add or remove questions as needed - the game adapts to any number of questions

**Example for a different topic (History):**
```javascript
{
  question: "The ancient Roman Colosseum could hold approximately _____ spectators.",
  answer: "50,000",
  explanation: "The Colosseum could hold between 50,000 to 80,000 spectators and hosted gladiator contests, animal hunts, and mock naval battles."
}
```

### Changing the Songs/Audio

Currently, the game does not include background music. To add audio:

1. **Add audio files**: Place MP3 or WAV files in a new `public/audio/` directory

2. **Background Music**: Add to [public/host.html](public/host.html):
   ```html
   <audio id="bgMusic" loop autoplay>
     <source src="/audio/your-music.mp3" type="audio/mpeg">
   </audio>
   ```

3. **Sound Effects**: Add to [public/js/host.js](public/js/host.js) or [public/js/player.js](public/js/player.js):
   ```javascript
   const correctSound = new Audio('/audio/correct.mp3');
   const wrongSound = new Audio('/audio/wrong.mp3');

   // Play when needed
   correctSound.play();
   ```

4. **Control volume in JavaScript:**
   ```javascript
   document.getElementById('bgMusic').volume = 0.3; // 30% volume
   ```

**Recommended sound events:**
- Question start
- Answer submission
- Voting complete
- Correct/incorrect answer reveal
- Game end

## Technical Details

### Technology Stack

- **Backend**: Node.js + Express
- **Real-time Communication**: Socket.io (WebSocket)
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: Modern CSS with gradients and animations

### Server Features

- Room-based game management
- Automatic timer synchronization
- Score calculation and validation
- Player reconnection handling
- Host transfer on disconnect
- Empty room cleanup

### Security Features

- Server-side answer shuffling
- Server-side score calculation
- Input validation and sanitization
- Vote validation (can't vote for own answer)
- Duplicate vote prevention

## Troubleshooting

### Players can't connect

- Make sure all devices are on the same network
- Check that the server is running
- Verify the room code is entered correctly (case-insensitive)
- Check firewall settings if connecting from different networks

### Timer not syncing

- The server manages all timers - refresh the page if timers seem off
- Check browser console for any errors

### Game not advancing

- Make sure the host clicks "Next Question" after results
- Check that all players have submitted/voted
- Refresh the page if the game seems stuck

## Development

### Running in Development

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

### Console Logging

The server logs important events to the console:
- Room creation
- Player joins/leaves
- Answer submissions
- Votes cast
- Score calculations

Check the server console for debugging information.

## License

ISC

## Credits

Game concept inspired by Jackbox Games' Fibbage series.
