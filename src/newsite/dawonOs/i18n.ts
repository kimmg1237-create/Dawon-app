import dictJson from './i18nDict.json'
import { UI_STRINGS } from './uiStrings'
import { applyOsUiStrings } from './applyOsUi'
import { RUNTIME, oneSuggestionsFor } from './runtimeStrings'
import { EXTRA_UI } from './extraUiStrings'
import { SUBPAGE_STRINGS } from './subpageStrings'
import { applyExtraUi, applySubpageStrings } from './applyExtraUi'

export type DawonLang = 'ko' | 'en' | 'ja' | 'zh'

type DictPack = Record<string, unknown>

const DICT = dictJson as Record<DawonLang, DictPack>

const LANG_KEY = 'dawon_lang_v1'
const MISSION_KEYS = [
  'praise',
  'comfort',
  'thanks',
  'reflect',
  'meditate',
  'pray',
  'exercise',
  'clean',
  'cook',
  'laundry',
  'organize',
  'today',
  'tomorrow',
  'priority',
  'one',
  'add',
  'subtract',
  'direction',
  'method',
  'alternative',
  'idea',
  'communicate',
] as const

/** Extra chrome strings not in the marketing HTML dictionary. */
const SHELL: Record<DawonLang, Record<string, string>> = {
  ko: {
    floor1: '오늘설계',
    floor2: '365학교',
    floor3: '창작',
    programs: '대상별 프로그램',
    institution: '학교·기관 도입',
    report: '성장리포트',
    library: '작품관',
    store: '스토어',
    mypage: '마이페이지',
    login: '로그인',
    logout: '로그아웃',
    guest: '게스트',
    startOne: '오늘 한 가지',
    navOne: '오늘 하나',
    navMissions: '생활미션',
    navToday: '3분 오늘설계',
    navPrecision: '정밀설계',
    navChallenge: '7일 실천',
    navSchool: '365학교',
    navLife: '생애맞춤',
    navWorks: '작품 안내',
    navStudio: '창작스튜디오',
    missionSave: '미션 저장',
    missionToToday: '오늘설계에 넣기',
    missionToChallenge: '7일 실천으로',
    transferSave: '전이 저장',
    transferToToday: '오늘설계에 반영',
    transferToChallenge: '7일 실천 이름으로',
    transferExamples: '적용 예시',
    langLabel: '언어',
    ebook: '전자책',
    audiobook: '오디오북',
    comic: '만화책',
    openLibrary: '작품관 열기',
    plans: '이용권',
    myPlan: '내 이용권',
    terms: '이용약관',
    refund: '환불정책',
    brandHome: 'DAWON 다원 하루설계 홈',
    brandLogoAlt: '다원 공식 로고',
    mainNav: '주요 메뉴',
    accountOpen: '회원 계정과 클라우드 상태 열기',
    cloudStatus: '회원·클라우드 상태',
    brandNav: 'DAWON | 다원 하루설계',
    noticeTitle: '여기가 다원 하루설계 홈입니다',
    noticeCopy: '오늘 바꿀 딱 한 가지를 정하고, 3분 기록·7일 실천으로 성장을 확인하세요. 출판·작가 소개는 출판사 사이트에서 따로 볼 수 있습니다.',
    noticeStart: '오늘설계 시작하기',
    noticePublisher: '출판사 사이트 ↗',
    noticeHideGroup: '다시 보지 않기',
    noticeHideToday: '오늘 하루 안보기',
    noticeHide6h: '6시간 안보기',
  },
  en: {
    floor1: 'Today',
    floor2: '365 School',
    floor3: 'Create',
    programs: 'Programs',
    institution: 'Schools & Institutions',
    report: 'Growth Report',
    library: 'Library',
    store: 'Store',
    mypage: 'My page',
    login: 'Log in',
    logout: 'Log out',
    guest: 'Guest',
    startOne: "Today's One",
    navOne: 'One Thing',
    navMissions: 'Life Missions',
    navToday: '3-Min Design',
    navPrecision: 'Precision',
    navChallenge: '7-Day Practice',
    navSchool: '365 School',
    navLife: 'Life Stage',
    navWorks: 'Works',
    navStudio: 'Studio',
    missionSave: 'Save mission',
    missionToToday: 'Add to today',
    missionToChallenge: 'Send to 7-day',
    transferSave: 'Save transfer',
    transferToToday: 'Apply to today',
    transferToChallenge: 'Use as 7-day title',
    transferExamples: 'Examples',
    langLabel: 'Language',
    ebook: 'E-books',
    audiobook: 'Audiobooks',
    comic: 'Comics',
    openLibrary: 'Open library',
    plans: 'Plans',
    myPlan: 'My plan',
    terms: 'Terms',
    refund: 'Refunds',
    brandHome: 'DAWON home',
    brandLogoAlt: 'Dawon logo',
    mainNav: 'Main menu',
    accountOpen: 'Open account and cloud status',
    cloudStatus: 'Account and cloud status',
    brandNav: 'DAWON | Day Design',
    noticeTitle: 'This is the Dawon Day Design home',
    noticeCopy: 'Pick one thing to change today, then grow with a 3-minute log and 7-day practice. Publishing and author pages live on the publisher site.',
    noticeStart: 'Start today’s design',
    noticePublisher: 'Publisher site ↗',
    noticeHideGroup: 'Don’t show again',
    noticeHideToday: 'Hide for today',
    noticeHide6h: 'Hide for 6 hours',
  },
  ja: {
    floor1: '今日設計',
    floor2: '365学校',
    floor3: '創作',
    programs: '対象別プログラム',
    institution: '学校・機関',
    report: '成長レポート',
    library: '作品館',
    store: 'ストア',
    mypage: 'マイページ',
    login: 'ログイン',
    logout: 'ログアウト',
    guest: 'ゲスト',
    startOne: '今日の一つ',
    navOne: '今日の一つ',
    navMissions: '生活ミッション',
    navToday: '3分設計',
    navPrecision: '精密設計',
    navChallenge: '7日実践',
    navSchool: '365学校',
    navLife: '生涯カスタム',
    navWorks: '作品案内',
    navStudio: '創作スタジオ',
    missionSave: 'ミッション保存',
    missionToToday: '今日設計へ',
    missionToChallenge: '7日実践へ',
    transferSave: '転移を保存',
    transferToToday: '今日設計に反映',
    transferToChallenge: '7日タイトルへ',
    transferExamples: '適用例',
    langLabel: '言語',
    ebook: '電子書籍',
    audiobook: 'オーディオブック',
    comic: '漫画',
    openLibrary: '作品館を開く',
    plans: '利用券',
    myPlan: '自分の利用券',
    terms: '利用規約',
    refund: '返金ポリシー',
    brandHome: 'DAWON ホーム',
    brandLogoAlt: 'Dawonロゴ',
    mainNav: 'メインメニュー',
    accountOpen: '会員アカウントとクラウド状態を開く',
    cloudStatus: '会員・クラウド状態',
    brandNav: 'DAWON | 一日設計',
    noticeTitle: 'ここがDawon一日設計のホームです',
    noticeCopy: '今日変える一つを決め、3分記録と7日実践で成長を確認しましょう。出版・作家紹介は出版社サイトで別にご覧ください。',
    noticeStart: '今日設計を始める',
    noticePublisher: '出版社サイト ↗',
    noticeHideGroup: '再表示しない',
    noticeHideToday: '今日は表示しない',
    noticeHide6h: '6時間表示しない',
  },
  zh: {
    floor1: '今日设计',
    floor2: '365学校',
    floor3: '创作',
    programs: '对象项目',
    institution: '学校·机构',
    report: '成长报告',
    library: '作品馆',
    store: '商店',
    mypage: '我的页面',
    login: '登录',
    logout: '退出',
    guest: '访客',
    startOne: '今日一件',
    navOne: '今日一件',
    navMissions: '生活任务',
    navToday: '3分钟设计',
    navPrecision: '精密设计',
    navChallenge: '7日实践',
    navSchool: '365学校',
    navLife: '生涯定制',
    navWorks: '作品导览',
    navStudio: '创作工作室',
    missionSave: '保存任务',
    missionToToday: '放入今日设计',
    missionToChallenge: '转入7日实践',
    transferSave: '保存迁移',
    transferToToday: '反映到今日',
    transferToChallenge: '用作7日标题',
    transferExamples: '应用示例',
    langLabel: '语言',
    ebook: '电子书',
    audiobook: '有声书',
    comic: '漫画',
    openLibrary: '打开作品馆',
    plans: '会员',
    myPlan: '我的会员',
    terms: '使用条款',
    refund: '退款政策',
    brandHome: 'DAWON 首页',
    brandLogoAlt: 'Dawon标志',
    mainNav: '主导航',
    accountOpen: '打开会员账户与云状态',
    cloudStatus: '会员与云状态',
    brandNav: 'DAWON | 一日设计',
    noticeTitle: '这里是Dawon一日设计首页',
    noticeCopy: '选定今天要改变的一件事，用3分钟记录与7日实践确认成长。出版与作者介绍可在出版社网站查看。',
    noticeStart: '开始今日设计',
    noticePublisher: '出版社网站 ↗',
    noticeHideGroup: '不再显示',
    noticeHideToday: '今天不再显示',
    noticeHide6h: '6小时内不显示',
  },
}

