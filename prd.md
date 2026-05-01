# PRD — Padel Court Booking Application

**Versi:** 1.1.0
**Tanggal:** 1 Mei 2026
**Status:** Draft (Revisi — migrasi ke Supabase + Vercel)
**Tech Stack:** Next.js · Supabase DB · Supabase Auth · PostgreSQL · PWA

> **Changelog v1.1.0:** Drizzle ORM diganti Supabase Client (`@supabase/supabase-js` + `@supabase/ssr`). Better Auth diganti Supabase Auth (built-in email/password + session management). Deployment dipinned ke Vercel. Supabase Storage menggantikan local/S3 untuk file upload bukti transfer.

---

## 1. Latar Belakang & Tujuan

Aplikasi pemesanan lapangan padel berbasis web (PWA-ready) yang memungkinkan:

- **Pengunjung umum** memesan lapangan tanpa harus membuat akun terlebih dahulu, lalu melakukan pembayaran via transfer bank.
- **Pengolah Lapangan** memantau dan mengonfirmasi status booking dari panel admin mereka sendiri.
- **Superadmin** mengelola seluruh data lapangan, pengguna, dan pengolah lapangan.

Aplikasi ini harus berjalan sebagai **Progressive Web App (PWA)** agar dapat diinstal di perangkat mobile, sekaligus tetap optimal sebagai web app di desktop. Tampilan dibedakan secara tegas antara portal pelanggan dan dashboard pengelola.

---

## 2. Stakeholder & Role

| Role | Deskripsi |
|---|---|
| **Guest / User** | Pengunjung yang memesan lapangan — tidak wajib login, cukup mengisi data diri saat checkout |
| **Pengolah Lapangan** | Operator yang mengelola lapangan tertentu; dapat melihat dan memperbarui status booking |
| **Superadmin** | Admin pusat; mengelola semua lapangan, semua operator, dan semua booking |

---

## 3. Scope

### 3.1 In Scope

- Halaman publik booking (pilih lapangan → pilih court → pilih slot waktu → isi data → checkout)
- Konfirmasi pembayaran via upload bukti transfer (disimpan di **Supabase Storage**)
- Dashboard Pengolah Lapangan (list booking, update status)
- Dashboard Superadmin (manajemen lapangan, court, operator, dan booking global)
- Notifikasi status booking (email atau in-app)
- PWA manifest + service worker (offline shell, installable)
- Autentikasi dengan **Supabase Auth** terintegrasi Next.js (via `@supabase/ssr`)

### 3.2 Out of Scope (v1)

- Payment gateway otomatis (Midtrans, Xendit, dll.) — v2
- Aplikasi native Android/iOS terpisah
- Loyalty poin / membership tier

---

## 4. User Stories

### 4.1 Guest / User

| ID | Story | Priority |
|---|---|---|
| U-01 | Saya ingin melihat daftar lapangan padel yang tersedia tanpa harus login | High |
| U-02 | Saya ingin memilih court dan slot waktu yang belum terpesan | High |
| U-03 | Saya ingin mengisi nama, nomor HP, dan email saat checkout | High |
| U-04 | Saya ingin mendapat informasi nomor rekening tujuan transfer setelah booking | High |
| U-05 | Saya ingin mengupload bukti transfer pembayaran | High |
| U-06 | Saya ingin mendapat halaman konfirmasi / kode booking | High |
| U-07 | Saya ingin mengecek status booking saya dengan kode booking atau email | Medium |
| U-08 | Saya ingin aplikasi bisa diinstal ke layar utama HP saya (PWA) | Medium |

### 4.2 Pengolah Lapangan

| ID | Story | Priority |
|---|---|---|
| P-01 | Saya ingin login ke dashboard khusus pengolah lapangan | High |
| P-02 | Saya ingin melihat semua booking di lapangan yang saya kelola | High |
| P-03 | Saya ingin memperbarui status booking: Pending → Terpesan / Ditolak | High |
| P-04 | Saya ingin melihat detail booking beserta bukti transfer yang diupload user | High |
| P-05 | Saya ingin melihat jadwal court dalam format kalender/grid per hari | Medium |
| P-06 | Saya ingin mendapat notifikasi (in-app atau email) setiap ada booking baru | Medium |

### 4.3 Superadmin

