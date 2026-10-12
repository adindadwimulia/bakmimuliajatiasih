BAKMI MULIA — UPGRADE PEMESANAN (BETA)

YANG DIPERTAHANKAN
- Semua kartu menu, nama menu, kategori, harga, tautan, desain, foto dokumentasi, favicon, efek suara/karaoke, dan cursor diambil dari file web yang kamu upload.
- Fitur baru menambahkan tombol + Tambah ke keranjang, keranjang, form detail pesanan, dan template Apps Script.

MENJALANKAN WEBSITE
1. Ekstrak seluruh ZIP ke satu folder.
2. Buka index.html di browser atau unggah isi folder ke hosting website kamu.
3. Coba tombol + Tambah ke keranjang pada kartu menu.
4. Sebelum Apps Script dihubungkan, checkout akan membuka WhatsApp dengan rincian pesanan.

MENGHUBUNGKAN GOOGLE SHEETS + APPS SCRIPT
1. Buat/cadangkan spreadsheet Google Sheets yang akan dipakai.
2. Dari spreadsheet, pilih Extensions > Apps Script. Salin isi Code.gs ke editor Apps Script.
3. Ganti GANTI_DENGAN_ID_GOOGLE_SHEETS dengan ID spreadsheet (bagian di antara /d/ dan /edit pada URL). Jangan pernah membagikan ID atau URL privat ke publik.
4. Simpan lalu Deploy > New deployment > Web app. Pilih Execute as: Me. Pilih akses yang sesuai kebijakan akun/organisasi kamu. Untuk pemakaian nyata, jangan mengandalkan URL rahasia sebagai autentikasi; batasi akses dan tambahkan autentikasi/validasi sesuai kebutuhan.
5. Salin URL Web App yang berakhiran /exec.
6. Buka script.js dan isi konstanta APPS_SCRIPT_URL dengan URL tersebut. Simpan lalu unggah ulang.
7. Tes satu pesanan uji dan cek sheet Orders serta OrderItems. Template hanya membuat dua sheet itu jika belum ada; tidak mengubah sheet yang sudah ada.

PENTING
- Ini adalah template awal, bukan sistem kasir/pembayaran lengkap. Pesanan dari browser belum terverifikasi pembayaran.
- Backend memvalidasi format dan total yang dikirim, tetapi versi produksi sebaiknya mengambil harga dari database server-side agar pelanggan tidak dapat memanipulasi harga.
- Jangan simpan password/token di index.html atau script.js. Tambahkan autentikasi admin sebelum membuat dashboard admin publik.
- Pastikan nomor WhatsApp pada konstanta WA_NUMBER benar sebelum dipakai. Nilai saat ini memakai nomor kontak Bakmi Mulia yang tersimpan dalam konteks proyek; ubah jika perlu.
- File website mempertahankan menu dan harga dari sumber yang diberikan; periksa kembali sebelum publikasi.
