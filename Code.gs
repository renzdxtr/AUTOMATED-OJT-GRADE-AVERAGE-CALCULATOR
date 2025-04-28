const SUMMARY_SHEET = 'Summary'; // Name of the summary sheet where averages will be updated
const SOURCE_SHEET  = 'Grades';  // Name of the source sheet that contains the raw grades data

// Mapping of metric names to zero-based indices in the data rows
const METRICS = {
  A1: 1, A2: 2, A3: 3, A4: 4, A5: 5,
  B1: 6, B2: 7, B3: 8, B4: 9, B5: 10, B6: 11, B7: 12, B8: 13
};

/**
 * Builds a map of student data from the source sheet. The map contains sums and counts for each student.
 * @param {string} sourceSheetName - The name of the source sheet containing the grades data.
 * @returns {Object} - A map of student names to their grade sums and counts.
 */
function buildStudentDataMap(sourceSheetName = SOURCE_SHEET) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();  // Get the active spreadsheet
  const sheet = ss.getSheetByName(sourceSheetName);    // Get the sheet by its name
  if (!sheet) {
    logToastError("source_sheet_missing", { sheetName: sourceSheetName }); // Error if the sheet is missing
    return {};  // Return empty map if sheet is not found
  }

  const lastRow = sheet.getLastRow();  // Get the last row with data
  if (lastRow < 3) {
    logToastError("no_grade_data", { sheetName: sourceSheetName }); // Error if there is no grade data
    return {};  // Return empty map if no grade data exists
  }

  const width = 1 + Object.keys(METRICS).length;  // Number of columns to fetch, including the name column
  const data  = sheet.getRange(3, 1, lastRow - 2, width).getValues();  // Get all data from the sheet starting from row 3
  const map   = {};  // Initialize the map to hold student data
  let countRows = 0;  // Initialize the row counter

  // Loop through each row in the data
  data.forEach(row => {
    const name = row[0];  // The first column in the row is the student name
    if (!name) return;  // Skip empty rows
    countRows++;  // Increment the row counter

    // Initialize the map entry for a new student if it doesn't exist
    if (!map[name]) {
      map[name] = { count: 0, sums: Object.fromEntries(Object.keys(METRICS).map(m => [m, 0])) };
    }
    const entry = map[name];  // Get the student's data entry
    entry.count++;  // Increment the count of grades for this student

    // Update the sums for each metric
    for (const [metric, idx] of Object.entries(METRICS)) {
      entry.sums[metric] += Number(row[idx]) || 0;  // Add the grade for this metric (default to 0 if missing)
    }
  });

  logToastError("data_map_built", { sheetName: sourceSheetName, rowCount: countRows });  // Log the successful data map build
  return map;  // Return the built map
}

/**
 * Updates the Summary sheet with the average grades for each metric (A1–A5 & B1–B8).
 * The averages are calculated per student.
 * @param {string} summarySheetName - The name of the summary sheet to update.
 * @param {string} sourceSheetName - The name of the source sheet containing the raw grades data.
 */
