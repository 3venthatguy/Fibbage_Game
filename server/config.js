/**
 * Configuration constants for the Fibbage game.
 * Contains all magic numbers, timeouts, and game settings.
 */

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  CORS_ORIGIN: "*",

  // Room configuration
  ROOM_CODE_LENGTH: 4,
  ROOM_CODE_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes

  // Game configuration
  MIN_PLAYERS: 2,
  QUESTIONS_PER_GAME: 8,  // Total questions (matches TOTAL_QUESTIONS)
  MAX_PLAYER_NAME_LENGTH: 20,
  MAX_ANSWER_LENGTH: 100,

  // Phase durations (in seconds)
  READING_PHASE_DURATION: 8,
  SUBMIT_PHASE_DURATION: 35,
  VOTING_PHASE_DURATION: 20,

  // Transition delays (in milliseconds)
  GAME_START_DELAY: 2000,
  NEXT_QUESTION_DELAY: 0, // No delay when advancing to next question from leaderboard
  VOTING_TRANSITION_DELAY: 1000,
  RESULTS_TRANSITION_DELAY: 3000, // Increased to allow time_to_vote.mp3 to play + 2s delay
  AUTO_ADVANCE_DELAY: 3000,

  // Scoring
  CORRECT_VOTE_POINTS: 1000,
  FOOL_PLAYER_POINTS: 500,
  DUPLICATE_FOOL_POINTS: 250, // Fixed points when 2+ players submit the same answer

  // Point Multiplier Configuration
  QUESTIONS_BEFORE_DOUBLE: 3,  // After question 3, points double (questions 4-7 are 2x)
  QUESTIONS_BEFORE_TRIPLE: 5,  // After question 7, points triple (question 8 is 3x)
  TOTAL_QUESTIONS: 6,

  // Game text customization
  GAME_TITLE: 'ECON FIBBAGE',
  GAME_RULES: `Welcome to ECON FIBBAGE! Here's how to play:

1. You'll play through 8 fill-in-the-blank questions
2. Make up a LIE that sounds believable to fill in the blank
3. Everyone votes on which answer they think is TRUE
4. Earn points by:
   • Fooling other players with your lie
   • Voting for the correct answer
5. The player with the most points wins!

Remember: The best lies are the ones that sound almost true!`,

  // Timer broadcast interval
  TIMER_BROADCAST_INTERVAL: 1000,

  // Multiplier Announcement Animation Timings (in milliseconds)
  MULTIPLIER_ANIMATION_TIMINGS: {
    fadeToBlack: 500,           // Duration for screen fade to black
    textZoomIn: 800,            // Duration for text zoom entrance (scale 0 → 1.2 → 1.0)
    holdDuration: 3500,         // How long to hold the announcement on screen
    fadeOut: 500,               // Duration for fade out transition
    particlesDuration: 3500     // Duration for confetti/particles animation
  },

  // Results animation timings (in milliseconds)
  RESULTS_ANIMATION_TIMINGS: {
    initialAnswerDelay: 2000,           // Delay after showing all answers before highlighting first one
    answerHighlight: 1000,              // Duration for highlighting a fake answer before revealing it
    suspensePause: 1500,                // Pause duration to build suspense before showing who fooled whom
    lieRevealDuration: 1500,            // Duration to display "IT'S A LIE!" text above fake answer
    voterAppearStagger: 1000,           // Time between each fooled player appearing on screen
    authorRevealDuration: 1000,         // Duration to show the author who created the fake answer
    scoreAnimationDuration: 1300,       // Duration for score counting animation and point displays
    reactionPause: 1500,                // Pause to let players react before moving to next answer
    transitionDuration: 1000,           // Duration for fade-out transition between answers
    correctAnswerHighlight: 1000,       // Duration for highlighting the correct answer
    truthRevealDuration: 1500,          // Duration to display "THE TRUTH!" text above correct answer
    correctVoterAppearStagger: 1500,    // Time between each correct voter appearing on screen
    explanationDisplay: 4000,           // Duration to display the explanation text
    scoreboardAnimation: 2000,          // Duration for the leaderboard animation
    betweenAnswers: 500                 // Short pause between processing different answers
  }
};
