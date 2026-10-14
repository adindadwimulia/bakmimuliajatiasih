/**
 * BAKMI MULIA — Google Apps Script Backend
 * =========================================
 * Keamanan:
 *  - SPREADSHEET_ID dan ADMIN_PASSWORD disimpan di Script Properties
 *    (File > Project settings > Script properties). TIDAK ada di GitHub Pages.
 *  - Session admin memakai token sementara (CacheService, TTL 2 jam).
 *
 * Setup sekali saja:
 *  1. Buka spreadsheet kosong (atau buat baru).
 *  2. Extensions > Apps Script → tempel seluruh file ini.
 *  3. Di editor, jalankan fungsi setupOnce() dari dropdown Run.
 *     (Akan minta izin, lalu mengisi Script Properties & membuat sheet.)
 *  4. Deploy > New deployment > Web app
 *     - Execute as: Me
 *     - Who has access: Anyone  (atau sesuai kebijakan)
 *  5. Salin URL /exec ke konstanta APPS_SCRIPT_URL di script.js
 *
 * Password admin default: Bismillaah  (bisa diubah di Script Properties)
 */

// ===================== KONFIGURASI DEFAULT (hanya dipakai setupOnce) =====================
const DEFAULT_ADMIN_PASSWORD = 'Bismillaah';
// Sheet names & headers — digenerate otomatis, jangan diubah manual kecuali paham
const SHEET_ORDERS = 'Orders';
const SHEET_ITEMS  = 'OrderItems';
const HEADERS_ORDERS = [
  'OrderID', 'CreatedAt', 'CustomerName', 'Phone',
  'OrderType', 'Notes', 'Total', 'Status', 'UpdatedAt'
];
const HEADERS_ITEMS = [
  'OrderID', 'MenuName', 'UnitPrice', 'Quantity', 'Subtotal'
];
const VALID_STATUS = ['Menunggu', 'Dikonfirmasi', 'Diproses', 'Selesai', 'Dibatalkan'];
const TOKEN_TTL_SEC = 7200; // 2 jam

// ===================== SETUP (jalankan sekali dari editor) =====================
/**
 * Jalankan fungsi ini SEKALI dari editor Apps Script (dropdown Run > setupOnce).
 * - Menyimpan password & spreadsheet ID ke Script Properties
 * - Membuat sheet Orders & OrderItems beserta header jika belum ada
 */
function setupOnce() {
  const props = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Buka script ini dari dalam spreadsheet (Extensions > Apps Script), atau set SPREADSHEET_ID manual.');
  }
  props.setProperty('SPREADSHEET_ID', ss.getId());
  if (!props.getProperty('ADMIN_PASSWORD')) {
    props.setProperty('ADMIN_PASSWORD', DEFAULT_ADMIN_PASSWORD);
  }
  ensureSheets_(ss);
  Logger.log('Setup selesai. Spreadsheet ID: ' + ss.getId());
  Logger.log('Password admin tersimpan di Script Properties (default: Bismillaah). Ubah jika perlu.');
  return { ok: true, spreadsheetId: ss.getId() };
}

/** Helper: buat sheet + header jika belum ada */
function ensureSheets_(ss) {
  getOrCreateSheet_(ss, SHEET_ORDERS, HEADERS_ORDERS);
  getOrCreateSheet_(ss, SHEET_ITEMS, HEADERS_ITEMS);
}

// ===================== ENTRY POINTS =====================
function doGet(e) {
  return handleRequest_(e, null);
}

function doPost(e) {
  let body = null;
  try {
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
  } catch (err) {
    return json_({ ok: false, message: 'JSON tidak valid.' });
  }
  return handleRequest_(e, body);
}

function handleRequest_(e, body) {
  try {
    const params = (e && e.parameter) || {};
    // Tentukan action: body.action > query > jika ada orderId tanpa action = createOrder
    var action = (body && body.action) || params.action || '';
    if (!action) {
      if (body && body.orderId) action = 'createOrder';
      else action = 'ping';
    }

    // ---- Public ----
    if (action === 'ping' || action === 'health') {
      return json_({ ok: true, service: 'Bakmi Mulia API', message: 'Backend aktif.' });
    }
    if (action === 'createOrder') {
      // Kompatibel: body bisa objek order langsung, atau {action, order}
      const order = (body && body.order) ? body.order : body;
      return createOrder_(order);
    }

    // ---- Admin (butuh token / password) ----
    if (action === 'adminLogin') {
      return adminLogin_(body);
    }
    if (action === 'adminLogout') {
      return adminLogout_(body);
    }

    // Semua action admin lain wajib token valid
    requireAdmin_(body);

    switch (action) {
      case 'listOrders':
        return listOrders_(body);
      case 'getOrder':
        return getOrder_(body);
      case 'updateOrder':
        return updateOrder_(body);
      case 'deleteOrder':
        return deleteOrder_(body);
      case 'stats':
        return stats_();
      case 'ensureSheets':
        ensureSheets_(getSpreadsheet_());
        return json_({ ok: true, message: 'Sheet siap.' });
      default:
        return json_({ ok: false, message: 'Action tidak dikenal: ' + action });
    }
  } catch (err) {
    return json_({ ok: false, message: String(err.message || err) });
  }
}

