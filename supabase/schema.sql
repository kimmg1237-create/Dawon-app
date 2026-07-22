-- My Day Design: 전체 스키마
-- Supabase 대시보드 → SQL Editor 에서 실행하세요.
-- 이미 일부가 적용된 경우에도 다시 실행할 수 있습니다 (idempotent).

-- ============================================================
-- day_records
-- ============================================================

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

drop policy if exists "Users read own records" on public.day_records;
create policy "Users read own records"
  on public.day_records for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own records" on public.day_records;
create policy "Users insert own records"
  on public.day_records for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own records" on public.day_records;
create policy "Users update own records"
  on public.day_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own records" on public.day_records;
create policy "Users delete own records"
  on public.day_records for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 바람설계 설문 (Wish Design Portal)
-- ============================================================

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "No direct read on admin_users" on public.admin_users;
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

drop policy if exists "Users insert own wish responses" on public.wish_survey_responses;
create policy "Users insert own wish responses"
  on public.wish_survey_responses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users read own wish responses" on public.wish_survey_responses;
create policy "Users read own wish responses"
  on public.wish_survey_responses for select
  using (auth.uid() = user_id or public.is_wish_admin());

drop policy if exists "Admins delete wish responses" on public.wish_survey_responses;
create policy "Admins delete wish responses"
  on public.wish_survey_responses for delete
  using (public.is_wish_admin());

-- 관리자 등록 예시 (본인 user UUID로 교체):
-- insert into public.admin_users (user_id) values ('YOUR-USER-UUID-HERE');

-- ============================================================
-- 사용자별 운영 데이터 (독립 페이지 저장)
-- ============================================================

create table if not exists public.user_quick_designs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_quick_designs enable row level security;
drop policy if exists "Users manage own quick designs" on public.user_quick_designs;
create policy "Users manage own quick designs"
  on public.user_quick_designs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.user_trackers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_trackers enable row level security;
drop policy if exists "Users manage own trackers" on public.user_trackers;
create policy "Users manage own trackers"
  on public.user_trackers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.user_life_stage_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_life_stage_prefs enable row level security;
drop policy if exists "Users manage own life stage prefs" on public.user_life_stage_prefs;
create policy "Users manage own life stage prefs"
  on public.user_life_stage_prefs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.user_quests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_quests enable row level security;
drop policy if exists "Users manage own quests" on public.user_quests;
create policy "Users manage own quests"
  on public.user_quests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.user_ops_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);
alter table public.user_ops_data enable row level security;
drop policy if exists "Users manage own ops data" on public.user_ops_data;
create policy "Users manage own ops data"
  on public.user_ops_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 구독 · 결제 (토스페이먼츠)
-- ============================================================

create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'monthly', 'b2b')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  expires_at timestamptz,
  trial_ends_at timestamptz,
  ad_access_until timestamptz,
  source text not null default 'trial'
    check (source in ('trial', 'toss', 'play', 'app_store', 'manual_b2b', 'ads', 'dev')),
  external_id text,
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions
  add column if not exists trial_ends_at timestamptz,
  add column if not exists ad_access_until timestamptz,
  add column if not exists source text,
  add column if not exists external_id text;

update public.user_subscriptions set source = coalesce(source, 'trial') where source is null;
alter table public.user_subscriptions alter column source set default 'trial';

alter table public.user_subscriptions enable row level security;

drop policy if exists "Users read own subscription" on public.user_subscriptions;
create policy "Users read own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own subscription" on public.user_subscriptions;
create policy "Users insert own subscription"
  on public.user_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own subscription" on public.user_subscriptions;
create policy "Users update own subscription"
  on public.user_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_subscriptions (
    user_id, plan, status, trial_ends_at, source
  )
  values (
    new.id,
    'free',
    'active',
    now() + interval '30 days',
    'trial'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_subscription on auth.users;
create trigger on_auth_user_subscription
  after insert on auth.users
  for each row execute function public.handle_new_user_subscription();

create table if not exists public.payment_orders (
  order_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount > 0),
  product text not null default 'monthly' check (product in ('monthly', 'b2b')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled')),
  payment_key text,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists payment_orders_user_id_idx on public.payment_orders (user_id);

alter table public.payment_orders enable row level security;

drop policy if exists "Users read own payment orders" on public.payment_orders;
create policy "Users read own payment orders"
  on public.payment_orders for select
  using (auth.uid() = user_id);

-- ============================================================
-- 환불·해지·이용개시
-- ============================================================

alter table public.user_subscriptions
  add column if not exists content_first_used_at timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists cancelled_at timestamptz;

alter table public.payment_orders
  add column if not exists refunded_at timestamptz,
  add column if not exists refund_reason text;

alter table public.payment_orders drop constraint if exists payment_orders_status_check;
alter table public.payment_orders
  add constraint payment_orders_status_check
  check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded'));

create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null references public.payment_orders(order_id) on delete cascade,
  amount integer not null check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'completed')),
  decision_code text,
  reason text,
  admin_note text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists refund_requests_user_id_idx on public.refund_requests (user_id, created_at desc);

alter table public.refund_requests enable row level security;

drop policy if exists "Users read own refund requests" on public.refund_requests;
create policy "Users read own refund requests"
  on public.refund_requests for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own refund requests" on public.refund_requests;
create policy "Users insert own refund requests"
  on public.refund_requests for insert
  with check (auth.uid() = user_id);