function isLang(v: string | null | undefined): v is DawonLang {
  return v === 'ko' || v === 'en' || v === 'ja' || v === 'zh'
}

export function getDawonLang(): DawonLang {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (isLang(stored)) return stored
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'ko'
  if (nav.startsWith('ja')) return 'ja'
  if (nav.startsWith('zh')) return 'zh'
  if (nav.startsWith('en')) return 'en'
  return 'ko'
}

export function setDawonLang(lang: DawonLang) {
  if (!isLang(lang)) return
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang
  // Apply first so __dawonI18n.t is current before listeners (renderAccess / renderSubscription).
  applyDawonI18n(document)
  window.dispatchEvent(new CustomEvent('dawon-lang-changed', { detail: { lang } }))
}

function pack(lang: DawonLang): DictPack {
  return DICT[lang] || DICT.ko
}

export function dawonT(key: string, lang = getDawonLang()): string {
  if (UI_STRINGS[lang]?.[key]) return UI_STRINGS[lang][key]
  if (UI_STRINGS.ko[key]) return UI_STRINGS[lang]?.[key] || UI_STRINGS.ko[key]
  if (RUNTIME[lang]?.[key]) return RUNTIME[lang][key]
  if (RUNTIME.ko[key]) return RUNTIME[lang]?.[key] || RUNTIME.ko[key]
  if (EXTRA_UI[lang]?.[key]) return EXTRA_UI[lang][key]
  if (EXTRA_UI.ko[key]) return EXTRA_UI[lang]?.[key] || EXTRA_UI.ko[key]
  if (SUBPAGE_STRINGS[lang]?.[key]) return SUBPAGE_STRINGS[lang][key]
  if (SUBPAGE_STRINGS.ko[key]) return SUBPAGE_STRINGS[lang]?.[key] || SUBPAGE_STRINGS.ko[key]
  if (SHELL[lang]?.[key]) return SHELL[lang][key]
  if (SHELL.ko[key]) return SHELL[lang]?.[key] || SHELL.ko[key]
  const p = pack(lang)
  const v = p[key]
  if (typeof v === 'string') return v
  const fallback = pack('ko')[key]
  return typeof fallback === 'string' ? fallback : key
}

