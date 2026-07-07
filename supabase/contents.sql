-- My Day Design: 콘텐츠 추천 테이블 + 시드 데이터
-- Supabase SQL Editor에서 schema.sql 실행 후 이 파일도 실행하세요.

create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('book', 'video', 'song')),
  title text not null,
  description text not null default '',
  url text not null,
  emotion text not null check (emotion in ('기쁨', '평안', '감사', '걱정', '희망')),
  created_at timestamptz not null default now()
);

create index if not exists contents_emotion_type_idx on public.contents (emotion, type);

alter table public.contents enable row level security;

create policy "Anyone can read contents"
  on public.contents for select
  using (true);

-- 시드 데이터 (중복 실행 시 에러 나면 무시해도 됩니다)
insert into public.contents (type, title, description, url, emotion) values
  ('book', '기쁨의 기록', '오늘의 기쁨을 더 오래 기억하는 짧은 독서 노트', '#', '기쁨'),
  ('video', '작은 기쁨 찾기', '일상 속 작은 행복을 돌아보는 3분 영상', 'https://www.youtube.com/results?search_query=작은+기쁨+찾기', '기쁨'),
  ('song', '오늘도 좋은 날', '가볍고 밝은 리듬의 추천곡', 'https://www.youtube.com/results?search_query=오늘도+좋은+날', '기쁨'),

  ('book', '자신과의 소통', '마음을 정리하며 나와 대화하는 다원작가 대표 도서', '#', '평안'),
  ('video', '3분 호흡 명상', '긴장을 내려놓는 짧은 호흡 가이드', 'https://www.youtube.com/results?search_query=3분+호흡+명상', '평안'),
  ('song', '고요한 바람', '잔잔한 멜로디로 마음을 가라앉히는 곡', 'https://www.youtube.com/results?search_query=고요한+바람+명상음악', '평안'),

  ('book', '감사 일기의 힘', '감사 한 줄이 하루를 바꾸는 방법', '#', '감사'),
  ('video', '감사가 만든 하루', '감사의 시선으로 하루를 돌아보는 영상', 'https://www.youtube.com/results?search_query=감사+일기', '감사'),
  ('song', '고마운 마음', '감사의 마음을 노래하는 잔잔한 곡', 'https://www.youtube.com/results?search_query=감사+노래', '감사'),

  ('book', '힐링게임', '상처와 두려움을 지나 작은 실천으로 회복하는 지침서', '#', '걱정'),
  ('video', '걱정 내려놓기', '걱정을 적고 마음 이름을 불러보는 3분 가이드', 'https://www.youtube.com/results?search_query=걱정+내려놓기+명상', '걱정'),
  ('song', '작아도 괜찮아', '걱정은 적어보고 마음 이름 불러봐', 'https://www.youtube.com/results?search_query=작아도+괜찮아', '걱정'),

  ('book', '새출발 노트', '희망을 한 걸음씩 실천으로 옮기는 기록법', '#', '희망'),
  ('video', '내일을 위한 한 걸음', '희망을 키우는 짧은 동기 영상', 'https://www.youtube.com/results?search_query=희망+새출발+동기부여', '희망'),
  ('song', '다시 시작해', '새로운 시작을 응원하는 따뜻한 곡', 'https://www.youtube.com/results?search_query=다시+시작해+희망', '희망');
