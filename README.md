# Kemala Profile Office

Aplikasi internal — invoice, stock, task, dashboard. Mode kerja sekarang:
**single-user local + PWA installable**, data tersimpan di browser (localStorage).

---

## Login

| Field    | Value      |
|----------|------------|
| Username | `hani`     |
| Password | `hani123`  |
| Role     | owner      |

Ganti credential nanti: edit `defaultUsers` di [data.js](data.js) sebelum deploy.

Semua data transaksi mulai **kosong**. Nomor invoice di-generate otomatis
(`ID/<KATEGORI>/V/<NNN>`) dan auto-increment + dijamin unik.

---

## 1) Jalankan di PC

```
cd C:\Users\user\kemala-profile-office
python -m http.server 5173
```

Buka http://localhost:5173

> Kalau habis update file tapi browser masih tampil versi lama → hard refresh
> (`Ctrl+Shift+R`), atau di DevTools → Application → Service Workers → **Unregister**.

---

## 2) Install ke HP

1. Buka URL di Chrome (Android) / Safari (iOS) lewat WiFi yang sama.
2. Chrome: muncul prompt "Install App" / menu ⋮ → "Add to Home screen".
3. Safari: tombol Share → "Add to Home Screen".

> Untuk install prompt resmi & PWA full → wajib HTTPS. Cara paling cepat: deploy ke Vercel (langkah 3).

---

## 3) Deploy ke Vercel (gratis + HTTPS)

### Cara A — Drag-and-drop (paling cepat, no Git)

1. Login ke https://vercel.com (pakai Google/GitHub).
2. Klik **Add New → Project → Deploy without Git**, atau buka https://vercel.com/new
3. Drag folder `C:\Users\user\kemala-profile-office` ke browser.
4. Project Name bebas (mis. `kemala-profile-office`) → klik **Deploy**.
5. Tunggu ~30 detik. Dapat URL seperti `https://kemala-profile-office.vercel.app`.

### Cara B — Lewat Git (recommended untuk update rutin)

```
cd C:\Users\user\kemala-profile-office
git init
git add .
git commit -m "init: kemala profile office"
```

1. Buat repo kosong di GitHub (jangan tambah README/license).
2. Hubungkan & push:
```
git remote add origin https://github.com/USER/REPO.git
git branch -M main
git push -u origin main
```
3. Di Vercel → **Add New → Project** → pilih repo → Deploy.
4. Setiap `git push` selanjutnya = auto-deploy.

### Cara C — Vercel CLI

```
npm i -g vercel
cd C:\Users\user\kemala-profile-office
vercel          # ikuti prompt; pilih scope, project name
vercel --prod   # promote ke production
```

Setelah deploy: buka URL di HP → menu Chrome → **Install App**. Selesai.

`vercel.json` di repo sudah ngatur header service worker + manifest dengan benar.

---

## 4) Tentang "Cloudinary" — klarifikasi penting

**Cloudinary BUKAN database.** Itu layanan untuk hosting & transformasi
gambar/video. Yang kamu butuh kalau mau data **sinkron antar device**
(HP + laptop lihat data sama) adalah **database cloud**.

Opsi praktis (urut paling cocok):

| Layanan             | Untuk apa                                    | Free tier |
|---------------------|----------------------------------------------|-----------|
| **Supabase**        | Database Postgres + auth + realtime + storage | Ya (cukup besar) |
| **Vercel Postgres** | Database Postgres di ekosistem Vercel        | Ya (limit kecil) |
| **Firebase**        | NoSQL realtime + auth                        | Ya |
| **Cloudinary**      | Hanya upload foto bukti / tanda tangan       | Ya |

**Rekomendasi:** **Supabase** (untuk data invoice/customer/dst) +
**Cloudinary** opsional (kalau mau foto bukti pekerjaan ditampung di CDN).

### Setup Supabase (ringkas)