export function dawonMissionLabels(lang = getDawonLang()): Record<string, string> {
  const groups = (pack(lang).groups || pack('ko').groups) as [string, string[]][]
  const labels: Record<string, string> = {}
  let i = 0
  groups.forEach(([, items]) => {
    items.forEach((label) => {
      const key = MISSION_KEYS[i++]
      if (key) labels[key] = label
    })
  })
  return labels
}

export function dawonMissionQuestions(lang = getDawonLang()): string[] {
  const qs = pack(lang).missionQs as string[] | undefined
  return qs || (pack('ko').missionQs as string[])
}

function setText(root: ParentNode, sel: string, value: string | undefined) {
  if (!value) return
  const el = root.querySelector(sel)
  if (el) el.textContent = value
}

function applyDataAttrs(root: ParentNode, lang: DawonLang) {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n
    if (!key) return
    const text = dawonT(key, lang)
    if (text && text !== key) el.textContent = text
  })
  root.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    const key = el.dataset.i18nHtml
    if (!key) return
    const text = dawonT(key, lang)
    if (text && text !== key) el.innerHTML = text
  })
  root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder
    if (!key) return
    const text = dawonT(key, lang)
    if (text && text !== key) el.placeholder = text
  })
}

function applyPublisher(root: ParentNode, lang: DawonLang) {
  const p = pack(lang)
  setText(root, '#publisher [data-i18n="pubTitle"]', p.pubTitle as string)
  setText(root, '#publisher [data-i18n="pubDesc"]', p.pubDesc as string)
  setText(root, '#publisher [data-i18n="pubCta"]', p.pubCta as string)
  setText(root, '#publisher [data-i18n="pubFlow"]', p.pubFlow as string)
  const cards = p.pubCards as [string, string][] | undefined
  root.querySelectorAll('#publisher .publisher-grid article').forEach((art, i) => {
    if (!cards?.[i]) return
    const h = art.querySelector('h3')
    const para = art.querySelector('p')
    if (h) h.textContent = cards[i][0]
    if (para) para.textContent = cards[i][1]
  })
}

