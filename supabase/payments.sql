-- 토스 결제 주문 (Edge Function만 insert/update — 클라이언트 직접 쓰기 금지)
-- Supabase SQL Editor에서 실행하세요.

create table if not exists public.payment_orders (
  order_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount > 0),
  product text not null default 'monthly' check (product in ('monthly', 'b2b')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  payment_key text,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz,
  refund_reason text
);

create index if not exists payment_orders_user_id_idx on public.payment_orders (user_id);

alter table public.payment_orders enable row level security;

drop policy if exists "Users read own payment orders" on public.payment_orders;
create policy "Users read own payment orders"
  on public.payment_orders for select
  using (auth.uid() = user_id);
