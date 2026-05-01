-- Fix recursive RLS policy on public.profiles
-- Previous policy queried public.profiles within a policy on public.profiles,
-- which causes "infinite recursion detected in policy" errors.

alter table public.profiles enable row level security;

drop policy if exists "Superadmin can view all profiles" on public.profiles;

create policy "Superadmin can view all profiles" on public.profiles
  for select using (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'superadmin'
  );
