/**
 * Socket event handlers for the player screen.
 */

/**
 * Sets up all socket event handlers for the player.
 * @param {object} socket - Socket.io client instance
 * @param {object} state - Player state object
 */
function setupPlayerSocketHandlers(socket, state) {
  socket.on('playerJoined', (data) => {
    const { players } = data;
    updatePlayersList(players);

    // Find our player ID - only if we don't have it yet
    if (!state.playerId && state.playerName) {
      const ourPlayer = players.find(p => p.name === state.playerName);

      if (ourPlayer) {
        state.playerId = ourPlayer.id;

        // Show player name badge and lobby screen only for the joining player
        showPlayerNameBadge(state.playerName);
        showPlayerLobbyScreen(state.roomCode);
      }
    }
  });

  socket.on('gameState', (data) => {
    // Update game title if provided
    if (data.gameTitle) {
      const joinTitle = document.getElementById('joinGameTitle');
      const lobbyTitle = document.getElementById('lobbyGameTitle');
      if (joinTitle) joinTitle.textContent = data.gameTitle;
      if (lobbyTitle) lobbyTitle.textContent = data.gameTitle;
      document.title = `${data.gameTitle} - Player`;
    }

    // Set player ID if provided (when joining)
    if (data.playerId) {
      state.playerId = data.playerId;

      // Show player name badge and lobby screen when joining
      if (state.playerName && state.roomCode) {
        showPlayerNameBadge(state.playerName);
        showPlayerLobbyScreen(state.roomCode);
      }
    }

    // Handle mid-game join
    if (data.phase !== 'lobby' && data.joinedMidGame) {
      // Player joined mid-game - they'll receive newQuestion and phaseChange events
      // to get them into the current game state
      console.log('Joined mid-game during phase:', data.phase);
      state.currentPhase = data.phase;
    }
  });

  socket.on('gameStarted', () => {
    state.currentPhase = 'submit';
  });

  socket.on('newQuestion', (data) => {
    const { question, questionIndex, totalQuestions } = data;
    const questionDisplay = document.getElementById('questionDisplay');
    const questionNumber = document.getElementById('questionNumber');

    questionDisplay.textContent = question;
    questionNumber.textContent = `Question ${questionIndex + 1} of ${totalQuestions}`;

    // Reset state
    state.submittedAnswer = false;
    state.submittedVote = false;
    state.selectedAnswerId = null;
    resetSubmitPhase();

    // Show game screen
    hidePlayerLobbyScreen();
    const gameScreen = document.getElementById('gameScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameScreen.classList.add('active');
    gameOverScreen.classList.remove('active');

    // Hide watch screen if it was showing
    const watchScreen = document.getElementById('watchScreen');
    if (watchScreen) {
      watchScreen.style.display = 'none';
    }

    // Reset phases
    showPlayerSubmitPhase();

    // Show timer for new question
    showPlayerTimer();
  });

  socket.on('phaseChange', (data) => {
    state.currentPhase = data.phase;

    if (data.phase === 'reading') {
      showPlayerReadingPhase(data.timeRemaining);
    } else if (data.phase === 'submit') {
      showPlayerSubmitPhase();
    } else if (data.phase === 'voting') {
      showPlayerVotingPhase();
    } else if (data.phase === 'results') {
      showPlayerResultsPhase();
      hidePlayerTimer(); // Hide timer during results animation
    }

    updatePlayerTimer(data.timeRemaining);
  });

  socket.on('timerUpdate', (data) => {
    updatePlayerTimer(data.timeRemaining);
  });

  socket.on('allAnswersSubmitted', () => {
    showAllAnswersSubmittedPlayer();
  });

  socket.on('votingReady', (data) => {
    const { answers } = data;
    displayPlayerVotingAnswers(answers, state.playerId, (votedForId) => {
      socket.emit('submitVote', { roomCode: state.roomCode, votedForId });
      state.submittedVote = true;

      // Immediately show watch screen - direct player to look at TV
      showWatchScreen();
    });
  });

  socket.on('resultsReady', (data) => {
    // Legacy handler - animation sequence now handled by individual events
    showPlayerResultsPhase();
    hidePlayerTimer();
    displayPlayerResults(data, state.playerId);
  });

  // Results animation sequence events (simplified for player view)
  socket.on('results:startSequence', (data) => {
    if (typeof handlePlayerResultsStart === 'function') {
      handlePlayerResultsStart(data);
    }
  });

  socket.on('results:correctAnswerReveal', (data) => {
    if (typeof handlePlayerCorrectAnswerReveal === 'function') {
      handlePlayerCorrectAnswerReveal(data);
    }
  });

  socket.on('results:showExplanation', (data) => {
    if (typeof handlePlayerShowExplanation === 'function') {
      handlePlayerShowExplanation(data);
    }
  });

  socket.on('results:updateScore', (data) => {
    if (typeof handlePlayerScoreUpdate === 'function') {
      handlePlayerScoreUpdate(data);
    }
  });

  socket.on('results:updateCorrectScores', (data) => {
    // Check if this player is in the correct voters
    const ourVoter = data.voters.find(v => v.id === state.playerId);
    if (ourVoter && typeof handlePlayerScoreUpdate === 'function') {
      handlePlayerScoreUpdate({
        playerId: state.playerId,
        pointsEarned: ourVoter.pointsEarned,
        newTotalScore: ourVoter.newTotalScore
      });
    }
  });

  socket.on('results:showLeaderboard', (data) => {
    if (typeof handlePlayerLeaderboard === 'function') {
      handlePlayerLeaderboard(data);
    }
  });

  socket.on('gameOver', (data) => {
    const { finalScores } = data;

    // Hide watch screen if showing
    const watchScreen = document.getElementById('watchScreen');
    if (watchScreen) {
      watchScreen.style.display = 'none';
    }

    showPlayerGameOverScreen(finalScores, state.playerId);
  });

  socket.on('error', (message) => {
    showPlayerError(message);

    // If it's the "truth" error during submit phase, unlock the input
    if (message.includes("can't fool someone with the truth") && state.currentPhase === 'submit') {
      state.submittedAnswer = false;

      // Re-enable the input and button
      const answerInput = document.getElementById('answerInput');
      const submitButton = document.getElementById('submitButton');
      const submitWaiting = document.getElementById('submitWaiting');

      if (answerInput) answerInput.disabled = false;
      if (submitButton) submitButton.disabled = false;
      if (submitWaiting) submitWaiting.style.display = 'none';
    } else {
      resetJoinButton();
    }
  });

  // Multiplier announcement event
  socket.on('multiplierAnnouncement', (data) => {
    console.log('[PlayerSocketHandlers] Multiplier announcement:', data);
    if (typeof showMultiplierAnnouncement === 'function') {
      showMultiplierAnnouncement(data);
    }
  });
}
