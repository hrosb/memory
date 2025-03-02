/**
 * Collection of encouragement messages to display to users who didn't make the leaderboard
 */
export const encouragementMessages = [
  "Nice try, but these high scores are tougher than a two-dollar steak! 🥩",
  "Close, but no banana! 🍌 The top players have been practicing since the Stone Age.",
  "Well, at least you didn't break your keyboard! 😅 Want another shot?",
  "The good news: you completed the game! The bad news: the high scores are being difficult. 🎮",
  "Even Einstein had to practice! (But he probably would've gotten a high score) 🧠",
  "You're getting better! The high scores are just playing hard to get. 💫",
  "Remember: every master was once a beginner! (Except maybe these high score holders) 🌟"
];

/**
 * Get a random encouragement message
 * @returns A randomly selected message from the encouragement messages array
 */
export function getRandomEncouragement(): string {
  return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
}
