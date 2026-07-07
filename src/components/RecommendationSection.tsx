import { useState } from 'react'
import type { Emotion } from '../types'
import { EMOTIONS } from '../data/emotions'
import { useDayRecordsContext } from '../context/DayRecordsContext'
import { useRecommendations } from '../hooks/useRecommendations'
import { useSubscription } from '../context/SubscriptionContext'
import './RecommendationSection.css'
import './PremiumGate.css'

const TYPE_LABELS = {
  book: { label: '추천 도서', icon: 'fa-solid fa-book-open' },
  video: { label: '추천 영상', icon: 'fa-brands fa-youtube' },
  song: { label: '추천 노래', icon: 'fa-solid fa-music' },
} as const

export function RecommendationSection() {
  const { todayRecord } = useDayRecordsContext()
  const [previewEmotion, setPreviewEmotion] = useState<Emotion | ''>('')

  const emotion = todayRecord?.emotion ?? (previewEmotion || null)
  const { data, loading } = useRecommendations(emotion)
  const { isPremium } = useSubscription()

  return (
    <section id="recommendations">
      <h2 className="section-title">오늘의 맞춤 추천</h2>
      <p className="section-subtitle">
        오늘의 기분과 기록을 바탕으로 책·영상·노래를 추천합니다.
      </p>

      {!todayRecord && (
        <div className="recommend-preview">
          <p className="recommend-hint">오늘 기록 전에 감정을 선택하면 추천을 미리 볼 수 있어요.</p>
          <div className="emotion-pool recommend-emotions">
            {EMOTIONS.map((emo) => (
              <button
                key={emo.value}
                type="button"
                className={`emotion-badge ${emo.className} ${previewEmotion === emo.value ? 'active' : ''}`}
                onClick={() => setPreviewEmotion(emo.value)}
              >
                {emo.value}
              </button>
            ))}
          </div>
        </div>
      )}

      {todayRecord && (
        <p className="recommend-based-on">
          <i className="fa-solid fa-heart" /> 오늘의 감정 <strong>{todayRecord.emotion}</strong> 기반 추천
        </p>
      )}

      {!emotion && (
        <div className="recommend-empty">
          <p>오늘 기록을 작성하거나 감정을 선택하면 추천이 표시됩니다.</p>
        </div>
      )}

      {emotion && loading && (
        <p className="recommend-loading">맞춤 콘텐츠를 불러오는 중...</p>
      )}

      {emotion && data && !loading && (
        <div className="recommend-grid">
          {(['book', 'video', 'song'] as const).map((type) => {
            const item = data[type]
            const meta = TYPE_LABELS[type]
            return (
              <article key={type} className="recommend-card">
                <span className="recommend-type">
                  <i className={meta.icon} /> {meta.label}
                </span>
                <h3 className="recommend-title">{item.title}</h3>
                <p className="recommend-desc">{item.description}</p>
                {type === 'book' && !isPremium ? (
                  <a href="#pricing" className="premium-locked-link">
                    <i className="fa-solid fa-lock" /> 전자책 보기 (구독 필요)
                  </a>
                ) : (
                  <a
                    href={item.url}
                    className="recommend-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {type === 'book' ? '전자책 보기' : type === 'video' ? '영상 보기' : '노래 듣기'}
                    <i className="fa-solid fa-arrow-up-right-from-square" />
                  </a>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