function applyOnePrinciple(root: ParentNode, lang: DawonLang) {
  const p = pack(lang)
  setText(root, '#onePrinciple [data-i18n="oneMain"]', p.oneMain as string)
  setText(root, '#onePrinciple [data-i18n="oneText"]', p.oneText as string)
  setText(root, '#onePrinciple [data-i18n="oneQuote"]', p.oneQuote as string)
  const steps = p.step as [string, string][] | undefined
  root.querySelectorAll('#onePrinciple .one-principle-step').forEach((el, i) => {
    if (!steps?.[i]) return
    const b = el.querySelector('b')
    const span = el.querySelector('span')
    if (b) b.textContent = steps[i][0]
    if (span) span.textContent = steps[i][1]
  })
}

function applyMissions(root: ParentNode, lang: DawonLang) {
  const p = pack(lang)
  setText(root, '#lifeMissions [data-i18n="missionTitle"]', p.missionTitle as string)
  setText(root, '#lifeMissions [data-i18n="missionText"]', p.missionText as string)
  const groups = p.groups as [string, string[]][] | undefined
  const groupEls = root.querySelectorAll('#lifeMissions .mission-group')
  groupEls.forEach((group, gi) => {
    if (!groups?.[gi]) return
    const h = group.querySelector('h3')
    if (h) h.textContent = groups[gi][0]
    const chips = group.querySelectorAll<HTMLElement>('[data-mission]')
    chips.forEach((chip, ci) => {
      const label = groups[gi][1][ci]
      if (label) chip.textContent = label
    })
  })
  const qs = dawonMissionQuestions(lang)
  qs.forEach((q, i) => {
    const label = root.querySelector(`label[for="missionQ${i}"]`)
    if (label) {
      const b = label.querySelector('b')
      if (b) b.textContent = `${i + 1}.`
      // keep number + question
      label.innerHTML = `<b>${i + 1}.</b> ${q}`
    }
  })
  setText(root, '#missionSave', dawonT('missionSave', lang))
  setText(root, '#missionToToday', dawonT('missionToToday', lang))
  setText(root, '#missionToChallenge', dawonT('missionToChallenge', lang))
  setText(root, '#missionModalLead', lang === 'ko'
    ? '5가지 질문으로 오늘 하나를 확인하고, 오늘설계·7일 실천으로 이어갑니다.'
    : lang === 'en'
      ? 'Answer five questions, then continue into today’s design or a 7-day practice.'
      : lang === 'ja'
        ? '5つの質問で今日の一つを確認し、今日設計・7日実践につなげます。'
        : '用五个问题确认今天的一件事，并连接到今日设计或7日实践。')
}

