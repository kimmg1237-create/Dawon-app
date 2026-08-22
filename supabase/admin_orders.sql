-- 판매관리(관리자) 메모·수정 권한

alter table public.payment_orders
  add column if not exists admin_note text not null default '';

drop policy if exists "Admins update payment orders" on public.payment_orders;
create policy "Admins update payment orders"
  on public.payment_orders for update
  using (public.is_wish_admin())
  with check (public.is_wish_admin());
