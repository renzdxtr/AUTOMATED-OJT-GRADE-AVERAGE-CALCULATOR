/**
 * Adds a custom menu to the spreadsheet when it is opened.
 * This menu allows the user to easily access the functionality of calculating
 * students' averages per criteria by invoking the `updateSummaryAverages` function.
 *
 * The custom menu will appear in the Google Sheets UI under the name "GENERATE SUMMARY"
 * with an option to "Calculate Students' Average Per Criteria".
 *
 * When the user selects this menu item, the `updateSummaryAverages` function is called,
 * which updates the 'Summary' sheet with the calculated averages for each student
 * based on their grades in the source sheet.
 */
function onOpen() {
  // Create the custom menu in the spreadsheet's UI
  SpreadsheetApp.getUi()
    .createMenu("GENERATE SUMMARY") // Menu title
    .addItem(
      // Menu item
      "Calculate Students' Average Per Criteria", // Display name of the menu item
      "updateSummaryAverages" // Function to call when the item is selected
    )
    .addToUi(); // Add the menu to the UI
}
