# Wargi Tani 🌾

Platform tanya jawab khusus pertanian yang mempertemukan petani, mahasiswa, penyuluh, dan
masyarakat umum untuk berdiskusi tentang masalah tanaman — konsepnya mirip Stack Overflow / X,
tapi fokus pertanian.

**Stack:** SvelteKit · Supabase (Auth, Database, Storage) · Tailwind CSS · Vercel

Lihat [`progress.md`](./progress.md) untuk checklist tahap pengembangan yang sudah/belum dikerjakan.

## 1. Persiapan

- Node.js 18+ dan npm terpasang
- Akun [Supabase](https://supabase.com) (gratis)
- Akun [Vercel](https://vercel.com) (gratis)

## 2. Setup Supabase

1. Buat project baru di [supabase.com/dashboard](https://supabase.com/dashboard).
2. Buka **Project Settings → API**, catat:
   - `Project URL` → jadi `PUBLIC_SUPABASE_URL`
   - `anon public key` → jadi `PUBLIC_SUPABASE_ANON_KEY`
3. Buka **SQL Editor**, salin-tempel seluruh isi `supabase/migrations/0001_init.sql`, lalu jalankan
   (**Run**). Skrip ini membuat semua tabel, trigger, RLS, dan bucket storage `question-images`
   sekaligus — tidak perlu membuat bucket manual.
4. Buka **Authentication → Providers**, pastikan **Email** aktif (Email + Password). Untuk
   pengujian cepat, boleh nonaktifkan "Confirm email" di **Authentication → Settings** agar tidak
   perlu verifikasi email setiap mendaftar akun uji coba.
5. (Opsional) Untuk menjadikan salah satu akun sebagai admin, jalankan di SQL Editor:
   ```sql
   update profiles set role = 'admin' where username = 'username_anda';
   ```

## 3. Jalankan secara lokal

```bash
# 1. Ekstrak zip ini, lalu masuk ke foldernya
cd wargi-tani

# 2. Install dependencies
npm install

# 3. Salin env contoh lalu isi kredensial Supabase
cp .env.example .env
# edit .env → isi PUBLIC_SUPABASE_URL dan PUBLIC_SUPABASE_ANON_KEY

# 4. Jalankan dev server
npm run dev
```

Buka `http://localhost:5173`.

## 4. Deploy ke Vercel

**Opsi A — lewat Dashboard Vercel (paling mudah):**

1. Push folder ini ke repository GitHub/GitLab/Bitbucket.
2. Buka [vercel.com/new](https://vercel.com/new), import repository tersebut.
3. Vercel otomatis mendeteksi SvelteKit (`@sveltejs/adapter-vercel` sudah terpasang) — biarkan
   pengaturan build default.
4. Di bagian **Environment Variables**, tambahkan:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
5. Klik **Deploy**. Setelah selesai, aplikasi bisa diakses di domain `*.vercel.app` yang diberikan.

**Opsi B — lewat Vercel CLI:**

```bash
npm install -g vercel
vercel login
vercel            # deploy preview
vercel --prod     # deploy production
```

Saat pertama kali menjalankan `vercel`, isi environment variable saat diminta, atau tambahkan
lewat `vercel env add PUBLIC_SUPABASE_URL` dan `vercel env add PUBLIC_SUPABASE_ANON_KEY`.

## 5. Fitur yang sudah tersedia

- Autentikasi email + password (daftar, masuk, keluar)
- Tanya jawab ala Stack Overflow: buat pertanyaan dengan upload hingga 4 foto, kategori, dan tag
- Jawaban, komentar pada pertanyaan & jawaban, tandai jawaban terpilih
- Vote naik/turun untuk pertanyaan dan jawaban, skor otomatis terhitung
- Pencarian teks dan filter kategori di homepage
- Bookmark pertanyaan, notifikasi (mis. saat pertanyaan Anda dijawab), reputasi pengguna
- Laporkan konten bermasalah + dashboard admin untuk moderasi dan kelola peran pengguna
- Tampilan responsive (mobile/tablet/desktop) dan halaman error kustom

Lihat `progress.md` untuk detail lengkap per STEP dan daftar penyempurnaan opsional yang belum
dikerjakan.

## 6. Struktur Proyek

```
wargi-tani/
├── supabase/migrations/0001_init.sql   # skema database + RLS + storage policy
├── src/
│   ├── routes/            # halaman & endpoint SvelteKit (lihat progress.md untuk daftar lengkap)
│   ├── lib/
│   │   ├── supabase/      # client Supabase (browser)
│   │   └── components/    # QuestionCard, VoteButtons, dst.
│   ├── hooks.server.js    # setup Supabase SSR + session + proteksi rute
│   ├── app.html
│   └── app.css            # Tailwind + komponen utilitas (btn, card, input)
├── static/
├── tailwind.config.js
├── svelte.config.js       # adapter-vercel
├── .env.example
└── progress.md
```

## Catatan

Kode dibuat sekaligus untuk seluruh 12 STEP rencana pengembangan (lihat `progress.md`). Karena
dibuat tanpa akses menjalankan `npm install`/`npm run dev` secara langsung, sangat disarankan
untuk menjalankan dan menguji secara lokal dulu sebelum deploy ke production, terutama alur
autentikasi, upload gambar, dan RLS.
