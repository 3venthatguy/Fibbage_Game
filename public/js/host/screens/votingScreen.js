/**
 * Voting phase screen logic for the host.
 */

/**
 * Shows the voting phase UI.
 * @param {Array} players - Players in join order
 */
function showVotingPhase(players) {
  console.log('[VotingScreen] Showing voting phase');
  const submitPhase = document.getElementById('submitPhase');
  const votingPhase = document.getElementById('votingPhase');
  const resultsPhase = document.getElementById('resultsPhase');

  submitPhase.style.display = 'none';
  votingPhase.style.display = 'block';
  resultsPhase.style.display = 'none';

  updateVotingStatus(players, []);

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
  answersGrid.classList.toggle('many', answers.length > 6);

  answers.forEach((answer, index) => {
    // Black tape chips, each slightly tilted and slapped down in turn
    const card = document.createElement('div');
    card.className = 'answer-card tape slap-in';
    card.dataset.answerId = answer.id;
    card.style.setProperty('--tilt', tiltFor(answer.text, 3));
    card.style.setProperty('--delay', `${index * 0.12}s`);

    const answerText = document.createElement('div');
    answerText.textContent = answer.text;
    card.appendChild(answerText);

    answersGrid.appendChild(card);
    console.log('[VotingScreen] Added answer card:', answer.text);
  });

  console.log('[VotingScreen] Total answer cards added:', answers.length);
}

/**
 * Updates the voting status text and lights up players who have voted.
 * Also used to re-render after a disconnect.
 * @param {Array} players - Players in join order
 * @param {Array} votedPlayerIds - IDs of players who have voted
 */
function updateVotingStatus(players, votedPlayerIds) {
  renderPlayerStatus('votingCheckmarks', players, votedPlayerIds);

  const votingStatus = document.getElementById('votingStatus');
  if (!votingStatus) return;

  const votedCount = votedPlayerIds.length;
  if (votedCount === players.length && players.length > 0) {
    votingStatus.textContent = 'All votes submitted!';
  } else {
    votingStatus.textContent = `${votedCount} of ${players.length} players voted`;
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
