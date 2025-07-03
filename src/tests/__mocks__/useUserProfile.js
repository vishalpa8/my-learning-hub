import { vi } from 'vitest';

let _mockUserProfile = { points: 0, currentStreak: 0, earnedBadges: [] };
let _mockAddPoints = vi.fn();
let _mockUpdateStreak = vi.fn();
let _mockEarnBadge = vi.fn();

export const useUserProfile = vi.fn(() => [
  _mockUserProfile,
  _mockAddPoints,
  _mockUpdateStreak,
  _mockEarnBadge,
  false,
]);

export const __resetAllMocks = () => {
  _mockUserProfile = { points: 0, currentStreak: 0, earnedBadges: [] };
  _mockAddPoints = vi.fn();
  _mockUpdateStreak = vi.fn();
  _mockEarnBadge = vi.fn();
};
