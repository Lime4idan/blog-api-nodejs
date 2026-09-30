-- Comunidade Entrelinhas: perfis, moderação e políticas de acesso.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts drop constraint if exists posts_status_check;
alter table public.posts add constraint posts_status_check
check (status in ('draft', 'pending', 'published', 'rejected'));

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

alter table public.profiles enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles for select using (true);

drop policy if exists "members update own profile" on public.profiles;
create policy "members update own profile" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id and role = 'member');

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles" on public.profiles for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "authors manage categories" on public.categories;
drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

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

drop policy if exists "admins manage all posts" on public.posts;
create policy "admins manage all posts" on public.posts for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.profiles (id, display_name, role)
select id, coalesce(nullif(split_part(email, '@', 1), ''), 'Autora'),
  case when email = 'admin@entrelinhas.local' then 'admin' else 'member' end
from auth.users
on conflict (id) do update set role = excluded.role;