// ===================== AUTH =====================
function adminLogin_(body) {
  const password = String((body && body.password) || '');
  const stored = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD') || DEFAULT_ADMIN_PASSWORD;
  if (!password || password !== stored) {
    Utilities.sleep(400);
    throw new Error('Password salah.');
  }
  const token = Utilities.getUuid() + '-' + Utilities.getUuid();
  CacheService.getScriptCache().put('admin:' + token, '1', TOKEN_TTL_SEC);
  return json_({ ok: true, token: token, expiresIn: TOKEN_TTL_SEC });
}

function adminLogout_(body) {
  const token = body && body.token;
  if (token) {
    CacheService.getScriptCache().remove('admin:' + token);
  }
  return json_({ ok: true });
}

function requireAdmin_(body) {
  const token = body && body.token;
  if (!token) throw new Error('Sesi admin diperlukan. Silakan login ulang.');
  const ok = CacheService.getScriptCache().get('admin:' + token);
  if (!ok) throw new Error('Sesi berakhir atau tidak valid. Silakan login ulang.');
  CacheService.getScriptCache().put('admin:' + token, '1', TOKEN_TTL_SEC);
}

// ===================== PUBLIC: CREATE ORDER =====================
function createOrder_(order) {
  validateOrder_(order);
  const ss = getSpreadsheet_();
  ensureSheets_(ss);
  const orders = ss.getSheetByName(SHEET_ORDERS);
  const items  = ss.getSheetByName(SHEET_ITEMS);

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const finder = orders.createTextFinder(String(order.orderId)).matchEntireCell(true).findNext();
    if (finder) throw new Error('Nomor pesanan sudah digunakan.');

    const now = new Date();
    orders.appendRow([
      safe_(order.orderId),
      now,
      safe_(order.customerName),
      safe_(order.phone),
      safe_(order.orderType || 'Takeaway'),
      safe_(order.notes || ''),
      Number(order.total),
      'Menunggu',
      now
    ]);
    (order.items || []).forEach(function (item) {
      items.appendRow([
        safe_(order.orderId),
        safe_(item.name),
        Number(item.price),
        Number(item.qty),
        Number(item.subtotal)
      ]);
    });
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true, orderId: order.orderId });
}

// ===================== ADMIN CRUD =====================
function listOrders_(body) {
  const ss = getSpreadsheet_();
  ensureSheets_(ss);
  const sh = ss.getSheetByName(SHEET_ORDERS);
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return json_({ ok: true, orders: [] });

  const headers = data[0];
  const statusFilter = body && body.status ? String(body.status) : '';
  const search = body && body.q ? String(body.q).toLowerCase() : '';
  const limit = Math.min(Number(body && body.limit) || 200, 500);

  const orders = [];
  for (let i = data.length - 1; i >= 1 && orders.length < limit; i--) {
    const row = data[i];
    const obj = rowToObj_(headers, row);
    if (statusFilter && obj.Status !== statusFilter) continue;
    if (search) {
      const hay = [obj.OrderID, obj.CustomerName, obj.Phone, obj.Notes].join(' ').toLowerCase();
      if (hay.indexOf(search) === -1) continue;
    }
    orders.push(obj);
  }
  return json_({ ok: true, orders: orders });
}

function getOrder_(body) {
  const orderId = body && body.orderId;
  if (!orderId) throw new Error('orderId wajib.');
  const ss = getSpreadsheet_();
  const ordersSh = ss.getSheetByName(SHEET_ORDERS);
  const itemsSh  = ss.getSheetByName(SHEET_ITEMS);

  const orderRow = findRowByOrderId_(ordersSh, orderId);
  if (!orderRow) throw new Error('Pesanan tidak ditemukan.');

  const headers = ordersSh.getRange(1, 1, 1, ordersSh.getLastColumn()).getValues()[0];
  const order = rowToObj_(headers, orderRow.values);

  const itemsData = itemsSh.getDataRange().getValues();
  const itemHeaders = itemsData[0] || HEADERS_ITEMS;
  const items = [];
  for (let i = 1; i < itemsData.length; i++) {
    if (String(itemsData[i][0]) === String(orderId)) {
      items.push(rowToObj_(itemHeaders, itemsData[i]));
    }
  }
  order.items = items;
  return json_({ ok: true, order: order });
}

