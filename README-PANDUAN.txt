BAKMI MULIA — PANDUAN UPGRADE (Google Sheets + Admin Panel)
============================================================

FITUR YANG SUDAH ADA DI WEBSITE
- Navigasi: Home, Menu, Order, Keranjang
- Hero + menu lengkap (~113 item) dengan filter kategori & pencarian
- Tombol "+ Tambah ke keranjang" di setiap kartu menu
- Keranjang pesanan + modal checkout (nama, WA, jenis, catatan)
- Kirim pesanan ke Google Sheets (via Apps Script) + fallback WhatsApp
- Galeri dokumentasi pembeli (lightbox)
- Link GrabFood / GoFood / ShopeeFood
- Suara + efek karaoke
- Footer alamat Bekasi

FITUR BARU DI UPGRADE INI
1. Backend Apps Script lengkap:
   - Sheet Orders & OrderItems digenerate OTOMATIS (header + freeze row)
   - Password admin & Spreadsheet ID disimpan di Script Properties
     (TIDAK pernah ada di file GitHub Pages)
2. Panel Admin:
   - Klik logo "BAKMI MULIA" di navbar EMPAT KALI berturut-turut
   - Password default: Bismillaah
   - Dashboard: statistik, daftar pesanan, filter & cari
   - CRUD pesanan: lihat detail, ubah status/nama/telepon/catatan, hapus
3. Autentikasi admin pakai token sesi (CacheService, 2 jam), bukan password di frontend


CARA SETUP (PENTING — IKUTI URUTAN)
------------------------------------
A. Google Sheets + Apps Script
   1. Buat spreadsheet Google Sheets baru (kosong saja).
   2. Dari spreadsheet: Extensions > Apps Script.
   3. Hapus kode default, tempel SELURUH isi file Code.gs.
   4. Simpan project (Ctrl/Cmd+S).
   5. Di dropdown fungsi, pilih setupOnce → klik Run.
      - Izinkan akses saat diminta.
      - Fungsi ini akan:
        • Menyimpan ID spreadsheet ke Script Properties
        • Menyimpan password admin "Bismillaah" ke Script Properties
        • Membuat sheet "Orders" dan "OrderItems" + header otomatis
   6. Deploy > New deployment > tipe: Web app
      - Description: Bakmi Mulia API
      - Execute as: Me
      - Who has access: Anyone  (agar form website bisa POST)
   7. Authorize, lalu salin URL yang berakhiran /exec.

B. Hubungkan ke website
   1. Buka file script.js
   2. Cari baris:
        const APPS_SCRIPT_URL = '';
   3. Isi dengan URL Web App:
        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/XXXX/exec';
      (Jangan ubah baris window.__BAKMI_API_URL di bawahnya.)
   4. Upload ulang semua file ke GitHub Pages / hosting.

C. Uji
   - Pesan 1 item dari website → cek sheet Orders & OrderItems terisi.
   - Klik logo 4x → login dengan password Bismillaah → lihat dashboard.


MENGUBAH PASSWORD ADMIN
-----------------------
1. Apps Script editor → Project Settings (ikon roda gigi) → Script properties
2. Edit key ADMIN_PASSWORD, atau jalankan di editor:

   function gantiPassword() {
     PropertiesService.getScriptProperties()
       .setProperty('ADMIN_PASSWORD', 'PasswordBaruKamu');
   }

JANGAN pernah menaruh password di index.html / script.js / GitHub.


STRUKTUR SHEET (auto-generated)
-------------------------------
Orders:
  OrderID | CreatedAt | CustomerName | Phone | OrderType | Notes | Total | Status | UpdatedAt

OrderItems:
  OrderID | MenuName | UnitPrice | Quantity | Subtotal

Status yang valid:
  Menunggu | Dikonfirmasi | Diproses | Selesai | Dibatalkan


KEAMANAN
--------
- Password & Spreadsheet ID hanya di Script Properties (server-side Google).
- File di GitHub Pages hanya berisi URL Web App publik (boleh).
- Panel admin tidak punya link publik; hanya muncul setelah 4x klik logo + password.
- Token sesi habis setelah ~2 jam idle / logout.


CATATAN
-------
- Ini bukan sistem pembayaran. Status "Selesai" diatur manual di admin.
- Untuk produksi lebih ketat, batasi akses Web App dan/atau validasi harga
  server-side dari database menu (saat ini harga diambil dari HTML).
- Nomor WhatsApp fallback ada di konstanta WA_NUMBER di script.js.
