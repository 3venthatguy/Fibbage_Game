/**
 * Join screen logic for the player.
 */

/**
 * Sets up the join screen inputs and button.
 * @param {Function} onJoin - Callback when join button is clicked
 */
function setupJoinScreen(onJoin) {
  const roomCodeInput = document.getElementById('roomCodeInput');
  const playerNameInput = document.getElementById('playerNameInput');
  const joinButton = document.getElementById('joinButton');

  // Input handlers
  roomCodeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    updateJoinButton();
  });

  playerNameInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.substring(0, 20);
    updateJoinButton();
  });

  // Enter key handlers
  roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !joinButton.disabled) {
      joinButton.click();
    }
  });

  playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !joinButton.disabled) {
      joinButton.click();
    }
  });

  // Join button handler
  joinButton.addEventListener('click', () => {
    const code = roomCodeInput.value.toUpperCase();
    const name = playerNameInput.value.trim();

    if (code.length !== 4 || name.length === 0) {
      return;
    }

    joinButton.disabled = true;
    joinButton.textContent = 'Joining...';
    onJoin(code, name);
  });

  function updateJoinButton() {
    joinButton.disabled = !(roomCodeInput.value.length === 4 && playerNameInput.value.trim().length > 0);
  }

  updateJoinButton();
}

/**
 * Hides the join screen.
 */
function hideJoinScreen() {
  const joinScreen = document.getElementById('joinScreen');
  joinScreen.style.display = 'none';
}

/**
 * Resets the join button state (for error handling).
 */
function resetJoinButton() {
  const joinButton = document.getElementById('joinButton');
  joinButton.disabled = false;
  joinButton.textContent = 'Join Game';
}