| ID | Story | Priority |
|---|---|---|
| S-01 | Saya ingin login ke dashboard superadmin | High |
| S-02 | Saya ingin menambah / edit / hapus lapangan (venue) | High |
| S-03 | Saya ingin menambah / edit / hapus court di dalam suatu lapangan | High |
| S-04 | Saya ingin menambah akun pengolah lapangan dan assign ke venue | High |
| S-05 | Saya ingin melihat seluruh booking dari semua venue | High |
| S-06 | Saya ingin mengatur slot waktu dan harga per court | High |
| S-07 | Saya ingin mengatur info rekening bank tujuan transfer | Medium |
| S-08 | Saya ingin melihat laporan ringkasan booking per periode | Low |

---

## 5. Alur Aplikasi

### 5.1 Alur Booking (Guest)

```
Halaman Utama
    └── Pilih Venue (lapangan)
        └── Pilih Court
            └── Pilih Tanggal & Slot Waktu (grid ketersediaan)
                └── Isi Form: Nama, No. HP, Email
                    └── Halaman Ringkasan Booking
                        └── Tampil Nomor Rekening & Nominal
                            └── Upload Bukti Transfer → Supabase Storage
                                └── Halaman Konfirmasi (Kode Booking)
                                    └── [Status: PENDING]
```

### 5.2 Alur Konfirmasi (Pengolah Lapangan)

```
Dashboard Login (Supabase Auth)
    └── List Booking (filter: Pending | Terpesan | Ditolak)
        └── Detail Booking
            ├── Lihat bukti transfer (Supabase Storage signed URL)
            └── Aksi: [Konfirmasi → TERPESAN] atau [Tolak → DITOLAK]
                └── Status diperbarui di database
                    └── User dapat cek status via kode booking
```

### 5.3 Alur Manajemen (Superadmin)

```
Dashboard Superadmin
    ├── Manajemen Venue
    │   ├── Tambah / Edit / Hapus Venue
    │   └── Tambah / Edit / Hapus Court per Venue
    ├── Manajemen Operator
    │   └── Tambah akun Pengolah Lapangan & assign ke Venue
    ├── Manajemen Booking
    │   └── Lihat semua booking (semua venue)
    └── Pengaturan
        └── Rekening Bank, Slot Waktu Default, Harga
```

---

## 6. Spesifikasi Teknis

### 6.1 Stack Teknologi

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Database Client | Supabase Client (`@supabase/supabase-js`) |
| Auth | Supabase Auth (`@supabase/ssr` untuk Next.js) |
| Database | PostgreSQL (via Supabase managed DB) |
| Styling | Tailwind CSS |
| PWA | `next-pwa` atau `@ducanh2912/next-pwa` |
| File Upload | Supabase Storage (bucket `transfer-proofs`) |
| Email | Resend / Nodemailer |
| Deployment | **Vercel** |

### 6.2 Environment Variables

```env
# .env.local

NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # hanya dipakai di server/API routes
```

> `SUPABASE_SERVICE_ROLE_KEY` **tidak boleh** di-expose ke client (`NEXT_PUBLIC_`). Digunakan hanya untuk operasi admin seperti pembuatan akun operator oleh superadmin.

### 6.3 Struktur Proyek

```
/
├── app/
│   ├── (public)/                    # Portal pelanggan (Guest)
│   │   ├── page.tsx                 # Halaman utama / daftar venue
│   │   ├── venue/[slug]/
│   │   │   └── page.tsx             # Detail venue + pilih court
│   │   ├── booking/
│   │   │   ├── [courtId]/page.tsx   # Form checkout
│   │   │   └── confirmation/page.tsx
│   │   └── cek-booking/page.tsx     # Cek status booking by kode
│   │
│   ├── (operator)/                  # Dashboard Pengolah Lapangan
│   │   ├── layout.tsx               # Auth guard: role = operator
│   │   ├── dashboard/page.tsx
│   │   ├── bookings/page.tsx
│   │   └── bookings/[id]/page.tsx
│   │
│   ├── (superadmin)/                # Dashboard Superadmin
│   │   ├── layout.tsx               # Auth guard: role = superadmin
│   │   ├── dashboard/page.tsx
│   │   ├── venues/page.tsx
│   │   ├── operators/page.tsx
│   │   └── bookings/page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   ├── callback/route.ts    # Supabase OAuth / email confirm callback
│       │   └── confirm/route.ts     # Email verification handler
│       ├── bookings/route.ts
│       ├── upload/route.ts          # Supabase Storage upload handler
│       └── venues/route.ts
│
├── lib/
│   └── supabase/
│       ├── client.ts                # Browser Supabase client (createBrowserClient)
│       ├── server.ts                # Server Supabase client (createServerClient)
│       └── admin.ts                 # Admin client (SERVICE_ROLE_KEY)
│
├── middleware.ts                    # Supabase Auth session refresh + role guard
│
├── components/
│   ├── public/                      # Komponen portal pelanggan
│   └── dashboard/                   # Komponen dashboard admin/operator
│
└── public/
    ├── manifest.json                # PWA manifest
    └── icons/                       # PWA icons
```

