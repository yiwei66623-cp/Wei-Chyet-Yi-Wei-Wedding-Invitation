/**
 * RSVP endpoint – paste into Extensions > Apps Script of your Google Sheet.
 * Saves each RSVP as a new row in a tab called "RSVP".
 */
var SHEET_NAME = "RSVP";
var TIMEZONE   = "Asia/Kuala_Lumpur";
var MAX_GUESTS = 10;
var HEADERS = ["Timestamp (MYT)","Name","Phone","Attending","Pax","Accompanying guests","Dietary requirements","Message","Request ID"];

function doGet() { return json_({ status: "ok", message: "RSVP endpoint is running." }); }

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    if (d.website) return json_({ status: "ok" });            // spam trap: pretend success, save nothing

    var name = clean_(d.name, 100), phone = clean_(d.phone, 20);
    var attending = d.attending === "Yes" ? "Yes" : (d.attending === "No" ? "No" : "");
    var guests = attending === "Yes" ? parseInt(d.guests, 10) : 0;
    var companions = attending === "Yes" ? clean_(d.companions, 500) : "";
    var diet = attending === "Yes" ? clean_(d.diet, 200) : "";
    var message = clean_(d.message, 800);
    var requestId = clean_(d.requestId, 64);

    if (name.length < 2) return json_({ status: "error", message: "Please enter your full name." });
    if (phone.replace(/\D/g, "").length < 8) return json_({ status: "error", message: "Please enter a valid phone number." });
    if (!attending) return json_({ status: "error", message: "Please select your attendance." });
    if (attending === "Yes" && !(guests >= 1 && guests <= MAX_GUESTS)) return json_({ status: "error", message: "Please choose a valid number of guests." });
    if (guests > 1 && companions.length < 2) return json_({ status: "error", message: "Please list your accompanying guests." });

    var sheet = getSheet_();
    // duplicate protection: same request ID already saved -> report success without a second row
    if (requestId && sheet.getLastRow() > 1) {
      var ids = sheet.getRange(2, HEADERS.length, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (ids[i][0] === requestId) return json_({ status: "ok", duplicate: true });
    }

    sheet.appendRow([
      Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss"),
      safe_(name), "", attending === "Yes" ? "Attending" : "Not attending",
      guests, safe_(companions), safe_(diet), safe_(message), requestId
    ]);
    var row = sheet.getLastRow();
    sheet.getRange(row, 3).setNumberFormat("@").setValue(phone);   // keep leading zeros / + sign
    SpreadsheetApp.flush();
    return json_({ status: "ok" });
  } catch (err) {
    return json_({ status: "error", message: "Sorry, something went wrong. Please try again." });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange("C:C").setNumberFormat("@");
  }
  return sh;
}
function clean_(v, max) { return String(v == null ? "" : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().substring(0, max); }
// stops values starting with = + - @ being run as spreadsheet formulas
function safe_(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
