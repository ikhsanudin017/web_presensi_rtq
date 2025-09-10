# Presensi Rumah Tahfizh Quran (RTQ)

Website presensi RTQ dengan monitoring orang tua. Dibangun dengan Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, NextAuth.js, dan PostgreSQL (Vercel Postgres). Siap untuk deploy di Vercel.

## Tech Stack
- Frontend: Next.js 14 (App Router) + TypeScript
- Styling: Tailwind CSS
- Database: PostgreSQL (Vercel Postgres)
- ORM: Prisma
- Auth: NextAuth.js (Credentials, JWT sessions)
- Deployment: Vercel

## Fitur Utama (Ringkas)
- Autentikasi 3 role: Admin, Pengajar, Orang Tua (Pengajar/Orang Tua login dengan username, Admin bisa username atau email)
- Dashboard per role (admin/pengajar/orang tua)
- Presensi: Hadir/Izin/Sakit/Alpa + timestamp + catatan + notifikasi
- Monitoring Hafalan + evaluasi (endpoint dasar)
- Komunikasi antar role (pengajar ↔ orang tua)
- Notifikasi ketidakhadiran (DB + stub email/WA)
- Export Presensi (CSV); siap extend ke PDF
- Keamanan: Zod validation, auth middleware, rate limit (in-memory), audit log
- UI/UX: Tailwind, dark/light mode, responsive, toast-ready

## Struktur Folder
- `app/` App Router, halaman, API Routes
- `components/` Komponen UI bersama (Nav, ThemeToggle, Providers)
- `lib/` Prisma client, auth, validations, rate limit, audit, i18n
- `prisma/schema.prisma` Skema database

## Prisma Schema (Tabel)
- users (role: ADMIN | USTADZ | ORANG_TUA)
- santri (data anak; relasi parent dan kelas)
- kelas (kelompok belajar; relasi pengajar)
- presensi (HADIR/IZIN/SAKIT/ALPA + timestamp)
- hafalan (status BARU/PROSES/SELESAI/MURAJAAH + target bulanan)
- evaluasi (nilai + catatan)
- notifikasi (pemberitahuan berbagai tipe)
- komunikasi (pesan antar user, optional santriId)
- auditLog (pencatatan aktivitas)

Detail lihat `prisma/schema.prisma`.

## Instalasi (Local Dev)
1) Persiapan
- Node.js 18+ dan PNPM/NPM/Yarn
- PostgreSQL instance (lokal atau Vercel Postgres)

2) Konfigurasi env
- Salin `.env.example` menjadi `.env`
- Isi `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, dst.

3) Install deps dan setup Prisma
```
# install dependencies
npm install

# generate Prisma Client
npm run postinstall

# inisialisasi schema (create tables)
npx prisma migrate dev --name init

# (opsional) buka Prisma Studio
npm run prisma:studio
```

4) Jalankan dev server
```
npm run dev
```
Buka `http://localhost:3000`.

5) Membuat akun admin pertama
- Gunakan Prisma Studio untuk insert user admin, atau buat endpoint seeding sederhana.
- Kolom password harus berupa hash bcrypt. Lihat contoh hash di `prisma/seed.ts` atau gunakan `bcryptjs` untuk membuat hash.

### Akun contoh (seeding)
Jalankan:
```
npm run seed
```
Akan dibuat akun berikut (login menggunakan Email + Password):
- Admin: admin@rtq.local / rumah123.
- Ustadz Yuliyanto: yuliyanto@rtq.local / rtq2025
- Mbak Zulfaa: zulfaa@rtq.local / rtq2025
- Mas Nofhendri: nofhendri@rtq.local / rtq2025

## Deployment (Vercel)
- Hubungkan repo ke Vercel
- Project Settings → Framework: Next.js
- Tambah Environment Variables sesuai `.env.example`
- Tambah integration Vercel Postgres dan set `DATABASE_URL`
- Jalankan `prisma migrate deploy` via Vercel Build Command (opsional: gunakan Postinstall)

Contoh Build & Install:
- Install Command: `npm install`
- Build Command: `npm run build`
- Postinstall: `prisma generate`

## API Endpoints (Inti)
- Auth: `GET/POST /api/auth/[...nextauth]` (NextAuth)
- Users (Admin): `GET/POST /api/users`
- Santri: `GET /api/santri`, `POST /api/santri`, `GET/PUT/DELETE /api/santri/:id`
- Presensi: `GET/POST /api/presensi` (filter `?santriId=`)
- Hafalan: `GET/POST /api/hafalan`
- Notifikasi: `GET/PATCH /api/notifikasi`
- Komunikasi: `GET/POST /api/komunikasi` (filter `?with=<userId>`) 
- Export CSV: `GET /api/export/presensi`

Semua endpoint (kecuali auth) dilindungi oleh middleware NextAuth. Rate-limit sederhana in-memory tersedia di beberapa endpoint penting. Tambahkan validasi tambahan sesuai kebutuhan.

## Keamanan
- Validasi input (Zod) di layer API
- Proteksi route via NextAuth middleware
- JWT session minimal payload berisi `id` dan `role`
- SQL injection ditangani oleh Prisma
- XSS: hindari dangerouslySetInnerHTML; sanitasi bila menampilkan input user
- Password hashing: bcryptjs
- CSRF: NextAuth melindungi rute auth; untuk API internal, gunakan auth + cek Origin bila diperlukan

## Fitur Tambahan & Catatan
- Dark/Light Mode: `next-themes` + tombol toggle
- Multibahasa: provider sederhana di `lib/i18n.tsx` (ID/AR)
- Export: CSV implemented; PDF dapat ditambah menggunakan `pdfkit` pada server route
- Backup Otomatis: gunakan backup DB di Vercel Postgres atau cron eksternal
- Audit Log: tercatat pada aksi penting di API

## TODO yang bisa dikembangkan
- UI CRUD lengkap untuk Santri, Pengajar, Orang Tua
- Dashboard statistik (chart) menggunakan `chart.js`/`recharts`
- Evaluasi endpoints dan halaman
- Email/WhatsApp notif via `nodemailer` / provider WhatsApp API ketika var tersedia
- Jadwal mengajar (model & UI)
- Pagination + filter UI untuk list data besar

## Environment Variables
```
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
EMAIL_HOST=
EMAIL_USER=
EMAIL_PASS=
WHATSAPP_API_KEY=
```

## Lisensi
Proyek contoh/skeleton. Gunakan bebas untuk kebutuhan internal RTQ.
