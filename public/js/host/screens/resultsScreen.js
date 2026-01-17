/**
 * Results phase screen logic for the host.
 * Handles progressive results reveal animation sequence.
 */

// Animation state
let currentSequenceId = null;
let answerElements = new Map(); // answerId -> element
let currentAnswerElement = null;
let currentDrumRoll = null; // Track current drum roll sound effect
let animationState = {
  currentAnswerIndex: 0,
  fakeAnswers: [],
  correctAnswer: null,
  explanation: null,
  totalScores: null,
  roundScores: null
};

/**
 * Shows the results phase UI.
 */
function showResultsPhase() {
  console.log('[ResultsScreen] ========== SHOW RESULTS PHASE ==========');
  console.log('[ResultsScreen] About to reset state. Current sequenceId:', currentSequenceId);
  console.log('[ResultsScreen] Current answerElements size:', answerElements.size);

  const submitPhase = document.getElementById('submitPhase');
  const votingPhase = document.getElementById('votingPhase');
  const resultsPhase = document.getElementById('resultsPhase');
  const questionDisplay = document.getElementById('questionDisplay');
  const questionNumber = document.getElementById('questionNumber');

  console.log('[ResultsScreen] Hiding submitPhase and votingPhase, showing resultsPhase');
  submitPhase.style.display = 'none';
  votingPhase.style.display = 'none';
  resultsPhase.style.display = 'block';
  console.log('[ResultsScreen] votingPhase display set to:', votingPhase.style.display);
  console.log('[ResultsScreen] resultsPhase display set to:', resultsPhase.style.display);

  // Keep question visible during results animation but make it smaller
  if (questionDisplay) {
    questionDisplay.style.display = 'block';
    questionDisplay.classList.add('results-mode');
  }
  if (questionNumber) {
    questionNumber.style.display = 'block';
    questionNumber.classList.add('results-mode');
  }

  console.log('[ResultsScreen] Results phase UI updated');

  // CRITICAL: Reset sequence ID IMMEDIATELY to prepare for new animation
  // This must happen BEFORE the results:startSequence event arrives
  console.log('[ResultsScreen] Resetting currentSequenceId from', currentSequenceId, 'to null');
  currentSequenceId = null;

  // Clear previous results but preserve structure
  const resultsContainer = document.getElementById('resultsPhase');
  if (resultsContainer) {
    // Check if structure already exists
    let answersRevealArea = document.getElementById('answersRevealArea');
    if (!answersRevealArea) {
      resultsContainer.innerHTML = `
        <div class="results-container">
          <div class="answers-reveal-area" id="answersRevealArea"></div>
          <div class="correct-answer-area" id="correctAnswerArea" style="display: none;"></div>
          <div class="explanation-area" id="explanationArea" style="display: none;"></div>
          <div class="leaderboard-area" id="leaderboardArea" style="display: none;"></div>
          <button class="next-button" id="nextButton" style="display: none;">Next Question</button>
        </div>
      `;
    } else {
      // Clear content but keep structure
      answersRevealArea.innerHTML = '';
      // CRITICAL: Reset display to flex so animations are visible for all questions
      answersRevealArea.style.display = 'flex';

      document.getElementById('correctAnswerArea').innerHTML = '';
      document.getElementById('correctAnswerArea').style.display = 'none';
      document.getElementById('explanationArea').innerHTML = '';
      document.getElementById('explanationArea').style.display = 'none';
      document.getElementById('leaderboardArea').innerHTML = '';
      document.getElementById('leaderboardArea').style.display = 'none';
      const nextButton = document.getElementById('nextButton');
      if (nextButton) {
        nextButton.style.display = 'none';
      }
    }
  }

  // Reset animation state
  console.log('[ResultsScreen] Resetting animation state...');
  animationState = {
    currentAnswerIndex: 0,
    fakeAnswers: [],
    correctAnswer: null,
    explanation: null,
    totalScores: null,
    roundScores: null
  };
  answerElements.clear();
  currentAnswerElement = null;
  console.log('[ResultsScreen] State reset complete. answerElements size:', answerElements.size);
  console.log('[ResultsScreen] ========== SHOW RESULTS PHASE COMPLETE ==========');
}

