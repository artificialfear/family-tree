/**
 * Graham & Harper Family Tree — shared memories backend
 *
 * Lives in a Google Sheet (Extensions > Apps Script). The family tree page on
 * GitHub Pages reads memories from here and sends new ones here.
 *
 *   Sheet tab "Memories": one row per memory, photo, answer or correction.
 *   To hide a row from the tree, type anything in its "hidden" column.
 *   Drive folder "Family Tree Uploads": photos people add.
 *
 * Set the family passcode with the "Family Tree > Set family passcode" menu.
 */

var SHEET = 'Memories';
var COLS = ['id','type','pid','from','at','text','asset','portrait','q','of','name','rel','born','died','living','note','by','hidden'];
var MAX_TEXT = 4000;
var MAX_PHOTO_BYTES = 6 * 1024 * 1024;

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Family Tree')
    .addItem('Set up (run once)', 'setup')
    .addItem('Set family passcode', 'promptPasscode')
    .addToUi();
}

function setup() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLS.length).setFontWeight('bold');
  }
  folder_();
  var p = PropertiesService.getScriptProperties();
  if (!p.getProperty('FAMILY_CODE')) p.setProperty('FAMILY_CODE', 'change-me');
  try { SpreadsheetApp.getUi().alert('Set up. Now choose Family Tree > Set family passcode.'); } catch (e) {}
}

function promptPasscode() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Family passcode', 'Family members type this once to add memories. Not case-sensitive.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var code = norm_(r.getResponseText());
  if (code.length < 3) { ui.alert('Use at least 3 characters.'); return; }
  PropertiesService.getScriptProperties().setProperty('FAMILY_CODE', code);
  ui.alert('Saved. The passcode is: ' + code);
}

/* ---------- web app ---------- */

function doGet(e) {
  return json_({ ok: true, items: list_() });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_request' }); }
  var action = String(req.action || '');
  if (action === 'check') return json_({ ok: codeOk_(req.code) });
  if (!codeOk_(req.code)) return json_({ ok: false, error: 'bad_code' });
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (action === 'add') return json_({ ok: true, item: add_(req.doc || {}, req.photo, String(req.devId || '')) });
    if (action === 'del') return json_({ ok: del_(String(req.id || ''), String(req.devId || '')) });
    return json_({ ok: false, error: 'unknown_action' });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- data ---------- */

function sheet_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SHEET);
  if (!sh) { setup(); sh = SpreadsheetApp.getActive().getSheetByName(SHEET); }
  return sh;
}

function list_() {
  var sh = sheet_(), n = sh.getLastRow();
  if (n < 2) return [];
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var rows = sh.getRange(2, 1, n - 1, head.length).getValues();
  var out = [];
  rows.forEach(function (r) {
    var o = {};
    head.forEach(function (h, i) { o[h] = r[i]; });
    if (!o.id || String(o.hidden).trim()) return;
    var item = { id: String(o.id), type: String(o.type), pid: String(o.pid), from: String(o.from), at: Number(o.at) || 0, text: String(o.text) };
    ['asset', 'q', 'of', 'name', 'rel', 'born', 'died', 'note'].forEach(function (k) { if (String(o[k])) item[k] = String(o[k]); });
    if (o.portrait === true || String(o.portrait).toUpperCase() === 'TRUE') item.portrait = true;
    if (o.living === true || String(o.living).toUpperCase() === 'TRUE') item.living = true;
    if (String(o.by)) item.by = String(o.by);
    out.push(item);
  });
  return out;
}

function add_(doc, photo, devId) {
  var types = ['story', 'photo', 'fix', 'answer', 'person'];
  var type = types.indexOf(doc.type) >= 0 ? doc.type : 'story';
  var row = {
    id: Utilities.getUuid().slice(0, 12),
    type: type,
    pid: clip_(doc.pid, 40),
    from: clip_(doc.from, 60),
    at: Date.now(),
    text: clip_(doc.text, MAX_TEXT),
    asset: '',
    portrait: doc.portrait === true,
    q: clip_(doc.q, 20),
    of: clip_(doc.of, 40),
    name: clip_(doc.name, 120),
    rel: ['parent', 'child', 'spouse', 'sibling'].indexOf(doc.rel) >= 0 ? doc.rel : '',
    born: clip_(doc.born, 20),
    died: clip_(doc.died, 20),
    living: doc.living === true,
    note: clip_(doc.note, 2000),
    by: clip_(devId, 40),
    hidden: ''
  };
  if (photo && photo.b64) {
    var bytes = Utilities.base64Decode(String(photo.b64));
    if (bytes.length > MAX_PHOTO_BYTES) throw new Error('photo_too_big');
    var mime = /^image\/(jpeg|png|webp|gif)$/.test(photo.mime) ? photo.mime : 'image/jpeg';
    var file = folder_().createFile(Utilities.newBlob(bytes, mime, row.id + '-' + clip_(photo.name, 60)));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    row.asset = file.getId();
    if (row.type === 'story') { row.type = 'photo'; row.portrait = false; }
  }
  sheet_().appendRow(COLS.map(function (c) { return row[c]; }));
  return row;
}

function del_(id, devId) {
  if (!id || !devId) return false;
  var sh = sheet_(), n = sh.getLastRow();
  if (n < 2) return false;
  var ids = sh.getRange(2, 1, n - 1, 1).getValues();
  var byCol = COLS.indexOf('by') + 1, hidCol = COLS.indexOf('hidden') + 1;
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) {
      if (String(sh.getRange(i + 2, byCol).getValue()) !== devId) return false;
      sh.getRange(i + 2, hidCol).setValue('removed by sharer');
      return true;
    }
  }
  return false;
}

/* ---------- helpers ---------- */

function folder_() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var f = DriveApp.createFolder('Family Tree Uploads');
  p.setProperty('FOLDER_ID', f.getId());
  return f;
}

function codeOk_(code) {
  var want = PropertiesService.getScriptProperties().getProperty('FAMILY_CODE');
  return !!want && want !== 'change-me' && norm_(code) === want;
}

function norm_(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function clip_(s, n) { return String(s == null ? '' : s).slice(0, n); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
