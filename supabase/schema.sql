-- Execute este arquivo uma vez no SQL Editor do Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  color text not null default '#D8CFEA',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(title) between 3 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null check (char_length(excerpt) between 10 and 280),
  content text not null,
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'pending', 'published', 'rejected')),
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles for select using (true);

drop policy if exists "members update own profile" on public.profiles;
create policy "members update own profile" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id and role = 'member');

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles" on public.profiles for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "categories are public" on public.categories;
create policy "categories are public" on public.categories for select using (true);

drop policy if exists "authors manage categories" on public.categories;
drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public" on public.posts for select
using (status = 'published' and published_at <= now());

drop policy if exists "authors read own posts" on public.posts;
create policy "authors read own posts" on public.posts for select to authenticated
using ((select auth.uid()) = author_id);

drop policy if exists "authors create own posts" on public.posts;
create policy "authors create own posts" on public.posts for insert to authenticated
with check (
  (select auth.uid()) = author_id and
  (status in ('draft', 'pending') or (select public.is_admin())) and
  (featured = false or (select public.is_admin())) and
  (published_at is null or (select public.is_admin()))
);

drop policy if exists "authors update own posts" on public.posts;
create policy "authors update own posts" on public.posts for update to authenticated
using ((select auth.uid()) = author_id and not (select public.is_admin()))
with check (
  (select auth.uid()) = author_id and
  status in ('draft', 'pending') and
  featured = false and
  published_at is null
);

drop policy if exists "authors delete own posts" on public.posts;
create policy "authors delete own posts" on public.posts for delete to authenticated
using ((select auth.uid()) = author_id);

drop policy if exists "admins manage all posts" on public.posts;
create policy "admins manage all posts" on public.posts for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.profiles (id, display_name, role)
select id, coalesce(nullif(split_part(email, '@', 1), ''), 'Autora'),
  case when email = 'admin@entrelinhas.local' then 'admin' else 'member' end
from auth.users
on conflict (id) do update set role = excluded.role;

insert into public.categories (name, slug, color) values
  ('Processo', 'processo', '#E8C7D2'),
  ('Código', 'codigo', '#B5D6E0'),
  ('Arte', 'arte', '#D8CFEA')
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-covers', 'blog-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "covers are public" on storage.objects;
create policy "covers are public" on storage.objects for select
using (bucket_id = 'blog-covers');

drop policy if exists "authors upload covers" on storage.objects;
create policy "authors upload covers" on storage.objects for insert to authenticated
with check (bucket_id = 'blog-covers' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "authors update covers" on storage.objects;
create policy "authors update covers" on storage.objects for update to authenticated
using (bucket_id = 'blog-covers' and owner_id = (select auth.uid())::text);

drop policy if exists "authors delete covers" on storage.objects;
create policy "authors delete covers" on storage.objects for delete to authenticated
using (bucket_id = 'blog-covers' and owner_id = (select auth.uid())::text);
