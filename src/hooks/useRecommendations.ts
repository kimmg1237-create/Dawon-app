import { useEffect, useState } from 'react'
import type { Emotion, RecommendationSet } from '../types'
import { fetchRecommendations } from '../services/recommendationService'

export function useRecommendations(emotion: Emotion | null) {
  const [data, setData] = useState<RecommendationSet | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!emotion) {
      setData(null)
      return
    }

    let cancelled = false
    setLoading(true)

    fetchRecommendations(emotion).then((result) => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [emotion])

  return { data, loading }
}
