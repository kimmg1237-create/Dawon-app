-- 라이브러리 메타데이터 테이블 (전자책·만화·오디오북)
-- Supabase SQL Editor에서 이 파일만 실행하세요.
-- 404 PGRST205: Could not find the table 'public.library_items' 해결용

create table if not exists public.library_items (
  id text primary key,
  title text not null,
  description text not null default '',
  category text not null default 'life'
    check (category in ('life', 'mind', 'relation', 'future', 'age')),
  tag text not null default '',
  path_no text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  cover_path text,
  ebook_cover_path text,
  comic_cover_path text,
  audiobook_cover_path text,
  ebook_pdf_path text,
  comic_pdf_path text,
  audiobook_text_path text,
  updated_at timestamptz not null default now()
);

alter table public.library_items
  add column if not exists ebook_cover_path text,
  add column if not exists comic_cover_path text,
  add column if not exists audiobook_cover_path text;

create index if not exists library_items_sort_idx
  on public.library_items (published, sort_order, id);

alter table public.library_items enable row level security;

drop policy if exists "Anyone read published library items" on public.library_items;
create policy "Anyone read published library items"
  on public.library_items for select
  using (published = true or public.is_wish_admin());

drop policy if exists "Admins insert library items" on public.library_items;
create policy "Admins insert library items"
  on public.library_items for insert
  with check (public.is_wish_admin());

drop policy if exists "Admins update library items" on public.library_items;
create policy "Admins update library items"
  on public.library_items for update
  using (public.is_wish_admin())
  with check (public.is_wish_admin());

drop policy if exists "Admins delete library items" on public.library_items;
create policy "Admins delete library items"
  on public.library_items for delete
  using (public.is_wish_admin());

grant select on public.library_items to anon, authenticated;
grant insert, update, delete on public.library_items to authenticated;

notify pgrst, 'reload schema';
