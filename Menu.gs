/**
 * Add custom menu on spreadsheet open
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("GENERATE SUMMARY")
    .addItem(
      "Calculate Students' Average Per Criteria",
      "updateSummaryAverages"
    )
    .addToUi();
}
