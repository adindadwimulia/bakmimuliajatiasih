# Panduan SEO Lengkap — Bakmi Mulia Jatiasih
Website: https://bakmimuliajatiasih.my.id/
Repo: https://github.com/adindadwimulia/bakmimuliajatiasih

## Apa yang sudah ditambahkan di zip revisi ini

### File SEO baru / diperbarui
| File | Fungsi |
|------|--------|
| `robots.txt` | Memberitahu mesin pencari halaman mana yang boleh di-crawl + lokasi sitemap |
| `sitemap.xml` | Daftar URL penting agar Google cepat menemukan & mengindeks |
| `site.webmanifest` | PWA-like (nama, icon, theme) — membantu di mobile & install |
| `favicon-16x16.png` | Favicon kecil untuk browser tab |
| `favicon-32x32.png` | Favicon standar |
| `apple-touch-icon.png` | Icon saat disimpan di layar beranda iPhone/iPad |
| `icon-512.png` | Icon besar untuk manifest / PWA |
| `index.html` (head diperbarui) | Title, description, keywords, robots, geo, Open Graph, Twitter Card, **JSON-LD Restaurant** |
| `og-image.jpg` | Sudah ada (1200×630) — gambar yang muncul saat link dishare |
| `favicon.png` / `favicon.svg` | Sudah ada sebelumnya |

### Structured Data (JSON-LD)
Sudah dimasukkan schema **Restaurant** + alamat Jatiasih, nomor WA, jam buka, jenis masakan, dll.
Ini membantu Google menampilkan rich result / knowledge panel lokal.

---

## Langkah setelah deploy ulang (wajib)

1. **Deploy**
   - Upload semua file dari zip ini ke root repo GitHub (ganti yang lama).
   - Pastikan GitHub Pages / hosting sudah publish ke `https://bakmimuliajatiasih.my.id/`
   - Cek:
     - https://bakmimuliajatiasih.my.id/robots.txt
     - https://bakmimuliajatiasih.my.id/sitemap.xml
     - https://bakmimuliajatiasih.my.id/og-image.jpg
     - https://bakmimuliajatiasih.my.id/favicon-32x32.png

2. **Google Search Console** (paling penting)
   - Buka: https://search.google.com/search-console
   - Tambah property → URL prefix → `https://bakmimuliajatiasih.my.id`
   - Verifikasi (paling mudah: HTML tag, atau DNS, atau file HTML).
   - Setelah verified:
     - Sitemaps → tambahkan `sitemap.xml` → Submit
     - URL Inspection → masukkan homepage → Request Indexing
   - Pantau Coverage & Performance.

3. **Google Business Profile (Maps)** — sangat penting untuk lokal SEO
   - https://business.google.com/ atau https://www.google.com/maps
   - Buat / klaim bisnis "Bakmi Mulia" di alamat Kemang IFI Graha F8 No 9, Jatiasih, Bekasi.
   - Isi kategori: Restoran Indonesia / Bakmi / Chinese Restaurant
   - Upload foto (menu, interior, makanan)
   - Tambahkan website: https://bakmimuliajatiasih.my.id/
   - Tambahkan nomor WhatsApp / telepon
   - Minta pelanggan beri review bintang 5.

4. **Bing Webmaster Tools** (opsional tapi gratis)
   - https://www.bing.com/webmasters
   - Tambah site + submit sitemap.

5. **Uji Open Graph & Twitter Card**
   - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
     → masukkan URL → Scrape Again
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector (opsional): https://www.linkedin.com/post-inspector/

6. **PageSpeed & Mobile**
   - https://pagespeed.web.dev/ → masukkan URL
   - Perbaiki jika skor rendah (gambar dokumentasi masih cukup besar, bisa di-compress nanti).

7. **Index sekarang**
   - Setelah submit sitemap + Request Indexing, tunggu 1–14 hari.
   - Cari di Google: `site:bakmimuliajatiasih.my.id`

---

## Tips SEO lanjutan (setelah yang di atas selesai)

- Isi link GrabFood / GoFood / ShopeeFood yang masih `#` di index.html.
- Tambahkan nomor telepon / WA yang konsisten di footer & schema (sudah ada di JSON-LD).
- Buat konten blog sederhana (misal halaman "Cerita Bakmi Mulia") jika ingin long-tail keyword.
- Minta backlink dari akun Instagram / TikTok bisnis ke website.
- Update `lastmod` di sitemap.xml setiap kali ada perubahan besar.
- Pastikan HTTPS aktif (sudah dari domain .my.id).

---

## Checklist cepat setelah deploy

- [ ] robots.txt bisa diakses
- [ ] sitemap.xml bisa diakses
- [ ] og-image.jpg muncul saat share WhatsApp / FB
- [ ] Favicon muncul di tab browser
- [ ] Google Search Console verified + sitemap submitted
- [ ] Google Business Profile dibuat / diklaim
- [ ] Request indexing homepage
- [ ] Cek mobile-friendly di Search Console

Selamat! Setelah langkah di atas, website sudah siap diindeks Google dengan baik.