function applyTransfer(root: ParentNode, lang: DawonLang) {
  const p = pack(lang)
  setText(root, '#transfer [data-i18n="transferTitle"]', p.transferTitle as string)
  setText(root, '#transfer [data-i18n="transferText"]', p.transferText as string)
  setText(root, '#transferSave', dawonT('transferSave', lang))
  setText(root, '#transferToToday', dawonT('transferToToday', lang))
  setText(root, '#transferToChallenge', dawonT('transferToChallenge', lang))
  setText(root, '#transfer .transfer-examples .kicker', dawonT('transferExamples', lang))
  const rows = p.transferRows as [string, string][] | undefined
  root.querySelectorAll('#transfer .transfer-row').forEach((row, i) => {
    if (!rows?.[i]) return
    const b = row.querySelector('b')
    const span = row.querySelector('span')
    if (b) b.textContent = rows[i][0]
    if (span) span.textContent = rows[i][1]
  })
  const from = root.querySelector<HTMLInputElement>('#transferFrom')
  const to = root.querySelector<HTMLInputElement>('#transferTo')
  // Placeholders come from applyOsUi; sample input values refresh via Dawon.renderAll / applyTransferSampleDefaults
  void from
  void to
  try {
    window.Dawon?.applyTransferSampleDefaults?.(false)
  } catch {
    /* core may not be ready */
  }
}

function applyIdeaLab(root: ParentNode, lang: DawonLang) {
  const p = pack(lang)
  setText(root, '#ideaLab [data-i18n="ideaTitle"]', p.ideaTitle as string)
  setText(root, '#ideaLab [data-i18n="ideaText"]', p.ideaText as string)
  const cards = p.ideaCards as [string, string, string][] | undefined
  root.querySelectorAll('#ideaLab .idea-lab-card').forEach((card, i) => {
    if (!cards?.[i]) return
    const k = card.querySelector('.kicker')
    const strong = card.querySelector('strong')
    const para = card.querySelector('p')
    if (k) k.textContent = cards[i][0]
    if (strong) strong.textContent = cards[i][1]
    if (para) para.textContent = cards[i][2]
  })
}

function applySchoolProgram(root: ParentNode, lang: DawonLang) {
  const p = pack(lang)
  setText(root, '#schoolProgram [data-i18n="publicTitle"]', p.publicTitle as string)
  setText(root, '#schoolProgram [data-i18n="publicText"]', p.publicText as string)
  setText(root, '#schoolProgram [data-i18n="privacyTitle"]', p.privacyTitle as string)
  setText(root, '#schoolProgram [data-i18n="privacyText"]', p.privacyText as string)
  setText(root, '#schoolProgram [data-i18n="global"]', p.global as string)
  const program = p.program as [string, string, string][] | undefined
  root.querySelectorAll('#schoolProgram .school-program-table tbody tr').forEach((tr, i) => {
    if (!program?.[i]) return
    const cells = tr.querySelectorAll('td')
    if (cells[0]) cells[0].innerHTML = `<b>${program[i][0]}</b>`
    if (cells[1]) cells[1].textContent = program[i][1]
    if (cells[2]) cells[2].textContent = program[i][2]
  })
}

function applyAudience(root: ParentNode, lang: DawonLang) {
  const p = pack(lang)
  setText(root, '#life [data-i18n="audTitle"]', p.audTitle as string)
  setText(root, '#life [data-i18n="audText"]', p.audText as string)
  const aud = p.aud as [string, string][] | undefined
  root.querySelectorAll('#audienceBridge .audience-chip').forEach((chip, i) => {
    if (!aud?.[i]) return
    const b = chip.querySelector('b')
    const span = chip.querySelector('span')
    if (b) b.textContent = aud[i][0]
    if (span) span.textContent = aud[i][1]
  })
}

function applyLibraryBridge(root: ParentNode, lang: DawonLang) {
  const p = pack(lang)
  setText(root, '#works [data-i18n="libraryTitle"]', p.libraryTitle as string)
  setText(root, '#works [data-i18n="libraryText"]', p.libraryText as string)
  const cards = p.libraryCards as [string, string][] | undefined
  root.querySelectorAll('#libraryBridge .library-bridge-card').forEach((card, i) => {
    if (!cards?.[i]) return
    const h = card.querySelector('h3')
    const para = card.querySelector('p')
    if (h) h.textContent = cards[i][0]
    if (para) para.textContent = cards[i][1]
  })
}

