/**
 * Modular Toast Logger Function (errors & successes)
 */
function logToastError(eventType, contextData = {}) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  switch (eventType) {
    // — Errors —
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

    // — Successes —
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

    default:
      ss.toast("An unknown event occurred.", "ℹ️ Notice", 5);
      break;
  }
}
