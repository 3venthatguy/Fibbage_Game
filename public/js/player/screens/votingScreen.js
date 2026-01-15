/**
 * Voting phase screen logic for the player.
 */

/**
 * Shows the voting phase UI.
 */
function showPlayerVotingPhase() {
  const submitPhase = document.getElementById('submitPhase');
  const votingPhase = document.getElementById('votingPhase');
  const watchScreen = document.getElementById('watchScreen');
  const votingWaiting = document.getElementById('votingWaiting');

  submitPhase.style.display = 'none';
  votingPhase.style.display = 'block';
  if (watchScreen) {
    watchScreen.style.display = 'none';
  }
  votingWaiting.style.display = 'none';
}

/**
 * Displays the voting answers (excluding player's own answer).
 * @param {Array} answers - Array of answer objects
 * @param {string} playerId - Current player's ID
 * @param {Function} onVote - Callback when an answer is voted for
 */
function displayPlayerVotingAnswers(answers, playerId, onVote) {
  const answersList = document.getElementById('answersList');
  answersList.innerHTML = '';

  // Filter out the player's own answer - they should not see it at all
  const votableAnswers = answers.filter(answer => answer.id !== playerId);

  votableAnswers.forEach((answer) => {
    const button = document.createElement('button');
    button.className = 'answer-button';
    button.textContent = answer.text;
    button.dataset.answerId = answer.id;

    button.addEventListener('click', () => {
      const playerState = window.playerState;
      if (playerState.submittedVote) return;

      // Remove previous selection
      answersList.querySelectorAll('.answer-button').forEach(btn => {
        btn.classList.remove('selected');
      });

      button.classList.add('selected');
      playerState.selectedAnswerId = answer.id;

      onVote(answer.id);
    });

    answersList.appendChild(button);
  });
}

/**
 * Shows the voting waiting state.
 */
function showVotingWaiting() {
  const votingWaiting = document.getElementById('votingWaiting');
  const answersList = document.getElementById('answersList');

  votingWaiting.style.display = 'block';

  // Disable all buttons
  answersList.querySelectorAll('.answer-button').forEach(btn => {
    btn.disabled = true;
  });
}

/**
 * Shows the watch screen after voting.
 * Immediately directs player to look at main screen.
 */
function showWatchScreen() {
  const submitPhase = document.getElementById('submitPhase');
  const votingPhase = document.getElementById('votingPhase');
  const watchScreen = document.getElementById('watchScreen');
  const questionDisplay = document.getElementById('questionDisplay');
  const questionNumber = document.getElementById('questionNumber');
  const timerDisplay = document.getElementById('timerDisplay');

  submitPhase.style.display = 'none';
  votingPhase.style.display = 'none';
  watchScreen.style.display = 'flex';

  // Hide question, question number, and timer on watch screen
  if (questionDisplay) {
    questionDisplay.style.display = 'none';
  }
  if (questionNumber) {
    questionNumber.style.display = 'none';
  }
  if (timerDisplay) {
    timerDisplay.style.display = 'none';
  }
}