function updateSummaryAverages(
  summarySheetName = SUMMARY_SHEET,
  sourceSheetName  = SOURCE_SHEET
) {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();  // Get the active spreadsheet
  const summary = ss.getSheetByName(summarySheetName);    // Get the summary sheet
  const source  = ss.getSheetByName(sourceSheetName);     // Get the source sheet

  // Error handling if either of the sheets is missing
  if (!summary) {
    logToastError("summary_sheet_missing", { sheetName: summarySheetName });
    return;
  }

  if (!source) {
    logToastError("source_sheet_missing", { sheetName: sourceSheetName });
    return;
  }

  const lastSourceRow = source.getLastRow();  // Get the last row with data in the source sheet
  if (lastSourceRow < 3) return;  // If there is no data to process, exit early

  const metricKeys = Object.keys(METRICS);  // Get all the metric keys (A1, A2, ..., B8)
  const startCol   = METRICS[metricKeys[0]] + 1;  // The column index where the grades start (1-based)
  const numCols    = metricKeys.length;  // The number of columns to fetch (one for each metric)
  const numRows    = lastSourceRow - 2;  // The number of rows to fetch (excluding header rows)
  const range      = source.getRange(3, startCol, numRows, numCols);  // Get the data range for the metrics
  const values     = range.getValues();  // Get the values from the range

  // Check for missing grades and highlight them before proceeding
  const result = checkMissingGrades(values);
  if (result.state) {
    range.setBackgrounds(result.data);  // Highlight the missing grades in the sheet
    logToastError("highlighted_missing_grades", { rowCount: numRows });
    return;  // Abort further updates if there are missing grades
  }

  const lastSummaryRow = summary.getLastRow();  // Get the last row in the summary sheet
  if (lastSummaryRow < 2) {
    logToastError("no_summary_entries", { sheetName: summarySheetName });
    return;  // If no entries exist, exit early
  }

  const names    = summary.getRange(2, 1, lastSummaryRow - 1, 1).getValues().flat();  // Get the student names from the summary sheet
  const dataMap  = buildStudentDataMap(sourceSheetName);  // Build the student data map from the source sheet

  // Calculate the average grades for each student and metric
  const output = names.map(name => {
    if (!dataMap[name]) {
      return metricKeys.map(_ => 0);  // Return 0s if no data exists for this student
    }
    const { count, sums } = dataMap[name];  // Get the count and sums for the student
    return metricKeys.map(m => sums[m] / count);  // Calculate the average for each metric
  });

  // Write the average values to the summary sheet
  summary
    .getRange(2, 2, output.length, metricKeys.length)
    .setValues(output);

  // Format the values as numbers with 2 decimal places
  summary.getRange(2, 2, output.length, metricKeys.length).setNumberFormat("0.00");

  logToastError("summary_updated", { sheetName: summarySheetName, count: output.length });
}

/**
 * Test harness for the updateSummaryAverages function.
 * This function creates test sheets, runs the update, and validates the results.
 */
function testUpdateSummaryAverages() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const GRADES_NAME  = 'GradesTest';  // Test sheet name for grades data
  const SUMMARY_NAME = 'TestSummary';  // Test sheet name for summary
  const metricCount  = Object.keys(METRICS).length;  // Number of metrics (A1–A5 & B1–B8)
  const colCount     = 1 + metricCount;  // Total number of columns in the grades sheet (name + metrics)

  // 1) Create test grades data in 'GradesTest' sheet
  if (ss.getSheetByName(GRADES_NAME)) ss.deleteSheet(ss.getSheetByName(GRADES_NAME));
  const grades = ss.insertSheet(GRADES_NAME);
  grades.getRange(2, 1, 1, colCount).setValues([['Name', ...Object.keys(METRICS)]]);
  grades.getRange(3, 1, 3, colCount).setValues([  // Sample data: Alice and Bob with grades
    ['Alice', ...Array(metricCount).fill(4)],
    ['Bob',   ...Array(metricCount).fill(5)],
    ['Alice', ...Array(metricCount).fill(5)]
  ]);

  // 2) Create test summary sheet 'TestSummary'
  if (ss.getSheetByName(SUMMARY_NAME)) ss.deleteSheet(ss.getSheetByName(SUMMARY_NAME));
  const summary = ss.insertSheet(SUMMARY_NAME);
  summary.getRange(1, 1).setValue('Name');
  summary.getRange(2, 1, 2, 1).setValues([['Alice'], ['Bob']]);

  // 3) Run the updateSummaryAverages function
  updateSummaryAverages(SUMMARY_NAME, GRADES_NAME);

  // 4) Validate the result
  const actual   = summary.getRange(2, 2, 2, metricCount).getValues();  // Get the actual results from the summary
  const expected = [
    Array(metricCount).fill(4.5),  // Expected averages for Alice
    Array(metricCount).fill(5)     // Expected averages for Bob
  ];

  // 5) Check if the actual result matches the expected result
  const pass = actual.length === expected.length
            && actual.every((r,i) => r.every((v,j) => v === expected[i][j]));

  // 6) Toast result based on pass/fail
  if (pass) {
    logToastError("test_passed");
  } else {
    logToastError("test_failed", { expected, actual });
  }
}
