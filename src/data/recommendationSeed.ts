import type { ContentItem, Emotion } from '../types'

const seed: ContentItem[] = [
  { id: 's-joy-book', type: 'book', title: '기쁨의 기록', description: '오늘의 기쁨을 더 오래 기억하는 짧은 독서 노트', url: '#', emotion: '기쁨' },
  { id: 's-joy-video', type: 'video', title: '작은 기쁨 찾기', description: '일상 속 작은 행복을 돌아보는 3분 영상', url: 'https://www.youtube.com/results?search_query=작은+기쁨+찾기', emotion: '기쁨' },
  { id: 's-joy-song', type: 'song', title: '오늘도 좋은 날', description: '가볍고 밝은 리듬의 추천곡', url: 'https://www.youtube.com/results?search_query=오늘도+좋은+날', emotion: '기쁨' },

  { id: 's-peace-book', type: 'book', title: '자신과의 소통', description: '마음을 정리하며 나와 대화하는 다원작가 대표 도서', url: '#', emotion: '평안' },
  { id: 's-peace-video', type: 'video', title: '3분 호흡 명상', description: '긴장을 내려놓는 짧은 호흡 가이드', url: 'https://www.youtube.com/results?search_query=3분+호흡+명상', emotion: '평안' },
  { id: 's-peace-song', type: 'song', title: '고요한 바람', description: '잔잔한 멜로디로 마음을 가라앉히는 곡', url: 'https://www.youtube.com/results?search_query=고요한+바람+명상음악', emotion: '평안' },

  { id: 's-thanks-book', type: 'book', title: '감사 일기의 힘', description: '감사 한 줄이 하루를 바꾸는 방법', url: '#', emotion: '감사' },
  { id: 's-thanks-video', type: 'video', title: '감사가 만든 하루', description: '감사의 시선으로 하루를 돌아보는 영상', url: 'https://www.youtube.com/results?search_query=감사+일기', emotion: '감사' },
  { id: 's-thanks-song', type: 'song', title: '고마운 마음', description: '감사의 마음을 노래하는 잔잔한 곡', url: 'https://www.youtube.com/results?search_query=감사+노래', emotion: '감사' },

  { id: 's-worry-book', type: 'book', title: '힐링게임', description: '상처와 두려움을 지나 작은 실천으로 회복하는 지침서', url: '#', emotion: '걱정' },
  { id: 's-worry-video', type: 'video', title: '걱정 내려놓기', description: '걱정을 적고 마음 이름을 불러보는 3분 가이드', url: 'https://www.youtube.com/results?search_query=걱정+내려놓기+명상', emotion: '걱정' },
  { id: 's-worry-song', type: 'song', title: '작아도 괜찮아', description: '걱정은 적어보고 마음 이름 불러봐', url: 'https://www.youtube.com/results?search_query=작아도+괜찮아', emotion: '걱정' },

  { id: 's-hope-book', type: 'book', title: '새출발 노트', description: '희망을 한 걸음씩 실천으로 옮기는 기록법', url: '#', emotion: '희망' },
  { id: 's-hope-video', type: 'video', title: '내일을 위한 한 걸음', description: '희망을 키우는 짧은 동기 영상', url: 'https://www.youtube.com/results?search_query=희망+새출발+동기부여', emotion: '희망' },
  { id: 's-hope-song', type: 'song', title: '다시 시작해', description: '새로운 시작을 응원하는 따뜻한 곡', url: 'https://www.youtube.com/results?search_query=다시+시작해+희망', emotion: '희망' },
]

export function getSeedRecommendations(emotion: Emotion) {
  const items = seed.filter((c) => c.emotion === emotion)
  const book = items.find((c) => c.type === 'book')!
  const video = items.find((c) => c.type === 'video')!
  const song = items.find((c) => c.type === 'song')!
  return { emotion, book, video, song }
}

export const RECOMMENDATION_SEED = seed
