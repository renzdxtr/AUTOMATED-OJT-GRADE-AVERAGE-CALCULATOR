/**
 * Logs toast notifications for errors, successes, and other events in the spreadsheet.
 * The function is modular and provides feedback to the user through the use of toast messages,
 * indicating the status of various processes, such as missing sheets, data loading, or test results.
 *
 * Each event type corresponds to a specific message that informs the user about what happened.
 * The function also accepts context data (if applicable) to further explain the details of the event.
 *
 * — Error events —
 * 1. **summary_sheet_missing**: When the summary sheet cannot be found.
 * 2. **no_summary_entries**: When no student names are found in the summary sheet.
 * 3. **source_sheet_missing**: When the grades source sheet cannot be found.
 * 4. **no_grade_data**: When the grades data is missing or improperly structured.
 * 5. **test_failed**: When an aggregation test fails, showing expected vs. actual data.
 * 6. **highlighted_missing_grades**: When missing grades are found and highlighted.
 *
 * — Success events —
 * 1. **data_map_built**: When the grade data is successfully loaded and processed.
 * 2. **summary_updated**: When the summary sheet is successfully updated with new averages.
 * 3. **test_passed**: When an aggregation test passes successfully.
 * 4. **no_missing_grades**: When no missing grades are found, indicating all entries are complete.
 *
 * @param {string} eventType - The type of event to log. Based on the event, the appropriate toast message will be shown.
 * @param {Object} [contextData={}] - Additional data used to populate the message. For example, sheet names, row counts, or expected/actual values.
 */
function logToastError(eventType, contextData = {}) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); // Get the active spreadsheet instance.

  // Switch case to handle different event types and display appropriate toast messages.
  switch (eventType) {
    // Error events
    case "summary_sheet_missing":
      ss.toast(
        `Could not find the summary sheet "${contextData.sheetName}".`,
        "⚠️ Missing Summary Sheet",
        5
      );
      break;
    case "no_summary_entries":
      ss.toast(
        `No student names found in "${contextData.sheetName}". Nothing to update.`,
        "⚠️ Empty Summary",
        5
      );
      break;
    case "source_sheet_missing":
      ss.toast(
        `Could not find the grades source sheet "${contextData.sheetName}".`,
        "⚠️ Missing Grades Sheet",
        5
      );
      break;
    case "no_grade_data":
      ss.toast(
        `No grade data found in "${contextData.sheetName}". Make sure header is on row 2 and data starts on row 3.`,
        "⚠️ Empty Grades Sheet",
        5
      );
      break;
    case "test_failed":
      ss.toast(
        `Aggregation test failed!\nExpected: ${JSON.stringify(
          contextData.expected
        )}\nActual:   ${JSON.stringify(contextData.actual)}`,
        "❌ Test Failed",
        10
      );
      break;
    case "highlighted_missing_grades":
      ss.toast(
        `Missing grades found and highlighted successfully. Aborting average calculation!`,
        "⚠️ Missing grades found!",
        3
      );
      break;

    // Success events
    case "data_map_built":
      ss.toast(
        `Grade data successfully loaded from "${contextData.sheetName}" (${contextData.rowCount} rows).`,
        "✅ Grades Loaded",
        3
      );
      break;
    case "summary_updated":
      ss.toast(
        `Updated averages in "${contextData.sheetName}" for ${contextData.count} students.`,
        "✅ Summary Updated",
        3
      );
      break;
    case "test_passed":
      ss.toast(`Aggregation test passed ✅`, "✔️ Success", 3);
      break;

    case "no_missing_grades":
      ss.toast(
        `No missing grades detected. All entries are complete!`,
        "✅ Grade check passed",
        3
      );
      break;

    default:
      ss.toast("An unknown event occurred.", "ℹ️ Notice", 5); // Default case for any unexpected event types
      break;
  }
}
