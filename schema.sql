-- ═══════════════════════════════════════════════════════════════
-- Swatti content plan — Supabase setup
-- Paste this whole file into: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- 1. The table that holds every tick, note, week plan and reference list.
create table if not exists public.entries (
  id         text primary key,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Let the page read and write it.
--    Anyone with the link can edit — that is the point, it is a shared board
--    between Prince and Swatti. Keep the URL private.
alter table public.entries enable row level security;

drop policy if exists "open read"  on public.entries;
drop policy if exists "open write" on public.entries;

create policy "open read"  on public.entries for select using (true);
create policy "open write" on public.entries for all    using (true) with check (true);

-- 3. Turn on live updates so both screens stay in sync.
alter publication supabase_realtime add table public.entries;

-- 4. Storage bucket for reference photos and voice notes.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media read"   on storage.objects;
drop policy if exists "media write"  on storage.objects;

create policy "media read"  on storage.objects
  for select using (bucket_id = 'media');
create policy "media write" on storage.objects
  for all using (bucket_id = 'media') with check (bucket_id = 'media');
