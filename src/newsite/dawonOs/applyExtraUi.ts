import { EXTRA_UI, type UiLang } from './extraUiStrings'
import { SUBPAGE_STRINGS } from './subpageStrings'
import { UI_STRINGS } from './uiStrings'
import { RUNTIME } from './runtimeStrings'

function x(lang: UiLang, key: string): string {
  return (
    EXTRA_UI[lang]?.[key] ||
    UI_STRINGS[lang]?.[key] ||
    RUNTIME[lang]?.[key] ||
    EXTRA_UI.ko[key] ||
    UI_STRINGS.ko[key] ||
    RUNTIME.ko[key] ||
    key
  )
}

function s(lang: UiLang, key: string): string {
  return SUBPAGE_STRINGS[lang]?.[key] || SUBPAGE_STRINGS.ko[key] || key
}

function setText(el: Element | null | undefined, value: string) {
  if (el) el.textContent = value
}

function setHtml(el: Element | null | undefined, value: string) {
  if (el) el.innerHTML = value
}

function labelFor(root: ParentNode, id: string, value: string) {
  root.querySelectorAll(`label[for="${id}"]`).forEach((el) => {
    el.textContent = value
  })
  // Institution (and similar) forms use <label> next to input without for=
  const control = root.querySelector(`#${CSS.escape(id)}`)
  if (control) {
    const wrap = control.parentElement
    const loose = wrap?.querySelector(':scope > label:not([for])')
    if (loose) loose.textContent = value
  }
}

function setPh(root: ParentNode, id: string, value: string) {
  const el = root.querySelector(`#${CSS.escape(id)}`) as HTMLInputElement | HTMLTextAreaElement | null
  if (el) el.placeholder = value
}

