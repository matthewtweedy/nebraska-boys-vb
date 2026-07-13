/**
 * NBV EVENT CHECK-IN — GOOGLE APPS SCRIPT BACKEND
 * ================================================
 * This turns a Google Sheet into a free API for your check-in page.
 * Every RSVP becomes a row. The page also asks this script for live counts.
 *
 * SETUP (10 minutes, one time):
 * 1. Go to sheets.google.com and create a new blank spreadsheet.
 *    Name it something like "NBV Event Check-Ins".
 * 2. In the sheet, click Extensions > Apps Script.
 * 3. Delete anything in the editor and paste this whole file in.
 * 4. Click Save (the disk icon). Name the project "NBV Check-In Backend".
 * 5. Click Deploy > New deployment.
 *    - Click the gear icon next to "Select type" and choose "Web app".
 *    - Description: "NBV check-in v1"
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Click Deploy.
 * 6. Google will ask you to authorize the script — click through
 *    (Advanced > Go to NBV Check-In Backend (unsafe) is expected and fine,
 *    this is normal for scripts you write yourself).
 * 7. Copy the "Web app URL" it gives you.
 * 8. Paste that URL into rsvp.html where it says GAS_URL = "PASTE_YOUR...".
 * 9. Every time you edit this script later, you must create a NEW
 *    deployment (Deploy > Manage deployments > pencil icon > New version)
 *    for changes to take effect on the live URL.
 *
 * The sheet will fill in a tab called "RSVPs" automatically — you don't
 * need to create it yourself. Columns: Timestamp, Name, Grade, Event, City.
 */

const SHEET_NAME = 'RSVPs';

function jsonOutput_(data, callback) {
  const safeCallback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback || '')
    ? callback
    : '';
  const json = JSON.stringify(data);
  const output = safeCallback ? `${safeCallback}(${json});` : json;
  const mimeType = safeCallback
    ? ContentService.MimeType.JAVASCRIPT
    : ContentService.MimeType.JSON;

  return ContentService
    .createTextOutput(output)
    .setMimeType(mimeType);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Name', 'Grade', 'Event ID', 'City']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Handles a check-in submission from the page.
function doPost(e) {
  const data = JSON.parse((e.postData && e.postData.contents) || '{}');
  const name = (data.name || '').toString().trim();
  const grade = (data.grade || '').toString().trim();
  const eventId = (data.event || '').toString().trim();
  const city = (data.city || '').toString().trim();

  if (!name || !grade || !eventId || !city) {
    return jsonOutput_({
      status: 'error',
      message: 'Missing required RSVP fields.'
    });
  }

  const sheet = getSheet_();
  sheet.appendRow([
    new Date(),
    name,
    grade,
    eventId,
    city
  ]);

  return jsonOutput_({ status: 'ok' });
}

// Returns live participant counts per event, e.g. {"sioux-city-open-gym": 5}
function doGet(e) {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  const counts = {};

  for (let i = 1; i < rows.length; i++) {
    const eventId = rows[i][3];
    if (!eventId) continue;
    counts[eventId] = (counts[eventId] || 0) + 1;
  }

  const callback = e.parameter && e.parameter.callback;
  return jsonOutput_(counts, callback);
}
