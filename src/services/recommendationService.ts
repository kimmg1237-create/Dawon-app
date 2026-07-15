import type { ContentItem, Emotion, RecommendationSet } from '../types'
import { getDawonSongRecommendation } from '../data/dawonShorts'
import { getAnyPathBookRecommendation, getPathBookRecommendation } from '../data/pathRecommendations'
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

async function fetchVideoFromSupabase(emotion: Emotion): Promise<ContentItem | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('contents')
    .select('*')
    .eq('emotion', emotion)
    .eq('type', 'video')

  if (error || !data?.length) return null
  return rowToItem(data[0] as ContentRow)
}

export async function fetchRecommendations(emotion: Emotion): Promise<RecommendationSet> {
  const book =
    getPathBookRecommendation(emotion) ?? getAnyPathBookRecommendation(emotion)
  const song = getDawonSongRecommendation(emotion)
  const video =
    (await fetchVideoFromSupabase(emotion)) ?? getSeedRecommendations(emotion).video

  if (book) {
    return { emotion, book, video, song }
  }

  const seed = getSeedRecommendations(emotion)
  return {
    emotion,
    book: seed.book,
    video,
    song,
  }
}
