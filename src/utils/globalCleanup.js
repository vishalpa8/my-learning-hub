import Dexie from "dexie";
import {
  runComprehensiveDataCleanup,
  validateDatabase,
} from "./comprehensiveDataCleanup.js";

const createDB = () => {
  const db = new Dexie("my-learning-hub-db");
  db.version(1).stores({ "keyval-store": "id" });
  return db;
};

if (typeof window !== "undefined") {
  window.learningHubUtils = {
    async fixDataIssues() {
      try {
        console.log("Starting data cleanup...");
        const db = createDB();
        await runComprehensiveDataCleanup(db);
        console.log("Data cleanup completed! Refresh the page to see changes.");
        console.log("You can now refresh the page to apply the changes.");
        return true;
      } catch (error) {
        console.error("Data cleanup failed:", error);
        console.log(
          'Try using the "Fix Data Issues" button on the homepage instead.'
        );
        return false;
      }
    },

    async validateData() {
      try {
        console.log("Validating database...");
        const db = createDB();
        const report = await validateDatabase(db);
        console.log("Validation Report:");
        console.log("Total records: " + report.totalRecords);
        console.log("Records with issues: " + report.summary.recordsWithIssues);
        console.log("Total issues: " + report.summary.totalIssues);

        if (report.issues.length > 0) {
          console.log("Issues found:");
          report.issues.forEach((record) => {
            console.log("  " + record.id + ":");
            record.issues.forEach((issue) => console.log("    - " + issue));
          });
          console.log(
            "Run learningHubUtils.fixDataIssues() to fix these issues."
          );
        } else {
          console.log("No issues found!");
        }

        return report;
      } catch (error) {
        console.error("Validation failed:", error);
        return null;
      }
    },

    async resetAllData() {
      try {
        console.log("Resetting all data...");
        const db = createDB();
        await db["keyval-store"].clear();
        console.log("All data cleared! Refresh the page.");
        return true;
      } catch (error) {
        console.error("Reset failed:", error);
        return false;
      }
    },

    help() {
      console.log("Learning Hub Utilities");
      console.log("");
      console.log("Available commands:");
      console.log(
        "• learningHubUtils.validateData()    - Check for data issues"
      );
      console.log(
        "• learningHubUtils.fixDataIssues()   - Fix data issues (preserves progress)"
      );
      console.log(
        "• learningHubUtils.resetAllData()    - Clear all data (same as reset button)"
      );
      console.log("• learningHubUtils.help()            - Show this help");
      console.log("");
      console.log("Examples:");
      console.log(
        "  learningHubUtils.validateData()     // Check what issues exist"
      );
      console.log(
        "  learningHubUtils.fixDataIssues()    // Fix issues automatically"
      );
    },
  };

  console.log(
    "Learning Hub utilities loaded! Type learningHubUtils.help() for commands."
  );
}

export { createDB };