/**
 * Initializes the results animation sequence.
 * Builds fresh answer cards from server data instead of cloning from hidden voting grid.
 * @param {Array} answersData - Array of answer objects from server
 */
function initializeResultsSequence(answersData) {
  console.log('[ResultsScreen] initializeResultsSequence called with answersData:', answersData);
  console.log('[ResultsScreen] currentSequenceId:', currentSequenceId);

  const answersRevealArea = document.getElementById('answersRevealArea');

  if (!answersRevealArea) {
    console.error('[ResultsScreen] answersRevealArea not found!');
    return;
  }

  // Clear previous answer elements
  answersRevealArea.innerHTML = '';
  answerElements.clear();
  console.log('[ResultsScreen] Cleared previous answer elements');

  // Build fresh answer cards from server data
  if (answersData && answersData.length > 0) {
    console.log('[ResultsScreen] Building', answersData.length, 'fresh cards from server data');
    console.log('[ResultsScreen] Full answersData:', JSON.stringify(answersData, null, 2));

    answersData.forEach((answer) => {
      // Create fresh card
      const card = document.createElement('div');
      card.className = 'answer-card';
      card.dataset.answerId = answer.id;

      // Create answer text element (matching voting screen structure)
      const answerText = document.createElement('div');
      answerText.textContent = answer.text;
      answerText.style.flex = '1';
      card.appendChild(answerText);

      // Apply base styles
      card.style.opacity = '1';

      // Append to reveal area
      answersRevealArea.appendChild(card);
      answerElements.set(answer.id, card);
      console.log(`[ResultsScreen] Created fresh card for answerId: ${answer.id}, text: "${answer.text.substring(0, 50)}"`);
    });
  } else {
    console.error('[ResultsScreen] No answers data provided!');
  }

  console.log('[ResultsScreen] Total cards created:', answerElements.size);

  // Debug: Check visibility of reveal area
  if (answersRevealArea) {
    console.log('[ResultsScreen] answersRevealArea display:', answersRevealArea.style.display);
    console.log('[ResultsScreen] answersRevealArea offsetHeight:', answersRevealArea.offsetHeight);
    console.log('[ResultsScreen] answersRevealArea children:', answersRevealArea.children.length);

    // Check each created card
    answerElements.forEach((element, answerId) => {
      console.log(`[ResultsScreen] Card ${answerId}: display=${element.style.display}, opacity=${element.style.opacity}, offsetHeight=${element.offsetHeight}`);
    });
  }
}

/**
 * Handles the start of results sequence.
 * @param {object} data - Sequence data (includes answers array from server)
 */
function handleResultsStartSequence(data) {
  console.log('[ResultsScreen] ========== RESULTS SEQUENCE START ==========');
  console.log('[ResultsScreen] Results sequence started:', data);
  console.log('[ResultsScreen] Previous currentSequenceId:', currentSequenceId);
  console.log('[ResultsScreen] New sequenceId:', data.sequenceId);
  console.log('[ResultsScreen] Answers data received:', data.answers);

  // CRITICAL: Always accept new sequence and update ID
  // This allows animations to work for all questions (1-8)
  currentSequenceId = data.sequenceId;
  console.log('[ResultsScreen] currentSequenceId updated to:', currentSequenceId);

  // Initialize results sequence with answers data from server
  setTimeout(() => {
    console.log('[ResultsScreen] Initializing results sequence with server data...');
    initializeResultsSequence(data.answers);

    // Dim all answers initially (including correct answer)
    answerElements.forEach((element) => {
      element.classList.add('answer-dimmed');
    });
    console.log('[ResultsScreen] Dimmed all answer elements');
    console.log('[ResultsScreen] ========== INITIALIZATION COMPLETE ==========');
  }, 100);
}

/**
 * Handles answer highlight phase.
 * @param {object} data - Highlight data
 */
