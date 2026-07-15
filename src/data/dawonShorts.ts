/** 다원작가 YouTube Shorts — @다원작가-y6i */
import type { ContentItem, Emotion } from '../types'

export const DAWON_AUTHOR_CHANNEL =
  'https://www.youtube.com/@%EB%8B%A4%EC%9B%90%EC%9E%91%EA%B0%80-y6i'

export interface DawonShort {
  id: string
  title: string
  url: string
}

/** 채널 Shorts 목록 (scripts/fetch-dawon-shorts.cjs 로 갱신) */
export const DAWON_SHORTS: DawonShort[] = [
  { id: '5cixzHxLVfg', title: '무엇을_지킬_것인가', url: 'https://www.youtube.com/shorts/5cixzHxLVfg' },
  { id: 'KqNIbdRr9Dg', title: '미션', url: 'https://www.youtube.com/shorts/KqNIbdRr9Dg' },
  { id: 'v04a8Fyzcgg', title: '종이배 항해', url: 'https://www.youtube.com/shorts/v04a8Fyzcgg' },
  { id: 'UL01zATilSI', title: '인생의 스승 4부', url: 'https://www.youtube.com/shorts/UL01zATilSI' },
  { id: 'lqeyaJ8Ammw', title: '인생의 스승 3부', url: 'https://www.youtube.com/shorts/lqeyaJ8Ammw' },
  { id: 'jyoxjZzY8uk', title: '인생의 스승2부', url: 'https://www.youtube.com/shorts/jyoxjZzY8uk' },
  { id: 'jshISjm68A8', title: '인생의 스승1부', url: 'https://www.youtube.com/shorts/jshISjm68A8' },
  { id: 'ROXt5K5Bq_s', title: '상처도 길을 찾습니다', url: 'https://www.youtube.com/shorts/ROXt5K5Bq_s' },
  { id: 'DelF80dpI58', title: '내가 말하게 해', url: 'https://www.youtube.com/shorts/DelF80dpI58' },
  { id: 'uCYg5QZ6cvg', title: '길이 다시 나타났다', url: 'https://www.youtube.com/shorts/uCYg5QZ6cvg' },
  { id: 'D95XzmADHnU', title: '길이 다시 나타났다', url: 'https://www.youtube.com/shorts/D95XzmADHnU' },
  { id: 'P0l-CG7jAsg', title: '오늘 내가 쓴 돈', url: 'https://www.youtube.com/shorts/P0l-CG7jAsg' },
  { id: '7eiZ5UcKJ1s', title: '먼저 들어보세요', url: 'https://www.youtube.com/shorts/7eiZ5UcKJ1s' },
  { id: 'WcddKZWCXdk', title: 'Red and Yellow Butterfly Habits', url: 'https://www.youtube.com/shorts/WcddKZWCXdk' },
  { id: 'omV_Q3m2knw', title: '조용히 쉴 수 있는 곳', url: 'https://www.youtube.com/shorts/omV_Q3m2knw' },
  { id: 'AotcTQ5aHRo', title: '오늘 잘 했어', url: 'https://www.youtube.com/shorts/AotcTQ5aHRo' },
  { id: '3h9vfG0hR6w', title: '내 이름을 부르며', url: 'https://www.youtube.com/shorts/3h9vfG0hR6w' },
  { id: 'hLpXxfomYSA', title: '다원작가 베스트 도서 목록', url: 'https://www.youtube.com/shorts/hLpXxfomYSA' },
  { id: 'Fucum54u86g', title: '생활을 보면 주식이 보인다', url: 'https://www.youtube.com/shorts/Fucum54u86g' },
  { id: 'ds3sl5fUjpI', title: '나는 내 삶의 설계자', url: 'https://www.youtube.com/shorts/ds3sl5fUjpI' },
  { id: 'AtyU6IrreYU', title: '하루 한 줄, 나를 위로하는 노래', url: 'https://www.youtube.com/shorts/AtyU6IrreYU' },
  { id: 'gHvZwjIJmZ0', title: 'Praise My Little Self', url: 'https://www.youtube.com/shorts/gHvZwjIJmZ0' },
  { id: 'PnJ04wCSgGc', title: 'Learning Through My Day', url: 'https://www.youtube.com/shorts/PnJ04wCSgGc' },
  { id: 'EkIGkq3OjHM', title: 'Check My Heart', url: 'https://www.youtube.com/shorts/EkIGkq3OjHM' },
  { id: '2RdxlXyARtw', title: '나는 내 생활의 설계자', url: 'https://www.youtube.com/shorts/2RdxlXyARtw' },
  { id: '_Gdq_CcUVsg', title: '그네가 왔다갔다', url: 'https://www.youtube.com/shorts/_Gdq_CcUVsg' },
  { id: 'zpBoUHfrHs0', title: '디자인 전략인지', url: 'https://www.youtube.com/shorts/zpBoUHfrHs0' },
  { id: '76YStkXpqzA', title: '방도 인지', url: 'https://www.youtube.com/shorts/76YStkXpqzA' },
  { id: 'Dw-VCdqF3fA', title: '생활습관 통합', url: 'https://www.youtube.com/shorts/Dw-VCdqF3fA' },
  { id: 'hjcmzsz-sPo', title: 'Root of My Mind', url: 'https://www.youtube.com/shorts/hjcmzsz-sPo' },
  { id: 'PGaQpLyhuPI', title: 'Know Yourself', url: 'https://www.youtube.com/shorts/PGaQpLyhuPI' },
  { id: '_a6o_KlGVh4', title: 'I check in with myself', url: 'https://www.youtube.com/shorts/_a6o_KlGVh4' },
  { id: 'RsWGDWARkXg', title: '생활에 적용하는 정보능력', url: 'https://www.youtube.com/shorts/RsWGDWARkXg' },
  { id: 'U___KcerM3Y', title: '거울치료', url: 'https://www.youtube.com/shorts/U___KcerM3Y' },
  { id: 'PQYsAZ9g6cs', title: '자신의 기질', url: 'https://www.youtube.com/shorts/PQYsAZ9g6cs' },
  { id: 'DRXozsEgi1Y', title: 'hug me', url: 'https://www.youtube.com/shorts/DRXozsEgi1Y' },
  { id: 'S_2yzzuD_bw', title: 'I love you', url: 'https://www.youtube.com/shorts/S_2yzzuD_bw' },
  { id: '95q7VIKMPrQ', title: '투정은 당신에게 의지한다는 말', url: 'https://www.youtube.com/shorts/95q7VIKMPrQ' },
  { id: 'BMgXNfPfZj8', title: '평안을 위한 사랑', url: 'https://www.youtube.com/shorts/BMgXNfPfZj8' },
  { id: 'vxuarhKvlLk', title: '자신과의 소통문명', url: 'https://www.youtube.com/shorts/vxuarhKvlLk' },
  { id: 'nJ9K19CH-hM', title: '가족', url: 'https://www.youtube.com/shorts/nJ9K19CH-hM' },
  { id: 'fN3V2oUyQjM', title: 'A Priest in Everyday Life', url: 'https://www.youtube.com/shorts/fN3V2oUyQjM' },
  { id: '4EaM2vubj4g', title: '행복한 강아지', url: 'https://www.youtube.com/shorts/4EaM2vubj4g' },
  { id: 'mJkeSWdqPAw', title: "Let's Live Together with Love", url: 'https://www.youtube.com/shorts/mJkeSWdqPAw' },
  { id: 'Prlh5Rvhwgc', title: 'Living Study', url: 'https://www.youtube.com/shorts/Prlh5Rvhwgc' },
  { id: 't6K0ljSkCzE', title: '배우고, 사용하고, 공유하세요', url: 'https://www.youtube.com/shorts/t6K0ljSkCzE' },
  { id: '_zD3SqY2PW8', title: '시선', url: 'https://www.youtube.com/shorts/_zD3SqY2PW8' },
  { id: 'faLJMtcoDbw', title: '자신과의 소통 활용기술', url: 'https://www.youtube.com/shorts/faLJMtcoDbw' },
]

