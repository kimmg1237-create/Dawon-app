-- 단행본 결제(자신과의 소통 · 힐링게임) 상품 코드 허용
-- 기존 DB에 한 번 실행하세요.

alter table public.payment_orders
  drop constraint if exists payment_orders_product_check;

alter table public.payment_orders
  add constraint payment_orders_product_check
  check (product in ('monthly', 'b2b', 'sotong', 'healing'));