async function handleHighlightAnswer(data) {
  console.log('[ResultsScreen] handleHighlightAnswer called');
  console.log('[ResultsScreen] Event sequenceId:', data.sequenceId, 'Current sequenceId:', currentSequenceId);

  if (data.sequenceId !== currentSequenceId) {
    console.log('[ResultsScreen] SEQUENCE ID MISMATCH - IGNORING EVENT');
    return;
  }

  console.log('[ResultsScreen] Highlighting answer:', data.answerId);
  const answerElement = answerElements.get(data.answerId);
  if (!answerElement) {
    console.error('[ResultsScreen] Answer element not found for ID:', data.answerId);
    return;
  }

  currentAnswerElement = answerElement;

  // Remove dim from this answer, keep others dimmed
  answerElements.forEach((element, answerId) => {
    if (answerId === data.answerId) {
      element.classList.remove('answer-dimmed');
    } else {
      element.classList.add('answer-dimmed');
    }
  });

  // Import and use animation function
  const { highlightAnswer } = await import('../animations/resultsAnimations.js');
  await highlightAnswer(answerElement);
  console.log('[ResultsScreen] Highlight animation complete');

  // Play drum roll sound immediately with no delay
  currentDrumRoll = playSoundEffect('drumRoll', AUDIO_CONFIG.SFX_DRUM_ROLL_VOLUME);
}

/**
 * Handles showing voters for an answer.
 * @param {object} data - Voters data
 */
async function handleShowVoters(data) {
  if (data.sequenceId !== currentSequenceId || !currentAnswerElement) return;

  const votersContainer = document.createElement('div');
  votersContainer.className = 'voters-container';
  currentAnswerElement.appendChild(votersContainer);

  const { showVoters } = await import('../animations/resultsAnimations.js');
  await showVoters(votersContainer, data.voters);
}

/**
 * Handles author reveal.
 * @param {object} data - Author data
 */
async function handleRevealAuthor(data) {
  if (data.sequenceId !== currentSequenceId || !currentAnswerElement) return;

  const authorContainer = document.createElement('div');
  authorContainer.className = 'author-container';
  currentAnswerElement.appendChild(authorContainer);

  const { revealAuthor } = await import('../animations/resultsAnimations.js');

  // Check if this is a duplicate answer (multiple authors)
  if (data.isDuplicate && data.authorNames && data.authorNames.length > 1) {
    // For duplicate answers, pass additional information including authorIds
    await revealAuthor(authorContainer, data.authorName, data.pointsEarned, {
      isDuplicate: true,
      authorNames: data.authorNames,
      authorIds: data.authorIds,
      pointsPerPlayer: data.pointsPerPlayer,
      voterCount: data.voterCount,
      multiplier: data.multiplier,
      baseFoolPlayerPoints: data.baseFoolPlayerPoints,
      foolPlayerPoints: data.foolPlayerPoints
    });
  } else {
    // Single author - pass authorId for score update
    await revealAuthor(authorContainer, data.authorName, data.pointsEarned, {
      isDuplicate: false,
      authorId: data.authorId,
      voterCount: data.voterCount,
      multiplier: data.multiplier,
      baseFoolPlayerPoints: data.baseFoolPlayerPoints,
      foolPlayerPoints: data.foolPlayerPoints
    });
  }
}

/**
 * Handles score update.
 * @param {object} data - Score data
 * Note: This function is kept for compatibility but no longer updates UI since we removed total scores.
 */
async function handleUpdateScore(data) {
  if (data.sequenceId !== currentSequenceId || !currentAnswerElement) return;
  // No longer updating UI - scores are shown only in the "Won" column which is set during author reveal
}

/**
 * Handles transition to next answer.
 * @param {object} data - Transition data
 */
function handleTransitionNext(data) {
  if (data.sequenceId !== currentSequenceId || !currentAnswerElement) return;

  currentAnswerElement.classList.add('fade-out');
  setTimeout(() => {
    currentAnswerElement.style.display = 'none';
  }, 300);
}

/**
 * Handles "IT'S A LIE!" reveal for fake answers.
 * @param {object} data - Lie reveal data
 */
