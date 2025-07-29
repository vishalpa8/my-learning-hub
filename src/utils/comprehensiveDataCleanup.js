import {
  DSA_COMPLETED_PROBLEMS_KEY,
  CHESS_USER_PROFILE_KEY,
  SEEN_NUGGETS_KEY,
} from "../constants/localIndexedDbKeys";

export async function normalizeDsaCompletedProblems(db) {
  try {
    const result = await db["keyval-store"].get(DSA_COMPLETED_PROBLEMS_KEY);

    if (!result || !result.value) {
      console.log("No DSA completed problems data found");
      return;
    }

    const completedProblems = result.value;
    let hasChanges = false;
    const normalizedData = {};

    if ("allActivityDates" in completedProblems) {
      hasChanges = true;
      console.log(
        "Removed invalid allActivityDates field from dsaCompletedProblems"
      );
    }

    for (const [problemId, value] of Object.entries(completedProblems)) {
      if (problemId === "allActivityDates") {
        continue;
      }

      if (value === true) {
        normalizedData[problemId] = new Date().toISOString();
        hasChanges = true;
        console.log(
          "Normalized " + problemId + ": true -> " + normalizedData[problemId]
        );
      } else if (
        typeof value === "string" &&
        value.includes("T") &&
        value.includes("Z")
      ) {
        normalizedData[problemId] = value;
      } else {
        normalizedData[problemId] = new Date().toISOString();
        hasChanges = true;
        console.log(
          "Fixed invalid value for " +
            problemId +
            ": " +
            value +
            " -> " +
            normalizedData[problemId]
        );
      }
    }

    if (hasChanges) {
      await db["keyval-store"].put({
        id: DSA_COMPLETED_PROBLEMS_KEY,
        value: normalizedData,
      });
      console.log("DSA completed problems data normalized successfully");
    } else {
      console.log("DSA completed problems data is already normalized");
    }
  } catch (error) {
    console.error("Error normalizing DSA completed problems:", error);
    throw error;
  }
}

export async function removeInvalidActivityDates(db) {
  try {
    const allRecords = await db["keyval-store"].toArray();

    for (const record of allRecords) {
      if (
        record.id !== CHESS_USER_PROFILE_KEY &&
        record.value &&
        typeof record.value === "object" &&
        record.value !== null &&
        "allActivityDates" in record.value
      ) {
        delete record.value.allActivityDates;
        await db["keyval-store"].put(record);
        console.log("Removed invalid allActivityDates from " + record.id);
      }
    }

    console.log("Cleanup of invalid allActivityDates completed");
  } catch (error) {
    console.error("Error cleaning up invalid activity dates:", error);
    throw error;
  }
}

export async function deduplicateChessActivityDates(db) {
  try {
    const result = await db["keyval-store"].get(CHESS_USER_PROFILE_KEY);

    if (
      !result ||
      !result.value ||
      !Array.isArray(result.value.allActivityDates)
    ) {
      console.log("No chess user profile or allActivityDates found");
      return;
    }

    const profile = result.value;
    const originalDates = profile.allActivityDates;
    const uniqueDates = [...new Set(originalDates)];

    if (originalDates.length !== uniqueDates.length) {
      profile.allActivityDates = uniqueDates;
      await db["keyval-store"].put({
        id: CHESS_USER_PROFILE_KEY,
        value: profile,
      });
      console.log(
        "Removed " +
          (originalDates.length - uniqueDates.length) +
          " duplicate dates from chess profile"
      );
      console.log(
        "Original: " +
          originalDates.length +
          " dates, After cleanup: " +
          uniqueDates.length +
          " dates"
      );
    } else {
      console.log("No duplicate dates found in chess profile");
    }
  } catch (error) {
    console.error("Error deduplicating chess activity dates:", error);
    throw error;
  }
}

export async function fixSeenNuggetsKeys(db) {
  try {
    const result = await db["keyval-store"].get(SEEN_NUGGETS_KEY);

    if (!result || !result.value) {
      console.log("No seen nuggets data found");
      return;
    }

    const seenNuggets = result.value;
    let hasChanges = false;
    const cleanedData = {};

    for (const [key, value] of Object.entries(seenNuggets)) {
      if (key === "[object Object]" || key === "undefined") {
        hasChanges = true;
        console.log("Removed invalid key: " + key);
      } else {
        cleanedData[key] = value;
      }
    }

    if (hasChanges) {
      await db["keyval-store"].put({
        id: SEEN_NUGGETS_KEY,
        value: cleanedData,
      });
      console.log("Seen nuggets data cleaned successfully");
    } else {
      console.log("Seen nuggets data is already clean");
    }
  } catch (error) {
    console.error("Error fixing seen nuggets keys:", error);
    throw error;
  }
}

