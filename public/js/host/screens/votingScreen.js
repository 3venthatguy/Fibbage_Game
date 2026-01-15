/**
 * Voting phase screen logic for the host.
 */

/**
 * Shows the voting phase UI.
 * @param {number} playerCount - Number of players
 */
function showVotingPhase(playerCount) {
  console.log('[VotingScreen] Showing voting phase');
  const submitPhase = document.getElementById('submitPhase');
  const votingPhase = document.getElementById('votingPhase');
  const resultsPhase = document.getElementById('resultsPhase');

  submitPhase.style.display = 'none';
  votingPhase.style.display = 'block';
  resultsPhase.style.display = 'none';

  // Initialize voting checkmarks
  const votingCheckmarks = document.getElementById('votingCheckmarks');
  if (votingCheckmarks && playerCount) {
    votingCheckmarks.innerHTML = '';
    for (let i = 0; i < playerCount; i++) {
      const checkmark = document.createElement('div');
      checkmark.className = 'checkmark';
      checkmark.textContent = '✓';
      votingCheckmarks.appendChild(checkmark);
    }
  }

  // Debug: Check if answers are in the grid
  const answersGrid = document.getElementById('answersGrid');
  console.log('[VotingScreen] Voting phase UI updated');
  console.log('[VotingScreen] votingPhase display:', votingPhase.style.display);
  console.log('[VotingScreen] answersGrid children count:', answersGrid?.children.length);
  console.log('[VotingScreen] answersGrid HTML:', answersGrid?.innerHTML.substring(0, 200));
}

/**
 * Displays the voting answers.
 * @param {Array} answers - Array of answer objects
 */
function displayVotingAnswers(answers) {
  console.log('[VotingScreen] Displaying voting answers:', answers);
  const answersGrid = document.getElementById('answersGrid');
  if (!answersGrid) {
    console.error('[VotingScreen] answersGrid element not found!');
    return;
  }

  answersGrid.innerHTML = '';

  answers.forEach((answer) => {
    const card = document.createElement('div');
    card.className = 'answer-card';
    card.dataset.answerId = answer.id;

    const answerText = document.createElement('div');
    answerText.textContent = answer.text;
    answerText.style.flex = '1';
    card.appendChild(answerText);

    answersGrid.appendChild(card);
    console.log('[VotingScreen] Added answer card:', answer.text);
  });

  console.log('[VotingScreen] Total answer cards added:', answers.length);
}

/**
 * Updates the voting status display.
 * @param {number} votedCount - Number of players who voted
 * @param {number} totalPlayers - Total number of players
 */
function updateVotingStatus(votedCount, totalPlayers) {
  const votingStatus = document.getElementById('votingStatus');
  if (votingStatus) {
    votingStatus.textContent = `${votedCount}/${totalPlayers} players voted`;
  }

  // Update checkmarks
  const votingCheckmarks = document.getElementById('votingCheckmarks');
  if (votingCheckmarks) {
    const checkmarks = votingCheckmarks.querySelectorAll('.checkmark');
    for (let i = 0; i < votedCount; i++) {
      if (checkmarks[i]) {
        checkmarks[i].classList.add('submitted');
      }
    }
  }
}

/**
 * Shows all votes submitted message.
 */
function showAllVotesSubmitted() {
  const votingStatus = document.getElementById('votingStatus');
  if (votingStatus) {
    votingStatus.textContent = 'All votes submitted!';
  }
}
