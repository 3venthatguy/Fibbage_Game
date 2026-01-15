/**
 * Timer class for managing phase timers.
 */

class Timer {
  constructor() {
    this.startTime = null;
    this.duration = 0;
    this.pausedAt = null;
    this.pausedTimeRemaining = 0;
  }

  /**
   * Starts the timer with the specified duration.
   * @param {number} durationSeconds - Duration in seconds
   */
  start(durationSeconds) {
    this.startTime = Date.now();
    this.duration = durationSeconds * 1000;
  }

  /**
   * Gets the remaining time in seconds.
   * @returns {number} Remaining time in seconds
   */
  getTimeRemaining() {
    // If paused, return the paused time
    if (this.pausedAt !== null) {
      return this.pausedTimeRemaining;
    }

    if (!this.startTime) return 0;
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, Math.ceil((this.duration - elapsed) / 1000));
    return remaining;
  }

  /**
   * Checks if the timer has expired.
   * @returns {boolean} True if expired, false otherwise
   */
  isExpired() {
    return this.getTimeRemaining() <= 0;
  }

  /**
   * Pauses the timer.
   */
  pause() {
    if (this.pausedAt !== null) return; // Already paused
    if (!this.startTime) return; // Not started

    this.pausedAt = Date.now();
    this.pausedTimeRemaining = this.getTimeRemaining();
  }

  /**
   * Resumes the timer.
   */
  resume() {
    if (this.pausedAt === null) return; // Not paused

    // Calculate how much time was remaining when paused
    const remainingMs = this.pausedTimeRemaining * 1000;

    // Reset start time and duration to continue from where we left off
    this.startTime = Date.now();
    this.duration = remainingMs;

    // Clear pause state
    this.pausedAt = null;
    this.pausedTimeRemaining = 0;
  }

  /**
   * Checks if the timer is paused.
   * @returns {boolean} True if paused, false otherwise
   */
  isPaused() {
    return this.pausedAt !== null;
  }

  /**
   * Resets the timer.
   */
  reset() {
    this.startTime = null;
    this.duration = 0;
    this.pausedAt = null;
    this.pausedTimeRemaining = 0;
  }
}

module.exports = Timer;
