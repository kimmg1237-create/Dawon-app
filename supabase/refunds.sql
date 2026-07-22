-- 환불·해지·이용개시 기록
-- Supabase SQL Editor에서 실행하세요. (idempotent)

alter table public.user_subscriptions
  add column if not exists content_first_used_at timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists cancelled_at timestamptz;

alter table public.payment_orders
  add column if not exists refunded_at timestamptz,
  add column if not exists refund_reason text;

-- status에 refunded 허용 (기존 check 제거 후 재생성)
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