function updateOrder_(body) {
  const orderId = body && body.orderId;
  if (!orderId) throw new Error('orderId wajib.');
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_ORDERS);
  const found = findRowByOrderId_(sh, orderId);
  if (!found) throw new Error('Pesanan tidak ditemukan.');

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const col = function (name) {
    const idx = headers.indexOf(name);
    if (idx < 0) throw new Error('Kolom tidak ada: ' + name);
    return idx + 1;
  };

  if (body.status !== undefined && body.status !== null && body.status !== '') {
    if (VALID_STATUS.indexOf(String(body.status)) === -1) {
      throw new Error('Status tidak valid. Pilih: ' + VALID_STATUS.join(', '));
    }
    sh.getRange(found.row, col('Status')).setValue(String(body.status));
  }
  if (body.notes !== undefined) {
    sh.getRange(found.row, col('Notes')).setValue(safe_(body.notes));
  }
  if (body.customerName !== undefined) {
    sh.getRange(found.row, col('CustomerName')).setValue(safe_(body.customerName));
  }
  if (body.phone !== undefined) {
    sh.getRange(found.row, col('Phone')).setValue(safe_(body.phone));
  }
  if (body.orderType !== undefined) {
    sh.getRange(found.row, col('OrderType')).setValue(safe_(body.orderType));
  }
  const updCol = headers.indexOf('UpdatedAt');
  if (updCol >= 0) {
    sh.getRange(found.row, updCol + 1).setValue(new Date());
  }

  return getOrder_({ orderId: orderId, token: body.token });
}

function deleteOrder_(body) {
  const orderId = body && body.orderId;
  if (!orderId) throw new Error('orderId wajib.');
  const ss = getSpreadsheet_();
  const ordersSh = ss.getSheetByName(SHEET_ORDERS);
  const itemsSh  = ss.getSheetByName(SHEET_ITEMS);

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const found = findRowByOrderId_(ordersSh, orderId);
    if (!found) throw new Error('Pesanan tidak ditemukan.');
    ordersSh.deleteRow(found.row);

    const itemsData = itemsSh.getDataRange().getValues();
    for (let i = itemsData.length - 1; i >= 1; i--) {
      if (String(itemsData[i][0]) === String(orderId)) {
        itemsSh.deleteRow(i + 1);
      }
    }
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true, message: 'Pesanan ' + orderId + ' dihapus.' });
}

function stats_() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_ORDERS);
  const data = sh.getDataRange().getValues();
  const counts = { total: 0, Menunggu: 0, Dikonfirmasi: 0, Diproses: 0, Selesai: 0, Dibatalkan: 0 };
  let revenue = 0;
  for (let i = 1; i < data.length; i++) {
    counts.total++;
    const status = String(data[i][7] || 'Menunggu');
    if (counts[status] !== undefined) counts[status]++;
    else counts[status] = 1;
    if (status !== 'Dibatalkan') revenue += Number(data[i][6]) || 0;
  }
  return json_({ ok: true, stats: counts, revenue: revenue });
}

// ===================== HELPERS =====================
function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) {
    throw new Error('SPREADSHEET_ID belum di-set. Jalankan setupOnce() dulu dari editor Apps Script.');
  }
  return SpreadsheetApp.openById(id);
}

function getOrCreateSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sh.setColumnWidths(1, headers.length, 120);
  } else {
    if (sh.getLastRow() === 0) {
      sh.appendRow(headers);
      sh.setFrozenRows(1);
    }
  }
  return sh;
}

function findRowByOrderId_(sheet, orderId) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(orderId)) {
      return { row: i + 1, values: data[i] };
    }
  }
  return null;
}

function rowToObj_(headers, row) {
  const obj = {};
  headers.forEach(function (h, i) {
    let v = row[i];
    if (v instanceof Date) v = v.toISOString();
    obj[h] = v;
  });
  return obj;
}

function validateOrder_(o) {
  if (!o || typeof o !== 'object') throw new Error('Format pesanan tidak valid.');
  if (!/^BM-[A-Z0-9]+$/i.test(String(o.orderId || ''))) throw new Error('ID pesanan tidak valid.');
  if (!String(o.customerName || '').trim() || !String(o.phone || '').trim()) {
    throw new Error('Nama dan nomor kontak wajib diisi.');
  }
  if (!Array.isArray(o.items) || !o.items.length || o.items.length > 80) {
    throw new Error('Daftar menu tidak valid.');
  }
  let total = 0;
  o.items.forEach(function (i) {
    const p = Number(i.price);
    const q = Number(i.qty);
    const sub = Number(i.subtotal);
    if (!String(i.name || '').trim() || !Number.isFinite(p) || p < 0 ||
        !Number.isInteger(q) || q < 1 || q > 99 || sub !== p * q) {
      throw new Error('Detail menu tidak valid.');
    }
    total += sub;
  });
  if (total !== Number(o.total)) throw new Error('Total pesanan tidak sesuai.');
}

function safe_(v) {
  const s = String(v == null ? '' : v).slice(0, 1000);
  return /^[=+@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
