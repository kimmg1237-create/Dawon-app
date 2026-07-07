-- My Day Design: 구독 테이블
-- Supabase SQL Editor에서 실행하세요.

create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'monthly', 'b2b')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

create policy "Users read own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users insert own subscription"
  on public.user_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users update own subscription"
  on public.user_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 신규 가입 시 무료 플랜 자동 생성
create or replace function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_subscription on auth.users;
create trigger on_auth_user_subscription
  after insert on auth.users
  for each row execute function public.handle_new_user_subscription();
