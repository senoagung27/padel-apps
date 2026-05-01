# PRD — Padel Court Booking Application

**Versi:** 1.0.0
**Tanggal:** 29 April 2026
**Status:** Draft
**Tech Stack:** Next.js · Drizzle ORM · Better Auth · PostgreSQL · PWA

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
- Konfirmasi pembayaran via upload bukti transfer
- Dashboard Pengolah Lapangan (list booking, update status)
- Dashboard Superadmin (manajemen lapangan, court, operator, dan booking global)
- Notifikasi status booking (email atau in-app)
- PWA manifest + service worker (offline shell, installable)
- Autentikasi dengan **Better Auth** terintegrasi Next.js

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
                            └── Upload Bukti Transfer
                                └── Halaman Konfirmasi (Kode Booking)
                                    └── [Status: PENDING]
```

### 5.2 Alur Konfirmasi (Pengolah Lapangan)

```
Dashboard Login
    └── List Booking (filter: Pending | Terpesan | Ditolak)
        └── Detail Booking
            ├── Lihat bukti transfer
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
| ORM | Drizzle ORM |
| Auth | Better Auth (`better-auth` + Next.js integration) |
| Database | PostgreSQL |
| Styling | Tailwind CSS |
| PWA | `next-pwa` atau `@ducanh2912/next-pwa` |
| File Upload | Next.js API Route + local/S3 storage |
| Email | Resend / Nodemailer |
| Deployment | Vercel / VPS Docker |

### 6.2 Struktur Proyek

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
│       ├── auth/[...all]/route.ts   # Better Auth handler
│       ├── bookings/route.ts
│       ├── upload/route.ts
│       └── venues/route.ts
│
├── lib/
│   ├── auth.ts                      # Better Auth config
│   ├── db/
│   │   ├── index.ts                 # Drizzle instance
│   │   └── schema.ts                # Schema definitions
│   └── utils.ts
│
├── components/
│   ├── public/                      # Komponen portal pelanggan
│   └── dashboard/                   # Komponen dashboard admin/operator
│
└── public/
    ├── manifest.json                # PWA manifest
    └── icons/                       # PWA icons
```

### 6.3 Schema Database (Drizzle ORM)

```typescript
// lib/db/schema.ts

