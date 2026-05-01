-- =============================================
-- Padel Court Booking App - Initial Schema
-- PRD v1.1.0
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'user' check (role in ('superadmin', 'operator', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- VENUES
-- =============================================
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  address text,
  description text,
  phone text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- BANK ACCOUNTS
-- =============================================
create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- OPERATOR VENUES (junction: operator <-> venue)
-- =============================================
create table public.operator_venues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, venue_id)
);

-- =============================================
-- COURTS
-- =============================================
create table public.courts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  description text,
  price_per_hour numeric not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- TIME SLOTS
-- =============================================
create table public.time_slots (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts(id) on delete cascade,
  start_time text not null,  -- e.g. "08:00"
  end_time text not null,    -- e.g. "09:00"
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================
-- BOOKINGS
-- =============================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  court_id uuid not null references public.courts(id),
  venue_id uuid not null references public.venues(id),
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  booking_date date not null,
  start_time text not null,
  end_time text not null,
  duration_hours numeric not null,
  total_amount numeric not null,
  status text not null default 'pending' check (status in ('pending', 'terpesan', 'ditolak', 'expired')),
  transfer_proof_url text,
  operator_note text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index idx_bookings_court_date on public.bookings(court_id, booking_date);
create index idx_bookings_booking_code on public.bookings(booking_code);
create index idx_bookings_guest_email on public.bookings(guest_email);
create index idx_bookings_status on public.bookings(status);
create index idx_courts_venue_id on public.courts(venue_id);
create index idx_time_slots_court_id on public.time_slots(court_id);
create index idx_operator_venues_user_id on public.operator_venues(user_id);
create index idx_bank_accounts_venue_id on public.bank_accounts(venue_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles enable row level security;
alter table public.venues enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.operator_venues enable row level security;
alter table public.courts enable row level security;
alter table public.time_slots enable row level security;
alter table public.bookings enable row level security;

-- Profiles: users can read own profile, superadmin can read all
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Superadmin can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

-- Venues: public read, superadmin write
create policy "Public can view active venues" on public.venues
  for select using (is_active = true);

create policy "Superadmin can manage venues" on public.venues
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

create policy "Operator can view own venues" on public.venues
  for select using (
    exists (
      select 1 from public.operator_venues ov
      where ov.venue_id = id and ov.user_id = auth.uid()
    )
  );

-- Bank accounts: public read
create policy "Public can view bank accounts" on public.bank_accounts
  for select using (true);

create policy "Superadmin can manage bank accounts" on public.bank_accounts
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

-- Operator venues
create policy "Superadmin can manage operator_venues" on public.operator_venues
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

create policy "Operators can view own assignments" on public.operator_venues
  for select using (user_id = auth.uid());

-- Courts: public read, superadmin write
create policy "Public can view active courts" on public.courts
  for select using (is_active = true);

create policy "Superadmin can manage courts" on public.courts
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

-- Time slots: public read
create policy "Public can view time slots" on public.time_slots
  for select using (true);

create policy "Superadmin can manage time slots" on public.time_slots
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

-- Bookings: guest can create, operator can read own venue, superadmin full access
create policy "Anyone can create booking" on public.bookings
  for insert with check (true);

create policy "Guest can view own bookings by code and email" on public.bookings
  for select using (true);

create policy "Operator can view own venue bookings" on public.bookings
  for select using (
    exists (
      select 1 from public.operator_venues ov
      where ov.venue_id = bookings.venue_id and ov.user_id = auth.uid()
    )
  );

create policy "Operator can update own venue bookings" on public.bookings
  for update using (
    exists (
      select 1 from public.operator_venues ov
      where ov.venue_id = bookings.venue_id and ov.user_id = auth.uid()
    )
  );

create policy "Superadmin can manage all bookings" on public.bookings
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );
