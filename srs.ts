// Spaced Repetition System - Leitner Algorithm
// Simplified version: intervals double on correct, reset to 1 on wrong

// Standard intervals for the Leitner system (in days)
export const LEITNER_INTERVALS = [1, 3, 7, 14, 30, 60, 120];

export interface ReviewResult {
  remembered: boolean;
}

export interface SRSUpdate {
  nextReviewDate: Date;
  interval: number;
  easeFactor: number;
  timesReviewed: number;
  timesRemembered: number;
  timesForgot: number;
  lastReviewedAt: Date;
}

/**
 * Calculate the next review date and interval based on user's response
 * 
 * @param currentInterval - Current interval in days
 * @param remembered - Whether the user remembered the fact
 * @param currentEaseFactor - Current ease factor (default 2.5)
 * @returns Updated SRS data
 */
export function calculateNextReview(
  currentInterval: number,
  remembered: boolean,
  currentEaseFactor: number = 2.5
): SRSUpdate {
  const now = new Date();
  let newInterval: number;
  let newEaseFactor: number;
  let timesRemembered = 0;
  let timesForgot = 0;

  if (remembered) {
    // User remembered: double the interval (or use next Leitner level)
    // Find current level in Leitner intervals
    const currentLevelIndex = LEITNER_INTERVALS.findIndex(
      (interval) => interval >= currentInterval
    );
    
    if (currentLevelIndex === -1 || currentLevelIndex === LEITNER_INTERVALS.length - 1) {
      // Already at max level, keep same interval
      newInterval = currentInterval;
    } else {
      // Move to next level
      newInterval = LEITNER_INTERVALS[currentLevelIndex + 1];
    }

    // Slight increase to ease factor (max 3.0)
    newEaseFactor = Math.min(3.0, currentEaseFactor + 0.1);
    timesRemembered = 1;
  } else {
    // User forgot: reset to 1 day
    newInterval = 1;
    
    // Decrease ease factor (min 1.3)
    newEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
    timesForgot = 1;
  }

  // Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  nextReviewDate.setHours(0, 0, 0, 0); // Set to start of day

  return {
    nextReviewDate,
    interval: newInterval,
    easeFactor: newEaseFactor,
    timesReviewed: 1,
    timesRemembered,
    timesForgot,
    lastReviewedAt: now,
  };
}

/**
 * Check if a fact is due for review today
 */
export function isDueForReview(nextReviewDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reviewDate = new Date(nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);
  
  return reviewDate <= today;
}

/**
 * Get the next interval for display purposes
 */
export function getNextIntervalDisplay(currentInterval: number, remembered: boolean): string {
  if (remembered) {
    const currentLevelIndex = LEITNER_INTERVALS.findIndex(
      (interval) => interval >= currentInterval
    );
    
    if (currentLevelIndex === -1 || currentLevelIndex === LEITNER_INTERVALS.length - 1) {
      return `${currentInterval} days`;
    }
    return `${LEITNER_INTERVALS[currentLevelIndex + 1]} days`;
  }
  return '1 day';
}

/**
 * Get motivational message based on review performance
 */
export function getReviewMessage(successRate: number): string {
  if (successRate >= 0.9) return '🌟 Outstanding memory!';
  if (successRate >= 0.7) return '💪 Great recall!';
  if (successRate >= 0.5) return '📚 Keep practicing!';
  return '🧠 Building those connections!';
}
