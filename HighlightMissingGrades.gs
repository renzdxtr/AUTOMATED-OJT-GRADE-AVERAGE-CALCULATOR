/**
 * Checks for missing grades (empty, null, or NaN values) in the provided data.
 * If any missing grade is detected, it highlights the cell in a reddish color.
 * 
 * @param {Array} values - The 2D array of grade values to check for missing entries.
 * @returns {Object} - An object containing:
 *   - state (Boolean): Whether any missing grades were found (true/false).
 *   - data (Array): A 2D array of background colors to apply to the range,
 *     where missing values are highlighted in red (#dd7e6b) and others have no background.
 */
function checkMissingGrades(values) {
  let hasMissing = false;

  // Iterate over each row and each value to check for missing grades
  const backgrounds = values.map((row) =>
    row.map((value) => {
      // A grade is considered missing if it's empty, null, or NaN
      const isMissing = value === "" || value === null || isNaN(value);
      if (isMissing) hasMissing = true; // Flag that there are missing grades
      // Apply red background if the grade is missing
      return isMissing ? "#dd7e6b" : null;
    })
  );

  return { state: hasMissing, data: backgrounds };
}

/**
 * Highlights cells with missing grades (empty, null, or NaN values) in the source sheet.
 * It also displays a toast message to indicate whether missing grades were found and highlighted.
 * 
 * @param {string} [sheetName=SOURCE_SHEET] - The name of the sheet to check for missing grades.
 *   Defaults to 'Grades' if not provided.
 */
function highlightMissingGrades(sheetName = SOURCE_SHEET) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  // Check if the sheet exists
  if (!sheet) {
    logToastError("source_sheet_missing", { sheetName });
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return; // If there is no data, exit early

  const metricKeys = Object.keys(METRICS); // Get the list of metric keys (columns)
  const startCol = METRICS[metricKeys[0]] + 1; // Start column based on the first metric
  const numCols = metricKeys.length; // Number of columns to check for grades
  const numRows = lastRow - 2; // The number of rows with data (excluding header)
  
  const range = sheet.getRange(3, startCol, numRows, numCols); // Get the range of grade data
  const values = range.getValues(); // Get the actual grade values

  // Check for missing grades and return the result (highlighting info)
  const result = checkMissingGrades(values);
  range.setBackgrounds(result.data); // Set background colors to highlight missing grades

  // Log the result via toast notification
  logToastError(
    result.state ? "highlighted_missing_grades" : "no_missing_grades",
    { rowCount: numRows }
  );
}
