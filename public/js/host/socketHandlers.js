/**
 * Socket event handlers for the host screen.
 */

/**
 * Sets up all socket event handlers for the host.
 * @param {object} socket - Socket.io client instance
 * @param {object} state - Host state object
 */
function setupHostSocketHandlers(socket, state) {
  socket.on('roomCreated', (data) => {
    // Handle both old format (string) and new format (object)
    const code = typeof data === 'string' ? data : data.roomCode;
    const gameTitle = data.gameTitle || 'Fibbage';
    const gameRules = data.gameRules || '';
    const availablePackages = data.availablePackages || [];
    const selectedPackageId = data.packageId || 'economics';

    console.log('Room created with code:', code);
    state.roomCode = code;
    state.selectedPackageId = selectedPackageId;
    state.availablePackages = availablePackages;

    const roomCodeDisplay = document.getElementById('roomCodeDisplay');
    if (roomCodeDisplay) {
      roomCodeDisplay.textContent = code;
      console.log('Room code displayed:', code);
    } else {
      console.error('Room code display element not found!');
    }

    // Update persistent room code display
    const persistentRoomCode = document.getElementById('persistentRoomCode');
    if (persistentRoomCode) {
      persistentRoomCode.textContent = code;
    }

    // Update game title
    const gameTitleElement = document.getElementById('gameTitle');
    if (gameTitleElement) {
      gameTitleElement.textContent = gameTitle;
      document.title = `${gameTitle} - Host`;
    }

    // Update game rules
    const gameRulesElement = document.getElementById('gameRules');
    if (gameRulesElement && gameRules) {
      gameRulesElement.textContent = gameRules;
    }

    // Render package cards
    if (availablePackages.length > 0) {
      renderPackageCards(availablePackages, selectedPackageId);
    }
  });

  socket.on('packageChanged', (data) => {
    console.log('Package changed to:', data.packageId);
    state.selectedPackageId = data.packageId;
    // Update the selected card visually
    const packageCards = document.querySelectorAll('.package-card');
    packageCards.forEach(card => {
      if (card.dataset.packageId === data.packageId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  });

  socket.on('playerJoined', (data) => {
    state.players = data.players;
    updatePlayersDisplay(state.players);
    updateStartButton(state.players.length);
    // Play pop sound when a player joins
    playSoundEffect('pop', AUDIO_CONFIG.SFX_PLAYER_JOIN_VOLUME);

    // Update checkmarks if player joined during submit or reading phase
    if (data.phase === 'submit' || data.phase === 'reading') {
      console.log('[SocketHandlers] Player joined mid-game, updating checkmarks. Total:', data.totalPlayers, 'Submitted:', data.submittedCount);
      rerenderSubmitCheckmarks(data.totalPlayers, data.submittedCount || 0);
    }
  });

  socket.on('playerDisconnected', (data) => {
    console.log('[SocketHandlers] Player disconnected:', data);
    if (data.phase === 'submit') {
      // Re-render checkmarks with new player count
      rerenderSubmitCheckmarks(data.totalPlayers, data.submittedCount);
    } else if (data.phase === 'voting') {
      // Re-render voting checkmarks with new player count
      rerenderVotingCheckmarks(data.totalPlayers, data.voteCount);
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

    // Show question elements and restore normal size (remove results-mode class)
    questionDisplay.style.display = 'block';
    questionDisplay.classList.remove('results-mode');
    questionNumber.style.display = 'block';
    questionNumber.classList.remove('results-mode');

    // Show game screen
    hideLobbyScreen();
    const gameScreen = document.getElementById('gameScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameScreen.classList.add('active');
    gameOverScreen.classList.remove('active');

    // Reset phases
    showSubmitPhase(state.players.length);

    // Show timer for new question
    showTimer();
  });

  socket.on('phaseChange', (data) => {
    console.log('[SocketHandlers] phaseChange event received:', data);
    state.currentPhase = data.phase;

    // Stop ticking sound on any phase change
    if (typeof stopTickingSound !== 'undefined') {
      stopTickingSound();
    }

    if (data.phase === 'reading') {
      showReadingPhase(data.timeRemaining);
      // Stop game music during reading phase
      stopGameMusic();
    } else if (data.phase === 'submit') {
      showSubmitPhase(state.players.length);
      // Start game music for submit phase (volume already set in playRandomGameMusic)
      playRandomGameMusic();
    } else if (data.phase === 'voting') {
      console.log('[SocketHandlers] Showing voting phase...');
      showVotingPhase(state.players.length);
      // Continue game music into voting phase (or start if not playing)
      if (!isGameMusicPlaying()) {
        playRandomGameMusic();
      }
    } else if (data.phase === 'results') {
      console.log('[SocketHandlers] Showing results phase...');
      showResultsPhase();
      hideTimer(); // Hide timer during results animation
      // Switch to ending music for results phase at lower volume
      stopGameMusic();
      playRandomEndingMusic();
      lowerMusicVolume(AUDIO_CONFIG.RESULTS_MUSIC_LOWERED_VOLUME);
    }

    updateTimer(data.timeRemaining);
  });

  socket.on('timerUpdate', (data) => {
    updateTimer(data.timeRemaining);
  });

  socket.on('answerSubmitted', (data) => {
    const { submittedCount, totalPlayers } = data;
    updateSubmitStatus(submittedCount, totalPlayers);
    // Play pop sound when an answer is submitted
    playSoundEffect('pop', AUDIO_CONFIG.SFX_ANSWER_SUBMIT_VOLUME);
  });

  socket.on('allAnswersSubmitted', () => {
    showAllAnswersSubmitted();
    // Stop ticking sound if all players finished early
    if (typeof stopTickingSound !== 'undefined') {
      stopTickingSound();
    }
  });

  socket.on('voteSubmitted', (data) => {
    const { voteCount, totalPlayers } = data;
    updateVotingStatus(voteCount, totalPlayers);
    // Play pop sound when a vote is cast
    playSoundEffect('pop', AUDIO_CONFIG.SFX_VOTE_CAST_VOLUME);

    // Show "All votes submitted!" when everyone has voted
    if (voteCount === totalPlayers) {
      showAllVotesSubmitted();
      // Stop ticking sound if all players finished early
      if (typeof stopTickingSound !== 'undefined') {
        stopTickingSound();
      }
    }
  });

  socket.on('votingReady', (data) => {
    console.log('[SocketHandlers] votingReady event received:', data);
    const { answers } = data;
    displayVotingAnswers(answers);
  });

  socket.on('resultsReady', (data) => {
    // Legacy handler - animation sequence now handled by individual events
    console.log('[SocketHandlers] resultsReady event received (LEGACY - should not fire during voting!):', data);
    showResultsPhase();
    hideTimer();
    displayResults(data, state.players);
  });

  // Results animation sequence events
  socket.on('results:startSequence', (data) => {
    if (typeof handleResultsStartSequence === 'function') {
      handleResultsStartSequence(data);
    }
  });

  socket.on('results:highlightAnswer', (data) => {
    if (typeof handleHighlightAnswer === 'function') {
      handleHighlightAnswer(data);
    }
  });

  socket.on('results:showVoters', (data) => {
    if (typeof handleShowVoters === 'function') {
      handleShowVoters(data);
    }
  });

  socket.on('results:revealAuthor', (data) => {
    if (typeof handleRevealAuthor === 'function') {
      handleRevealAuthor(data);
    }
  });

  socket.on('results:updateScore', (data) => {
    if (typeof handleUpdateScore === 'function') {
      handleUpdateScore(data);
    }
  });

  socket.on('results:transitionNext', (data) => {
    if (typeof handleTransitionNext === 'function') {
      handleTransitionNext(data);
    }
  });

  socket.on('results:revealLie', (data) => {
    if (typeof handleRevealLie === 'function') {
      handleRevealLie(data);
    }
  });

  socket.on('results:highlightCorrectAnswer', (data) => {
    if (typeof handleHighlightCorrectAnswer === 'function') {
      handleHighlightCorrectAnswer(data);
    }
  });

  socket.on('results:revealTruth', (data) => {
    if (typeof handleRevealTruth === 'function') {
      handleRevealTruth(data);
    }
  });

  socket.on('results:showCorrectVoters', (data) => {
    if (typeof handleShowCorrectVoters === 'function') {
      handleShowCorrectVoters(data);
    }
  });

  socket.on('results:updateCorrectScores', (data) => {
    if (typeof handleUpdateCorrectScores === 'function') {
      handleUpdateCorrectScores(data);
    }
  });

  socket.on('results:showExplanation', (data) => {
    if (typeof handleShowExplanation === 'function') {
      handleShowExplanation(data);
    }
  });

  socket.on('results:showLeaderboardButton', (data) => {
    if (typeof handleShowLeaderboardButton === 'function') {
      handleShowLeaderboardButton(data);
    }
  });

  socket.on('results:showLeaderboard', (data) => {
    if (typeof handleShowLeaderboard === 'function') {
      handleShowLeaderboard(data);
    }
  });

  socket.on('results:showNextButton', (data) => {
    if (typeof handleShowNextButton === 'function') {
      handleShowNextButton(data);
    }
  });

  socket.on('results:complete', (data) => {
    if (typeof handleResultsComplete === 'function') {
      handleResultsComplete(data);
    }
  });

  socket.on('playTransitionSound', () => {
    console.log('[SocketHandlers] Playing transition sound before results');
    // Stop ticking timer sound if playing
    stopTickingSound();
    // Stop music first
    stopGameMusic();
    // Play the transition sound effect
    playSoundEffect('timeToVote', AUDIO_CONFIG.SFX_TIME_TO_VOTE_VOLUME);
  });

  socket.on('gameOver', (data) => {
    const { finalScores } = data;
    showGameOverScreen(finalScores);
    // Don't stop music - ending music continues from results phase
  });

  socket.on('error', (message) => {
    showError(message);
  });

  // Multiplier announcement event
  socket.on('multiplierAnnouncement', (data) => {
    console.log('[SocketHandlers] Multiplier announcement:', data);
    if (typeof showMultiplierAnnouncement === 'function') {
      showMultiplierAnnouncement(data);
    }
  });
}
