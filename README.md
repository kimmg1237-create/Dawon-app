# My Day Design (나의 하루설계)

DAWON 글로벌 — 매일 3분 자기기록 생활설계 웹앱

## 로컬 실행

```bash
npm install
cp .env.example .env   # Supabase 키 입력
npm run dev
```

## 환경 변수

| 변수 | 설명 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

## Supabase SQL (순서대로 실행)

1. `supabase/schema.sql` — 일일 기록
2. `supabase/contents.sql` — 추천 콘텐츠 (선택)
3. `supabase/subscriptions.sql` — 구독
4. `supabase/notification_settings.sql` — 알림 설정

## Vercel 배포

- Framework: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Vercel 대시보드 → Settings → Environment Variables 에 Supabase 변수 2개를 추가하세요.

## GitHub

https://github.com/kimmg1237-create/Dawon-app