function handleRevealLie(data) {
  if (data.sequenceId !== currentSequenceId || !currentAnswerElement) return;

  // Stop drum roll if still playing
  if (currentDrumRoll && typeof stopSoundEffect !== 'undefined') {
    stopSoundEffect(currentDrumRoll);
    currentDrumRoll = null;
  }

  // Play error sound when lie is revealed
  playSoundEffect('error', AUDIO_CONFIG.SFX_LIE_REVEAL_VOLUME);

  // Add "IT'S A LIE!" text above the answer
  const lieRevealDiv = document.createElement('div');
  lieRevealDiv.className = 'lie-reveal';
  lieRevealDiv.textContent = `IT'S A LIE!`;

  // Insert at the top of the current answer element
  currentAnswerElement.insertBefore(lieRevealDiv, currentAnswerElement.firstChild);
}

/**
 * Handles highlighting the correct answer.
 * @param {object} data - Highlight data
 */
function handleHighlightCorrectAnswer(data) {
  console.log('[ResultsScreen] handleHighlightCorrectAnswer called');
  console.log('[ResultsScreen] Event sequenceId:', data.sequenceId, 'Current sequenceId:', currentSequenceId);

  if (data.sequenceId !== currentSequenceId) {
    console.log('[ResultsScreen] SEQUENCE ID MISMATCH - IGNORING EVENT');
    return;
  }

  console.log('[ResultsScreen] Getting correct answer card from answerElements');
  console.log('[ResultsScreen] answerElements keys:', Array.from(answerElements.keys()));

  // Get the cloned correct answer card from answersRevealArea
  const correctAnswerCard = answerElements.get('correct');
  if (correctAnswerCard) {
    console.log('[ResultsScreen] Found correct answer card, highlighting it');
    // Show the card and highlight it
    correctAnswerCard.style.display = 'block';
    correctAnswerCard.classList.remove('answer-dimmed');
    correctAnswerCard.classList.add('answer-highlighted');

    // Add vibration effect after initial highlight for suspense (like loot box opening)
    setTimeout(() => {
      correctAnswerCard.classList.add('answer-vibrating');
      // Play drum roll sound during suspenseful vibration
      currentDrumRoll = playSoundEffect('drumRoll', AUDIO_CONFIG.SFX_DRUM_ROLL_VOLUME);
    }, 500);

    currentAnswerElement = correctAnswerCard;
    console.log('[ResultsScreen] Correct answer highlighted');
  } else {
    console.error('[ResultsScreen] Correct answer card NOT FOUND in answerElements!');
  }
}

/**
 * Handles "THE TRUTH!" reveal for correct answer.
 * @param {object} data - Truth reveal data
 */
function handleRevealTruth(data) {
  console.log('[ResultsScreen] handleRevealTruth called');
  console.log('[ResultsScreen] Event sequenceId:', data.sequenceId, 'Current sequenceId:', currentSequenceId);
  console.log('[ResultsScreen] currentAnswerElement exists:', !!currentAnswerElement);

  if (data.sequenceId !== currentSequenceId || !currentAnswerElement) {
    console.log('[ResultsScreen] TRUTH REVEAL BLOCKED - sequence mismatch or no element');
    return;
  }

  console.log('[ResultsScreen] Processing truth reveal...');

  // Stop drum roll if still playing
  if (currentDrumRoll && typeof stopSoundEffect !== 'undefined') {
    stopSoundEffect(currentDrumRoll);
    currentDrumRoll = null;
  }

  // Remove vibrating class before showing truth
  currentAnswerElement.classList.remove('answer-vibrating');
  console.log('[ResultsScreen] Removed vibrating class');

  // Add green background to indicate correct answer
  currentAnswerElement.classList.add('correct-answer-revealed');
  console.log('[ResultsScreen] Added green background class');

  // Play success sound when truth is revealed
  playSoundEffect('success', AUDIO_CONFIG.SFX_TRUTH_REVEAL_VOLUME);

  // Add "THE TRUTH!" text above the answer
  const truthRevealDiv = document.createElement('div');
  truthRevealDiv.className = 'truth-reveal';
  truthRevealDiv.textContent = 'THE TRUTH!';
  console.log('[ResultsScreen] Created truth reveal div:', truthRevealDiv);

  // Insert at the top of the current answer element
  currentAnswerElement.insertBefore(truthRevealDiv, currentAnswerElement.firstChild);
  console.log('[ResultsScreen] Inserted truth reveal div into DOM');

  // Apply the zoom animation
  currentAnswerElement.classList.add('correct-answer-zoom');
  console.log('[ResultsScreen] Truth reveal complete');
}


