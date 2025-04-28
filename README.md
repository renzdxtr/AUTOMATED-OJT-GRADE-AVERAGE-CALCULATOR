# 🧮 Automated OJT Grade Average Calculator

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)  
_An easy-to-install Google Apps Script that computes per-criteria averages for On-the-Job Training grades, complete with custom menu commands and toast notifications._

---

## 📖 Table of Contents

- [🚀 Overview](#-overview)  
- [✨ Features](#-features)  
- [📂 Directory Structure](#-directory-structure)  
- [⚙️ Installation & Setup](#️-installation--setup)  
- [🎮 Usage](#-usage)  
  - [Run from Custom Menu](#run-from-custom-menu)  
  - [Programmatic Invocation](#programmatic-invocation)  
  - [Toast Notifications](#toast-notifications)  
  - [Automated Testing](#automated-testing)  
- [🗂 File Breakdown](#-file-breakdown)  
- [🤝 Contributing](#-contributing)  
- [📄 License](#-license)  
- [✉️ Contact](#️-contact)  

---

## 🚀 Overview

The **Automated OJT Grade Average Calculator** streamlines the process of computing student performance metrics in Google Sheets.  
By simply listing student names in a **Summary** sheet and their raw scores in a **Grades** sheet, this script:

- **Aggregates** criteria scores (A1–A5, B1–B8)  
- **Calculates** per-criteria averages  
- **Displays** results back in your spreadsheet  
- **Alerts** you with friendly toast notifications for errors & successes  
- **Integrates** a menu command for one-click execution  

Ideal for HR trainers, team leads, and educators running OJT programs.

---

## ✨ Features

- 🔢 **Automated Aggregation**: Reads all raw scores, groups by student name, and computes averages.  
- 📋 **Custom Menu**: “GENERATE SUMMARY → Calculate Students’ Average Per Criteria” appears on open.  
- 🔔 **Toast Notifications**: Instant feedback for missing sheets, empty data, successful runs, and test results.  
- 🧪 **Test Harness**: Built-in function to validate correctness with sample data.  
- 🛠️ **Configurable**: Change source/summary sheet names via constants.  
- 🚀 **Lightweight**: Pure Apps Script—no external dependencies.
- ⚙️ **Extensible & Maintainable**  
   - Single Responsibility Principle: each function does one thing.  
   - Open/Closed: add new metrics or toast types without modifying core logic.  
   - DRY & KISS: minimal repetition, clear abstractions.

---

## 📂 Directory Structure

```
renzdxtr-automated-ojt-grade-average-calculator/
├── Code.gs           # Core logic: data mapping & average computation
├── Menu.gs           # onOpen() → adds custom menu item
├── Notifications.gs  # Toast logger: error & success messages
├── LICENSE           # MIT License
└── README.md         # <— You are here
```

---

## ⚙️ Installation & Setup

1. **Fork or Clone** this repository.  
2. Open your **Google Sheets** spreadsheet.  
3. In the menu, select **Extensions → Apps Script**.  
4. Replace the default files with:
   - **Code.gs**  
   - **Menu.gs**  
   - **Notifications.gs**  
5. (Optional) Rename your sheets to match the constants at the top of **Code.gs**:
   ```js
   const SUMMARY_SHEET = "Summary";
   const SOURCE_SHEET  = "Grades";
   ```
6. **Save** and **Deploy** (no special scopes needed beyond normal Spreadsheet access).

---

## 🎮 Usage

1. **Fill in your OJT scores in the Grades sheet**.  
   > _The example below is just a sample layout – you can customize the category labels and criteria._  
   - **Two-row header** for flexible categorization:  
     1. **Row 1 (Category Labels)**  
        - e.g. `A1–A5` fall under **JOB PERFORMANCE**, `B1–B8` under **ATTITUDE**  
     2. **Row 2 (Criteria Codes & Name)**  
        ```text
        Name | A1 | A2 | A3 | A4 | A5 | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8
        ```  
   - **Data starts on row 3** so that training coordinators can:  
     - Add or adjust **category headers** on row 1  
     - Rename or reorder **criteria codes** on row 2  
     - Keep **raw scores** neatly below without disturbing your custom labels  
   - **Columns**:  
     - **A** → Student **Name**  
     - **B–F** → Scores (0–10) for **A1–A5** (Job Performance)  
     - **G–N** → Scores (0–10) for **B1–B8** (Attitude)  
   - **Tip:** You can enter multiple rows per student; the script will group by Name, compute each criterion’s average, and populate your **Summary** sheet automatically.  
   
2. **In the menu bar**, choose **GENERATE SUMMARY → Calculate Students' Average Per Criteria**.  
3. **Averages** will appear in the **Summary** sheet in columns B–O, aligned by student name.  
4. **Check toast notifications** for success or any errors.

---

### Checking and Highlighting Missing Grades

The script will automatically check for missing grades in the **Grades** sheet before proceeding with calculations. If any student has missing grades (blank values), those cells will be highlighted in **yellow** and a toast notification will alert you to the issue. The script will not proceed with the summary update until all grades are provided.

Here’s how it works:

- **Missing Grade Check**:  
   The script will loop through the student names and their corresponding grade cells to check if any grade is missing.
  
- **Highlight Missing Grades**:  
   Any missing grades will be highlighted in **yellow** to make it easy to spot incomplete entries.

- **Stop Further Processing**:  
   If missing grades are detected, the script will display a toast notification indicating the issue and halt further processing of averages until the grades are filled in.

#### Example:

```javascript
function checkMissingGrades(gradesSheet) {
  const gradesRange = gradesSheet.getRange(3, 2, gradesSheet.getLastRow() - 2, gradesSheet.getLastColumn() - 1);
  const grades = gradesRange.getValues();
  
  let missingGradesFound = false;
  
  grades.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === "" || cell === null) {
        gradesRange.getCell(rowIndex + 1, colIndex + 1).setBackground("yellow");
        missingGradesFound = true;
      }
    });
  });
  
  if (missingGradesFound) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Missing grades detected! Highlighted in yellow.");
  }
  
  return missingGradesFound;
}

function updateSummaryAverages() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const gradesSheet = ss.getSheetByName("Grades");
  const summarySheet = ss.getSheetByName("Summary");
  
  if (!gradesSheet || !summarySheet) {
    logToastError("Missing sheets", {sheetName: "Grades or Summary"});
    return;
  }
  
  if (checkMissingGrades(gradesSheet)) {
    return;  // Stop further execution if missing grades are found
  }

  // Continue with the summary calculation logic...
}
```

This added check and highlight logic ensures that no incomplete data gets processed, and users are immediately notified with a visual cue and a toast notification.

---

## 🛠️ Configuration

- **Change sheet names** by editing the `SUMMARY_SHEET` and `SOURCE_SHEET` constants in `Code.gs`.  
- **Add new metrics**: append to the `METRICS` map—logic auto-adapts.  
- **Customize toasts**: expand `logToastError` in `Notifications.gs`.

> _Building better spreadsheets so you can focus on training, not tracking!_

### Programmatic Invocation

Call directly from another script or trigger:
```js
// Default sheets:
updateSummaryAverages();

// Or specify custom sheet names:
updateSummaryAverages('MySummarySheet', 'MyGradesData');
```

### Toast Notifications

All important events are surfaced via **SpreadsheetApp.toast**, including:

| Event Key              | Message Example                                              | Type       |
|------------------------ |------------------------------------------------------------- |----------- |
| `source_sheet_missing`  | ❌ “Could not find the grades source sheet ‘Grades’.”        | Error      |
| `no_grade_data`         | ⚠️ “No grade data found in ‘Grades’. Header on row 2?”       | Warning    |
| `data_map_built`        | ✅ “Grade data successfully loaded from ‘Grades’ (24 rows).” | Success    |
| `summary_sheet_missing` | ⚠️ “Could not find the summary sheet ‘Summary’.”             | Error      |
| `no_summary_entries`    | ⚠️ “No student names found in ‘Summary’. Nothing to update.” | Warning    |
| `summary_updated`       | ✅ “Updated averages in ‘Summary’ for 12 students.”          | Success    |
| `test_failed`           | ❌ “Test failed! Expected …, Actual …”                       | Error      |
| `test_passed`           | ✔️ “Aggregation test passed ✅”                              | Success    |

### Automated Testing

A built-in harness validates the logic against sample data:

```js
function testUpdateSummaryAverages() {
  // Creates ‘GradesTest’ and ‘TestSummary’ sheets,
  // runs the aggregation, and toasts pass/fail.
}
```

Just run `testUpdateSummaryAverages()` in the Apps Script editor and check your toast messages.

---

## 🗂 File Breakdown

| File               | Purpose                                                              |
|--------------------|----------------------------------------------------------------------|
| **Code.gs**        | Core functions:  
  - `buildStudentDataMap()`  
  - `updateSummaryAverages()`  
  - `testUpdateSummaryAverages()` |
| **Menu.gs**        | Adds a one-click menu item on spreadsheet open                       |
| **Notifications.gs** | Centralizes all toast messages (errors & successes)                |
| **LICENSE**        | MIT License—free to fork, modify, and distribute                     |
| **README.md**      | Project documentation (you’re reading it!)                           |

---

## 🤝 Contributing

1. 🍴 **Fork** this repo  
2. 🛠️ **Branch** your feature (`git checkout -b feature/foo`)  
3. 🚧 **Commit** your changes (`git commit -m 'Add amazing feature'`)  
4. 🔀 **Push** to your branch (`git push origin feature/foo`)  
5. 📩 **Open a Pull Request**—we’ll review and merge  

Please follow the coding principles: SRP, DRY, KISS, and ensure files stay under 200 lines.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## ✉️ Contact

Developed by **renzdxtr** | © 2025  
Have questions or feedback? Open an issue or reach out on [GitHub](https://github.com/renzdxtr).  
