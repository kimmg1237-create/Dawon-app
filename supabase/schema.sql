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

-- ============================================================
-- 바람설계 설문 (Wish Design Portal)
-- 아래 블록을 day_records 설정 이후 SQL Editor에서 실행하세요.
-- ============================================================

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- 관리자 목록은 서버 함수로만 확인 (일반 사용자 직접 조회 불가)
create policy "No direct read on admin_users"
  on public.admin_users for select
  using (false);

create or replace function public.is_wish_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_wish_admin() from public;
grant execute on function public.is_wish_admin() to authenticated;

create table if not exists public.wish_survey_responses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  version text not null default 'portal-v3',
  submitted_at timestamptz not null default now()
);

create index if not exists wish_survey_responses_user_id_idx
  on public.wish_survey_responses (user_id, submitted_at desc);

alter table public.wish_survey_responses enable row level security;

create policy "Users insert own wish responses"
  on public.wish_survey_responses for insert
  with check (auth.uid() = user_id);

create policy "Users read own wish responses"
  on public.wish_survey_responses for select
  using (auth.uid() = user_id or public.is_wish_admin());

create policy "Admins delete wish responses"
  on public.wish_survey_responses for delete
  using (public.is_wish_admin());

-- 관리자 등록 예시 (본인 user UUID로 교체):
-- insert into public.admin_users (user_id) values ('YOUR-USER-UUID-HERE');
