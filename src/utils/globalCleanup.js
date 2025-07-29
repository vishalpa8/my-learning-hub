/**
 * Global cleanup utilities - exposed to window for advanced users
 */
import Dexie from 'dexie';
import { runAllNormalizations } from './comprehensiveDataCleanup.js';

// Create database connection
const createDB = () => {
  const db = new Dexie('my-learning-hub-db');
  db.version(1).stores({
    'keyval-store': 'id',
  });
  return db;
};

// Expose cleanup functions globally for advanced users
if (typeof window !== 'undefined') {
  window.learningHubUtils = {
    /**
     * Fix data issues without resetting progress
     */
    async fixDataIssues() {
      try {
        console.log('🔧 Starting data cleanup...');
        const db = createDB();
        await runAllNormalizations(db);
        console.log(
          '✅ Data cleanup completed! Refresh the page to see changes.'
        );
        console.log('💡 You can now refresh the page to apply the changes.');
        return true;
      } catch (error) {
        console.error('❌ Data cleanup failed:', error);
        console.log(
          '💡 Try using the "Fix Data Issues" button on the homepage instead.'
        );
        return false;
      }
    },
    /**
     * Clear all data (same as reset button)
     */
    async clearAllData() {
      try {
        console.log('🗑️ Clearing all data...');
        const db = createDB();
        await db.delete();
        console.log('✅ All data cleared! The application will now reload.');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return true;
      } catch (error) {
        console.error('❌ Failed to clear all data:', error);
        return false;
      }
    },
  };
}