const SHORTS_BY_ID = new Map(DAWON_SHORTS.map((s) => [s.id, s]))

/** 감정별 우선 추천 Shorts (채널 내 곡만 사용) */
const EMOTION_SHORT_IDS: Record<Emotion, string[]> = {
  기쁨: ['AotcTQ5aHRo', 'gHvZwjIJmZ0', '4EaM2vubj4g', 'WcddKZWCXdk', 'mJkeSWdqPAw', 'S_2yzzuD_bw', '_Gdq_CcUVsg'],
  평안: ['omV_Q3m2knw', 'PGaQpLyhuPI', '_a6o_KlGVh4', 'BMgXNfPfZj8', 'hjcmzsz-sPo', 'AtyU6IrreYU', '3h9vfG0hR6w'],
  감사: ['DRXozsEgi1Y', 'S_2yzzuD_bw', 'nJ9K19CH-hM', 'mJkeSWdqPAw', 'AtyU6IrreYU', 'fN3V2oUyQjM', 'DelF80dpI58'],
  걱정: ['ROXt5K5Bq_s', 'U___KcerM3Y', '95q7VIKMPrQ', 'EkIGkq3OjHM', 'DelF80dpI58', 'PQYsAZ9g6cs', '7eiZ5UcKJ1s'],
  희망: ['uCYg5QZ6cvg', 'D95XzmADHnU', 'ds3sl5fUjpI', '2RdxlXyARtw', 'PnJ04wCSgGc', 'Dw-VCdqF3fA', 'faLJMtcoDbw'],
}

const EMOTIONS: Emotion[] = ['기쁨', '평안', '감사', '걱정', '희망']

function pickDailyIndex(length: number, emotion: Emotion): number {
  const day = Math.floor(Date.now() / 86_400_000)
  return (day + EMOTIONS.indexOf(emotion)) % length
}

function shortToSong(short: DawonShort, emotion: Emotion): ContentItem {
  return {
    id: `dawon-short-${short.id}`,
    type: 'song',
    title: short.title,
    description: '다원작가 YouTube Shorts · 30초 음악 습관',
    url: short.url,
    emotion,
  }
}

export function getDawonSongRecommendation(emotion: Emotion): ContentItem {
  const preferredIds = EMOTION_SHORT_IDS[emotion]
  const pool = preferredIds
    .map((id) => SHORTS_BY_ID.get(id))
    .filter((s): s is DawonShort => Boolean(s))

  const candidates = pool.length > 0 ? pool : DAWON_SHORTS
  const picked = candidates[pickDailyIndex(candidates.length, emotion)] ?? DAWON_SHORTS[0]
  return shortToSong(picked, emotion)
}

/** 라이브러리·퀵링크용: 다원작가 Shorts 중 무작위 1곡 */
export function getRandomDawonShort(): DawonShort {
  const list = DAWON_SHORTS
  const index = Math.floor(Math.random() * list.length)
  return list[index] ?? list[0]
}
