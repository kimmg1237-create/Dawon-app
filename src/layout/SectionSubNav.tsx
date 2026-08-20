import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FEATURES } from '../data/features'
import { scrollToDawonSection } from '../newsite/dawonOs/initDawonOs'
import { dawonT, getDawonLang, type DawonLang } from '../newsite/dawonOs/i18n'
import './SectionSubNav.css'

type SubLink = {
  to: string
  labelKey: string
  match?: (path: string, hash: string) => boolean
}

function linksFor(path: string, lang: DawonLang): { label: string; items: SubLink[] } | null {
  const t = (key: string) => dawonT(key, lang)
  if (path === '/today') {
    return {
      label: t('floor1'),
      items: [
        { to: '/today#one', labelKey: 'navOne', match: (_p, h) => !h || h === '#one' },
        { to: '/today#lifeMissions', labelKey: 'navMissions', match: (_p, h) => h === '#lifeMissions' },
        { to: '/today#today', labelKey: 'navToday', match: (_p, h) => h === '#today' },
        { to: '/today#precision', labelKey: 'navPrecision', match: (_p, h) => h === '#precision' || h === '#ideaLab' },
      ],
    }
  }
  if (path === '/school') {
    return {
      label: t('floor2'),
      items: [
        { to: '/school#challenge', labelKey: 'navChallenge', match: (_p, h) => !h || h === '#challenge' || h === '#transfer' },
        { to: '/school#school', labelKey: 'navSchool', match: (_p, h) => h === '#school' || h === '#schoolProgram' },
        { to: '/school#report', labelKey: 'report', match: (_p, h) => h === '#report' },
        { to: '/school#life', labelKey: 'navLife', match: (_p, h) => h === '#life' || h === '#audienceBridge' },
      ],
    }
  }
  if (path === '/create' || path === '/movie-studio') {
    return {
      label: t('floor3'),
      items: [
        { to: '/create#works', labelKey: 'navWorks', match: (p, h) => p === '/create' && (!h || h === '#works') },
        { to: '/create#studio', labelKey: 'navStudio', match: (p, h) => p === '/create' && h === '#studio' },
        { to: '/library', labelKey: 'openLibrary' },
      ],
    }
  }
  if (path === '/library' || path === '/ebooks' || path === '/audiobooks' || path === '/comics') {
    return {
      label: t('library'),
      items: [
        {
          to: '/library',
          labelKey: 'ebook',
          match: (p) => p === '/library' || p === '/ebooks',
        },
        { to: '/audiobooks', labelKey: 'audiobook', match: (p) => p === '/audiobooks' },
        { to: '/comics', labelKey: 'comic', match: (p) => p === '/comics' },
        { to: '/create#studio', labelKey: 'navStudio' },
      ],
    }
  }
  if (path === '/subscribe' || path === '/store' || path === '/terms' || path === '/refund' || path === '/privacy' || path.startsWith('/payment')) {
    const storeItems: SubLink[] = [
      {
        to: '/subscribe#plans',
        labelKey: 'plans',
        match: (p: string, h: string) => (p === '/subscribe' || p === '/store') && h !== '#status',
      },
      { to: '/subscribe#status', labelKey: 'myPlan', match: (_p: string, h: string) => h === '#status' },
      { to: '/terms', labelKey: 'terms', match: (p: string) => p === '/terms' },
      { to: '/refund', labelKey: 'refund', match: (p: string) => p === '/refund' },
    ]
    return {
      label: t('store'),
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
  const [lang, setLang] = useState<DawonLang>(() => getDawonLang())

  useEffect(() => {
    const onLang = () => setLang(getDawonLang())
    window.addEventListener('dawon-lang-changed', onLang)
    return () => window.removeEventListener('dawon-lang-changed', onLang)
  }, [])

  const group = linksFor(pathname, lang)
  if (!group) return null

  return (
    <div className="section-subnav" aria-label={`${group.label}`}>
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
                {dawonT(item.labelKey, lang)}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
