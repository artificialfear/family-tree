/**
 * Graham & Harper Family Tree — shared memories backend
 *
 * Lives in a Google Sheet (Extensions > Apps Script). The family tree page on
 * GitHub Pages reads memories from here and sends new ones here.
 *
 *   Sheet tab "Memories": one row per memory, photo, answer or correction.
 *   To hide a row from the tree, type anything in its "hidden" column.
 *   Drive folder "Family Tree Uploads": photos and voice memories people add.
 *
 * Security: device ids are stored only as SHA-256 hashes, and too many wrong
 * passcodes lock that device (5 tries) or everyone (25 tries) out for 15 minutes.
 *
 * Set the family passcode with the "Family Tree > Set family passcode" menu.
 */

var SHEET = 'Memories';
// New columns are only ever added at the end so existing rows stay lined up.
var COLS = ['id','type','pid','from','at','text','asset','portrait','q','of','name','rel','born','died','living','note','by','hidden','audio'];
var MAX_TEXT = 4000;
var MAX_PHOTO_BYTES = 6 * 1024 * 1024;
var MAX_AUDIO_BYTES = 6 * 1024 * 1024;
var LOCK_SECS = 900, DEVICE_TRIES = 5, ALL_TRIES = 25;

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
  var audioId = e && e.parameter && e.parameter.audio;
  if (audioId) return json_(audio_(String(audioId)));
  return json_({ ok: true, items: list_() });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_request' }); }
  var action = String(req.action || '');
  var gate = gate_(req.code, String(req.devId || ''));
  if (action === 'check') return json_(gate);
  if (!gate.ok) return json_(gate);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (action === 'add') return json_({ ok: true, item: add_(req.doc || {}, req.photo, String(req.devId || ''), req.audio) });
    if (action === 'del') return json_({ ok: del_(String(req.id || ''), String(req.devId || '')) });
    if (action === 'edit') return json_({ ok: edit_(String(req.id || ''), String(req.devId || ''), req.doc || {}) });
    return json_({ ok: false, error: 'unknown_action' });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- data ---------- */

function sheet_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SHEET);
  if (!sh) { setup(); sh = SpreadsheetApp.getActive().getSheetByName(SHEET); }
  // add any new column headers (at the end) that an older sheet doesn't have yet
  var width = sh.getLastColumn();
  if (width < COLS.length) {
    var head = sh.getRange(1, 1, 1, width).getValues()[0];
    for (var c = width; c < COLS.length; c++) if (head.indexOf(COLS[c]) < 0) sh.getRange(1, c + 1).setValue(COLS[c]).setFontWeight('bold');
  }
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
    ['asset', 'audio', 'q', 'of', 'name', 'rel', 'born', 'died', 'note'].forEach(function (k) { if (o[k] != null && String(o[k])) item[k] = String(o[k]); });
    if (o.portrait === true || String(o.portrait).toUpperCase() === 'TRUE') item.portrait = true;
    if (o.living === true || String(o.living).toUpperCase() === 'TRUE') item.living = true;
    if (String(o.by)) item.by = String(o.by);
    out.push(item);
  });
  return out;
}

function add_(doc, photo, devId, audio) {
  // tradition and recipe belong to the whole family (pid 'family') and show in the keepsake chest
  var types = ['story', 'photo', 'fix', 'answer', 'person', 'tradition', 'recipe'];
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
    by: devId ? hash_(devId) : '',
    hidden: '',
    audio: ''
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
  if (audio && audio.b64) {
    var abytes = Utilities.base64Decode(String(audio.b64));
    if (abytes.length > MAX_AUDIO_BYTES) throw new Error('audio_too_big');
    var amime = /^audio\/(webm|mp4|ogg|mpeg|aac|x-m4a|wav)(;.*)?$/.test(audio.mime) ? String(audio.mime).split(';')[0] : 'audio/webm';
    var ext = { 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/aac': 'aac', 'audio/wav': 'wav' }[amime] || 'audio';
    var afile = folder_().createFile(Utilities.newBlob(abytes, amime, row.id + '-voice.' + ext));
    row.audio = afile.getId();
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
      var owner = String(sh.getRange(i + 2, byCol).getValue());
      if (!owner || owner !== hash_(devId)) return false;
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

/* Voice memories are only served from our own uploads folder. */
function audio_(id) {
  try {
    var f = DriveApp.getFileById(id), mine = false, parents = f.getParents(), folderId = folder_().getId();
    while (parents.hasNext()) if (parents.next().getId() === folderId) mine = true;
    if (!mine) return { ok: false, error: 'not_found' };
    var blob = f.getBlob();
    if (blob.getBytes().length > MAX_AUDIO_BYTES) return { ok: false, error: 'too_big' };
    return { ok: true, mime: blob.getContentType(), b64: Utilities.base64Encode(blob.getBytes()) };
  } catch (e) {
    return { ok: false, error: 'not_found' };
  }
}

/* Passcode check with a lockout after too many wrong tries. */
function gate_(code, devId) {
  var cache = CacheService.getScriptCache();
  var dk = 'bad:' + (devId ? hash_(devId) : 'none'), ak = 'bad:all';
  var dn = Number(cache.get(dk) || 0), an = Number(cache.get(ak) || 0);
  if (dn >= DEVICE_TRIES || an >= ALL_TRIES) return { ok: false, error: 'locked' };
  if (codeOk_(code)) return { ok: true };
  cache.put(dk, String(dn + 1), LOCK_SECS);
  cache.put(ak, String(an + 1), LOCK_SECS);
  return { ok: false, error: 'bad_code' };
}

function hash_(s) {
  var d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8);
  return d.map(function (b) { return ((b + 256) % 256).toString(16); }).map(function (h) { return h.length < 2 ? '0' + h : h; }).join('');
}

function codeOk_(code) {
  var want = PropertiesService.getScriptProperties().getProperty('FAMILY_CODE');
  return !!want && want !== 'change-me' && norm_(code) === want;
}

function norm_(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function clip_(s, n) { return String(s == null ? '' : s).slice(0, n); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// the device that shared something can change its words later (the text, a recipe or tradition's name and
// ingredients, and who it's from). Nothing else about the row changes, and nobody else can edit it.
function edit_(id, devId, doc) {
  if (!id || !devId) return false;
  var sh = sheet_(), n = sh.getLastRow();
  if (n < 2) return false;
  var ids = sh.getRange(2, 1, n - 1, 1).getValues();
  var col = function (k) { return COLS.indexOf(k) + 1; };
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) !== id) continue;
    var r = i + 2, owner = String(sh.getRange(r, col('by')).getValue());
    if (!owner || owner !== hash_(devId) || String(sh.getRange(r, col('hidden')).getValue()).trim()) return false;
    if (doc.text != null) sh.getRange(r, col('text')).setValue(clip_(doc.text, MAX_TEXT));
    if (doc.name != null) sh.getRange(r, col('name')).setValue(clip_(doc.name, 120));
    if (doc.note != null) sh.getRange(r, col('note')).setValue(clip_(doc.note, 2000));
    if (doc.from != null) sh.getRange(r, col('from')).setValue(clip_(doc.from, 60));
    return true;
  }
  return false;
}