> **Catatan:** `lib/db/` (Drizzle instance + schema) dan `lib/auth.ts` (Better Auth config) **dihapus**. Semua akses data melalui Supabase client.

### 6.4 Konfigurasi Supabase Client

```typescript
// lib/supabase/client.ts — digunakan di Client Components
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts — digunakan di Server Components & API Routes
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

```typescript
// lib/supabase/admin.ts — hanya di server, operasi bypass RLS
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

### 6.5 Middleware (Auth Guard + Role Check)

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Guard: /operator/* dan /superadmin/*
  if (path.startsWith("/operator") || path.startsWith("/superadmin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Ambil role dari tabel profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (path.startsWith("/superadmin") && profile?.role !== "superadmin") {
      return NextResponse.redirect(new URL("/operator/dashboard", request.url));
    }

    if (
      path.startsWith("/operator") &&
      !["operator", "superadmin"].includes(profile?.role ?? "")
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/operator/:path*", "/superadmin/:path*"],
};
```

### 6.6 Schema Database (SQL Migration — Supabase)

Skema dibuat via Supabase Migrations (`supabase/migrations/`). Autentikasi dikelola oleh `auth.users` (Supabase built-in), sehingga tabel `users`, `sessions`, dan `accounts` dari Better Auth **tidak lagi diperlukan**.

```sql
-- supabase/migrations/001_initial_schema.sql

-- Profiles: extend auth.users dengan role
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('superadmin', 'operator')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: otomatis buat profile saat user Supabase Auth dibuat
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Venues
CREATE TABLE venues (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  address     TEXT,
  description TEXT,
  phone       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Accounts (per venue)
CREATE TABLE bank_accounts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  bank_name   TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name   TEXT NOT NULL
);

-- Operator ↔ Venue assignment
CREATE TABLE operator_venues (
  operator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id    UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  PRIMARY KEY (operator_id, venue_id)
);

-- Courts
CREATE TABLE courts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price_per_hour NUMERIC(10,2) NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE
);

-- Time Slots
CREATE TABLE time_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id    UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE
);

-- Bookings
CREATE TABLE bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code  TEXT NOT NULL UNIQUE,  -- format: PDL-YYYYMMDD-XXXXXX
  court_id      UUID NOT NULL REFERENCES courts(id),
  booking_date  DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  total_price   NUMERIC(10,2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'terpesan', 'ditolak', 'expired')),

  -- Data pemesan (guest, tidak perlu akun)
  customer_name  TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,

  -- Bukti transfer (Supabase Storage path)
  transfer_proof_path TEXT,           -- path di bucket "transfer-proofs"
  transfer_proof_url  TEXT,           -- public/signed URL

  -- Konfirmasi oleh operator
  operator_note  TEXT,
  confirmed_by   UUID REFERENCES profiles(id),
  confirmed_at   TIMESTAMPTZ,

  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.7 Row Level Security (RLS)

Supabase menggunakan RLS untuk mengamankan akses data langsung dari client.

```sql
-- Enable RLS
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues        ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_venues ENABLE ROW LEVEL SECURITY;

-- Profiles: user hanya bisa lihat/edit profil sendiri
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Venues & Courts: publik bisa baca
CREATE POLICY "Public read venues"
  ON venues FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read courts"
  ON courts FOR SELECT USING (is_active = TRUE);

-- Bookings: publik bisa INSERT (booking guest)
CREATE POLICY "Public can create booking"
  ON bookings FOR INSERT WITH CHECK (TRUE);

-- Operator hanya bisa baca booking di venue yang dia kelola
CREATE POLICY "Operator read own venue bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM operator_venues ov
      JOIN courts c ON c.venue_id = ov.venue_id
      WHERE ov.operator_id = auth.uid()
        AND c.id = bookings.court_id
    )
  );

-- Superadmin bisa baca semua (via service role key di server)
-- Operasi superadmin dilakukan via supabaseAdmin (bypass RLS)
```

> **Catatan:** Operasi yang membutuhkan akses penuh (superadmin CRUD venues, tambah operator, lihat semua booking) dilakukan menggunakan `supabaseAdmin` di API Routes server-side, sehingga RLS di-bypass secara aman.

### 6.8 Supabase Auth — Login & Session

```typescript
// Contoh: login di Server Action atau Client Component

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "operator@example.com",
  password: "password123",
});

// Sign out
await supabase.auth.signOut();

// Ambil session di Server Component
const { data: { user } } = await supabase.auth.getUser();
```

**Auth Callback Route** (untuk email confirmation link):

```typescript
// app/api/auth/callback/route.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/operator/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
```

### 6.9 Supabase Storage — Upload Bukti Transfer

Bucket: `transfer-proofs` (private, akses via signed URL)

```typescript
// app/api/upload/route.ts
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const bookingCode = formData.get("bookingCode") as string;

  if (!file || file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "File tidak valid atau melebihi 5MB" }, { status: 400 });
  }

  const supabase = await createClient();
  const filePath = `proofs/${bookingCode}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("transfer-proofs")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Buat signed URL (valid 7 hari untuk operator)
  const { data: signedUrl } = await supabase.storage
    .from("transfer-proofs")
    .createSignedUrl(filePath, 60 * 60 * 24 * 7);

  // Update booking dengan path dan URL
  await supabase
    .from("bookings")
    .update({
      transfer_proof_path: filePath,
      transfer_proof_url: signedUrl?.signedUrl,
    })
    .eq("booking_code", bookingCode);

  return Response.json({ path: filePath, url: signedUrl?.signedUrl });
}
```

### 6.10 Tambah Operator oleh Superadmin

Karena operator dibuat oleh superadmin (bukan self-register), proses pembuatan akun menggunakan `supabaseAdmin`:

```typescript
// app/api/admin/operators/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { name, email, password, venueIds } = await request.json();

  // Buat user di Supabase Auth
  const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,   // langsung aktif tanpa perlu verifikasi email
    user_metadata: { name },
  });

  if (error || !newUser.user) {
    return Response.json({ error: error?.message }, { status: 500 });
  }

  // Set role di tabel profiles
  await supabaseAdmin
    .from("profiles")
    .update({ role: "operator", name })
    .eq("id", newUser.user.id);

  // Assign ke venue
  const assignments = venueIds.map((venueId: string) => ({
    operator_id: newUser.user!.id,
    venue_id: venueId,
  }));

  await supabaseAdmin.from("operator_venues").insert(assignments);

  return Response.json({ success: true, userId: newUser.user.id });
}
```

### 6.11 Role & Access Control

| Path | Akses |
|---|---|
| `/` dan `/venue/*` dan `/booking/*` | Public (tanpa login) |
| `/cek-booking` | Public |
| `/login` | Public |
| `/operator/*` | Login wajib + role = `operator` atau `superadmin` |
| `/superadmin/*` | Login wajib + role = `superadmin` |
| `POST /api/bookings` | Public |
| `PATCH /api/operator/bookings/:id/status` | Operator/Superadmin (session check di server) |
| `POST /api/upload` | Public (rate-limited) |
| `POST /api/admin/operators` | Superadmin (service role) |

Middleware Next.js (`middleware.ts`) menangani redirect berdasarkan role dari session Supabase Auth + query ke tabel `profiles`.

---

## 7. Desain UI / UX

### 7.1 Portal Pelanggan (Public)

- **Tone:** Bersih, modern, sporty — dominasi warna hijau/biru muda
- **Layout:** Mobile-first, max-width 480px di mobile, 1200px di desktop
- **Komponen utama:**
  - Hero section dengan CTA "Pesan Sekarang"
  - Card venue dengan foto, alamat, dan rating
  - Grid slot waktu dengan warna status: hijau (tersedia), merah (terisi), abu (tidak aktif)
  - Stepper checkout: 4 langkah (Pilih Waktu → Isi Data → Bayar → Konfirmasi)
  - Halaman konfirmasi dengan kode booking yang bisa di-screenshot

### 7.2 Dashboard Pengolah Lapangan

- **Tone:** Profesional, informatif, data-focused
- **Layout:** Sidebar navigasi + main content area
- **Komponen utama:**
  - Summary card: Total Pending, Terpesan Hari Ini, Pendapatan Bulan Ini
  - Tabel booking dengan filter status + tanggal
  - Detail modal: info pemesan + preview bukti transfer (via signed URL Supabase Storage) + tombol Konfirmasi / Tolak
  - Tampilan grid jadwal per court per hari (kalender mini)
- **Warna status badge:**
  - `pending` → kuning
  - `terpesan` → hijau
  - `ditolak` → merah
  - `expired` → abu

### 7.3 Dashboard Superadmin

- **Tone:** Enterprise, lengkap
- **Layout:** Sidebar multi-level + breadcrumb
- **Komponen utama:**
  - Dashboard stats global (semua venue)
  - CRUD form venue + court dengan drag-drop urutan
  - Tabel operator + assign venue
  - Global booking list dengan filter venue, tanggal, status
  - Pengaturan rekening bank per venue

### 7.4 Perbedaan Tampilan Guest vs Operator/Superadmin

| Aspek | Guest (Public) | Operator / Superadmin |
|---|---|---|
| Navigasi | Top navbar sederhana (logo + "Cek Booking") | Sidebar dengan menu navigasi lengkap |
| Warna dominan | Hijau segar / sporty | Dark navy / profesional |
| Autentikasi | Tidak ada / tanpa login | Login via Supabase Auth |
| Aksi utama | Pesan, Bayar, Cek Status | Konfirmasi, Kelola Data |
| Responsivitas | Mobile-first | Desktop-first (tablet supported) |

---

## 8. PWA Configuration

```json
// public/manifest.json
{
  "name": "PadelBook",
  "short_name": "PadelBook",
  "description": "Booking lapangan padel mudah dan cepat",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Service Worker Strategy:**
- Halaman publik: `StaleWhileRevalidate` untuk shell offline
- API routes: `NetworkFirst`
- Gambar venue/court: `CacheFirst` dengan expiry 7 hari
- Upload & booking submission: `NetworkOnly` (tidak di-cache)

---

## 9. Status Booking & State Machine

```
[PENDING]
   ├── Operator konfirmasi transfer → [TERPESAN]
   ├── Operator tolak / bukti tidak valid → [DITOLAK]
   └── Tidak ada aksi dalam 24 jam → [EXPIRED] (via Supabase Edge Function / cron)

[TERPESAN] → final (tidak bisa diubah kecuali Superadmin)
[DITOLAK]  → final
[EXPIRED]  → final
```

> **EXPIRED cron:** Di v1 tanpa VPS Docker, scheduled job bisa menggunakan **Supabase Edge Functions** dengan `pg_cron` extension, atau Vercel Cron Jobs (`vercel.json`).

---

## 10. API Endpoints

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/venues` | List semua venue aktif | - |
| GET | `/api/venues/:slug` | Detail venue + courts | - |
| GET | `/api/courts/:id/availability` | Slot tersedia per tanggal | - |
| POST | `/api/bookings` | Buat booking baru (guest) | - |
| GET | `/api/bookings/cek?code=&email=` | Cek status by kode | - |
| POST | `/api/upload/transfer-proof` | Upload ke Supabase Storage | - |
| GET | `/api/operator/bookings` | List booking (operator scope) | Operator |
| PATCH | `/api/operator/bookings/:id/status` | Update status booking | Operator |
| GET | `/api/admin/bookings` | List semua booking | Superadmin |
| POST | `/api/admin/venues` | Tambah venue | Superadmin |
| PUT | `/api/admin/venues/:id` | Edit venue | Superadmin |
| DELETE | `/api/admin/venues/:id` | Hapus venue | Superadmin |
| POST | `/api/admin/courts` | Tambah court | Superadmin |
| POST | `/api/admin/operators` | Tambah operator + assign venue | Superadmin |

---

## 11. Notifikasi

| Event | Penerima | Channel |
|---|---|---|
| Booking baru dibuat | Guest (pemesan) | Email (konfirmasi + instruksi bayar) |
| Booking baru dibuat | Operator lapangan terkait | Email / In-app notif |
| Status → TERPESAN | Guest | Email |
| Status → DITOLAK | Guest | Email + alasan |
| Upload bukti transfer | Operator | In-app badge/notif |

---

## 12. Deployment — Vercel

### 12.1 Konfigurasi Vercel

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/expire-bookings",
      "schedule": "0 * * * *"
    }
  ]
}
```

`/api/cron/expire-bookings` akan memperbarui status booking `pending` yang lebih dari 24 jam menjadi `expired`, menggunakan `supabaseAdmin`.

### 12.2 Environment Variables di Vercel

Set di **Vercel Dashboard → Settings → Environment Variables**:

| Key | Scope |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview (jangan di Development jika tidak perlu) |
| `RESEND_API_KEY` | Production, Preview |

### 12.3 Supabase Storage CORS

Tambahkan domain Vercel ke CORS policy Supabase Storage di **Supabase Dashboard → Storage → Policies**:

```
https://<project-name>.vercel.app
https://<custom-domain>.com
```

---

## 13. Non-Functional Requirements

| Aspek | Target |
|---|---|
| Performance | Lighthouse score ≥ 85 (mobile) |
| PWA Installable | Lulus PWA checklist Google |
| Keamanan upload | Validasi MIME type + ukuran maks 5MB (di API route + Supabase Storage policy) |
| Rate limiting | Max 10 booking/IP/jam (Vercel Edge Middleware) |
| Ketersediaan | 99.5% uptime (Vercel + Supabase SLA) |
| Booking code | Format: `PDL-YYYYMMDD-[6 char random]` |
| RLS | Semua tabel sensitif dilindungi Supabase RLS |

---

## 14. Milestones

| Fase | Deliverable | Estimasi |
|---|---|---|
| **Fase 1 — Foundation** | Setup Next.js, Supabase project, schema migration, Supabase Auth, RLS | 3 hari |
| **Fase 2 — Public Booking Flow** | Halaman venue, court, slot, form checkout, konfirmasi | 5 hari |
| **Fase 3 — Upload & Status Check** | Upload ke Supabase Storage, cek status by kode | 2 hari |
| **Fase 4 — Operator Dashboard** | Login via Supabase Auth, list booking, update status | 4 hari |
| **Fase 5 — Superadmin Dashboard** | CRUD venue, court, operator (via admin SDK), global booking | 5 hari |
| **Fase 6 — PWA + Notifikasi** | Manifest, service worker, email notif (Resend) | 2 hari |
| **Fase 7 — Vercel Deploy + Cron** | Deploy ke Vercel, cron expire booking, env setup, CORS config | 1 hari |
| **Fase 8 — QA & Polish** | Testing, bug fix, responsive check, RLS audit | 3 hari |
| **Total** | | **~25 hari** |

---

## 15. Open Issues / Keputusan yang Masih Perlu Dibuat

| # | Pertanyaan | Catatan |
|---|---|---|
| 1 | Apakah bucket `transfer-proofs` publik atau private (signed URL)? | Rekomendasi: **private + signed URL** (7 hari) untuk keamanan data pemesan |
| 2 | Apakah perlu fitur pembatalan booking dari sisi user? | Belum di-scope, kandidat v1.1 |
| 3 | Apakah jadwal slot bersifat fleksibel (1–3 jam) atau fixed per 1 jam? | Perlu konfirmasi bisnis |
| 4 | Berapa batas waktu upload bukti transfer setelah booking dibuat? | Saran: 2 jam, lalu auto-EXPIRED via Vercel Cron |
| 5 | Apakah Superadmin bisa override status TERPESAN menjadi DITOLAK? | Perlu konfirmasi kebijakan |
| 6 | Apakah email verifikasi diaktifkan untuk akun operator? | Rekomendasi: nonaktifkan (`email_confirm: true` saat `createUser`), karena akun dibuat langsung oleh superadmin |

---

*Dokumen ini adalah living document dan akan diperbarui seiring dengan diskusi teknis dan kebutuhan bisnis yang berkembang.*