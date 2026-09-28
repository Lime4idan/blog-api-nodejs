-- Execute este arquivo uma vez no SQL Editor do Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  color text not null default '#D8CFEA',
  created_at timestamptz not null default now()
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
  status text not null default 'draft' check (status in ('draft', 'published')),
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

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.posts enable row level security;

drop policy if exists "categories are public" on public.categories;
create policy "categories are public" on public.categories for select using (true);

drop policy if exists "authors manage categories" on public.categories;
create policy "authors manage categories" on public.categories for all to authenticated
using (true) with check (true);

drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public" on public.posts for select
using (status = 'published' and published_at <= now());

drop policy if exists "authors read own posts" on public.posts;
create policy "authors read own posts" on public.posts for select to authenticated
using ((select auth.uid()) = author_id);

drop policy if exists "authors create own posts" on public.posts;
create policy "authors create own posts" on public.posts for insert to authenticated
with check ((select auth.uid()) = author_id);

drop policy if exists "authors update own posts" on public.posts;
create policy "authors update own posts" on public.posts for update to authenticated
using ((select auth.uid()) = author_id) with check ((select auth.uid()) = author_id);

drop policy if exists "authors delete own posts" on public.posts;
create policy "authors delete own posts" on public.posts for delete to authenticated
using ((select auth.uid()) = author_id);

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