/**
 * Handles showing correct voters.
 * @param {object} data - Correct voters data
 */
function handleShowCorrectVoters(data) {
  if (data.sequenceId !== currentSequenceId || !currentAnswerElement) return;

  const votersContainer = document.createElement('div');
  votersContainer.className = 'author-container';

  if (data.voters.length === 0) {
    const noVotersDiv = document.createElement('div');
    noVotersDiv.className = 'author-reveal';
    noVotersDiv.innerHTML = '<div class="no-correct-voters" style="text-align: center; padding: 20px; color: white;">Everyone was fooled!</div>';
    votersContainer.appendChild(noVotersDiv);
  } else {
    // Create table structure for correct voters
    const authorReveal = document.createElement('div');
    authorReveal.className = 'author-reveal';

    const table = document.createElement('div');
    table.className = 'author-table';

    // Table header
    const header = document.createElement('div');
    header.className = 'author-table-header';

    const headerName = document.createElement('div');
    headerName.className = 'author-table-header-cell';
    headerName.textContent = 'Knew The Truth';

    const headerWon = document.createElement('div');
    headerWon.className = 'author-table-header-cell';
    headerWon.textContent = 'Won';

    header.appendChild(headerName);
    header.appendChild(headerWon);
    table.appendChild(header);

    // Create rows for each correct voter
    data.voters.forEach((voter, index) => {
      const row = document.createElement('div');
      row.className = 'author-table-row';
      row.style.animationDelay = `${index * 0.1}s`;

      const nameCell = document.createElement('div');
      nameCell.className = 'author-table-name';
      nameCell.textContent = voter.name;

      const pointsCell = document.createElement('div');
      pointsCell.className = 'author-table-points';
      pointsCell.dataset.playerId = voter.id;
      pointsCell.textContent = '—'; // Will be updated when scores come in

      row.appendChild(nameCell);
      row.appendChild(pointsCell);
      table.appendChild(row);
    });

    authorReveal.appendChild(table);
    votersContainer.appendChild(authorReveal);
  }

  currentAnswerElement.appendChild(votersContainer);
}

/**
 * Handles updating correct voters' scores.
 * @param {object} data - Score update data
 */
async function handleUpdateCorrectScores(data) {
  if (data.sequenceId !== currentSequenceId) return;

  // Use the actual multiplied points value from server
  const pointsToShow = data.correctVotePoints || 1000;

  for (const voter of data.voters) {
    if (voter.pointsEarned > 0) {
      const pointsCell = document.querySelector(`[data-player-id="${voter.id}"]`);
      if (pointsCell) {
        // Show actual multiplied points value (+1000, +2000, or +3000)
        pointsCell.textContent = `+${pointsToShow}`;
        // Apply pop animation
        pointsCell.style.animation = 'none';
        setTimeout(() => {
          pointsCell.style.animation = 'pointsPop 0.5s ease-out';
        }, 10);
      }
    }
  }
}

/**
 * Handles showing explanation.
 * @param {object} data - Explanation data
 */
function handleShowExplanation(data) {
  if (data.sequenceId !== currentSequenceId) return;

  const explanationArea = document.getElementById('explanationArea');
  if (!explanationArea) return;

  explanationArea.style.display = 'block';
  explanationArea.innerHTML = `
    <div class="explanation-box">
      <h3>Explanation</h3>
      <p>${data.explanation}</p>
    </div>
  `;
}

/**
 * Handles showing the leaderboard button.
 * @param {object} data - Button data
 */
