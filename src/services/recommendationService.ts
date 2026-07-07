import type { ContentItem, Emotion, RecommendationSet } from '../types'
import { getSeedRecommendations } from '../data/recommendationSeed'
import { getSupabase } from '../lib/supabase'

interface ContentRow {
  id: string
  type: string
  title: string
  description: string
  url: string
  emotion: string
}

function rowToItem(row: ContentRow): ContentItem {
  return {
    id: row.id,
    type: row.type as ContentItem['type'],
    title: row.title,
    description: row.description,
    url: row.url,
    emotion: row.emotion as Emotion,
  }
}

function buildSet(emotion: Emotion, items: ContentItem[]): RecommendationSet | null {
  const book = items.find((c) => c.type === 'book')
  const video = items.find((c) => c.type === 'video')
  const song = items.find((c) => c.type === 'song')
  if (!book || !video || !song) return null
  return { emotion, book, video, song }
}

export async function fetchRecommendations(emotion: Emotion): Promise<RecommendationSet> {
  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('emotion', emotion)

    if (!error && data && data.length >= 3) {
      const set = buildSet(emotion, (data as ContentRow[]).map(rowToItem))
      if (set) return set
    }
  }

  return getSeedRecommendations(emotion)
}
