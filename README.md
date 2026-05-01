# PadelBook — Padel Court Booking Application

Aplikasi pemesanan lapangan padel berbasis web (PWA-ready).

## Tech Stack

- **Next.js 14+** (App Router)
- **Drizzle ORM** + PostgreSQL
- **Better Auth** (authentication)
- **Tailwind CSS** + shadcn/ui
- **PWA** ready

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Pastikan PostgreSQL sudah berjalan. Jika perintah `createdb padelbook` tidak ditemukan, Anda dapat membuat database dengan salah satu cara berikut:
- Menggunakan GUI (pgAdmin, DBeaver, dll) untuk membuat database bernama `padelbook`.
- Melalui shell `psql`: jalankan `psql -U postgres` lalu jalankan perintah SQL `CREATE DATABASE padelbook;`.

Setelah database terbuat, atur `DATABASE_URL` di `.env.local`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/padelbook
```

### 3. Generate & Push Schema

```bash
npm run db:push
```

### 4. Seed Database (opsional)

```bash
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## User Accounts

| Role | Email | Password |
|---|---|---|
| Superadmin | admin@padelbook.id | (set via Better Auth signup) |
| Operator | operator@padelbook.id | (set via Better Auth signup) |

> **Note:** Untuk v1, buat akun pertama kali via API:
> ```bash
> curl -X POST http://localhost:3000/api/auth/sign-up/email \
>   -H "Content-Type: application/json" \
>   -d '{"name":"Super Admin","email":"admin@padelbook.id","password":"admin123"}'
> ```

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Portal pelanggan (guest)
│   ├── (auth)/            # Login page
│   ├── (operator)/        # Dashboard operator
│   ├── (superadmin)/      # Dashboard superadmin
│   └── api/               # API routes
├── components/
│   ├── public/            # Komponen portal pelanggan
│   └── dashboard/         # Komponen dashboard
└── lib/
    ├── auth.ts            # Better Auth config
    ├── db/                # Drizzle ORM
    └── utils.ts           # Utilities
```

## License

Private — All rights reserved.