1. https://supabase.com → Sign in → **New project** → catat `URL` & `anon key`.
2. SQL Editor → bikin tabel (contoh untuk invoices):
   ```sql
   create table invoices (
     id text primary key,
     tgl date not null,
     customer jsonb not null,
     items jsonb not null,
     ongkir int default 0,
     biaya_tambahan int default 0,
     catatan text default '',
     pembayaran jsonb default '[]',
     status text default 'Belum Bayar',
     created_at timestamp default now()
   );
   ```
3. Settings → API → copy `Project URL` + `anon public` key.
4. Di project ini, ganti dua fungsi di [data.js](data.js):
   ```js
   const loadCollection = async (key, fallback) => {
     const res = await fetch(`${SUPABASE_URL}/rest/v1/${key}?select=*`, {
       headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
     });
     return res.ok ? await res.json() : fallback;
   };
   const saveCollection = async (key, value) => {
     await fetch(`${SUPABASE_URL}/rest/v1/${key}`, {
       method: 'POST',
       headers: {
         apikey: SUPABASE_KEY,
         Authorization: `Bearer ${SUPABASE_KEY}`,
         'Content-Type': 'application/json',
         Prefer: 'resolution=merge-duplicates'
       },
       body: JSON.stringify(value)
     });
   };
   ```
   (Catatan: dengan begitu seluruh app perlu di-async; untuk versi simple
   tetap pakai localStorage dulu — sudah cukup untuk satu kasir.)

### Setup Cloudinary (opsional, untuk foto bukti)

1. https://cloudinary.com → Sign up → dashboard catat `Cloud name`.
2. Settings → Upload → Add upload preset → set ke **Unsigned** → save preset name.
3. Saat user upload foto:
   ```js
   const form = new FormData();
   form.append('file', file);
   form.append('upload_preset', 'PRESET_NAME');
   const res = await fetch(`https://api.cloudinary.com/v1_1/CLOUD_NAME/upload`, { method:'POST', body: form });
   const { secure_url } = await res.json();
   ```
4. Simpan `secure_url` ke field foto bukti di tabel tasks.

---

## 5) Yang sudah dikerjakan vs belum

**Sudah:**
- Login `hani`/`hani123` + session persist (refresh nggak kick balik ke login)
- Semua data transaksi kosong (invoice / task / customer / notif)
- Buat invoice → tersimpan di localStorage → langsung muncul di list Invoice
- Nomor invoice auto-generate unik per prefix (`SPC`, `PARQUET`, `PLINT`, `VINYL`)
- Validasi: nama customer wajib, minimal 1 item
- Template PDF di-lock ke Kemala (tidak bisa pilih lain)
- Mobile responsive + PWA installable
- Badge sidebar nge-track jumlah unpaid / pending task / unread notif beneran
- `vercel.json` siap deploy

**Belum (kalau mau dilanjut nanti):**
- Sync data antar device (perlu Supabase / backend)
- Multi-user beneran (sekarang owner tunggal, password plaintext — JANGAN dipakai untuk data sensitif sebelum dikasih backend)
- Auto-kurangi stock ketika invoice dibuat (sekarang baru ada toast simulasi)
- Upload foto bukti tugas ke Cloudinary
- Edit / hapus invoice yang sudah dibuat
- Cetak PDF asli (sekarang baru tombol — perlu library seperti `jsPDF` atau `print()`)

---

## 6) Reset data

Buka DevTools Console:
```
localStorage.clear(); location.reload();
```

## Struktur

```
index.html             entry HTML
manifest.webmanifest   PWA manifest
sw.js                  service worker (offline cache)
vercel.json            konfigurasi deploy
styles.css             design system + mobile overrides
data.js                state layer + localStorage + auth
app.jsx                root, routing, persistence wiring
icons.jsx              icon set
charts.jsx             chart helpers
screens/               halaman (dashboard, invoices, tasks, dll)
icons/                 PWA icons (svg + png 192/512)
```