// --- Auth (Better Auth managed) ---
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  role: text("role", { enum: ["superadmin", "operator"] }).default("operator"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", { /* Better Auth standard */ });
export const accounts = pgTable("accounts", { /* Better Auth standard */ });

// --- Venue ---
export const venues = pgTable("venues", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address"),
  description: text("description"),
  imageUrl: text("image_url"),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  bankHolder: text("bank_holder"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Court ---
export const courts = pgTable("courts", {
  id: uuid("id").primaryKey().defaultRandom(),
  venueId: uuid("venue_id").notNull().references(() => venues.id, { onDelete: "cascade" }),
  name: text("name").notNull(),         // e.g. "Court A", "Court 1"
  description: text("description"),
  pricePerHour: integer("price_per_hour").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Venue Operator (many-to-many) ---
export const venueOperators = pgTable("venue_operators", {
  id: uuid("id").primaryKey().defaultRandom(),
  venueId: uuid("venue_id").notNull().references(() => venues.id),
  userId: text("user_id").notNull().references(() => users.id),
});

// --- Booking ---
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingCode: text("booking_code").notNull().unique(), // e.g. PDL-20260429-XXXX
  courtId: uuid("court_id").notNull().references(() => courts.id),
  venueId: uuid("venue_id").notNull().references(() => venues.id),

  // Data pemesan (guest — tidak perlu akun)
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone").notNull(),

  // Jadwal
  bookingDate: date("booking_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  durationHours: integer("duration_hours").notNull(),

  // Pembayaran
  totalAmount: integer("total_amount").notNull(),
  transferProofUrl: text("transfer_proof_url"),

  // Status
  status: text("status", {
    enum: ["pending", "terpesan", "ditolak", "expired"]
  }).default("pending").notNull(),

  // Catatan operator
  operatorNote: text("operator_note"),
  confirmedBy: text("confirmed_by").references(() => users.id),
  confirmedAt: timestamp("confirmed_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Time Slots (opsional: jika slot diatur per venue/court) ---
export const timeSlots = pgTable("time_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  courtId: uuid("court_id").notNull().references(() => courts.id),
  startTime: time("start_time").notNull(),   // e.g. "08:00"
  endTime: time("end_time").notNull(),        // e.g. "09:00"
  isActive: boolean("is_active").default(true),
});
```

### 6.4 Konfigurasi Better Auth

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7 }, // 7 hari
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "operator" },
    },
  },
});
```

### 6.5 Role & Access Control

| Path | Akses |
|---|---|
| `/` dan `/venue/*` dan `/booking/*` | Public (tanpa login) |
| `/cek-booking` | Public |
| `/operator/*` | Login wajib + role = `operator` atau `superadmin` |
| `/superadmin/*` | Login wajib + role = `superadmin` |
| `POST /api/bookings` | Public |
| `PATCH /api/bookings/:id/status` | Operator/Superadmin |
| `POST /api/upload` | Public (rate-limited) |

Middleware Next.js (`middleware.ts`) menangani redirect berdasarkan role dari session Better Auth.

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
  - Detail modal: info pemesan + preview bukti transfer + tombol Konfirmasi / Tolak
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
| Autentikasi | Tidak ada / tanpa login | Login wajib via Better Auth |
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
   └── Tidak ada aksi dalam 24 jam → [EXPIRED] (via cron job)

[TERPESAN] → final (tidak bisa diubah kecuali Superadmin)
[DITOLAK]  → final
[EXPIRED]  → final
```

---

## 10. API Endpoints

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/venues` | List semua venue aktif | - |
| GET | `/api/venues/:slug` | Detail venue + courts | - |
| GET | `/api/courts/:id/availability` | Slot tersedia per tanggal | - |
| POST | `/api/bookings` | Buat booking baru (guest) | - |
| GET | `/api/bookings/cek?code=&email=` | Cek status by kode | - |
| POST | `/api/upload/transfer-proof` | Upload bukti transfer | - |
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

## 12. Non-Functional Requirements

| Aspek | Target |
|---|---|
| Performance | Lighthouse score ≥ 85 (mobile) |
| PWA Installable | Lulus PWA checklist Google |
| Keamanan upload | Validasi MIME type + ukuran maks 5MB |
| Rate limiting | Max 10 booking/IP/jam |
| Ketersediaan | 99.5% uptime |
| Booking code | Format: `PDL-YYYYMMDD-[6 char random]` |

---

## 13. Milestones

| Fase | Deliverable | Estimasi |
|---|---|---|
| **Fase 1 — Foundation** | Setup Next.js, Drizzle, Better Auth, schema DB | 3 hari |
| **Fase 2 — Public Booking Flow** | Halaman venue, court, slot, form checkout, konfirmasi | 5 hari |
| **Fase 3 — Upload & Status Check** | Upload bukti transfer, cek status by kode | 2 hari |
| **Fase 4 — Operator Dashboard** | Login, list booking, update status | 4 hari |
| **Fase 5 — Superadmin Dashboard** | CRUD venue, court, operator, global booking | 5 hari |
| **Fase 6 — PWA + Notifikasi** | Manifest, service worker, email notif | 2 hari |
| **Fase 7 — QA & Polish** | Testing, bug fix, responsive check | 3 hari |
| **Total** | | **~24 hari** |

---

## 14. Open Issues / Keputusan yang Masih Perlu Dibuat

| # | Pertanyaan | Catatan |
|---|---|---|
| 1 | Apakah bukti transfer disimpan di server lokal atau cloud (S3/Cloudinary)? | Rekomendasi: Cloudinary untuk simplisitas |
| 2 | Apakah perlu fitur pembatalan booking dari sisi user? | Belum di-scope, kandidat v1.1 |
| 3 | Apakah jadwal slot bersifat fleksibel (1–3 jam) atau fixed per 1 jam? | Perlu konfirmasi bisnis |
| 4 | Berapa batas waktu upload bukti transfer setelah booking dibuat? | Saran: 2 jam, lalu auto-EXPIRED |
| 5 | Apakah Superadmin bisa override status TERPESAN menjadi DITOLAK? | Perlu konfirmasi kebijakan |

---

*Dokumen ini adalah living document dan akan diperbarui seiring dengan diskusi teknis dan kebutuhan bisnis yang berkembang.*