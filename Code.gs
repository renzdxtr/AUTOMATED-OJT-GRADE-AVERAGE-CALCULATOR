const SUMMARY_SHEET = 'Summary';
const SOURCE_SHEET  = 'Grades';

// metric → zero-based index in data rows
const METRICS = {
  A1: 1, A2: 2, A3: 3, A4: 4, A5: 5,
  B1: 6, B2: 7, B3: 8, B4: 9, B5: 10, B6: 11, B7: 12, B8: 13
};

/**
 * Builds sums + counts per student from the source sheet.
 */
function buildStudentDataMap(sourceSheetName = SOURCE_SHEET) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sourceSheetName);
  if (!sheet) {
    logToastError("source_sheet_missing", { sheetName: sourceSheetName });
    return {};
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 3) {
    logToastError("no_grade_data", { sheetName: sourceSheetName });
    return {};
  }

  const width = 1 + Object.keys(METRICS).length;
  const data  = sheet.getRange(3, 1, lastRow - 2, width).getValues();
  const map   = {};
  let countRows = 0;

  data.forEach(row => {
    const name = row[0];
    if (!name) return;
    countRows++;
    if (!map[name]) {
      map[name] = { count: 0, sums: Object.fromEntries(Object.keys(METRICS).map(m => [m, 0])) };
    }
    const entry = map[name];
    entry.count++;
    for (const [metric, idx] of Object.entries(METRICS)) {
      entry.sums[metric] += Number(row[idx]) || 0;
    }
  });

  logToastError("data_map_built", { sheetName: sourceSheetName, rowCount: countRows });
  return map;
}

/**
 * Updates the Summary sheet with averages A1–A5 & B1–B8.
 */
function updateSummaryAverages(
  summarySheetName = SUMMARY_SHEET,
  sourceSheetName  = SOURCE_SHEET
) {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  const summary = ss.getSheetByName(summarySheetName);
  const source  = ss.getSheetByName(sourceSheetName);

  if (!summary) {
    logToastError("summary_sheet_missing", { sheetName: summarySheetName });
    return;
  }

  if (!source) {
    logToastError("source_sheet_missing", { sheetName: sourceSheetName });
    return;
  }

  const lastSourceRow = source.getLastRow();
  if (lastSourceRow < 3) return;

  const metricKeys = Object.keys(METRICS);
  const startCol   = METRICS[metricKeys[0]] + 1;
  const numCols    = metricKeys.length;
  const numRows    = lastSourceRow - 2;
  const range      = source.getRange(3, startCol, numRows, numCols);
  const values     = range.getValues();

  // ✅ Check for missing grades before proceeding
  const result = checkMissingGrades(values);
  if (result.state) {
    range.setBackgrounds(result.data); // Highlight missing grades
    logToastError("highlighted_missing_grades", { rowCount: numRows });
    return; // 🚫 Abort update
  }

  const lastSummaryRow = summary.getLastRow();
  if (lastSummaryRow < 2) {
    logToastError("no_summary_entries", { sheetName: summarySheetName });
    return;
  }

  const names    = summary.getRange(2, 1, lastSummaryRow - 1, 1).getValues().flat();
  const dataMap  = buildStudentDataMap(sourceSheetName);

  const output = names.map(name => {
    if (!dataMap[name]) {
      return metricKeys.map(_ => 0);
    }
    const { count, sums } = dataMap[name];
    return metricKeys.map(m => sums[m] / count);
  });

  summary
    .getRange(2, 2, output.length, metricKeys.length)
    .setValues(output);

  summary.getRange(2, 2, output.length, metricKeys.length).setNumberFormat("0.00");

  logToastError("summary_updated", { sheetName: summarySheetName, count: output.length });
}

/**
 * Test harness now toasts on pass/fail.
 */
function testUpdateSummaryAverages() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const GRADES_NAME  = 'GradesTest';
  const SUMMARY_NAME = 'TestSummary';
  const metricCount  = Object.keys(METRICS).length;
  const colCount     = 1 + metricCount;

  // 1) GradesTest
  if (ss.getSheetByName(GRADES_NAME)) ss.deleteSheet(ss.getSheetByName(GRADES_NAME));
  const grades = ss.insertSheet(GRADES_NAME);
  grades.getRange(2, 1, 1, colCount).setValues([['Name', ...Object.keys(METRICS)]]);
  grades.getRange(3, 1, 3, colCount).setValues([
    ['Alice', ...Array(metricCount).fill(4)],
    ['Bob',   ...Array(metricCount).fill(5)],
    ['Alice', ...Array(metricCount).fill(5)]
  ]);

  // 2) TestSummary
  if (ss.getSheetByName(SUMMARY_NAME)) ss.deleteSheet(ss.getSheetByName(SUMMARY_NAME));
  const summary = ss.insertSheet(SUMMARY_NAME);
  summary.getRange(1, 1).setValue('Name');
  summary.getRange(2, 1, 2, 1).setValues([['Alice'], ['Bob']]);

  // 3) Run
  updateSummaryAverages(SUMMARY_NAME, GRADES_NAME);

  // 4) Validate
  const actual   = summary.getRange(2, 2, 2, metricCount).getValues();
  const expected = [
    Array(metricCount).fill(4.5),
    Array(metricCount).fill(5)
  ];
  const pass = actual.length === expected.length
            && actual.every((r,i) => r.every((v,j) => v === expected[i][j]));

  // 5) Toast result via our handler
  if (pass) {
    logToastError("test_passed");
  } else {
    logToastError("test_failed", { expected, actual });
  }
}
