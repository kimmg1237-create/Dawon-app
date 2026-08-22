-- 주문·구매자·지급·이벤트 (기존 payment_orders 확장)
-- 한 번 실행: npx supabase db query --linked --project-ref … -f supabase/orders.sql

alter table public.payment_orders
  add column if not exists product_name text,
  add column if not exists quantity integer not null default 1,
  add column if not exists buyer_name text,
  add column if not exists buyer_email text,
  add column if not exists buyer_phone text,
  add column if not exists receipt_no text,
  add column if not exists fulfillment_status text not null default 'pending',
  add column if not exists fulfilled_at timestamptz,
  add column if not exists fail_code text,
  add column if not exists fail_message text,
  add column if not exists agreed_terms_at timestamptz,
  add column if not exists agreed_digital_at timestamptz,
  add column if not exists order_sheet jsonb not null default '{}'::jsonb;

alter table public.payment_orders drop constraint if exists payment_orders_fulfillment_check;
alter table public.payment_orders
  add constraint payment_orders_fulfillment_check
  check (fulfillment_status in ('pending', 'fulfilled', 'revoked'));

create unique index if not exists payment_orders_receipt_no_uidx
  on public.payment_orders (receipt_no)
  where receipt_no is not null;

create table if not exists public.buyer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.buyer_profiles enable row level security;

drop policy if exists "Users manage own buyer profile" on public.buyer_profiles;
create policy "Users manage own buyer profile"
  on public.buyer_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.payment_orders(order_id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_id_idx on public.order_events (order_id, created_at);

alter table public.order_events enable row level security;

drop policy if exists "Users read own order events" on public.order_events;
create policy "Users read own order events"
  on public.order_events for select
  using (
    exists (
      select 1 from public.payment_orders o
      where o.order_id = order_events.order_id
        and (o.user_id = auth.uid() or public.is_wish_admin())
    )
  );

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,
  order_id text not null references public.payment_orders(order_id) on delete cascade,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index if not exists user_entitlements_order_uidx on public.user_entitlements (order_id);

alter table public.user_entitlements enable row level security;

drop policy if exists "Users read own entitlements" on public.user_entitlements;
create policy "Users read own entitlements"
  on public.user_entitlements for select
  using (auth.uid() = user_id or public.is_wish_admin());

drop policy if exists "Admins read all payment orders" on public.payment_orders;
create policy "Admins read all payment orders"
  on public.payment_orders for select
  using (public.is_wish_admin());
