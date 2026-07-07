-- My Day Design: day_records 테이블
-- Supabase 대시보드 → SQL Editor 에서 실행하세요.

create table if not exists public.day_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  task text not null,
  emotion text not null check (emotion in ('기쁨', '평안', '감사', '걱정', '희망')),
  next_task text not null default '',
  message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists day_records_user_id_date_idx on public.day_records (user_id, date desc);

alter table public.day_records enable row level security;

create policy "Users read own records"
  on public.day_records for select
  using (auth.uid() = user_id);

create policy "Users insert own records"
  on public.day_records for insert
  with check (auth.uid() = user_id);

create policy "Users update own records"
  on public.day_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own records"
  on public.day_records for delete
  using (auth.uid() = user_id);