/** Auth, subscription, guide cards, school flowers, menu, works extras, studio chrome. */
export function applyExtraUi(root: ParentNode, lang: UiLang) {
  // Auth modal
  setText(root.querySelector('#authModalTitle'), x(lang, 'authTitle'))
  setText(root.querySelector('#syncStatus'), x(lang, 'authSyncGuest'))
  setText(root.querySelector('#showLoginPanel'), x(lang, 'authTabLogin'))
  setText(root.querySelector('#showRegisterPanel'), x(lang, 'authTabRegister'))
  setText(root.querySelector('#showForgotPanel'), x(lang, 'authTabForgot'))

  const loginPanel = root.querySelector('#loginPanel')
  if (loginPanel) {
    setText(loginPanel.querySelector('h3'), x(lang, 'authLoginTitle'))
    setText(loginPanel.querySelector('p'), x(lang, 'authLoginDesc'))
  }
  labelFor(root, 'loginEmail', x(lang, 'labelEmail'))
  labelFor(root, 'loginPassword', x(lang, 'labelPassword'))
  setText(root.querySelector('#loginSubmit'), x(lang, 'authLoginSubmit'))

  const reg = root.querySelector('#registerPanel')
  if (reg) {
    setText(reg.querySelector('h3'), x(lang, 'authRegisterTitle'))
    setText(reg.querySelector(':scope > p'), x(lang, 'authRegisterDesc'))
  }
  labelFor(root, 'registerName', x(lang, 'labelName'))
  labelFor(root, 'registerEmail', x(lang, 'labelEmail'))
  labelFor(root, 'registerPassword', x(lang, 'labelPassword'))
  labelFor(root, 'registerPasswordConfirm', x(lang, 'labelPasswordConfirm'))
  setText(root.querySelector('#registerSubmit'), x(lang, 'authRegisterSubmit'))

  // Agreement labels: keep links, rewrite surrounding text via span
  const agreeMap: [string, string][] = [
    ['registerAgreeTerms', 'authAgreeTerms'],
    ['registerAgreePrivacy', 'authAgreePrivacy'],
    ['registerAge14', 'authAgreeAge14'],
    ['registerAgreeRefund', 'authAgreeRefund'],
  ]
  agreeMap.forEach(([id, key]) => {
    const input = root.querySelector(`#${id}`)
    const label = input?.closest('label')
    const span = label?.querySelector('span')
    if (span) {
      // Preserve first link if present
      const links = Array.from(span.querySelectorAll('a'))
      span.textContent = x(lang, key)
      // If original had links, leave plain text (translated sentence includes concept)
      void links
    }
  })

  const forgot = root.querySelector('#forgotPanel')
  if (forgot) {
    setText(forgot.querySelector('h3'), x(lang, 'authForgotTitle'))
    setText(forgot.querySelector('p'), x(lang, 'authForgotDesc'))
  }
  setText(root.querySelector('#forgotSubmit'), x(lang, 'authForgotSubmit'))
  setText(root.querySelector('#resetPanel h3'), x(lang, 'authResetTitle'))
  setText(root.querySelector('#logoutBtn'), x(lang, 'authLogout'))
  setText(root.querySelector('#pullCloud'), x(lang, 'authPullCloud'))
  setText(root.querySelector('#pushCloud'), x(lang, 'authPushCloud'))
  setText(root.querySelector('#deleteAccountBtn'), x(lang, 'authDeleteBtn'))
  const delStrong = root.querySelector('.danger-zone strong')
  if (delStrong) delStrong.textContent = x(lang, 'authDeleteTitle')
  const delPh = root.querySelector<HTMLInputElement>('#deleteConfirmText')
  if (delPh) delPh.placeholder = x(lang, 'authDeleteConfirmPhrase')

  // Menu modal links
  const menuMap: [string, string][] = [
    ['a[href="/today"]', 'menuToday'],
    ['a[href="/school"]', 'menuSchool'],
    ['a[href="/create"]', 'menuCreate'],
    ['a[href="/programs"]', 'menuPrograms'],
    ['a[href="/institution"]', 'menuInstitution'],
    ['a[href="/report"]', 'menuReport'],
    ['a[href="/library"]', 'menuLibrary'],
    ['a[href="/subscribe"]', 'menuStore'],
  ]
  const menu = root.querySelector('#menuModal')
  if (menu) {
    menuMap.forEach(([sel, key]) => {
      menu.querySelectorAll(sel).forEach((a) => {
        a.textContent = x(lang, key)
      })
    })
  }

  // Guide
  const guideNote = root.querySelector('#guide .guide-note')
  if (guideNote) {
    guideNote.innerHTML = `<b>${x(lang, 'guideNoteLabel')}</b> ${x(lang, 'guideNoteBody')}`
  }
  root.querySelectorAll('#guide .time-node').forEach((node, i) => {
    const n = i + 1
    const raw = x(lang, `timeNode${n}`)
    const [time, title, desc] = raw.split('|').map((s) => s.trim())
    if (time) setText(node.querySelector('b'), time)
    if (title) setText(node.querySelector('strong'), title)
    if (desc) setText(node.querySelector('small'), desc)
  })
  setText(root.querySelector('#guide .guide-core h3'), x(lang, 'guideCoreTitle'))
  setText(root.querySelector('#guide .guide-core > p'), x(lang, 'guideCoreDesc'))
  const triangles = root.querySelectorAll('#guide .core-triangle > span')
  ;['coreTriangle1', 'coreTriangle2', 'coreTriangle3'].forEach((k, i) => {
    if (triangles[i]) triangles[i].innerHTML = x(lang, k).replace(/\n/g, '<br>')
  })
  const chain = root.querySelectorAll('#guide .link-chain > a')
  ;['linkChain1', 'linkChain2', 'linkChain3', 'linkChain4', 'linkChain5', 'linkChain6'].forEach((k, i) => {
    if (chain[i]) chain[i].textContent = x(lang, k)
  })
  const guideFlow = root.querySelectorAll('#guide .guide-core .guide-flow > span')
  ;['flowCheck', 'flowAct', 'flowResult', 'flowLearn', 'flowNext'].forEach((k, i) => {
    if (guideFlow[i]) guideFlow[i].textContent = x(lang, k)
  })
  const whyLabel =
    lang === 'ko' ? '왜 필요한가:' : lang === 'en' ? 'Why:' : lang === 'ja' ? 'なぜ必要か:' : '为何需要:'
  root.querySelectorAll('#guide .guide-card').forEach((card, i) => {
    const n = i + 1
    setText(card.querySelector('h3'), x(lang, `guideCard${n}Title`))
    setText(card.querySelector('p'), x(lang, `guideCard${n}Body`))
    const em = card.querySelector('em')
    if (em) em.innerHTML = `<strong>${whyLabel}</strong> ${x(lang, `guideCard${n}Why`)}`
    setText(card.querySelector('.practice'), x(lang, `guideCard${n}Practice`))
  })
  // Role compare (also in applyOsUi; reinforce here for order after render)
  const roleBoxes = root.querySelectorAll('#guide .role-box')
  if (roleBoxes[0]) {
    setText(roleBoxes[0].querySelector('b'), x(lang, 'modeQuickBadge'))
    setText(roleBoxes[0].querySelector('strong'), x(lang, 'guideQuickTitle'))
    setText(roleBoxes[0].querySelector('p'), x(lang, 'guideQuickDesc'))
  }
  if (roleBoxes[1]) {
    setText(roleBoxes[1].querySelector('b'), x(lang, 'modeDeepBadge'))
    setText(roleBoxes[1].querySelector('strong'), x(lang, 'guideDeepTitle'))
    setText(roleBoxes[1].querySelector('p'), x(lang, 'guideDeepDesc'))
  }
  const g3 = root.querySelector('#guide3min')
  if (g3) g3.setAttribute('aria-label', x(lang, 'guide3minAria'))
  setText(root.querySelector('#guide3min a.btn'), x(lang, 'guideStart3min'))

  // School flowers / lessons
  setText(root.querySelector('#school .flower-panel > p, #school .flower-panel h3 + p'), x(lang, 'flowerDesc'))
  setText(root.querySelector('#school .lesson-panel > p, #school .lesson-panel h3 + p'), x(lang, 'lessonDesc'))
  setText(root.querySelector('#school .life-book-box > p'), x(lang, 'lifeBookNote'))
  setText(root.querySelector('#school .formula'), x(lang, 'schoolFormula'))
  root.querySelectorAll('#school .flower-card').forEach((btn, i) => {
    const n = i + 1
    setText(btn.querySelector('b'), x(lang, `flower${n}Name`))
    setText(btn.querySelector('small'), x(lang, `flower${n}Tag`))
    btn.setAttribute('data-flower', x(lang, `flower${n}Prompt`))
  })
  root.querySelectorAll('#school .lesson-card').forEach((card, i) => {
    const n = i + 1
    setText(card.querySelector('b'), x(lang, `lesson${n}Title`))
    setText(card.querySelector('strong'), x(lang, `lesson${n}Focus`))
    setText(card.querySelector('p'), x(lang, `lesson${n}Q`))
    const lessonBtn = card.querySelector('[data-lesson]')
    if (lessonBtn) {
      const q = x(lang, `lesson${n}Q`)
      lessonBtn.setAttribute('data-lesson', q)
      // keep button label from applyOsUi lessonBtn
    }
  })

  // Subscription (marketing chrome; skip business registration numbers as footer-like).
  // React SubscribePage (.subscribe-page) owns its own DOM — rewriting it causes white-screen crashes.
  const subSection = root.querySelector('#subscription')
  if (subSection?.classList.contains('subscribe-page')) {
    /* skip React store page */
  } else {
  setText(root.querySelector('#subscription .section-head h2'), x(lang, 'subTitle'))
  setText(root.querySelector('#subscription .section-head p'), x(lang, 'subDesc'))
  setHtml(root.querySelector('#subscription .subscription-policy-banner'), x(lang, 'subPolicyBanner'))
  setHtml(root.querySelector('#subscription .subscriber-benefit'), x(lang, 'subBenefit'))

  const plans = root.querySelectorAll('#subscription .plan-card')
  const planKeys = [
    ['planFreeName', 'planFreePrice', 'planFreeDesc', 'planFreeCta', 'planFreeTag', 'planFreeStage', 'planFreeRenewal', 'planFreePeriod', 'planNextPayNone'],
    ['plan14Name', 'plan14Price', 'plan14Desc', 'plan14Cta', 'plan14Tag', 'plan14Stage', 'planNoAutoRenew', 'plan14Period', 'planNextPayNoCharge'],
    ['plan30Name', 'plan30Price', 'plan30Desc', 'plan30Cta', 'plan30Tag', 'plan30Stage', 'planNoAutoRenew', 'plan30Period', 'planNextPayNoCharge'],
    ['plan365Name', 'plan365Price', 'plan365Desc', 'plan365Cta', 'plan365Tag', 'plan365Stage', 'planNoAutoRenew', 'plan365Period', 'planNextPayNoCharge'],
  ] as const
  const periodDays = ['7', '14', '30', '365']
  plans.forEach((card, i) => {
    const keys = planKeys[i]
    if (!keys) return
    setText(card.querySelector('.plan-tag'), x(lang, keys[4]))
    setText(card.querySelector('.growth-stage'), x(lang, keys[5]))
    setText(card.querySelector('h3'), x(lang, keys[0]))
    setText(card.querySelector('.plan-price'), x(lang, keys[1]))
    setText(card.querySelector('.renewal-badge'), x(lang, keys[6]))
    const ul = card.querySelector('ul')
    if (ul) {
      const lines = x(lang, keys[2]).split(/\n|·|\|/).map((t) => t.trim()).filter(Boolean)
      if (lines.length > 1) {
        ul.innerHTML = lines.map((line) => `<li>${line}</li>`).join('')
      } else {
        ul.innerHTML = `<li>${x(lang, keys[2])}</li>`
      }
    }
    const period = x(lang, keys[7]).replace(/\{days\}/g, periodDays[i] || '')
    const next = x(lang, keys[8])
    const contracts = card.querySelectorAll('.plan-contract > span')
    if (contracts[0]) contracts[0].innerHTML = `<b>${x(lang, 'subPeriodLabel')}</b> ${period}`
    if (contracts[1]) {
      const secondLabel = i === 0 ? x(lang, 'planAutoPayLabel') : x(lang, 'subNextPayLabel')
      contracts[1].innerHTML = `<b>${secondLabel}</b> ${next}`
    }
    setText(card.querySelector('a.btn'), x(lang, keys[3]))
  })

  const trusts = root.querySelectorAll('#subscription .subscription-trust-item')
  trusts.forEach((item, i) => {
    const n = i + 1
    setText(item.querySelector('b'), x(lang, `subTrust${n}Q`))
    setText(item.querySelector('strong'), x(lang, `subTrust${n}Title`))
    setText(item.querySelector('span'), x(lang, `subTrust${n}Desc`))
  })

  const launch = root.querySelector('#subscription .launch-note')
  if (launch) {
    const link = launch.querySelector('a')
    const href = link?.getAttribute('href') || '/#policy-refund'
    launch.innerHTML = `${x(lang, 'subLaunchNoteBefore')}<a href="${href}">${x(lang, 'subLaunchNoteLink')}</a>${x(lang, 'subLaunchNoteAfter')} ${x(lang, 'subLaunchNoteContact')}`
  }

  const panels = root.querySelectorAll('#subscription .status-panel')
  if (panels[0]) {
    setText(panels[0].querySelector('.status-badge'), x(lang, 'subGuideBadge'))
    setHtml(panels[0].querySelector('h3'), x(lang, 'subGuideTitle').replace(/\n/g, '<br>'))
    setHtml(panels[0].querySelector('p'), x(lang, 'subGuideDesc'))
    panels[0].querySelectorAll('.readiness-item').forEach((item, i) => {
      const n = i + 1
      setText(item.querySelector('span'), x(lang, `subGuideStep${n}Label`))
      setText(item.querySelector('strong'), x(lang, `subGuideStep${n}Value`))
    })
  }
  if (panels[1]) {
    setText(panels[1].querySelector('h3'), x(lang, 'subMyTitle'))
    const summary = panels[1].querySelector('#subscriptionSummary')
    if (summary && /로그인|Log in|ログイン|登录|Sign in/.test(summary.textContent || '')) {
      summary.textContent = x(lang, 'subMyDesc')
    }
    setText(root.querySelector('#refreshSubscription'), x(lang, 'subRefresh'))
    setText(root.querySelector('#cancelSubscription'), x(lang, 'subCancelAutoRenew'))
    const stateItems = panels[1].querySelectorAll('.subscription-state-item b')
    ;['subStatusLabel', 'subPlanLabel', 'subEndsLabel', 'subAutoRenewLabel', 'subLastPaymentLabel', 'subRefundLabel'].forEach(
      (k, i) => {
        if (stateItems[i]) stateItems[i].textContent = x(lang, k)
      },
    )
    labelFor(root, 'refundReason', x(lang, 'refundReasonLabel'))
    const refundSel = root.querySelector<HTMLSelectElement>('#refundReason')
    if (refundSel) {
      ;[
        ['mistake', 'refundReasonMistake'],
        ['service', 'refundReasonService'],
        ['duplicate', 'refundReasonDuplicate'],
        ['other', 'refundReasonOther'],
      ].forEach(([val, key]) => {
        const opt = refundSel.querySelector(`option[value="${val}"]`)
        if (opt) opt.textContent = x(lang, key)
      })
    }
    setText(root.querySelector('#refundLatest'), x(lang, 'refundLatestBtn'))
    const empty = root.querySelector('#subscriptionOrderList .empty')
    if (empty) empty.textContent = x(lang, 'subOrdersEmpty')
  }

  // Seller info — translate labels only; keep legal entity values in spans
  const seller = root.querySelector('#subscription .business-disclosure')
  if (seller) {
    setText(seller.querySelector('h4'), x(lang, 'subSellerTitle'))
    setText(seller.querySelector('#businessInfoNotice'), x(lang, 'subSellerBlurb').replace('{company}', '다원'))
    const labelKeys = [
      'subBizName',
      'subBizRep',
      'subBizNumber',
      'subBizMailOrder',
      'subBizAuthority',
      'subBizPublishingNo',
      'subBizPublishingAuth',
      'subBizAddress',
      'subBizSupport',
      'subBizEmail',
      'subBizPrivacy',
      'subBizHomepage',
      'subBizProducts',
    ]
    seller.querySelectorAll('.business-grid > div').forEach((row, i) => {
      const key = labelKeys[i]
      if (!key) return
      const b = row.querySelector('b')
      if (b) b.textContent = x(lang, key)
    })
  }
  } // end OS subscription (skip React .subscribe-page)

  // Works featured — keep book1/2 titles Hangul; translate featured3 title + blurbs
  setText(root.querySelector('#works .works-featured > .kicker'), x(lang, 'worksFeaturedKicker'))
  const featured = root.querySelectorAll('#works .featured-work, #works .works-featured-grid > *')
  featured.forEach((item, i) => {
    const n = i + 1
    if (n > 3) return
    if (n === 3) setText(item.querySelector('strong'), x(lang, 'featured3Title'))
    setText(item.querySelector('span'), x(lang, `featured${n}Desc`))
  })
  setText(root.querySelector('#works .works-proof-head small'), x(lang, 'worksProofKicker'))
  setText(root.querySelector('#works .works-proof-head h3, #works .works-proof h3'), x(lang, 'worksProofHead'))
  setText(root.querySelector('#works .works-proof-head p'), x(lang, 'worksProofIntro'))
  setText(root.querySelector('#works .works-proof-note'), x(lang, 'worksProofNote'))
  setText(root.querySelector('#works .works-library-gateway h3'), x(lang, 'libraryBridgeTitle'))
  setText(root.querySelector('#works .works-library-gateway p'), x(lang, 'libraryBridgeDesc'))
  setText(root.querySelector('#works .youtube-band strong'), x(lang, 'youtubeBandTitle'))
  setText(root.querySelector('#works .youtube-band p'), x(lang, 'youtubeBandDesc'))
  root.querySelectorAll('#works .youtube-band a[href*="youtube"], #works .youtube-band a[href*="youtu"]').forEach((a) => {
    a.textContent = x(lang, 'youtubeOpen')
  })
  root.querySelectorAll('#works .youtube-band a[href*="#studio"], #works .youtube-band a[href*="/create"]').forEach((a) => {
    a.textContent = x(lang, 'studioOpen')
  })

  // Studio extras
  setText(root.querySelector('#page-video .dvs-head h3, #page-video .dvs-head strong, #page-video h3'), x(lang, 'dvsHead'))
  setText(root.querySelector('#dvsRender, #dvsMake'), x(lang, 'dvsMake'))
  setText(root.querySelector('#dvsSave'), x(lang, 'dvsSave'))
  labelFor(root, 'bookTitle', x(lang, 'bookTitleLabel'))
  labelFor(root, 'company', x(lang, 'proposalCompanyLabel'))
  labelFor(root, 'proposalTitle', x(lang, 'proposalTitleLabel'))
  labelFor(root, 'target', x(lang, 'proposalTargetLabel'))
  labelFor(root, 'problem', x(lang, 'proposalProblemLabel'))
  labelFor(root, 'solution', x(lang, 'proposalSolutionLabel'))
  labelFor(root, 'deliverables', x(lang, 'proposalDeliverablesLabel'))

  // First complete body
  setText(root.querySelector('#firstCompleteOverlay > .first-complete-card > p'), x(lang, 'firstCompleteDesc'))

  // Hero flow mini
  const flow = root.querySelectorAll('.flow-mini > span, .guide-flow > span')
  ;['flowCheck', 'flowAct', 'flowResult', 'flowLearn', 'flowNext'].forEach((k, i) => {
    if (flow[i]) flow[i].textContent = x(lang, k)
  })

  // Home / store ad rails (book titles kept as proper nouns; translate chrome)
  root.querySelectorAll('.home-ad-kicker, .store-ad-banners').forEach(() => {})
  root.querySelectorAll('.home-ad-kicker').forEach((el) => {
    el.textContent = x(lang, 'adKicker')
  })
  root.querySelectorAll('.home-ad-rail').forEach((rail) => {
    rail.setAttribute('aria-label', x(lang, 'adKicker'))
  })
  const adCards = root.querySelectorAll('.home-ad-card, .store-ad-card')
  adCards.forEach((card, i) => {
    const copy = card.querySelector('.home-ad-copy, .store-ad-copy')
    if (!copy) return
    setText(copy.querySelector('span'), x(lang, 'adSelected'))
    setText(copy.querySelector('em'), x(lang, 'adStoreCta'))
    const p = copy.querySelector('p')
    if (p) p.textContent = x(lang, i === 0 ? 'adSotongDesc' : 'adHealingDesc')
  })

  // One principle steps
  root.querySelectorAll('.one-principle-step').forEach((step, i) => {
    const keys = [
      ['flowCheck', 'stepCheckDesc'],
      ['flowChoose', 'stepChooseDesc'],
      ['flowAct', 'stepActDesc'],
      ['flowLearn', 'stepLearnDesc'],
      ['flowApply', 'stepApplyDesc'],
    ][i]
    if (!keys) return
    setText(step.querySelector('b'), x(lang, keys[0]))
    setText(step.querySelector('span'), x(lang, keys[1]))
  })
}

