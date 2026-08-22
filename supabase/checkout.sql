-- 전자책/종이책 구분 + 배송지 (주문서·마이페이지)

alter table public.payment_orders
  add column if not exists book_format text not null default 'none',
  add column if not exists ship_zip text,
  add column if not exists ship_address1 text,
  add column if not exists ship_address2 text,
  add column if not exists ship_receiver text;

alter table public.payment_orders drop constraint if exists payment_orders_book_format_check;
alter table public.payment_orders
  add constraint payment_orders_book_format_check
  check (book_format in ('none', 'ebook', 'paper'));

alter table public.buyer_profiles
  add column if not exists zip text not null default '',
  add column if not exists address1 text not null default '',
  add column if not exists address2 text not null default '',
  add column if not exists receiver_name text not null default '';
