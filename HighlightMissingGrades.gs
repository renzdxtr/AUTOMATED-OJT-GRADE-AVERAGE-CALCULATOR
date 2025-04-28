function checkMissingGrades(values) {
  let hasMissing = false;

  const backgrounds = values.map((row) =>
    row.map((value) => {
      const isMissing = value === "" || value === null || isNaN(value);
      if (isMissing) hasMissing = true;
      return isMissing ? "#dd7e6b" : null;
    })
  );

  return { state: hasMissing, data: backgrounds };
}

function highlightMissingGrades(sheetName = SOURCE_SHEET) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    logToastError("source_sheet_missing", { sheetName });
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;

  const metricKeys = Object.keys(METRICS);
  const startCol = METRICS[metricKeys[0]] + 1;
  const numCols = metricKeys.length;
  const numRows = lastRow - 2;
  const range = sheet.getRange(3, startCol, numRows, numCols);
  const values = range.getValues();

  const result = checkMissingGrades(values);
  range.setBackgrounds(result.data);

  logToastError(
    result.state ? "highlighted_missing_grades" : "no_missing_grades",
    { rowCount: numRows }
  );
}