function handleShowLeaderboardButton(data) {
  if (data.sequenceId !== currentSequenceId) return;

  const leaderboardArea = document.getElementById('leaderboardArea');
  if (!leaderboardArea) return;

  leaderboardArea.style.display = 'block';
  leaderboardArea.innerHTML = `
    <button class="show-leaderboard-button" id="showLeaderboardButton">
      Show Leaderboard
    </button>
  `;

  const button = document.getElementById('showLeaderboardButton');
  button.onclick = () => {
    if (hostState && hostState.roomCode) {
      socket.emit('showLeaderboard', { roomCode: hostState.roomCode });
      button.disabled = true;
      button.style.display = 'none';
    }
  };
}

/**
 * Handles showing leaderboard.
 * @param {object} data - Leaderboard data
 */
function handleShowLeaderboard(data) {
  if (data.sequenceId !== currentSequenceId) return;

  // Store in animation state
  if (data.totalScores) {
    animationState.totalScores = data.totalScores;
  }
  if (data.roundScores) {
    animationState.roundScores = data.roundScores;
  }

  // Hide all other elements to make leaderboard exclusive
  const answersRevealArea = document.getElementById('answersRevealArea');
  const correctAnswerArea = document.getElementById('correctAnswerArea');
  const explanationArea = document.getElementById('explanationArea');
  const questionDisplay = document.getElementById('questionDisplay');
  const questionNumber = document.getElementById('questionNumber');

  if (answersRevealArea) answersRevealArea.style.display = 'none';
  if (correctAnswerArea) correctAnswerArea.style.display = 'none';
  if (explanationArea) explanationArea.style.display = 'none';
  if (questionDisplay) questionDisplay.style.display = 'none';
  if (questionNumber) questionNumber.style.display = 'none';

  const leaderboardArea = document.getElementById('leaderboardArea');
  if (!leaderboardArea) return;

  leaderboardArea.style.display = 'block';
  leaderboardArea.innerHTML = '<h3 style="font-size: 32px; margin-bottom: 20px;">Leaderboard</h3>';

  const leaderboardList = document.createElement('div');
  leaderboardList.className = 'leaderboard-list';

  data.sortedPlayers.forEach((player, index) => {
    const entry = document.createElement('div');
    entry.className = 'leaderboard-entry';
    entry.style.animationDelay = `${index * 0.1}s`;

    const roundScore = data.roundScores[player.id] || 0;
    entry.innerHTML = `
      <div class="leaderboard-rank">${index + 1}</div>
      <div class="leaderboard-name">${player.name}</div>
      <div class="leaderboard-score">${player.score.toLocaleString()}</div>
      ${roundScore > 0 ? `<div class="leaderboard-round-score">+${roundScore}</div>` : ''}
    `;

    leaderboardList.appendChild(entry);
  });

  leaderboardArea.appendChild(leaderboardList);
}

/**
 * Handles showing the next button.
 * @param {object} data - Button data
 */
function handleShowNextButton(data) {
  if (data.sequenceId !== currentSequenceId) return;

  const nextButton = document.getElementById('nextButton');
  if (nextButton) {
    nextButton.style.display = 'block';
    nextButton.classList.add('fade-in');

    // Ensure event listener is attached (in case button was recreated)
    nextButton.onclick = () => {
      if (hostState && hostState.roomCode) {
        socket.emit('nextQuestion', { roomCode: hostState.roomCode });
      }
    };
  }
}

/**
 * Handles results sequence completion.
 * @param {object} data - Completion data
 */
function handleResultsComplete(data) {
  if (data.sequenceId !== currentSequenceId) return;
  // Animation sequence complete
}

/**
 * Legacy function for instant results (kept for compatibility).
 * @param {object} data - Results data
 * @param {Array} players - Array of players
 */
function displayResults(data, players) {
  // Store data for animation sequence
  animationState.totalScores = data.totalScores;
  animationState.roundScores = data.roundScores;
  animationState.correctAnswer = data.correctAnswer;
  animationState.explanation = data.explanation;
  
  // This function is called by socket handler, but animations are now handled
  // by individual socket events from the ResultsAnimator
  // The actual display happens through the animation sequence events
}