export async function validateDatabase(db) {
  try {
    const allRecords = await db["keyval-store"].toArray();
    const report = {
      totalRecords: allRecords.length,
      issues: [],
      validRecords: [],
      summary: {},
    };

    for (const record of allRecords) {
      const recordReport = {
        id: record.id,
        issues: [],
      };

      if (
        record.id !== CHESS_USER_PROFILE_KEY &&
        record.value &&
        typeof record.value === "object" &&
        record.value !== null &&
        "allActivityDates" in record.value
      ) {
        recordReport.issues.push(
          "Has allActivityDates field (should only be in chessUserProfile)"
        );
      }

      if (
        record.id === DSA_COMPLETED_PROBLEMS_KEY &&
        record.value &&
        typeof record.value === "object" &&
        record.value !== null
      ) {
        for (const [key, value] of Object.entries(record.value)) {
          if (key === "allActivityDates") {
            recordReport.issues.push("Contains invalid allActivityDates field");
          } else if (value === true) {
            recordReport.issues.push(
              "Problem " + key + " has boolean value instead of timestamp"
            );
          } else if (
            typeof value !== "string" ||
            !value.includes("T") ||
            !value.includes("Z")
          ) {
            recordReport.issues.push(
              "Problem " + key + " has invalid timestamp format: " + value
            );
          }
        }
      }

      if (
        record.id === CHESS_USER_PROFILE_KEY &&
        record.value &&
        typeof record.value === "object" &&
        record.value !== null &&
        Array.isArray(record.value.allActivityDates)
      ) {
        const dates = record.value.allActivityDates;
        const uniqueDates = [...new Set(dates)];
        if (dates.length !== uniqueDates.length) {
          recordReport.issues.push(
            "Has " +
              (dates.length - uniqueDates.length) +
              " duplicate activity dates"
          );
        }
      }

      if (
        record.id === SEEN_NUGGETS_KEY &&
        record.value &&
        typeof record.value === "object" &&
        record.value !== null
      ) {
        for (const key of Object.keys(record.value)) {
          if (key === "[object Object]" || key === "undefined") {
            recordReport.issues.push("Has invalid key: " + key);
          }
        }
      }

      if (recordReport.issues.length > 0) {
        report.issues.push(recordReport);
      } else {
        report.validRecords.push(record.id);
      }
    }

    report.summary = {
      totalIssues: report.issues.reduce(
        (sum, record) => sum + record.issues.length,
        0
      ),
      recordsWithIssues: report.issues.length,
      validRecords: report.validRecords.length,
    };

    return report;
  } catch (error) {
    console.error("Error validating database:", error);
    throw error;
  }
}

export async function runComprehensiveDataCleanup(db) {
  console.log("Starting comprehensive data cleanup...");

  try {
    console.log("=== VALIDATION REPORT ===");
    const report = await validateDatabase(db);
    console.log("Total records: " + report.totalRecords);
    console.log("Records with issues: " + report.summary.recordsWithIssues);
    console.log("Total issues found: " + report.summary.totalIssues);

    if (report.issues.length > 0) {
      console.log("Issues found:");
      report.issues.forEach((record) => {
        console.log("  " + record.id + ":");
        record.issues.forEach((issue) => console.log("    - " + issue));
      });
    }

    console.log("=== RUNNING CLEANUP ===");
    await normalizeDsaCompletedProblems(db);
    await removeInvalidActivityDates(db);
    await deduplicateChessActivityDates(db);
    await fixSeenNuggetsKeys(db);

    console.log("=== POST-CLEANUP VALIDATION ===");
    const postReport = await validateDatabase(db);
    console.log("Issues remaining: " + postReport.summary.totalIssues);

    if (postReport.summary.totalIssues === 0) {
      console.log("All issues have been resolved!");
    } else {
      console.log("Some issues remain:");
      postReport.issues.forEach((record) => {
        console.log("  " + record.id + ":");
        record.issues.forEach((issue) => console.log("    - " + issue));
      });
    }

    console.log("Data cleanup completed successfully");
  } catch (error) {
    console.error("Data cleanup failed:", error);
    throw error;
  }
}
