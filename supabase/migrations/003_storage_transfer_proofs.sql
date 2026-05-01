-- Bucket for bank transfer proof images (server uploads via service role; public read for operator UI URLs)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'transfer-proofs',
  'transfer-proofs',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
