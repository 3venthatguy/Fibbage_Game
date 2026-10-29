/**
 * Socket event handlers for the player screen.
 */

/**
 * Sets up all socket event handlers for the player.
 * @param {object} socket - Socket.io client instance
 * @param {object} state - Player state object
 */
function setupPlayerSocketHandlers(socket, state) {
  /**
   * Shows a question on the game screen and resets the round's submit/vote state.
   * @param {object} data - {question, questionIndex, totalQuestions}
   */
  function renderPlayerQuestion(data) {
    const { question, questionIndex, totalQuestions } = data;
    const questionDisplay = document.getElementById('questionDisplay');
    const questionNumber = document.getElementById('questionNumber');

    questionDisplay.innerHTML = formatQuestion(question);
    questionNumber.textContent = `Question ${questionIndex + 1} of ${totalQuestions}`;
    setTheme('play');

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
  }

  /**
   * Sends the vote and sends the player to the watch screen.
   * @param {string} votedForId - Answer id
   */
  function onPlayerVote(votedForId) {
    socket.emit('submitVote', { roomCode: state.roomCode, votedForId });
    state.submittedVote = true;

    // Immediately show watch screen - direct player to look at TV
    showWatchScreen();
  }

  /**
   * Redraws the whole screen from a rejoinSuccess snapshot.
   * @param {object} data - Snapshot from the server
   */
  function restorePlayerScreen(data) {
    hideJoinScreen();
    showPlayerNameBadge(state.playerName);

    if (data.phase === 'lobby') {
      showPlayerLobbyScreen(state.roomCode);
      updatePlayersList(state.players);
      return;
    }

    if (data.phase === 'gameOver') {
      clearPlayerSession();
      hidePlayerLobbyScreen();
      showPlayerGameOverScreen(data.finalScores || [], state.playerId);
      return;
    }

    renderPlayerQuestion(data);
    setTheme(data.phase === 'results' ? 'results' : 'play');

    if (data.phase === 'reading') {
      showPlayerReadingPhase(data.timeRemaining);
    } else if (data.phase === 'submit') {
      drawWave(document.getElementById('playerWave'), data.timeRemaining);
      if (data.hasSubmitted) {
        state.submittedAnswer = true;
        showSubmitWaiting();
      }
    } else if (data.phase === 'voting') {
      if (data.hasVoted) {
        state.submittedAnswer = true;
        state.submittedVote = true;
        showWatchScreen();
      } else {
        showPlayerVotingPhase();
        drawWave(document.getElementById('playerWave'), data.timeRemaining);
        displayPlayerVotingAnswers(data.votingAnswers || [], state.playerId, onPlayerVote);
      }
    } else if (data.phase === 'results') {
      showWatchScreen();
    }

    updatePlayerTimer(data.timeRemaining);
  }

  socket.on('playerJoined', (data) => {
    const { players } = data;
    state.players = players;

    // Find our player ID - only if we don't have it yet
    if (!state.playerId && state.playerName) {
      const ourPlayer = players.find(p => p.name === state.playerName);

      if (ourPlayer) {
        state.playerId = ourPlayer.id;

        // Show lobby screen only for the joining player
        showPlayerLobbyScreen(state.roomCode);
      }
    }

    updatePlayersList(players);

    // Avatars follow list position, so refresh ours when the list changes
    if (state.playerId) {
      showPlayerNameBadge(state.playerName);
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

      // Remember who we are so a refresh or dropped connection can rejoin this seat
      if (data.reconnectToken) {
        state.reconnectToken = data.reconnectToken;
        savePlayerSession();
      }

      // Show player name badge and lobby screen when joining
      if (state.playerName && state.roomCode) {
        showPlayerNameBadge(state.playerName);
        showPlayerLobbyScreen(state.roomCode);
        updatePlayersList(state.players || []);
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

  socket.on('gameStarted', (data) => {
    state.currentPhase = 'submit';
    // ROUND ONE card covers the server's start delay
    showRoundCard(1, 1, data?.duration || MULTIPLIER_CONFIG.roundOneDuration);
  });

  socket.on('newQuestion', (data) => {
    renderPlayerQuestion(data);
  });

  socket.on('phaseChange', (data) => {
    state.currentPhase = data.phase;
    setTheme(data.phase === 'results' ? 'results' : 'play');

    if (data.phase === 'reading') {
      showPlayerReadingPhase(data.timeRemaining);
    } else if (data.phase === 'submit') {
      showPlayerSubmitPhase();
      drawWave(document.getElementById('playerWave'), data.timeRemaining);
    } else if (data.phase === 'voting') {
      showPlayerVotingPhase();
      drawWave(document.getElementById('playerWave'), data.timeRemaining);
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
    // A player who rejoined and already voted keeps the watch screen
    if (state.submittedVote) return;
    displayPlayerVotingAnswers(answers, state.playerId, onPlayerVote);
  });

  socket.on('rejoinSuccess', (data) => {
    state.roomCode = data.roomCode;
    state.playerId = data.playerId;
    state.playerName = data.playerName;
    state.reconnectToken = data.reconnectToken;
    state.players = data.players;
    state.currentPhase = data.phase;
    savePlayerSession();
    hideConnectionBanner();
    resetJoinButton();

    if (data.gameTitle) {
      document.getElementById('joinGameTitle').textContent = data.gameTitle;
      document.getElementById('lobbyGameTitle').textContent = data.gameTitle;
      document.title = `${data.gameTitle} - Player`;
    }

    restorePlayerScreen(data);
  });

  socket.on('rejoinFailed', (data) => {
    clearPlayerSession();
    state.playerId = null;
    hideConnectionBanner();
    resetJoinButton();

    // Back to the join screen with the old code and name filled in
    hidePlayerLobbyScreen();
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('playerNameBadge').style.display = 'none';
    document.getElementById('joinScreen').style.display = '';
    setTheme('title');
    if (state.roomCode) document.getElementById('roomCodeInput').value = state.roomCode;
    if (state.playerName) document.getElementById('playerNameInput').value = state.playerName;

    showPlayerError(`Couldn't rejoin: ${data && data.reason ? data.reason : 'game not found'}`);
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

    // Nothing left to rejoin; a refresh should go back to the join screen for the next game
    clearPlayerSession();

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