function applyGuide(root: ParentNode, lang: DawonLang) {
  const p = pack(lang)
  setText(root, '#guide3min [data-i18n="guideTitle"]', p.guideTitle as string)
  const lines = p.guideLines as [string, string][] | undefined
  root.querySelectorAll('#guide3min .guide-3min-grid article').forEach((art, i) => {
    if (!lines?.[i]) return
    const b = art.querySelector('b')
    const para = art.querySelector('p')
    if (b) b.textContent = lines[i][0]
    if (para) para.textContent = lines[i][1]
  })
}

function applyShellNav(root: ParentNode, lang: DawonLang) {
  const map: [string, string][] = [
    ['a[href="/today"]', 'floor1'],
    ['a[href="/school"]', 'floor2'],
    ['a[href="/create"]', 'floor3'],
    ['a[href="/programs"]', 'programs'],
    ['a[href="/institution"]', 'institution'],
    ['a[href="/report"]', 'report'],
    ['a[href="/subscribe"]', 'store'],
  ]
  // Only rewrite top-level nav links that match exactly one key text slot
  root.querySelectorAll('.nav-links > a[href="/today"]').forEach((el) => {
    el.textContent = dawonT('floor1', lang)
  })
  root.querySelectorAll('.nav-links > a[href="/school"]').forEach((el) => {
    el.textContent = dawonT('floor2', lang)
  })
  root.querySelectorAll('.nav-links > a[href="/create"]').forEach((el) => {
    el.textContent = dawonT('floor3', lang)
  })
  root.querySelectorAll('.nav-links a[href="/subscribe"]').forEach((el) => {
    el.textContent = dawonT('store', lang)
  })
  root.querySelectorAll('.nav-links a[href="/mypage"]').forEach((el) => {
    el.textContent = dawonT('mypage', lang)
  })
  root.querySelectorAll('a[href="/admin"]').forEach((el) => {
    el.textContent = dawonT('admin', lang)
  })
  root.querySelectorAll('.nav-dropdown-menu a[href="/programs"]').forEach((el) => {
    el.textContent = dawonT('programs', lang)
  })
  root.querySelectorAll('.nav-dropdown-menu a[href="/institution"]').forEach((el) => {
    el.textContent = dawonT('institution', lang)
  })
  root.querySelectorAll('.nav-dropdown-menu a[href="/report"]').forEach((el) => {
    el.textContent = dawonT('report', lang)
  })
  root.querySelectorAll('.nav-dropdown-trigger').forEach((el) => {
    const arrow = el.querySelector('.dropdown-arrow')
    el.textContent = dawonT('programs', lang) + ' '
    if (arrow) el.appendChild(arrow)
    else {
      const span = document.createElement('span')
      span.className = 'dropdown-arrow'
      span.textContent = '▾'
      el.appendChild(span)
    }
  })
  root.querySelectorAll('.nav-actions > a.btn-primary[href="/today"]').forEach((el) => {
    el.textContent = dawonT('startOne', lang)
  })
  const accountBtn = root.querySelector('#accountBtn')
  if (accountBtn && !accountBtn.textContent?.includes('@')) {
    const logged = accountBtn.textContent === '로그아웃' || accountBtn.textContent === dawonT('logout', 'ko') || accountBtn.textContent === 'Log out' || accountBtn.textContent === 'ログアウト' || accountBtn.textContent === '退出'
    // leave syncDawonOsAccount to set login/logout; only set if looks like login
    if (/로그인|Log in|ログイン|登录/.test(accountBtn.textContent || '')) {
      accountBtn.textContent = dawonT('login', lang)
    } else if (logged) {
      accountBtn.textContent = dawonT('logout', lang)
    }
  }
  void map
}

function syncLangSelects(root: ParentNode, lang: DawonLang) {
  root.querySelectorAll<HTMLSelectElement>('select.dawon-lang, #dawonLang').forEach((sel) => {
    if (sel.value !== lang) sel.value = lang
  })
}

