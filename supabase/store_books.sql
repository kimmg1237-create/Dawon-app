-- 스토어 단행본(자신과의 소통 · 힐링게임) 파일은 서재 51권과 분리합니다.

create table if not exists public.store_books (
  product text primary key check (product in ('sotong', 'healing')),
  title text not null,
  cover_path text,
  pdf_path text,
  updated_at timestamptz not null default now()
);

insert into public.store_books (product, title)
values
  ('sotong', '자신과의 소통'),
  ('healing', '힐링게임')
on conflict (product) do nothing;

alter table public.store_books enable row level security;

drop policy if exists "Anyone read store books meta" on public.store_books;
create policy "Anyone read store books meta"
  on public.store_books for select
  using (true);

drop policy if exists "Admins write store books" on public.store_books;
create policy "Admins write store books"
  on public.store_books for all
  using (public.is_wish_admin())
  with check (public.is_wish_admin());
