/** Bakmi Mulia - Google Apps Script backend template.
 * 1) Set SPREADSHEET_ID below.
 * 2) Deploy as Web app; execute as owner. Restrict access appropriately.
 * 3) This template creates Orders and OrderItems only when absent; it does not edit existing sheets.
 */
const SPREADSHEET_ID = 'GANTI_DENGAN_ID_GOOGLE_SHEETS';
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Data pesanan kosong.');
    const order = JSON.parse(e.postData.contents);
    validateOrder_(order);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const orders = getOrCreateSheet_(ss, 'Orders', ['OrderID','CreatedAt','CustomerName','Phone','OrderType','Notes','Total','Status']);
    const details = getOrCreateSheet_(ss, 'OrderItems', ['OrderID','MenuName','UnitPrice','Quantity','Subtotal']);
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      if (orders.createTextFinder(order.orderId).matchEntireCell(true).findNext()) throw new Error('Nomor pesanan sudah digunakan.');
      orders.appendRow([safe_(order.orderId), new Date(), safe_(order.customerName), safe_(order.phone), safe_(order.orderType), safe_(order.notes), Number(order.total), 'Menunggu']);
      order.items.forEach(item => details.appendRow([safe_(order.orderId), safe_(item.name), Number(item.price), Number(item.qty), Number(item.subtotal)]));
    } finally { lock.releaseLock(); }
    return json_({ok:true, orderId:order.orderId});
  } catch (err) { return json_({ok:false, message:String(err.message || err)}); }
}
function doGet() { return json_({ok:true, service:'Bakmi Mulia Orders API', message:'Backend aktif.'}); }
function validateOrder_(o) {
  if (!o || typeof o !== 'object') throw new Error('Format pesanan tidak valid.');
  if (!/^BM-[A-Z0-9]+$/.test(String(o.orderId || ''))) throw new Error('ID pesanan tidak valid.');
  if (!String(o.customerName || '').trim() || !String(o.phone || '').trim()) throw new Error('Nama dan nomor kontak wajib diisi.');
  if (!Array.isArray(o.items) || !o.items.length || o.items.length > 80) throw new Error('Daftar menu tidak valid.');
  let total = 0;
  o.items.forEach(i => { const p=Number(i.price), q=Number(i.qty), sub=Number(i.subtotal); if (!String(i.name||'').trim() || !Number.isFinite(p) || p<0 || !Number.isInteger(q) || q<1 || q>99 || sub!==p*q) throw new Error('Detail menu tidak valid.'); total+=sub; });
  if (total !== Number(o.total)) throw new Error('Total pesanan tidak sesuai.');
}
function getOrCreateSheet_(ss, name, headers) { let sh=ss.getSheetByName(name); if (!sh) { sh=ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); } return sh; }
function safe_(v) { const s=String(v == null ? '' : v).slice(0,1000); return /^[=+@]/.test(s) ? "'"+s : s; }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
