# 🚀 Economics Fibbage - Startup Guide

## Prerequisites

Before starting, ensure you have:
- [Node.js](https://nodejs.org/) (version 14 or higher) installed
- All dependencies installed (run `npm install` if you haven't already)

## Quick Start

### 1. Install Dependencies (First Time Only)

```bash
npm install
```

This will download Express, Socket.io, and other required packages.

### 2. Start the Server

```bash
npm start
```

Or directly:

```bash
node server/server.js
```

### 3. Expected Output

You should see:

```
Economics Fibbage server running on port 3000

📱 Access from this computer:
   Host screen:   http://localhost:3000/host.html
   Player screen: http://localhost:3000/player.html

📱 Access from phone/other devices (same WiFi):
   Replace YOUR_IP with your computer's IP address:
   Host screen:   http://YOUR_IP:3000/host.html
   Player screen: http://YOUR_IP:3000/player.html
```

**Finding Your IP Address:**
- **Windows**: Open Command Prompt, type `ipconfig` (look for IPv4 Address)
- **Mac**: Open Terminal, type `ifconfig getifaddr en0` or check System Preferences > Network
- **Linux**: Open Terminal, type `hostname -I`

### 4. Access the Game

**IMPORTANT:** All devices (host computer and player phones/tablets) must be on the same WiFi network.

**From your computer (Host Display):**
- Open your web browser
- Go to: `http://localhost:3000/host.html`
- This will display the main game screen (for TV/projector)

**From phones/tablets (Player Controllers):**
- Make sure the device is connected to the same WiFi network
- Open a web browser on the phone/tablet
- Go to: `http://YOUR_IP:3000/player.html`
- Replace `YOUR_IP` with your computer's IP address
- Example: `http://192.168.1.100:3000/player.html`

---

## Important Notes

### ⚠️ Server Appears to "Hang"

**This is normal!** The server runs in the foreground and displays:
- Connection logs when players join
- Game events as they happen
- No output when idle (waiting for connections)

**To stop the server:** Press `Ctrl+C`

### ⚠️ Port Already in Use

If you see:
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

**Solution:** Kill the old process and restart

```bash
# Find process using port 3000
lsof -ti:3000

# Kill it (replace XXXX with the PID from above)
kill -9 XXXX

# Or kill all node server processes
pkill -9 -f "node server/server.js"

# Restart server
npm start
```

---

## Troubleshooting

### Problem: No output when running `npm start`

**This is normal!** The server is running and waiting for connections.

**To verify it's working:**
1. Open http://localhost:3000/host.html in a browser
2. You should see the game lobby screen
3. Check the terminal - you should see "Client connected: [socket-id]"

### Problem: Cannot connect from phone

**Check these:**
1. Phone and computer are on the same WiFi network
2. Use the IP address shown in server startup (not "localhost")
3. Some WiFi networks block device-to-device communication (try a different network)
4. Firewall may be blocking port 3000

### Problem: Server crashes or errors

**Check for:**
1. Missing node_modules: Run `npm install`
2. Wrong directory: Make sure you're in the `economics-fibbage` folder
3. Port already in use: See "Port Already in Use" above

---

## Server Logs

When the server is running, you'll see logs like:

```
Client connected: YTMFVrcTQH5ztrM0AAAB
Room created: A1B2 by host YTMFVrcTQH5ztrM0AAAB
Player Alice joined room A1B2
Player Bob joined room A1B2
Game started in room A1B2
Answer submitted by Alice in room A1B2
Vote submitted by Bob for Alice's answer in room A1B2
```

These logs help you debug and understand what's happening in the game.

---

## Running in Production

### Option 1: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start server
pm2 start server/server.js --name "economics-fibbage"

# View logs
pm2 logs economics-fibbage

# Stop server
pm2 stop economics-fibbage

# Restart server
pm2 restart economics-fibbage
```

### Option 2: Using nohup

```bash
# Start server in background
nohup node server/server.js > server.log 2>&1 &

# View logs
tail -f server.log

# Stop server
pkill -f "node server/server.js"
```

---

## Environment Variables

You can customize the server port:

```bash
# Use a different port
PORT=8080 npm start
```

Or set it in your environment:

```bash
export PORT=8080
npm start
```

---

## Quick Commands

```bash
# Start server
npm start

# Stop server (if running in foreground)
Ctrl+C

# Kill all server processes
pkill -9 -f "node server/server.js"

# Check if server is running
lsof -ti:3000

# Install dependencies
npm install

# Check Node.js version
node --version
```

---

## Game Flow

1. **Start Server** → Server shows startup message
2. **Open Host Screen** → Creates room with 4-letter code
3. **Players Join** → Enter room code on their devices
4. **Host Starts Game** → Clicks "Start Game" button
5. **Play Questions** → Submit answers, vote, see results
6. **Game Over** → View final scores, option to play again

---

## File Structure Reference

If you need to modify something, see:
- **[README.md](README.md)** - Main documentation with customization guide
- **[FILE_STRUCTURE.md](FILE_STRUCTURE.md)** - Complete file map
- **[HOST_HTML_STRUCTURE.md](HOST_HTML_STRUCTURE.md)** - Host screen structure

**Quick Customization Examples:**
- Change timer duration: [server/config.js](server/config.js)
- Change questions: [server/data/questions.js](server/data/questions.js)
- Change game title: [public/host.html](public/host.html) and [public/player.html](public/player.html)
- Change scoring: [server/config.js](server/config.js)

---

## Customization

See [README.md](README.md) for detailed instructions on:
- Changing the game name and rules
- Adding or modifying questions
- Adding background music and sound effects
- Adjusting timer durations and scoring

## Support

For issues or questions:
1. Check [README.md](README.md) troubleshooting section
2. Check server logs for error messages
3. Verify all dependencies are installed (`npm install`)
4. Ensure all devices are on the same WiFi network

---

**Ready to play! Enjoy your Economics Fibbage game! 🎉**
