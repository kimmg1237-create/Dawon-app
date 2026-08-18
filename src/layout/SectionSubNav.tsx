import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FEATURES } from '../data/features'
import { scrollToDawonSection } from '../newsite/dawonOs/initDawonOs'
import './SectionSubNav.css'

type SubLink = {
  to: string
  label: string
  match?: (path: string, hash: string) => boolean
}

function linksFor(path: string): { label: string; items: SubLink[] } | null {
  if (path === '/today') {
    return {
      label: '1층 오늘설계',
      items: [
        { to: '/today#one', label: '오늘 하나', match: (_p, h) => !h || h === '#one' },
        { to: '/today#today', label: '3분 오늘설계', match: (_p, h) => h === '#today' },
        { to: '/today#precision', label: '정밀설계', match: (_p, h) => h === '#precision' },
      ],
    }
  }
  if (path === '/school') {
    return {
      label: '2층 365학교',
      items: [
        { to: '/school#challenge', label: '7일 실천', match: (_p, h) => !h || h === '#challenge' },
        { to: '/school#school', label: '365학교', match: (_p, h) => h === '#school' },
        { to: '/school#report', label: '성장리포트', match: (_p, h) => h === '#report' },
        { to: '/school#life', label: '생애맞춤', match: (_p, h) => h === '#life' },
      ],
    }
  }
  if (path === '/create' || path === '/movie-studio') {
    return {
      label: '3층 창작',
      items: [
        { to: '/create#works', label: '작품 안내', match: (p, h) => p === '/create' && (!h || h === '#works') },
        { to: '/create#studio', label: '창작스튜디오', match: (p, h) => p === '/create' && h === '#studio' },
        { to: '/library', label: '작품관 열기' },
      ],
    }
  }
  if (path === '/library' || path === '/ebooks' || path === '/audiobooks' || path === '/comics') {
    return {
      label: '작품관',
      items: [
        {
          to: '/library',
          label: '전자책',
          match: (p) => p === '/library' || p === '/ebooks',
        },
        { to: '/audiobooks', label: '오디오북', match: (p, h) => p === '/audiobooks' && h !== '#voice-studio' },
        { to: '/audiobooks#voice-studio', label: '성우 7명', match: (p, h) => p === '/audiobooks' && h === '#voice-studio' },
        { to: '/comics', label: '만화책', match: (p) => p === '/comics' },
        { to: '/create#studio', label: '창작스튜디오' },
      ],
    }
  }
  if (path === '/subscribe' || path === '/store' || path === '/terms' || path === '/refund' || path === '/privacy' || path.startsWith('/payment')) {
    const storeItems: SubLink[] = [
      {
        to: '/subscribe#plans',
        label: '이용권',
        match: (p: string, h: string) => (p === '/subscribe' || p === '/store') && h !== '#status',
      },
      { to: '/subscribe#status', label: '내 이용권', match: (_p: string, h: string) => h === '#status' },
      { to: '/terms', label: '이용약관', match: (p: string) => p === '/terms' },
      { to: '/refund', label: '환불정책', match: (p: string) => p === '/refund' },
    ]
    return {
      label: '스토어',
      items: storeItems.filter(
        (item) => FEATURES.paymentsEnabled || item.to === '/terms' || item.to === '/refund',
      ),
    }
  }
  return null
}

export function SectionSubNav() {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const group = linksFor(pathname)
  if (!group) return null

  return (
    <div className="section-subnav" aria-label={`${group.label} 바로가기`}>
      <div className="container section-subnav-inner">
        <span className="section-subnav-kicker">{group.label}</span>
        <nav className="section-subnav-links">
          {group.items.map((item) => {
            const active = item.match
              ? item.match(pathname, hash)
              : pathname === item.to.split('#')[0] && !item.to.includes('#')
            const hashIdx = item.to.indexOf('#')
            const itemPath = hashIdx === -1 ? item.to : item.to.slice(0, hashIdx)
            const itemHash = hashIdx === -1 ? '' : item.to.slice(hashIdx + 1)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => {
                  if (itemPath !== pathname || !itemHash) return
                  e.preventDefault()
                  navigate({ hash: `#${itemHash}` }, { replace: true, preventScrollReset: true })
                  scrollToDawonSection(itemHash, 'auto')
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
