import { vi } from 'vitest';
import { DSA_LAST_ACTIVE_VIEW_KEY, DSA_REWARD_TRACKER_KEY, CHESS_USER_PROFILE_KEY } from '../../constants/localIndexedDbKeys';

// Internal mock state
let _mockLastActiveView = null;
let _mockRewardTracker = {
  lastKnownTotalCompletedDSA: 0,
  completedSinceLastRewardDSA: 0,
  lastKnownTotalCompletedChess: 0,
  completedSinceLastRewardChess: 0,
  availableRewards: [],
  rewardPending: false,
  pendingMessage: '',
};
let _mockCompletedVideos = {};

// Exposed setters for test control
export const __setMockLastActiveView = (value) => {
  _mockLastActiveView = value;
};

export const getMockLastActiveView = () => {
  return _mockLastActiveView;
};

// Reset all internal state (for beforeEach)
export const __resetAllMocks = () => {
  _mockLastActiveView = null;
  _mockRewardTracker = {
    lastKnownTotalCompletedDSA: 0,
    completedSinceLastRewardDSA: 0,
    lastKnownTotalCompletedChess: 0,
    completedSinceLastRewardChess: 0,
    availableRewards: [],
    rewardPending: false,
    pendingMessage: '',
  };
  _mockCompletedVideos = {};
};

// Actual mock hook implementation used in tests
export const useIndexedDb = vi.fn((key, defaultValue) => {
  let stateValue;
  let setStateFn;

  if (key === DSA_LAST_ACTIVE_VIEW_KEY) {
    // Always return _mockLastActiveView for this key, ignoring defaultValue
    stateValue = _mockLastActiveView;
    setStateFn = vi.fn((newValue) => {
      _mockLastActiveView = typeof newValue === 'function' ? newValue(_mockLastActiveView) : newValue;
    });
  } else if (key === DSA_REWARD_TRACKER_KEY) {
    stateValue = _mockRewardTracker !== null ? _mockRewardTracker : defaultValue;
    setStateFn = vi.fn((newValue) => {
      _mockRewardTracker = typeof newValue === 'function' ? newValue(_mockRewardTracker) : newValue;
    });
  } else if (key === CHESS_USER_PROFILE_KEY) {
    stateValue = _mockCompletedVideos !== null ? _mockCompletedVideos : defaultValue;
    setStateFn = vi.fn((newValue) => {
      _mockCompletedVideos = typeof newValue === 'function' ? newValue(_mockCompletedVideos) : newValue;
    });
  } else {
    stateValue = defaultValue;
    setStateFn = vi.fn();
  }

  return [stateValue, setStateFn];
});
