/**
 * Comprehensive utility functions to clean up inconsistent data in IndexedDB
 */
import {
  DSA_COMPLETED_PROBLEMS_KEY,
  CHESS_USER_PROFILE_KEY,
  SEEN_NUGGETS_KEY,
} from '../constants/localIndexedDbKeys';

/**
 * Normalizes dsaCompletedProblems data to ensure all values are ISO timestamp strings
 * @param {Object} db - Dexie database instance
 * @returns {Promise<void>}
 */
export async function normalizeDsaCompletedProblems(db) {
  try {
    const result = await db['keyval-store'].get(DSA_COMPLETED_PROBLEMS_KEY);

    if (!result || !result.value) {
      console.log('No DSA completed problems data found');
      return;
    }

    const completedProblems = result.value;
    let hasChanges = false;
    const normalizedData = {};

    // Remove allActivityDates field if it exists (it shouldn't be here)
    if ('allActivityDates' in completedProblems) {
      hasChanges = true;
      console.log(
        'Removed invalid allActivityDates field from dsaCompletedProblems'
      );
    }

    // Convert boolean true values to current timestamp
    for (const [problemId, value] of Object.entries(completedProblems)) {
      if (problemId === 'allActivityDates') {
        continue; // Skip this invalid field
      }

      if (value === true) {
        // Convert boolean true to a timestamp (use current time as fallback)
        normalizedData[problemId] = new Date().toISOString();
        hasChanges = true;
        console.log(
          `Normalized ${problemId}: true -> ${normalizedData[problemId]}`
        );
      } else if (
        typeof value === 'string' &&
        value.includes('T') &&
        value.includes('Z')
      ) {
        // Already a valid ISO timestamp
        normalizedData[problemId] = value;
      } else {
        // Invalid value, convert to current timestamp
        normalizedData[problemId] = new Date().toISOString();
        hasChanges = true;
        console.log(
          `Fixed invalid value for ${problemId}: ${value} -> ${normalizedData[problemId]}`
        );
      }
    }

    if (hasChanges) {
      await db['keyval-store'].put({
        id: DSA_COMPLETED_PROBLEMS_KEY,
        value: normalizedData,
      });
      console.log('Successfully normalized dsaCompletedProblems data');
    } else {
      console.log('No changes needed for dsaCompletedProblems data');
    }
  } catch (error) {
    console.error('Error normalizing DSA completed problems:', error);
  }
}

/**
 * Normalizes chessUserProfile data
 * @param {Object} db - Dexie database instance
 * @returns {Promise<void>}
 */
export async function normalizeChessUserProfile(db) {
  try {
    const result = await db['keyval-store'].get(CHESS_USER_PROFILE_KEY);

    if (!result || !result.value) {
      console.log('No chess user profile data found');
      return;
    }

    const userProfile = result.value;
    let hasChanges = false;

    // Example normalization: ensure rating is a number
    if (typeof userProfile.rating !== 'number') {
      userProfile.rating = parseInt(userProfile.rating, 10) || 1200;
      hasChanges = true;
      console.log(`Normalized chess rating to ${userProfile.rating}`);
    }

    if (hasChanges) {
      await db['keyval-store'].put({
        id: CHESS_USER_PROFILE_KEY,
        value: userProfile,
      });
      console.log('Successfully normalized chess user profile');
    } else {
      console.log('No changes needed for chess user profile');
    }
  } catch (error) {
    console.error('Error normalizing chess user profile:', error);
  }
}

/**
 * Normalizes seenNuggets data
 * @param {Object} db - Dexie database instance
 * @returns {Promise<void>}
 */
export async function normalizeSeenNuggets(db) {
  try {
    const result = await db['keyval-store'].get(SEEN_NUGGETS_KEY);

    if (!result || !result.value) {
      console.log('No seen nuggets data found');
      return;
    }

    const seenNuggets = result.value;
    let hasChanges = false;

    // Example normalization: ensure all values are booleans
    for (const [nuggetId, value] of Object.entries(seenNuggets)) {
      if (typeof value !== 'boolean') {
        seenNuggets[nuggetId] = true; // Or some other logic
        hasChanges = true;
        console.log(`Normalized seen nugget ${nuggetId} to true`);
      }
    }

    if (hasChanges) {
      await db['keyval-store'].put({
        id: SEEN_NUGGETS_KEY,
        value: seenNuggets,
      });
      console.log('Successfully normalized seen nuggets');
    } else {
      console.log('No changes needed for seen nuggets');
    }
  } catch (error) {
    console.error('Error normalizing seen nuggets:', error);
  }
}

/**
 * Runs all data normalization functions
 * @param {Object} db - Dexie database instance
 * @returns {Promise<void>}
 */
export async function runAllNormalizations(db) {
  console.log('Starting data normalization...');
  await normalizeDsaCompletedProblems(db);
  await normalizeChessUserProfile(db);
  await normalizeSeenNuggets(db);
  console.log('Data normalization complete.');
}