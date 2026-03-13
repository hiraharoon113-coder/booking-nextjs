-- =====================================================
--  SUPABASE SETUP — Run these in the Supabase SQL Editor
--  (Dashboard → SQL Editor → New Query)
-- =====================================================

-- ── 1. profiles table ────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  email       text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ── 2. Enable Row Level Security ─────────────────────────
alter table public.profiles enable row level security;

-- ── 3. RLS Policies ──────────────────────────────────────
-- Each user can only read/update/insert their own row

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── 4. Auto-create profile row on signup ─────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop existing trigger if it exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 5. Back-fill existing users (run once) ───────────────
-- If you already have users in auth.users without a profiles row, run this:
insert into public.profiles (id, email, full_name)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;


-- =====================================================
--  STORAGE SETUP
--  Do this in the Supabase Dashboard first:
--  Storage → New Bucket → Name: "avatars" → Public: ON
--  Then run the SQL below for RLS on storage objects.
-- =====================================================

-- ── 6. Storage RLS policies for avatars bucket ───────────

-- Anyone can view avatar images (public bucket)
create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Users can upload into their own folder (userId/avatar.ext)
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can overwrite their own avatar
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
