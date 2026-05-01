# PadelBook

Aplikasi web pemesanan lapangan padel (portal publik + dashboard operator & superadmin).

## Tech stack

- **Next.js 14** (App Router)
- **Supabase** — Auth, PostgreSQL, Row Level Security, Storage (bukti transfer)
- **Tailwind CSS**
- **Zod** — validasi API

## Prasyarat

- Node.js 18+
- Proyek [Supabase](https://supabase.com) (URL + anon key + service role key)
- (Opsional) [Supabase CLI](https://supabase.com/docs/guides/cli) untuk `supabase db push` / `db reset`

## Mulai dari nol

### 1. Install dependensi

```bash
npm install
```

### 2. Variabel lingkungan

Salin contoh env lalu isi nilai dari dashboard Supabase → **Settings → API**:

```bash
cp .env.local.example .env.local
```

| Variabel | Wajib | Keterangan |
|----------|--------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Ya | URL proyek (middleware & client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | Anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Ya untuk upload/cron/seed | **Rahasia**, hanya server |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Opsional | Jika dipakai di kode |

Tanpa URL + anon key, middleware tidak bisa memuat sesi; rute `/operator` dan `/superadmin` akan diarahkan ke `/login`.

### 3. Skema database

Migrasi SQL ada di `supabase/migrations/`. Terapkan ke proyek Supabase Anda:

- **Dengan CLI:** `supabase link` lalu `npm run db:push`, atau  
- **Manual:** salin isi file `.sql` ke **Supabase → SQL Editor** dan jalankan berurutan.

### 4. Storage (bukti transfer)

Pastikan bucket **`transfer-proofs`** ada (lihat migrasi `003_storage_transfer_proofs.sql` jika disertakan). Atau buat di **Storage** dengan nama sama dan kebijakan akses yang sesuai.

### 5. Akun & peran

Akun contoh untuk pengembangan / QA (buat dulu di **Supabase → Authentication → Users**, lalu set peran di `profiles` jika perlu):

| Email | Password | Peran | Setelah login |
|-------|----------|--------|-----------------|
| `admin@padelbook.id` | `admin123` | superadmin | `/superadmin/dashboard` |
| `operator@padelbook.id` | `operator123` | operator | `/operator/dashboard` |

Setelah user dibuat, trigger mengisi `public.profiles`. Pastikan kolom `role` sesuai:

```sql
update public.profiles set role = 'superadmin' where email = 'admin@padelbook.id';
update public.profiles set role = 'operator'  where email = 'operator@padelbook.id';
```

Operator perlu dihubungkan ke venue lewat **`operator_venues`** (dashboard superadmin atau SQL), agar bisa melihat booking venue tersebut.

> **Keamanan:** Jangan memakai password di atas di produksi. Ganti setelah go-live atau hapus user demo.

### 6. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Login: `/login` → superadmin ke `/superadmin/dashboard`, operator ke `/operator/dashboard`.

## Skrip npm

| Skrip | Fungsi |
|--------|--------|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `npm run lint:ci` | Lint tanpa toleransi warning |
| `npm run db:push` | Dorong migrasi ke Supabase (`supabase db push`) |
| `npm run db:reset` | Reset DB lokal/linked (`supabase db reset`) |
| `npm run db:seed:superadmin` | Seed data demo (butuh `.env` + service role) |

## Deploy (Vercel)

1. **Environment Variables:** sama seperti `.env.local` (minimal `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
2. **Supabase Auth → URL configuration:** tambahkan URL deployment (redirect/callback ke domain Vercel Anda).
3. **Cron:** `vercel.json` menjadwalkan `/api/cron/expire-bookings` **sekali per hari** (`0 0 * * *`) agar kompatibel dengan **Vercel Hobby** (cron tidak boleh lebih dari sekali/hari). Untuk jadwal lebih rapat, upgrade plan atau gunakan scheduler eksternal.

## Struktur proyek (ringkas)

```
src/
├── app/
│   ├── (public)/           # Beranda, venue, booking publik
│   ├── (auth)/login/       # Login Supabase
│   ├── operator/           # Dashboard operator (/operator/...)
│   ├── superadmin/         # Dashboard superadmin (/superadmin/...)
│   └── api/                # REST API (bookings, admin, upload, cron, …)
├── components/
│   ├── public/
│   └── dashboard/
└── lib/
    ├── supabase/           # client, server, admin
    └── utils.ts
```

## Lisensi

Private — All rights reserved.
