-- My Day Design: 알림 설정 테이블
-- Supabase SQL Editor에서 실행하세요.

create table if not exists public.notification_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  reminder_hour int not null default 21 check (reminder_hour >= 0 and reminder_hour <= 23),
  reminder_minute int not null default 0 check (reminder_minute >= 0 and reminder_minute <= 59),
  updated_at timestamptz not null default now()
);

alter table public.notification_settings enable row level security;

create policy "Users read own notification settings"
  on public.notification_settings for select
  using (auth.uid() = user_id);

create policy "Users upsert own notification settings"
  on public.notification_settings for insert
  with check (auth.uid() = user_id);

create policy "Users update own notification settings"
  on public.notification_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