/** DOM hosts that are safe to rewrite with innerHTML / textContent. */
function i18nMutationTargets(root: ParentNode): ParentNode[] {
  // Explicit host (programs/institution/report HTML mounts, or OS root passed from install).
  if (!(root instanceof Document) && root !== document) return [root]

  // Document-wide apply must not touch React trees (AppNav, SubscribePage, Library, …).
  // Those pages re-render from dawon-lang-changed + dawonT themselves.
  const osRoots = [...document.querySelectorAll('.dawon-os-root')]
  return osRoots.length ? osRoots : []
}

export function applyDawonI18n(root: ParentNode = document) {
  const lang = getDawonLang()
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang

  const labels = dawonMissionLabels(lang)
  const qs = dawonMissionQuestions(lang)
  window.__dawonI18n = {
    lang,
    t: (key: string, fallback?: string) => {
      const v = dawonT(key, lang)
      return v === key && fallback ? fallback : v
    },
    missionLabels: labels,
    missionQuestions: qs,
    oneSuggestions: oneSuggestionsFor(lang),
    saveLabel: dawonT('missionSave', lang),
    savedMessage: String(pack(lang).saved || pack('ko').saved || ''),
  }

  // Dynamic renders first (use __dawonI18n.t), then static UI rewrite so chrome stays translated.
  try {
    window.Dawon?.renderAll?.()
  } catch {
    /* core may not be ready yet */
  }

  for (const target of i18nMutationTargets(root)) {
    applyDataAttrs(target, lang)
    applyPublisher(target, lang)
    applyOnePrinciple(target, lang)
    applyMissions(target, lang)
    applyTransfer(target, lang)
    applyIdeaLab(target, lang)
    applySchoolProgram(target, lang)
    applyAudience(target, lang)
    applyLibraryBridge(target, lang)
    applyGuide(target, lang)
    applyShellNav(target, lang)
    applyOsUiStrings(target, lang)
    applyExtraUi(target, lang)
    applySubpageStrings(target, lang)
  }

  // Lang selects live in React AppNav too — sync values only, never rewrite their trees.
  syncLangSelects(document, lang)

  // Refresh dynamic access/subscription chrome after __dawonI18n is ready.
  try {
    window.dispatchEvent(new CustomEvent('dawon-subscription-changed', { detail: window.DAWON_ACCESS_STATE }))
  } catch {
    /* ignore */
  }

  const areaEl = document.getElementById('oneArea') as HTMLSelectElement | null
  const area = areaEl?.value || '마음'
  const list = window.__dawonI18n?.oneSuggestions?.[area]
  const sug = document.getElementById('oneSuggestion')
  if (sug && list?.[0]) sug.textContent = list[0]
}

export function bindDawonLangSelect(root: ParentNode, signal?: AbortSignal) {
  const opts = signal ? { signal } : undefined
  root.querySelectorAll<HTMLSelectElement>('select.dawon-lang, #dawonLang').forEach((sel) => {
    sel.value = getDawonLang()
    sel.addEventListener(
      'change',
      () => {
        const next = sel.value
        if (isLang(next)) setDawonLang(next)
      },
      opts,
    )
  })
}

export function installDawonI18n(root: ParentNode = document, signal?: AbortSignal) {
  applyDawonI18n(root)
  bindDawonLangSelect(root, signal)
  const onLang = () => applyDawonI18n(root)
  window.addEventListener('dawon-lang-changed', onLang, signal ? { signal } : undefined)
}

declare global {
  interface Window {
    __dawonI18n?: {
      lang: DawonLang
      t: (key: string, fallback?: string) => string
      missionLabels: Record<string, string>
      missionQuestions: string[]
      oneSuggestions: Record<string, string[]>
      saveLabel: string
      savedMessage: string
    }
    Dawon?: {
      renderAll?: () => void
      applyTransferSampleDefaults?: (force?: boolean) => void
      localeTag?: () => string
      bindPage?: () => void
      bindFeatures?: (() => void) | null
      [key: string]: unknown
    }
    DAWON_ACCESS_STATE?: {
      authenticated?: boolean
      active?: boolean
      planName?: string
      endsAt?: string | null
    }
  }
}
