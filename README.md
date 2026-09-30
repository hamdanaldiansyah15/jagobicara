# JAGO BICARA

Platform latihan public speaking berbasis komunitas untuk membantu generasi muda belajar, berlatih, dan berani menyampaikan gagasan.

**Dibuat oleh M. Hamdan Aldiansyah.**

## Tentang Proyek

JAGO BICARA adalah aplikasi web progresif (Progressive Web App/PWA) untuk latihan public speaking. Pengguna dapat mempelajari materi secara bertahap, berlatih berbicara dengan topik acak, menerima evaluasi yang terukur, menyusun draf naskah acara, serta berkembang bersama komunitas.

Aplikasi dapat digunakan melalui browser desktop maupun smartphone. Pada browser yang mendukungnya, aplikasi dapat dipasang ke layar utama atau desktop. Saat aplikasi dibuka, pengguna melihat tiga slide pengenalan sebelum masuk ke halaman yang sesuai dengan status login.

## Fitur Utama

- **Latihan bicara 60 detik** dengan topik acak, rekaman mikrofon, dan transkripsi otomatis jika browser mendukung Web Speech API.
- **Evaluasi lima dimensi:** kelancaran, pengembangan ide, relevansi topik, struktur, dan kosakata. Penilaian dilakukan oleh analyzer berbasis aturan yang berjalan di aplikasi, bukan layanan AI eksternal.
- **Pembersihan transkrip** untuk mendeteksi kata pengisi dan pengulangan, disertai catatan dan saran pengembangan.
- **Materi belajar dan kuis bertahap**, termasuk progres modul dan badge pencapaian.
- **Generator naskah** untuk MC, kata sambutan, moderator, serta pidato/presentasi. Hasil dibuat dari template dan input pengguna.
- **Komunitas** dengan kode bergabung, keanggotaan akun, serta fitur administrasi komunitas.
- **Leaderboard** komunitas dan global dengan perhitungan season bulanan.
- **Sertifikat digital** dengan nomor verifikasi, unduh, dan halaman pemeriksaan sertifikat.
- **Panel admin** untuk pengelolaan data pembelajaran dan komunitas.
- **PWA** dengan manifest, ikon aplikasi, service worker, dan panduan instalasi untuk iPhone/iPad, Android, serta desktop.

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Framework web | Next.js 14 App Router |
| UI | React 18, TypeScript, Tailwind CSS 3 |
| Ikon antarmuka | Lucide React |
| Database | PostgreSQL |
| ORM dan schema | Prisma 5 |
| Validasi data | Zod |
| Autentikasi | JWT dalam cookie HTTP-only dan bcryptjs untuk hashing password |
| Sertifikat PDF | jsPDF |
| Ikon PWA | Sharp |
| PWA | Web App Manifest dan service worker kustom |

## Persyaratan

- Node.js **20.9 atau lebih baru**. Sharp yang digunakan untuk membuat ikon PWA memerlukan versi ini.
- npm.
- PostgreSQL lokal atau database PostgreSQL terkelola, misalnya Supabase atau Neon.
- Browser modern. Akses mikrofon dan pemasangan PWA pada lingkungan produksi memerlukan HTTPS; `localhost` dapat digunakan untuk pengembangan.

## Instalasi dan Menjalankan Lokal

### 1. Pasang dependency

```bash
npm install
```

### 2. Buat file environment

Di PowerShell Windows:

```powershell
Copy-Item .env.example .env
```

Di macOS atau Linux:

```bash
cp .env.example .env
```

Edit `.env` dan isi nilai yang sesuai:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jago_bicara?schema=public"
AUTH_SECRET="isi-dengan-random-secret-yang-panjang"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Buat secret acak untuk `AUTH_SECRET` dengan Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Salin hasilnya ke `.env`. Jangan gunakan secret contoh atau secret bawaan aplikasi di deployment. File `.env` sudah dikecualikan dari Git; jangan membagikan kredensial database atau secret.

### 3. Siapkan database

Pastikan PostgreSQL berjalan dan database bernama `jago_bicara` sudah dibuat, atau sesuaikan nama database pada `DATABASE_URL`. Setelah itu jalankan:

```bash
npm run db:generate
npm run db:push
```

`db:generate` membuat Prisma Client dari schema. `db:push` menyelaraskan schema Prisma dengan database untuk pengembangan lokal.

### 4. (Opsional) Isi data demo

```bash
npm run db:seed
```

> **Peringatan:** seed menghapus dan membuat ulang sejumlah data aplikasi, termasuk pengguna, komunitas, modul, progres, topik, dan latihan. Jalankan hanya pada database pengembangan yang boleh di-reset. Jangan jalankan pada database produksi atau database berisi data penting.