/** Programs / institution / report marketing subpages. */
export function applySubpageStrings(root: ParentNode, lang: UiLang) {
  // Programs
  if (root.querySelector('.audience, .page-hero')) {
    const heroH1 = root.querySelector('.page-hero h1')
    if (heroH1 && root.querySelector('.audience')) {
      setHtml(heroH1, s(lang, 'programsHeroTitle').replace(/\n/g, '<br>'))
      setText(root.querySelector('.page-hero p'), s(lang, 'programsHeroDesc'))
      const ctas = root.querySelectorAll('.page-hero .hero-cta a, .page-hero .hero-cta button')
      if (ctas[0]) ctas[0].textContent = s(lang, 'programsCtaInst')
      if (ctas[1]) ctas[1].textContent = s(lang, 'programsCtaToday')
    }
  }

  const audSection = root.querySelector('section.audience')
  if (audSection) {
    const heads = audSection.querySelectorAll('.section-head')
    if (heads[0]) {
      setText(heads[0].querySelector('.badge'), s(lang, 'programsAudBadge'))
      setText(heads[0].querySelector('h2'), s(lang, 'programsAudTitle'))
      setText(heads[0].querySelector('p'), s(lang, 'programsAudDesc'))
    }
    const principleCards = audSection.querySelectorAll('.aud-principle .card')
    principleCards.forEach((card, i) => {
      const n = i + 1
      setText(card.querySelector('h3'), s(lang, `programsAud${n}Name`))
      setText(card.querySelector('p'), s(lang, `programsAud${n}Desc`))
      card.setAttribute('data-aud-name', s(lang, `programsAud${n}Name`))
      card.setAttribute('data-aud-detail', s(lang, `programsAud${n}Detail`))
    })
    if (heads[1]) {
      setText(heads[1].querySelector('.badge'), s(lang, 'programsDetailBadge'))
      setText(heads[1].querySelector('h2'), s(lang, 'programsDetailTitle'))
      setText(heads[1].querySelector('p'), s(lang, 'programsDetailDesc'))
    }
    const detailCards = audSection.querySelectorAll('.grid.grid-4:not(.aud-principle) .card')
    detailCards.forEach((card, i) => {
      const n = i + 1
      setText(card.querySelector('h3'), s(lang, `programsDetail${n}Name`))
      setText(card.querySelector('p'), s(lang, `programsDetail${n}Desc`))
      card.setAttribute('data-aud-name', s(lang, `programsDetail${n}Name`))
      card.setAttribute('data-aud-detail', s(lang, `programsDetail${n}Detail`))
    })
  }

  const process = root.querySelector('section.process')
  if (process && root.querySelector('section.audience')) {
    setText(process.querySelector('.badge'), s(lang, 'programsProcessBadge'))
    setText(process.querySelector('h2'), s(lang, 'programsProcessTitle'))
    setText(process.querySelector('.section-head p'), s(lang, 'programsProcessDesc'))
    process.querySelectorAll('.step').forEach((step, i) => {
      const n = i + 1
      setText(step.querySelector('h3'), s(lang, `programsStep${n}Title`))
      setText(step.querySelector('p'), s(lang, `programsStep${n}Desc`))
    })
  }

  const progTable = root.querySelector('section.programs')
  if (progTable) {
    setText(progTable.querySelector('.badge'), s(lang, 'programsTableBadge'))
    setText(progTable.querySelector('h2'), s(lang, 'programsTableTitle'))
    setText(progTable.querySelector('.section-head p'), s(lang, 'programsTableDesc'))
    const ths = progTable.querySelectorAll('thead th')
    ;['programsThProgram', 'programsThPeriod', 'programsThGoal', 'programsThOutput'].forEach((k, i) => {
      if (ths[i]) ths[i].textContent = s(lang, k)
    })
    progTable.querySelectorAll('tbody tr').forEach((tr, i) => {
      const n = i + 1
      const tds = tr.querySelectorAll('td')
      if (tds[0]) setText(tds[0].querySelector('b') || tds[0], s(lang, `programsRow${n}Name`))
      if (tds[2]) tds[2].textContent = s(lang, `programsRow${n}Goal`)
      if (tds[3]) tds[3].textContent = s(lang, `programsRow${n}Out`)
    })
    setText(progTable.querySelector('.card h3'), s(lang, 'programsPrivacyTitle'))
    setText(progTable.querySelector('.card p'), s(lang, 'programsPrivacyDesc'))
  }

  const ctaPanel = root.querySelector('.cta-panel')
  if (ctaPanel && root.querySelector('section.audience')) {
    setText(ctaPanel.querySelector('h2'), s(lang, 'programsCtaTitle'))
    setText(ctaPanel.querySelector('p'), s(lang, 'programsCtaDesc'))
    setText(ctaPanel.querySelector('a.btn'), s(lang, 'programsCtaBtn'))
  }

  const audModal = root.querySelector('#audienceModal')
  if (audModal) {
    setText(audModal.querySelector('h3'), s(lang, 'programsModalOpsTitle'))
    const ps = audModal.querySelectorAll('p')
    // second structural p after detail is ops desc
    if (ps[1]) ps[1].textContent = s(lang, 'programsModalOpsDesc')
    setText(audModal.querySelector('a.btn'), s(lang, 'programsModalAsk'))
  }

  // Institution (B2B hero without .audience)
  const instHero = root.querySelector('.page-hero')
  if (instHero && root.querySelector('section.institution')) {
    setHtml(instHero.querySelector('h1'), s(lang, 'instHeroTitle').replace(/\n/g, '<br>'))
    setText(instHero.querySelector('p'), s(lang, 'instHeroDesc'))
    const ctas = instHero.querySelectorAll('.hero-cta a, .hero-cta button')
    if (ctas[0]) ctas[0].textContent = s(lang, 'instCtaInquiry')
    if (ctas[1]) ctas[1].textContent = s(lang, 'instCtaPrograms')
  }

  const instSec = root.querySelector('section.institution')
  if (instSec) {
    setText(instSec.querySelector('.badge'), s(lang, 'instBadge'))
    setText(instSec.querySelector('h2'), s(lang, 'instTitle'))
    setText(instSec.querySelector('.section-head p'), s(lang, 'instDesc'))
    instSec.querySelectorAll('.grid .card').forEach((card, i) => {
      const n = i + 1
      setText(card.querySelector('h3'), s(lang, `instCard${n}Title`))
      setText(card.querySelector('p'), s(lang, `instCard${n}Desc`))
    })
    const privacyCard =
      instSec.querySelector('.card[style*="margin-top"]') ||
      [...instSec.querySelectorAll('.card')].find((c) => !c.querySelector('.icon') && c.querySelector('.badge'))
    if (privacyCard) {
      setText(privacyCard.querySelector('.badge'), 'PRIVACY')
      setText(privacyCard.querySelector('h3'), s(lang, 'instPrivacyTitle'))
      setText(privacyCard.querySelector('p'), s(lang, 'instPrivacyDesc'))
    }
  }

  // Institution CTA panel (not gated on .audience — that is programs-only)
  if (root.querySelector('section.institution')) {
    const instCta = root.querySelector('.cta-panel')
    if (instCta) {
      setText(instCta.querySelector('h2'), s(lang, 'instCtaTitle'))
      setText(instCta.querySelector('p'), s(lang, 'instCtaDesc'))
      setText(instCta.querySelector('#openInquiryBtn'), s(lang, 'instCtaInquiry'))
      setText(instCta.querySelector('button.btn'), s(lang, 'instCtaInquiry'))
    }
    setText(root.querySelector('#openInquiryBtn2'), s(lang, 'instCtaInquiry'))
    setText(root.querySelector('#openInquiryBtn'), s(lang, 'instCtaInquiry'))
  }

  // Institution process / roles / budget — identify by badge text patterns after first apply
  root.querySelectorAll('section').forEach((sec) => {
    const badge = sec.querySelector('.section-head .badge')?.textContent || ''
    if (/운영|Process|プロセス|流程/.test(badge) || badge.includes('운영 프로세스')) {
      setText(sec.querySelector('.badge'), s(lang, 'instProcessBadge'))
      setText(sec.querySelector('h2'), s(lang, 'instProcessTitle'))
      setText(sec.querySelector('.section-head p'), s(lang, 'instProcessDesc'))
      sec.querySelectorAll('.step').forEach((step, i) => {
        const n = i + 1
        setText(step.querySelector('h3'), s(lang, `instStep${n}Title`))
        setText(step.querySelector('p'), s(lang, `instStep${n}Desc`))
      })
    }
    if (/역할|Role|役割|角色/.test(badge) || /담당자/.test(badge)) {
      setText(sec.querySelector('.badge'), s(lang, 'instRoleBadge'))
      setText(sec.querySelector('h2'), s(lang, 'instRoleTitle'))
      setText(sec.querySelector('.section-head p'), s(lang, 'instRoleDesc'))
      sec.querySelectorAll('.card').forEach((card, i) => {
        const n = i + 1
        setText(card.querySelector('h3'), s(lang, `instRole${n}Title`))
        setText(card.querySelector('p'), s(lang, `instRole${n}Desc`))
      })
    }
    if (/예산|Budget|予算|预算/.test(badge)) {
      setText(sec.querySelector('.badge'), s(lang, 'instBudgetBadge'))
      setText(sec.querySelector('h2'), s(lang, 'instBudgetTitle'))
      setText(sec.querySelector('.section-head p'), s(lang, 'instBudgetDesc'))
      sec.querySelectorAll('.card').forEach((card, i) => {
        const n = i + 1
        setText(card.querySelector('h3'), s(lang, `instBudget${n}Title`))
        setText(card.querySelector('p'), s(lang, `instBudget${n}Desc`))
      })
    }
  })

  // Institution modal
  const inq = root.querySelector('#institutionModal')
  if (inq) {
    setText(inq.querySelector('.badge'), s(lang, 'instModalBadge'))
    setText(inq.querySelector('h2, h3'), s(lang, 'instModalTitle'))
    labelFor(inq, 'inqOrg', s(lang, 'instLabelOrg'))
    labelFor(inq, 'inqTarget', s(lang, 'instLabelTarget'))
    labelFor(inq, 'inqPeriod', s(lang, 'instLabelPeriod'))
    labelFor(inq, 'inqContact', s(lang, 'instLabelContact'))
    labelFor(inq, 'inqBody', s(lang, 'instLabelBody'))
    setPh(inq, 'inqOrg', s(lang, 'instPhOrg'))
    setPh(inq, 'inqContact', s(lang, 'instPhContact'))
    setPh(inq, 'inqBody', s(lang, 'instPhBody'))
    const targetOpts = inq.querySelectorAll('#inqTarget option')
    targetOpts.forEach((opt, i) => {
      opt.textContent = s(lang, `instTarget${i + 1}`)
    })
    const periodOpts = inq.querySelectorAll('#inqPeriod option')
    periodOpts.forEach((opt, i) => {
      opt.textContent = s(lang, `instPeriod${i + 1}`)
    })
    setText(inq.querySelector('#submitInquiry'), s(lang, 'instSubmit'))
    setText(inq.querySelector('.notice'), s(lang, 'instNotice'))
  }

  // Report marketing page (GROWTH REPORT hero, no audience/institution)
  const isReportPage =
    Boolean(root.querySelector('.page-hero .eyebrow')?.textContent?.includes('GROWTH')) ||
    Boolean(root.querySelector('.report-demo'))
  if (isReportPage && !root.querySelector('section.audience') && !root.querySelector('section.institution')) {
    setHtml(root.querySelector('.page-hero h1'), s(lang, 'reportHeroTitle').replace(/\n/g, '<br>'))
    setText(root.querySelector('.page-hero p'), s(lang, 'reportHeroDesc'))
    const heroCtas = root.querySelectorAll('.page-hero .hero-cta a')
    if (heroCtas[0]) heroCtas[0].textContent = s(lang, 'reportCtaToday')
    if (heroCtas[1]) heroCtas[1].textContent = s(lang, 'reportCtaPrograms')

    const sections = root.querySelectorAll('.subpage > section')
    // value cards section (first after hero)
    const valueSec = sections[1]
    if (valueSec) {
      setText(valueSec.querySelector('.badge'), s(lang, 'reportValueBadge'))
      setText(valueSec.querySelector('h2'), s(lang, 'reportValueTitle'))
      setText(valueSec.querySelector('.section-head p'), s(lang, 'reportValueDesc'))
      valueSec.querySelectorAll('.card').forEach((card, i) => {
        const n = i + 1
        setText(card.querySelector('h3'), s(lang, `reportValue${n}Name`))
        setText(card.querySelector('p'), s(lang, `reportValue${n}Desc`))
      })
    }

    const demos = root.querySelectorAll('.report-demo')
    if (demos[0]) {
      setText(demos[0].querySelector('.badge'), s(lang, 'reportSampleBadge'))
      setText(demos[0].querySelector('h2'), s(lang, 'reportSampleTitle'))
      setText(demos[0].querySelector('p'), s(lang, 'reportSampleDesc'))
    }
    if (demos[1]) {
      setText(demos[1].querySelector('.badge'), s(lang, 'reportDemoBadge'))
      setText(demos[1].querySelector('h3'), s(lang, 'reportDemoMonth'))
      const metrics = demos[1].querySelectorAll('.metric')
      const metricKeys = [
        ['reportMetricDays', 'reportMetricDaysVal'],
        ['reportMetricActions', 'reportMetricActionsVal'],
        ['reportMetricArea', 'reportMetricAreaVal'],
        ['reportMetricNext', 'reportMetricNextVal'],
      ] as const
      metrics.forEach((m, i) => {
        const keys = metricKeys[i]
        if (!keys) return
        setText(m.querySelector('span'), s(lang, keys[0]))
        setText(m.querySelector('b'), s(lang, keys[1]))
      })
      setText(demos[1].querySelector('.bar-label'), s(lang, 'reportBarLabel'))
    }

    const outSec = root.querySelector('section.programs')
    if (outSec) {
      setText(outSec.querySelector('.badge'), s(lang, 'reportOutBadge'))
      setText(outSec.querySelector('h2'), s(lang, 'reportOutTitle'))
      setText(outSec.querySelector('.section-head p'), s(lang, 'reportOutDesc'))
      const ths = outSec.querySelectorAll('thead th')
      ;['reportThProgram', 'reportThPeriod', 'reportThOutput'].forEach((k, i) => {
        if (ths[i]) ths[i].textContent = s(lang, k)
      })
      outSec.querySelectorAll('tbody tr').forEach((tr, i) => {
        const n = i + 1
        const tds = tr.querySelectorAll('td')
        if (tds[0]) setText(tds[0].querySelector('b') || tds[0], s(lang, `reportRow${n}Name`))
        if (tds[1]) tds[1].textContent = s(lang, `reportRow${n}Period`)
        if (tds[2]) tds[2].textContent = s(lang, `reportRow${n}Out`)
      })
    }

    const kpiSec = root.querySelector('section.process')
    if (kpiSec && isReportPage) {
      setText(kpiSec.querySelector('.badge'), s(lang, 'reportKpiBadge'))
      setText(kpiSec.querySelector('h2'), s(lang, 'reportKpiTitle'))
      setText(kpiSec.querySelector('.section-head p'), s(lang, 'reportKpiDesc'))
      kpiSec.querySelectorAll('.step').forEach((step, i) => {
        const n = i + 1
        setText(step.querySelector('strong'), s(lang, `reportKpi${n}Label`))
        setText(step.querySelector('h3'), s(lang, `reportKpi${n}Title`))
        setText(step.querySelector('p'), s(lang, `reportKpi${n}Desc`))
      })
    }

    const cta = root.querySelector('.cta-panel')
    if (cta) {
      setText(cta.querySelector('h2'), s(lang, 'reportCtaTitle'))
      setText(cta.querySelector('p'), s(lang, 'reportCtaDesc'))
      setText(cta.querySelector('a.btn'), s(lang, 'reportCtaBtn'))
    }
  }
}

export function extraT(lang: UiLang, key: string): string {
  return x(lang, key)
}

export function subpageT(lang: UiLang, key: string): string {
  return s(lang, key)
}
