import type { ContentItem, Emotion } from '../types'
import { getEbookUrl } from './ebookFiles'
import { PATH_CARDS } from './paths'

/** 감정별 50개의 길 도서 후보 (path id) */
const EMOTION_PATH_IDS: Record<Emotion, string[]> = {
  기쁨: ['01', '04', '09', '10', '12', '20', '42'],
  평안: ['11', '14', '20', '30', '00', '36', '13'],
  감사: ['07', '22', '23', '24', '02', '29', '47'],
  걱정: ['12', '16', '17', '37', '18', '08', '14'],
  희망: ['08', '18', '39', '41', '50', '32', '44', '00'],
}

const EMOTIONS: Emotion[] = ['기쁨', '평안', '감사', '걱정', '희망']

function pickDailyIndex(length: number, emotion: Emotion): number {
  const day = Math.floor(Date.now() / 86_400_000)
  return (day + EMOTIONS.indexOf(emotion)) % length
}

export function getPathBookRecommendation(emotion: Emotion): ContentItem | null {
  const ids = EMOTION_PATH_IDS[emotion]
  const start = pickDailyIndex(ids.length, emotion)

  for (let offset = 0; offset < ids.length; offset++) {
    const pathId = ids[(start + offset) % ids.length]
    const card = PATH_CARDS.find((c) => c.id === pathId)
    const url = getEbookUrl(pathId)
    if (!card || !url) continue

    return {
      id: `path-book-${pathId}`,
      type: 'book',
      title: card.title,
      description: `${card.pathNo} · ${card.description}`,
      url,
      emotion,
    }
  }

  return null
}

/** PDF가 있는 모든 길 중 하나 (최후 fallback) */
export function getAnyPathBookRecommendation(emotion: Emotion): ContentItem | null {
  const withPdf = PATH_CARDS.filter((c) => getEbookUrl(c.id))
  if (withPdf.length === 0) return null

  const card = withPdf[pickDailyIndex(withPdf.length, emotion)]
  const url = getEbookUrl(card.id)!
  return {
    id: `path-book-${card.id}`,
    type: 'book',
    title: card.title,
    description: `${card.pathNo} · ${card.description}`,
    url,
    emotion,
  }
}