### 5. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Untuk masuk, gunakan akun yang sudah terdaftar. Data akun demo hanya tersedia jika seed dijalankan pada database pengembangan.

## Environment Variables

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Ya | Connection string PostgreSQL yang digunakan Prisma. |
| `AUTH_SECRET` | Ya | Secret acak minimal 32 karakter untuk penandatanganan JWT. Wajib dikonfigurasi di production dan dirahasiakan. |
| `NEXT_PUBLIC_APP_URL` | Disarankan | URL utama aplikasi; gunakan origin produksi HTTPS saat deployment. |

## Perintah NPM

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan Next.js. |
| `npm run build` | Membuat build produksi. |
| `npm start` | Menjalankan build produksi. Jalankan `npm run build` terlebih dahulu. |
| `npm run lint` | Menjalankan pemeriksaan lint Next.js. |
| `npm run db:generate` | Membuat Prisma Client. |
| `npm run db:push` | Menyelaraskan schema Prisma ke database. |
| `npm run db:migrate` | Menjalankan Prisma Migrate dalam mode pengembangan. |
| `npm run db:seed` | Mengisi data demo; perintah ini mereset sejumlah data, lihat peringatan di atas. |
| `npm run db:studio` | Membuka Prisma Studio untuk melihat data database. |
| `npm run icons:generate` | Membuat ulang ikon PWA dari logo JAGO BICARA. |

## Struktur Proyek

```text
app/                    Halaman Next.js dan API routes
  admin/                Area administrasi platform
  akun/                 Profil, komunitas, dan sertifikat pengguna
  api/                  Endpoint autentikasi, latihan, kursus, dan komunitas
  beranda/              Dashboard peserta
  bicara/               Pengalaman latihan bicara
  community-admin/      Area administrasi komunitas
  leaderboard/          Klasemen season
  modulku/              Daftar dan materi modul
  naskah/               Generator naskah
components/             Komponen UI yang digunakan lintas halaman
lib/                    Autentikasi, database, scoring, dan utilitas domain
prisma/                 Schema dan seed database
public/                 Manifest, service worker, ikon, dan aset publik
scripts/                Skrip pembantu, termasuk generator ikon PWA
```

## Alur Penggunaan

1. Pengguna membuka aplikasi dan melihat tiga slide pengenalan.
2. Pengguna mendaftar atau masuk; peserta dapat bergabung dengan komunitas menggunakan kode.
3. Dari beranda, pengguna dapat berlatih bicara, membuat naskah, melihat progres, dan melanjutkan modul.
4. Latihan yang memenuhi syarat disimpan dan dapat berkontribusi pada leaderboard season.
5. Setelah memenuhi persyaratan pembelajaran, pengguna dapat memperoleh sertifikat dan memverifikasi nomor sertifikat.

## PWA dan Dukungan Browser

- Manifest berada di `public/manifest.json`; service worker berada di `public/sw.js`.
- Pengguna dapat memasang aplikasi melalui prompt browser jika tersedia, atau mengikuti panduan berdasarkan perangkat.
- Di iPhone/iPad, pemasangan dilakukan melalui Safari: **Bagikan → Tambahkan ke Layar Utama**.
- PWA memiliki cache dasar untuk request GET yang berhasil. Endpoint API tidak di-cache; aplikasi tidak menjanjikan seluruh fitur berjalan offline.
- Transkripsi suara bergantung pada dukungan browser terhadap Web Speech API. Jika tidak tersedia, transkrip dapat dilengkapi secara manual.
- Untuk mengganti ikon pada instalasi yang sudah ada, hapus aplikasi dari perangkat lalu pasang kembali agar ikon terbaru dimuat.

## Deployment

1. Siapkan database PostgreSQL yang dapat diakses dari environment deployment.
2. Atur `DATABASE_URL`, `AUTH_SECRET` yang kuat, dan `NEXT_PUBLIC_APP_URL` ke URL HTTPS produksi.
3. Siapkan schema database sesuai proses deployment proyek, lalu buat Prisma Client dengan `npm run db:generate`.
4. Buat build dengan `npm run build` dan jalankan dengan `npm start`.
5. Pastikan domain memakai HTTPS agar service worker, akses mikrofon, dan pemasangan PWA dapat digunakan.

Jangan menjalankan seed demo pada database produksi. Simpan backup database dan rahasia deployment di secret manager atau environment settings platform hosting.

## Pembuat

**M. Hamdan Aldiansyah**
