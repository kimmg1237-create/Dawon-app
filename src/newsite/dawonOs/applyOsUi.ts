import { UI_STRINGS, type UiLang } from './uiStrings'
import { RUNTIME } from './runtimeStrings'

function u(lang: UiLang, key: string): string {
  return UI_STRINGS[lang]?.[key] || RUNTIME[lang]?.[key] || UI_STRINGS.ko[key] || RUNTIME.ko[key] || key
}

function text(root: ParentNode, sel: string, key: string, lang: UiLang) {
  const v = u(lang, key)
  root.querySelectorAll(sel).forEach((el) => {
    el.textContent = v
  })
}

function html(root: ParentNode, sel: string, value: string) {
  root.querySelectorAll(sel).forEach((el) => {
    el.innerHTML = value
  })
}

function ph(root: ParentNode, sel: string, key: string, lang: UiLang) {
  const v = u(lang, key)
  root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(sel).forEach((el) => {
    el.placeholder = v
  })
}

function labelFor(root: ParentNode, id: string, key: string, lang: UiLang) {
  const v = u(lang, key)
  root.querySelectorAll(`label[for="${id}"]`).forEach((el) => {
    el.textContent = v
  })
}

/** Apply full OS UI dictionary to visible chrome and floor forms. */
export function applyOsUiStrings(root: ParentNode, lang: UiLang) {
  // Hero
  if (lang === 'ko') {
    html(root, '.hero h1', '내 삶은 <span>내가 설계합니다.</span>')
  } else {
    text(root, '.hero h1', 'heroTitle', lang)
  }
  text(root, '.hero-subline', 'heroSub', lang)
  text(root, '.hero-tech', 'heroTech', lang)
  text(root, '.hero-actions a.btn-primary', 'heroStart', lang)
  text(root, '.hero-actions a.btn-soft[href="/today#today"]', 'heroToday', lang)
  text(root, '#heroGuide', 'heroGuide', lang)
  const trusts = root.querySelectorAll('.trust-row > span')
  ;['trustGuest', 'trustSync', 'trustAi', 'trustPay'].forEach((k, i) => {
    if (trusts[i]) trusts[i].textContent = u(lang, k)
  })
  // heroDate is set by scripts.raw.js renderAll / initHeader with locale-aware formatting
  text(root, '.os-message > small', 'heroOneLine', lang)
  text(root, '.os-message > strong', 'heroQuote', lang)
  const metrics = root.querySelectorAll('.os-metric > span')
  ;['metricPractice', 'metricDays', 'metricRestart'].forEach((k, i) => {
    if (metrics[i]) metrics[i].textContent = u(lang, k)
  })
  const servers = root.querySelectorAll('.server-card')
  const serverKeys: [string, string][] = [
    ['serverOneTitle', 'serverOneDesc'],
    ['server3mTitle', 'server3mDesc'],
    ['server7Title', 'server7Desc'],
    ['server30Title', 'server30Desc'],
  ]
  servers.forEach((card, i) => {
    const keys = serverKeys[i]
    if (!keys) return
    const b = card.querySelector('b')
    const span = card.querySelector('span')
    if (b) b.textContent = u(lang, keys[0])
    if (span) span.textContent = u(lang, keys[1])
  })

  // Layers
  text(root, '#layers .layer-intro h2', 'layersTitle', lang)
  text(root, '#layers .layer-intro > p:not(.sr-only)', 'layersDesc', lang)
  const layerCards = root.querySelectorAll('#layers .layer-card')
  if (layerCards[0]) {
    text(layerCards[0], '.layer-no', 'layer1No', lang)
    text(layerCards[0], 'p', 'layer1Desc', lang)
    text(layerCards[0], '.layer-flow', 'layer1Flow', lang)
    text(layerCards[0], 'a.btn', 'layer1Cta', lang)
  }
  if (layerCards[1]) {
    text(layerCards[1], '.layer-no', 'layer2No', lang)
    text(layerCards[1], 'h3', 'layer2Title', lang)
    text(layerCards[1], 'p', 'layer2Desc', lang)
    text(layerCards[1], '.layer-flow', 'layer2Flow', lang)
    text(layerCards[1], 'a.btn', 'layer2Cta', lang)
  }
  if (layerCards[2]) {
    text(layerCards[2], '.layer-no', 'layer3No', lang)
    text(layerCards[2], 'p', 'layer3Desc', lang)
    text(layerCards[2], '.layer-flow', 'layer3Flow', lang)
    const acts = layerCards[2].querySelectorAll('a.btn')
    if (acts[0]) acts[0].textContent = u(lang, 'layer3Library')
    if (acts[1]) acts[1].textContent = u(lang, 'layer3Video')
  }

  // One
  text(root, '#firstFlowOneIntro strong', 'firstOneTitle', lang)
  text(root, '#firstFlowOneIntro .first-flow-head p', 'firstOneDesc', lang)
  text(root, '#firstFlowOneIntro .first-flow-lock-note', 'firstLockNote', lang)
  text(root, '#firstFlowTodayIntro strong', 'firstTodayTitle', lang)
  text(root, '#firstFlowTodayIntro .first-flow-head p', 'firstTodayDesc', lang)
  root.querySelectorAll('#firstFlowOneIntro .first-flow-step, #firstFlowTodayIntro .first-flow-step').forEach((step, i) => {
    const keys = ['stepOne', 'stepToday', 'stepDone']
    const key = keys[i % 3]
    const icon = step.querySelector('i')
    const iconHtml = icon ? icon.outerHTML : ''
    step.innerHTML = `${iconHtml}${u(lang, key)}`
  })
  html(root, '#one .one-main h2', lang === 'ko' ? '오늘 나는 무엇을<br>하나 바꿀까?' : u(lang, 'oneTitle'))
  text(root, '#one .one-main > p', 'oneDesc', lang)
  text(root, '#one .one-suggestion > b', 'oneRecommendLabel', lang)
  text(root, '#oneRecommend', 'oneBtnOther', lang)
  text(root, '#oneToToday', 'oneBtnToToday', lang)
  text(root, '#oneToChallenge', 'oneBtnToChallenge', lang)
  text(root, '#oneDone', 'oneBtnDone', lang)
  text(root, '#oneRestart', 'oneBtnRestart', lang)
  text(root, '#one .one-side h3', 'oneSideTitle', lang)
  text(root, '#one .one-side > p', 'oneSideDesc', lang)
  const oneStats = root.querySelectorAll('#one .today-state span')
  if (oneStats[0]) oneStats[0].textContent = u(lang, 'oneDone30')
  if (oneStats[1]) oneStats[1].textContent = u(lang, 'oneRestartCount')
  ph(root, '#oneCustom', 'phOneCustom', lang)
  const oneArea = root.querySelector<HTMLSelectElement>('#oneArea')
  if (oneArea) {
    const areaKeys = ['oneAreaMind', 'oneAreaHealth', 'oneAreaSpace', 'oneAreaRelation', 'oneAreaLearn', 'oneAreaCreate', 'oneAreaMoney']
    ;[...oneArea.options].forEach((opt, i) => {
      if (areaKeys[i]) opt.textContent = u(lang, areaKeys[i])
    })
  }

  // Today
  // today section head
  const todayHead = root.querySelector('#today .section-head h2')
  if (todayHead) todayHead.textContent = u(lang, 'todayTitle')
  const todayDesc = root.querySelector('#today .section-head p')
  if (todayDesc) todayDesc.textContent = u(lang, 'todayDesc')
  const modeCards = root.querySelectorAll('#today .mode-card')
  if (modeCards[0]) {
    text(modeCards[0], 'b', 'modeQuickBadge', lang)
    text(modeCards[0], 'strong', 'modeQuickTitle', lang)
    text(modeCards[0], 'small', 'modeQuickDesc', lang)
  }
  if (modeCards[1]) {
    text(modeCards[1], 'b', 'modeDeepBadge', lang)
    text(modeCards[1], 'strong', 'modeDeepTitle', lang)
    text(modeCards[1], 'small', 'modeDeepDesc', lang)
  }
  labelFor(root, 'done', 'labelDone', lang)
  labelFor(root, 'action', 'labelAction', lang)
  labelFor(root, 'tomorrow', 'labelTomorrow', lang)
  labelFor(root, 'selfWord', 'labelSelfWord', lang)
  labelFor(root, 'area', 'labelArea', lang)
  labelFor(root, 'energy', 'labelEnergy', lang)
  labelFor(root, 'result', 'labelResult', lang)
  labelFor(root, 'learn', 'labelLearn', lang)
  labelFor(root, 'memo', 'labelMemo', lang)
  const moodField = root.querySelector('#moods')?.closest('.field')
  const moodLab = moodField?.querySelector('label')
  if (moodLab) moodLab.textContent = u(lang, 'labelMood')
  const moods = root.querySelectorAll('#moods .mood')
  ;['moodJoy', 'moodThanks', 'moodCalm', 'moodTired', 'moodAnxiety', 'moodHurt', 'moodAnger'].forEach((k, i) => {
    const btn = moods[i]
    if (!btn) return
    const b = btn.querySelector('b')
    btn.textContent = ''
    if (b) btn.appendChild(b)
    btn.appendChild(document.createTextNode(u(lang, k)))
  })
  text(root, '#saveDay', 'saveDay', lang)
  text(root, '#sampleDay', 'sampleDay', lang)
  text(root, '#speakSummary', 'speakSummary', lang)
  text(root, '#copySummary', 'copySummary', lang)
  text(root, '#clearDay', 'clearDay', lang)
  text(root, '#dayStatus', 'dayStatus', lang)
  text(root, '#cardTitle', 'cardTitleDefault', lang)
  ph(root, '#done', 'phDone', lang)
  ph(root, '#action', 'phAction', lang)
  ph(root, '#tomorrow', 'phTomorrow', lang)
  ph(root, '#selfWord', 'phSelfWord', lang)
  ph(root, '#result', 'phResult', lang)
  ph(root, '#learn', 'phLearn', lang)
  ph(root, '#memo', 'phMemo', lang)
  const quick = root.querySelectorAll('#today .quick-tools button')
  ;['quickBlog', 'quickSong', 'quickVideo'].forEach((k, i) => {
    if (quick[i]) quick[i].textContent = u(lang, k)
  })
  const optional = root.querySelector('#today .optional-details > summary')
  if (optional) optional.textContent = u(lang, 'optionalSummary')
  const quickCore = root.querySelector('#today .quick-core-label')
  if (quickCore) quickCore.textContent = u(lang, 'dayStatus')

  // Precision
  text(root, '#precision .section-head h2', 'precisionTitle', lang)
  text(root, '#precision .section-head p', 'precisionDesc', lang)
  labelFor(root, 'pPriority', 'labelPriority', lang)
  labelFor(root, 'pReason', 'labelReason', lang)
  labelFor(root, 'pAction', 'labelPAction', lang)
  labelFor(root, 'pObstacle', 'labelObstacle', lang)
  labelFor(root, 'pMethod', 'labelMethod', lang)
  labelFor(root, 'pAlternative', 'labelAlternative', lang)
  labelFor(root, 'pTomorrow', 'labelPTomorrow', lang)
  labelFor(root, 'pInsight', 'labelInsight', lang)
  text(root, '#savePrecision', 'savePrecision', lang)
  text(root, '#samplePrecision', 'samplePrecision', lang)
  text(root, '#precisionToChallenge', 'precisionTo7', lang)
  text(root, '#copyPrecision', 'copyPrecision', lang)
  text(root, '#exportPrecision', 'exportPrecision', lang)
  text(root, '#clearPrecision', 'clearPrecision', lang)
  text(root, '#precisionStatus', 'precisionStatus', lang)
  text(root, '#precision .precision-card h3', 'precisionBalanceTitle', lang)
  const domainHeads = root.querySelectorAll('#precision .precision-domain-head strong')
  ;['domainEmotion', 'domainRelation', 'domainMoney', 'domainHealth', 'domainCreation', 'domainBusiness'].forEach((k, i) => {
    if (domainHeads[i]) domainHeads[i].textContent = u(lang, k)
  })
  ph(root, '#pPriority', 'phPriority', lang)
  ph(root, '#pReason', 'phReason', lang)
  ph(root, '#pAction', 'phPAction', lang)
  ph(root, '#pObstacle', 'phObstacle', lang)
  ph(root, '#pMethod', 'phMethod', lang)
  ph(root, '#pAlternative', 'phAlternative', lang)
  ph(root, '#pTomorrow', 'phPTomorrow', lang)
  ph(root, '#pInsight', 'phInsight', lang)
  text(root, '#precision .precision-history h3', 'recentPrecision', lang)
  ph(root, '#pEmotionNote', 'phDomainEmotion', lang)
  ph(root, '#pRelationNote', 'phDomainRelation', lang)
  ph(root, '#pMoneyNote', 'phDomainMoney', lang)
  ph(root, '#pHealthNote', 'phDomainHealth', lang)
  ph(root, '#pCreationNote', 'phDomainCreation', lang)
  ph(root, '#pBusinessNote', 'phDomainBusiness', lang)

  // Area select (today form)
  const areaSel = root.querySelector<HTMLSelectElement>('#area')
  if (areaSel) {
    const areaKeys = [
      'areaMe',
      'areaHealth',
      'areaRelation',
      'areaLearn',
      'areaChallenge',
      'areaFuture',
      'areaMoney',
      'areaLife',
      'areaCreate',
      'areaBusiness',
    ]
    ;[...areaSel.options].forEach((opt, i) => {
      if (areaKeys[i]) opt.textContent = u(lang, areaKeys[i])
    })
  }

  // Next-step strips — full sentence HTML with links
  const nextHtml: [string, string][] = [
    [
      '#today .next-step',
      lang === 'ko'
        ? `다음 단계 → 오늘 정한 ‘하나’를 <a href="#challenge">${u(lang, 'linkChallenge')}</a>에서 반복하거나, 더 깊은 점검이 필요하면 <a href="#precision">${u(lang, 'linkPrecision')}</a>로 이동합니다.`
        : lang === 'en'
          ? `Next → Repeat today’s one thing in <a href="#challenge">${u(lang, 'linkChallenge')}</a>, or go deeper with <a href="#precision">${u(lang, 'linkPrecision')}</a>.`
          : lang === 'ja'
            ? `次へ → 今日決めた「一つ」を<a href="#challenge">${u(lang, 'linkChallenge')}</a>で繰り返すか、より深く見るなら<a href="#precision">${u(lang, 'linkPrecision')}</a>へ。`
            : `下一步 → 把今天定下的“一件事”在<a href="#challenge">${u(lang, 'linkChallenge')}</a>中重复，或进入<a href="#precision">${u(lang, 'linkPrecision')}</a>。`,
    ],
    [
      '#precision .next-step',
      lang === 'ko'
        ? `정밀설계의 목적 → 생각을 많이 적는 것이 아니라 <b>어디를 먼저 바꿀지 판단하고 실제 행동 하나를 정하는 것</b>입니다. 정한 행동은 <a href="#challenge">${u(lang, 'linkChallenge')}</a>로 보낼 수 있습니다.`
        : lang === 'en'
          ? `Precision goal → Not more notes, but <b>deciding what to change first and one real action</b>. Send it to <a href="#challenge">${u(lang, 'linkChallenge')}</a>.`
          : lang === 'ja'
            ? `精密設計の目的 → 多く書くことではなく、<b>どこを先に変えるか判断し実際の行動を一つ決めること</b>です。<a href="#challenge">${u(lang, 'linkChallenge')}</a>へ送れます。`
            : `精密设计目的 → 不是多写想法，而是<b>判断先改哪里并定下一个实际行动</b>。可送到<a href="#challenge">${u(lang, 'linkChallenge')}</a>。`,
    ],
    [
      '#challenge .next-step',
      lang === 'ko'
        ? `다음 단계 → 7일의 실천 증거를 <a href="#report">${u(lang, 'linkReport')}</a>에서 확인합니다.`
        : lang === 'en'
          ? `Next → Check 7-day evidence in the <a href="#report">${u(lang, 'linkReport')}</a>.`
          : lang === 'ja'
            ? `次へ → 7日の実践証拠を<a href="#report">${u(lang, 'linkReport')}</a>で確認します。`
            : `下一步 → 在<a href="#report">${u(lang, 'linkReport')}</a>中确认7日实践证据。`,
    ],
    [
      '#report .next-step',
      lang === 'ko'
        ? `다음 단계 → 평소에는 <a href="#today">${u(lang, 'linkToday')}</a>로 이어가고, 반복되는 문제나 균형을 깊이 볼 필요가 있으면 <a href="#precision">${u(lang, 'linkPrecision')}</a>로 들어갑니다. 30일이 쌓이면 생활 패턴으로 정리합니다.`
        : lang === 'en'
          ? `Next → Continue with <a href="#today">${u(lang, 'linkToday')}</a>; use <a href="#precision">${u(lang, 'linkPrecision')}</a> when balance needs a deeper look.`
          : lang === 'ja'
            ? `次へ → 普段は<a href="#today">${u(lang, 'linkToday')}</a>を続け、深く見る日は<a href="#precision">${u(lang, 'linkPrecision')}</a>へ。`
            : `下一步 → 平时继续<a href="#today">${u(lang, 'linkToday')}</a>；需要深入时进入<a href="#precision">${u(lang, 'linkPrecision')}</a>。`,
    ],
    [
      '#life .next-step',
      lang === 'ko'
        ? `적용 방법 → 내 상황에 맞는 질문을 고른 뒤 <a href="#today">${u(lang, 'linkToday')}</a>의 오늘 행동과 내일 계획에 적용합니다. 더 자세한 대상별 프로그램은 <a href="/programs">${u(lang, 'linkPrograms')}</a>에서 확인합니다.`
        : lang === 'en'
          ? `How to apply → Pick a fitting question, then use it in <a href="#today">${u(lang, 'linkToday')}</a>. See <a href="/programs">${u(lang, 'linkPrograms')}</a> for more.`
          : lang === 'ja'
            ? `適用方法 → 合う問いを選び<a href="#today">${u(lang, 'linkToday')}</a>に使います。詳細は<a href="/programs">${u(lang, 'linkPrograms')}</a>。`
            : `应用方法 → 选合适问题用到<a href="#today">${u(lang, 'linkToday')}</a>。更多见<a href="/programs">${u(lang, 'linkPrograms')}</a>。`,
    ],
    ['#studio .next-step', u(lang, 'nextStepStudio')],
  ]
  nextHtml.forEach(([sel, value]) => {
    root.querySelectorAll(sel).forEach((el) => {
      el.innerHTML = value
    })
  })

  // Challenge
  text(root, '#challenge .section-head h2', 'challengeTitle', lang)
  text(root, '#challenge .section-head p', 'challengeDesc', lang)
  labelFor(root, 'challengeTitle', 'labelChallengeTitle', lang)
  labelFor(root, 'challengeReason', 'labelChallengeReason', lang)
  labelFor(root, 'challengeReward', 'labelChallengeReward', lang)
  text(root, '#saveChallenge', 'saveChallenge', lang)
  text(root, '#challengeSample', 'challengeSample', lang)
  text(root, '#resetChallenge', 'resetChallenge', lang)
  text(root, '#challengeName', 'challengeEmpty', lang)
  text(root, '#challengeMessage', 'challengeMsg', lang)
  ph(root, '#challengeTitle', 'phChallengeTitle', lang)
  ph(root, '#challengeReason', 'phChallengeReason', lang)
  ph(root, '#challengeReward', 'phChallengeReward', lang)

  // School
  text(root, '#school .section-head h2', 'schoolTitle', lang)
  text(root, '#school .section-head p', 'schoolDesc', lang)
  text(root, '#school .success-rule', 'schoolRule', lang)
  const schoolCards = root.querySelectorAll('#school .school-card')
  const schoolKeys: [string, string][] = [
    ['schoolStep1', 'schoolStep1Desc'],
    ['schoolStep2', 'schoolStep2Desc'],
    ['schoolStep3', 'schoolStep3Desc'],
    ['schoolStep4', 'schoolStep4Desc'],
  ]
  schoolCards.forEach((card, i) => {
    const keys = schoolKeys[i]
    if (!keys) return
    const strong = card.querySelector('strong')
    const p = card.querySelector('p')
    if (strong) strong.textContent = u(lang, keys[0])
    if (p) p.textContent = u(lang, keys[1])
  })
  text(root, '#school .lesson-panel h3', 'lessonTitle', lang)
  text(root, '#school .flower-panel h3', 'flowerTitle', lang)
  root.querySelectorAll('#school [data-lesson]').forEach((btn) => {
    btn.textContent = u(lang, 'lessonBtn')
  })
  text(root, '#makeLifeBook', 'make30', lang)
  text(root, '#makeGrowthBook', 'make90', lang)
  text(root, '#makeLifeAlmanac', 'make365', lang)
  text(root, '#schoolProgram a.btn', 'schoolProgramCta', lang)

  // Report
  text(root, '#report .section-head h2', 'reportTitle', lang)
  text(root, '#report .section-head > div > p, #report .section-head p', 'reportDesc', lang)
  text(root, '#exportCsv', 'exportCsv', lang)
  text(root, '#exportJson', 'exportJson', lang)
  const importLab = root.querySelector('label[for="importJson"]')
  if (importLab) importLab.textContent = u(lang, 'importJson')
  text(root, '#report .practice-index h3', 'practiceIndexTitle', lang)
  text(root, '#report .practice-index p', 'practiceIndexDesc', lang)
  text(root, '#report .practice-index-head .kicker', 'practiceIndexKicker', lang)
  const precisionItems = root.querySelectorAll('#report .precision-report-item > span')
  ;['prCount', 'prAvg', 'prLowest', 'prPriority'].forEach((k, i) => {
    if (precisionItems[i]) precisionItems[i].textContent = u(lang, k)
  })

  // Life cards
  const lifeCards = root.querySelectorAll('#life .life-card')
  for (let i = 0; i < 7; i++) {
    const card = lifeCards[i]
    if (!card) continue
    const n = i + 1
    text(card, 'h3', `lifeCard${n}Title`, lang)
    text(card, 'p', `lifeCard${n}Desc`, lang)
    text(card, 'span', `lifeCard${n}Tags`, lang)
  }

  // Guide
  text(root, '#guide .section-head h2', 'guideTitleMain', lang)
  text(root, '#guide .section-head p', 'guideDesc', lang)
  text(root, '#guide3min a.btn', 'guideStart3min', lang)

  // Works CTAs
  text(root, '#works .works-actions a.btn-gold[href*="one"], #works a.btn-primary[href="/today#lifeMissions"]', 'worksToToday', lang)
  const libBtns = root.querySelectorAll('#works .works-library-gateway a.btn, #works .form-actions a.btn')
  libBtns.forEach((btn) => {
    const href = (btn as HTMLAnchorElement).getAttribute('href') || ''
    if (href.includes('library') && !href.includes('audio')) btn.textContent = u(lang, 'libraryOpenEbook')
    else if (href.includes('audio')) btn.textContent = u(lang, 'libraryOpenAudio')
    else if (href.includes('subscribe')) btn.textContent = u(lang, 'libraryPay')
    else if (href.includes('lifeMissions') || href.includes('#one')) btn.textContent = u(lang, 'worksToToday')
  })

  // Mission / transfer buttons handled in i18n applyMissions/applyTransfer (avoid key wipe)
  ph(root, '#transferFrom', 'phTransferFrom', lang)
  ph(root, '#transferTo', 'phTransferTo', lang)

  // First complete
  text(root, '#firstCompleteTitle', 'firstCompleteTitle', lang)
  text(root, '#firstStart7', 'firstStart7', lang)
  text(root, '#firstExploreLater', 'firstExploreLater', lang)
  text(root, '#firstUnlockChip', 'firstUnlockChip', lang)

  // Report metrics
  const metricCards = root.querySelectorAll('#report .metric-card')
  const metricKeys: [string, string][] = [
    ['metricDaysLabel', 'metricDaysHint'],
    ['metricRestartLabel', 'metricRestartHint'],
    ['metricHabitLabel', 'metricHabitHint'],
    ['metricActionDaysLabel', 'metricActionDaysHint'],
    ['metricAvgLabel', 'metricAvgHint'],
  ]
  metricCards.forEach((card, i) => {
    const keys = metricKeys[i]
    if (!keys) return
    const span = card.querySelector('span')
    const small = card.querySelector('small')
    if (span) span.textContent = u(lang, keys[0])
    if (small) small.textContent = u(lang, keys[1])
  })
  const practiceSpans = root.querySelectorAll('#report .practice-metric > span')
  ;['piRecord', 'piAction', 'piResult', 'piRepeat', 'piRestart'].forEach((k, i) => {
    if (practiceSpans[i]) practiceSpans[i].textContent = u(lang, k)
  })
  const panelHeads = root.querySelectorAll('#report .report-grid .panel-head')
  if (panelHeads[0]) {
    text(panelHeads[0], 'h3', 'recentRecords', lang)
    text(panelHeads[0], 'small', 'recentRecordsHint', lang)
  }
  if (panelHeads[1]) {
    text(panelHeads[1], 'h3', 'areaDist', lang)
    text(panelHeads[1], 'small', 'areaDistHint', lang)
  }
  const precHead = root.querySelector('#report .precision-report-wrap .panel-head, #report .panel-head h3')
  // precision insight head (sibling structure)
  root.querySelectorAll('#report .panel-head').forEach((head) => {
    const h3 = head.querySelector('h3')
    if (!h3) return
    const t = h3.textContent || ''
    if (/정밀|Precision|精密|精密/.test(t) || t.includes('Insight') || /インサイト|洞察/.test(t)) {
      h3.textContent = u(lang, 'precisionInsight')
      const sm = head.querySelector('small')
      if (sm) sm.textContent = u(lang, 'precisionInsightHint')
    }
  })
  void precHead

  // Works
  text(root, '#works .works-intro h3, #works .works-intro strong', 'worksIntroTitle', lang)
  text(root, '#works .works-intro p', 'worksIntroDesc', lang)
  text(root, '#works .works-featured > .kicker', 'worksFeaturedKicker', lang)
  text(root, '#works .works-featured h3, #works .works-featured .panel-head h3', 'worksFeatured', lang)
  const proofSpans = root.querySelectorAll('#works .works-proof-item span')
  ;['worksProofEbook', 'worksProofAudio', 'worksProofComic', 'worksProofTotal'].forEach((k, i) => {
    if (proofSpans[i]) proofSpans[i].textContent = u(lang, k)
  })
  text(root, '#works .youtube-band strong, #works .youtube-band h3, #works .works-youtube h3', 'youtubeBandTitle', lang)
  text(root, '#works .youtube-band p, #works .works-youtube p', 'youtubeBandDesc', lang)
  root.querySelectorAll('#works a[href*="youtube"], #works a[href*="youtu"]').forEach((a) => {
    a.textContent = u(lang, 'youtubeOpen')
  })
  root.querySelectorAll('#works a[href*="#studio"], #works a[href="/create#studio"]').forEach((a) => {
    a.textContent = u(lang, 'studioOpen')
  })

  // Guide role boxes
  const roleBoxes = root.querySelectorAll('#guide .role-box')
  if (roleBoxes[0]) {
    text(roleBoxes[0], 'b', 'modeQuickBadge', lang)
    text(roleBoxes[0], 'strong, h3', 'guideQuickTitle', lang)
    text(roleBoxes[0], 'p', 'guideQuickDesc', lang)
  }
  if (roleBoxes[1]) {
    text(roleBoxes[1], 'b', 'modeDeepBadge', lang)
    text(roleBoxes[1], 'strong, h3', 'guideDeepTitle', lang)
    text(roleBoxes[1], 'p', 'guideDeepDesc', lang)
  }

  // Chrome aria / skip
  document.querySelectorAll('a').forEach((a) => {
    if (/핵심 하루설계|Skip to day design|スキップ|跳到核心/.test(a.textContent || '')) {
      a.textContent = u(lang, 'skipToMain')
    }
  })
  const themeBtn = root.querySelector('#themeBtn')
  if (themeBtn) {
    const dark = document.documentElement.dataset.theme === 'dark' || document.body.classList.contains('dark')
    themeBtn.setAttribute('aria-label', u(lang, dark ? 'themeLight' : 'themeDark'))
  }
  const menuBtn = root.querySelector('#menuBtn')
  if (menuBtn) menuBtn.setAttribute('aria-label', u(lang, 'mobileMenu'))
  const accountChip = root.querySelector('#accountChip')
  if (accountChip) accountChip.setAttribute('aria-label', u(lang, 'accountOpen'))
  const cloudDot = root.querySelector('#cloudDot')
  if (cloudDot) cloudDot.setAttribute('title', u(lang, 'cloudStatus'))
  root.querySelectorAll('button[aria-label]').forEach((btn) => {
    const label = btn.getAttribute('aria-label') || ''
    if (/이모티콘|emoticon|絵文字|表情|Insert emoticon/i.test(label)) {
      btn.setAttribute('aria-label', u(lang, 'emoInsert'))
    }
  })
  root.querySelectorAll('.dawon-emo-btn').forEach((btn) => {
    btn.textContent = u(lang, 'emoShort')
    btn.setAttribute('aria-label', u(lang, 'emoInsert'))
  })
  const emoPop = root.querySelector('.dawon-emo-pop')
  if (emoPop) {
    emoPop.setAttribute('aria-label', u(lang, 'emoTitle'))
    const strong = emoPop.querySelector('.dawon-emo-pop-head strong')
    if (strong) strong.textContent = u(lang, 'emoTitle')
  }

  // Studio
  text(root, '#studio .section-head h2', 'studioTitle', lang)
  text(root, '#studio .section-head p', 'studioDesc', lang)
  const tabs = root.querySelectorAll('#studio .studio-tab')
  ;['studioTabTransform', 'studioTabVideo', 'studioTabBook', 'studioTabProposal'].forEach((k, i) => {
    if (tabs[i]) tabs[i].textContent = u(lang, k)
  })
  labelFor(root, 'ideaTitle', 'studioIdeaTitle', lang)
  labelFor(root, 'ideaSource', 'studioIdeaSource', lang)
  const formatLab = root.querySelector('#page-transform .field > label:not([for])')
  if (formatLab) formatLab.textContent = u(lang, 'studioFormat')
  ph(root, '#ideaTitle', 'phIdeaTitle', lang)
  ph(root, '#ideaSource', 'phIdeaSource', lang)
  const types = root.querySelectorAll('#typeGrid .type-card')
  const typeKeys: [string, string][] = [
    ['typeBlog', 'typeBlogDesc'],
    ['typeSong', 'typeSongDesc'],
    ['typeComic', 'typeComicDesc'],
    ['typeVideo', 'typeVideoDesc'],
    ['typePartner', 'typePartnerDesc'],
    ['typeDaily', 'typeDailyDesc'],
  ]
  types.forEach((card, i) => {
    const keys = typeKeys[i]
    if (!keys) return
    const b = card.querySelector('b')
    const small = card.querySelector('small')
    if (b) b.textContent = u(lang, keys[0])
    if (small) small.textContent = u(lang, keys[1])
  })
  text(root, '#generateContent', 'studioGenerate', lang)
  text(root, '#useToday', 'studioUseToday', lang)
  text(root, '#contentSample', 'studioSample', lang)
  text(root, '#copyContent', 'studioCopy', lang)
  text(root, '#downloadContent', 'studioDownload', lang)
  text(root, '#page-transform .label-row h3', 'studioResultTitle', lang)
  const out = root.querySelector('#contentOutput')
  if (out && /왼쪽|Choose a format|形式を|左侧|콘텐츠를 생성/.test(out.textContent || '')) {
    out.textContent = u(lang, 'studioResultEmpty')
  }
  text(root, '#openVideoStudioFromTransform', 'studioMakeVideo', lang)

  // Floor dock
  const dock = root.querySelectorAll('.floor-quick-nav a span')
  ;['floorQuick1', 'floorQuick2', 'floorQuick3'].forEach((k, i) => {
    if (dock[i]) dock[i].textContent = u(lang, k)
  })

  // Menu modal / account
  text(root, '#menuModalTitle', 'menu', lang)
  const accountBtn = root.querySelector('#accountBtn')
  if (accountBtn) {
    const cur = accountBtn.textContent || ''
    if (/내 계정|My account|マイアカウント|我的账号/.test(cur)) {
      accountBtn.textContent = u(lang, 'myAccount')
    } else if (/로그아웃|Log out|ログアウト|退出/.test(cur)) {
      accountBtn.textContent = u(lang, 'logout')
    } else if (/로그인|Log in|ログイン|登录|내 계정|My account/.test(cur) || !cur.trim()) {
      accountBtn.textContent = u(lang, 'login')
    }
  }
  root.querySelectorAll('.nav-actions > a.btn-primary[href="/today"]').forEach((el) => {
    el.textContent = u(lang, 'startOne')
  })

  // Brand / chrome aria
  root.querySelectorAll('a.brand').forEach((brand) => {
    brand.setAttribute('aria-label', u(lang, 'brandHome'))
    const b = brand.querySelector('b')
    if (b) b.textContent = u(lang, 'brandNav')
    const img = brand.querySelector('img')
    if (img) img.setAttribute('alt', u(lang, 'brandLogoAlt'))
  })
  root.querySelectorAll('.os-card').forEach((el) => el.setAttribute('aria-label', u(lang, 'osCardAria')))
  root.querySelectorAll('.server-strip').forEach((el) => el.setAttribute('aria-label', u(lang, 'serverStripAria')))
  root.querySelectorAll('#layers').forEach((el) => el.setAttribute('aria-label', u(lang, 'layersAria')))
  text(root, '#layers .layer-intro .sr-only', 'layersA11y', lang)
  text(root, '#publisher .publisher-foot a.btn-primary', 'layer1Cta', lang)
  text(root, '#publisher .publisher-foot a.btn-soft', 'pubLibraryCta', lang)

  // Formula strips
  const setFormula = (sel: string, keys: string[]) => {
    const spans = [...root.querySelectorAll(`${sel} > span`)].filter((s) => !s.classList.contains('arrow'))
    keys.forEach((k, i) => {
      if (spans[i]) spans[i].textContent = u(lang, k)
    })
  }
  setFormula('#today .formula', ['formulaCheck', 'formulaOne', 'formulaTomorrow'])
  setFormula('#precision .formula', ['formulaDomain', 'formulaPriority', 'formulaPlan', 'formulaAct'])
  setFormula('#school .formula, #schoolProgram .formula, section#school .formula', [
    'schoolF7',
    'schoolF30',
    'schoolF90',
    'schoolF365',
  ])
  // school section may use id school
  root.querySelectorAll('.formula').forEach((formula) => {
    const parent = formula.closest('section')
    if (!parent) return
    if (parent.id === 'school' || parent.querySelector('#schoolProgram')) {
      const spans = [...formula.querySelectorAll(':scope > span')].filter((s) => !s.classList.contains('arrow'))
      ;['schoolF7', 'schoolF30', 'schoolF90', 'schoolF365'].forEach((k, i) => {
        if (spans[i] && /7일|7-day|7日|7天|씨앗|seed|種|种子/.test(spans[i].textContent || '')) {
          spans[i].textContent = u(lang, k)
        } else if (spans[i] && spans.length === 4) {
          spans[i].textContent = u(lang, k)
        }
      })
    }
  })

  // Day card flow + summary hints
  const flowBs = root.querySelectorAll('#today .flow-step b')
  ;['formulaCheck', 'flowPractice', 'flowResult', 'flowLearn', 'flowNext'].forEach((k, i) => {
    if (flowBs[i]) flowBs[i].textContent = u(lang, k)
  })
  const summary = root.querySelector('#summary')
  if (summary && /핵심 5항목|five core|核心5|核心五项|왼쪽|left|左側|左侧/i.test(summary.textContent || '')) {
    summary.textContent = u(lang, 'daySummaryHint')
  }
  const kpiSpans = root.querySelectorAll('#precision .precision-kpi span')
  if (kpiSpans[0]) kpiSpans[0].textContent = u(lang, 'precisionAvg')
  if (kpiSpans[1]) kpiSpans[1].textContent = u(lang, 'precisionLowest')
  const pCount = root.querySelector('#precisionCount')
  if (pCount && /^0/.test((pCount.textContent || '').trim())) {
    pCount.textContent = u(lang, 'precisionCount0')
  }
  const pHint = root.querySelector('#precisionSummaryText')
  if (pHint && /여섯|six areas|六つ|六个/i.test(pHint.textContent || '')) {
    pHint.textContent = u(lang, 'precisionSummaryHint')
  }
  text(root, '#lifeMissions .kicker', 'missionKicker', lang)
  text(root, '#transfer .kicker', 'transferKicker', lang)
  labelFor(root, 'transferFrom', 'labelTransferFrom', lang)
  labelFor(root, 'transferTo', 'labelTransferTo', lang)
  text(root, '#schoolProgram .kicker, #schoolProgram .section-head .kicker', 'schoolProgKicker', lang)
  const schoolTh = root.querySelectorAll('#schoolProgram .school-program-table thead th')
  ;['schoolThPeriod', 'schoolThGoal', 'schoolThOut'].forEach((k, i) => {
    if (schoolTh[i]) schoolTh[i].textContent = u(lang, k)
  })
  const privacyBadge = root.querySelector('#schoolProgram .badge, #schoolProgram .privacy-card .kicker, #schoolProgram .card .badge')
  if (privacyBadge && /PRIVACY|운영|運営|运营/.test(privacyBadge.textContent || '')) {
    privacyBadge.textContent = u(lang, 'privacyKicker')
  }

  // Mic buttons
  root.querySelectorAll('.mic-btn').forEach((btn) => {
    const t = btn.textContent || ''
    if (t.includes('음성') || t.includes('Voice') || t.includes('音声') || t.includes('语音') || t.includes('🎙') || t.includes('듣는') || t.includes('Listening')) {
      btn.textContent = u(lang, 'voice')
    }
  })
}

export function uiT(lang: UiLang, key: string): string {
  return u(lang, key)
}
