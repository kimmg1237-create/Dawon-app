-- 관리자만 payment_orders 삭제 가능 (클라이언트 삭제 UI용)
-- Supabase SQL Editor에서 실행하세요.

drop policy if exists "Admins delete payment orders" on public.payment_orders;
create policy "Admins delete payment orders"
  on public.payment_orders for delete
  using (public.is_wish_admin());
