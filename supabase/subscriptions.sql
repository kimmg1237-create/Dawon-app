-- My Day Design: 구독 테이블 (체험 / 광고 / 결제 채널)
-- Supabase SQL Editor에서 실행하세요.

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

-- 기존 테이블 마이그레이션
alter table public.user_subscriptions
  add column if not exists trial_ends_at timestamptz,
  add column if not exists ad_access_until timestamptz,
  add column if not exists source text,
  add column if not exists external_id text;

-- source 기본값/제약 (이미 있으면면 무시될 수 있음)
update public.user_subscriptions
set source = coalesce(source, 'trial')
where source is null;

alter table public.user_subscriptions
  alter column source set default 'trial';

do $$
begin
  alter table public.user_subscriptions
    add constraint user_subscriptions_source_check
    check (source in ('trial', 'toss', 'play', 'app_store', 'manual_b2b', 'ads', 'dev'));
exception
  when duplicate_object then null;
end $$;

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

-- 신규 가입: 30일 무료 체험
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
