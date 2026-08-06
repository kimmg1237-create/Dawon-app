-- 사이트 문구 (관리자 CMS)
-- Supabase SQL Editor에서 실행하세요.

create table if not exists public.site_copy (
  id text primary key default 'default',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_copy enable row level security;

drop policy if exists "Anyone can read site copy" on public.site_copy;
create policy "Anyone can read site copy"
  on public.site_copy for select
  using (true);

drop policy if exists "Admins upsert site copy" on public.site_copy;
create policy "Admins upsert site copy"
  on public.site_copy for insert
  with check (public.is_wish_admin());

drop policy if exists "Admins update site copy" on public.site_copy;
create policy "Admins update site copy"
  on public.site_copy for update
  using (public.is_wish_admin())
  with check (public.is_wish_admin());

insert into public.site_copy (id, payload)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;
