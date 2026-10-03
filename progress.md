# Progress — Wargi Tani

Seluruh 12 STEP telah dikerjakan sekaligus (MVP fungsional). Kode ini belum pernah dijalankan
`npm install` / `npm run dev` di lingkungan ini (tidak ada akses jaringan saat pembuatan), jadi
disarankan untuk menjalankan lokal dulu dan menguji sebelum deploy ke production.

- [x] **STEP 1 — Setup proyek**
  SvelteKit + Tailwind (tema hijau/earth tone) + adapter-vercel, koneksi Supabase (client browser
  `src/lib/supabase/client.js` + `src/hooks.server.js` untuk session SSR), layout dasar.
- [x] **STEP 2 — Database**
  `supabase/migrations/0001_init.sql` — skema lengkap: profiles, categories, questions,
  question_images, answers, comments, tags, question_tags, votes, bookmarks, notifications,
  reports. Trigger otomatis: buat profil saat daftar, hitung ulang skor vote, reputasi saat
  jawaban diterima, notifikasi jawaban baru. RLS aktif di semua tabel + bucket storage
  `question-images`.
- [x] **STEP 3 — Autentikasi**
  `/login`, `/register` (email + password via Supabase Auth), `/logout`, proteksi rute
  (`/pertanyaan/baru`, `/notifikasi`, `/admin`) lewat `hooks.server.js`.
- [x] **STEP 4 — Homepage**
  `/` menampilkan daftar pertanyaan terbaru, filter kategori, kartu pertanyaan
  (`QuestionCard.svelte`), paginasi.
- [x] **STEP 5 — Buat pertanyaan + upload gambar**
  `/pertanyaan/baru` — form judul/isi/kategori/tag, upload hingga 4 gambar ke Supabase Storage.
- [x] **STEP 6 — Detail pertanyaan + jawaban**
  `/pertanyaan/[id]` — tampilkan pertanyaan, gambar, tag, daftar jawaban, form jawaban baru.
- [x] **STEP 7 — Vote + komentar**
  Tombol upvote/downvote pertanyaan & jawaban (`VoteButtons.svelte`), komentar di pertanyaan &
  jawaban, tandai jawaban terpilih (hanya oleh penanya).
- [x] **STEP 8 — Pencarian + filter**
  Kotak pencarian di navbar & homepage (full-text search PostgreSQL berbahasa Indonesia), filter
  kategori berupa chip di homepage.
- [x] **STEP 9 — Bookmark + notifikasi + reputasi**
  Tombol simpan (★) di halaman detail, halaman `/bookmark`, halaman `/notifikasi` dengan badge
  jumlah belum dibaca di navbar, reputasi otomatis bertambah saat jawaban diterima.
- [x] **STEP 10 — Admin + laporan**
  `/admin` (statistik, kelola peran pengguna), `/admin/laporan` (moderasi laporan konten: tandai
  selesai/abaikan, hapus pertanyaan/jawaban terkait), tombol "Laporkan" di halaman detail.
- [x] **STEP 11 — Responsive + error states**
  Layout responsive (mobile/tablet/desktop) dengan Tailwind, `+error.svelte` untuk halaman 404 /
  error lain, indikator loading saat navigasi di navbar.
- [x] **STEP 12 — README + progress.md + deployment**
  `README.md` diperbarui dengan struktur lengkap, langkah setup Supabase (termasuk menjalankan
  migrasi SQL & membuat bucket), dan panduan deploy ke Vercel.

## Struktur proyek akhir

```
wargi-tani/
├── supabase/migrations/0001_init.sql   # skema DB + RLS + storage policy
├── src/
│   ├── hooks.server.js                 # supabase SSR client, proteksi rute
│   ├── app.html / app.css
│   ├── lib/
│   │   ├── supabase/client.js
│   │   └── components/
│   │       ├── QuestionCard.svelte
│   │       └── VoteButtons.svelte
│   └── routes/
│       ├── +layout.svelte / +layout.server.js
│       ├── +page.svelte / +page.server.js       # homepage: list, search, filter, paginasi
│       ├── +error.svelte
│       ├── login/  register/  logout/
│       ├── pertanyaan/baru/                      # buat pertanyaan + upload gambar
│       ├── pertanyaan/[id]/                      # detail, jawab, vote, komentar, bookmark, laporkan
│       ├── notifikasi/
│       ├── bookmark/
│       ├── profil/[username]/
│       └── admin/  admin/laporan/
├── .env.example
├── README.md
└── progress.md
```

## Yang masih perlu disempurnakan (opsional, di luar cakupan awal)

- Edit pertanyaan/jawaban setelah dibuat (saat ini hanya bisa hapus).
- Rich text / markdown editor untuk isi pertanyaan & jawaban.
- Infinite scroll atau server actions dengan `use:enhance` yang lebih halus (progressive
  enhancement sudah dipasang di sebagian besar form, tapi belum di semua tombol vote).
- Rate limiting untuk mencegah spam.
- Pengujian end-to-end (Playwright) belum dibuat.
