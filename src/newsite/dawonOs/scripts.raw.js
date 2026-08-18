(() => {
  'use strict';
  if (!window.dawonNavigateSection) {
    window.dawonNavigateSection = (id) => {
      const key = String(id || '').replace(/^#/, '');
      const target = document.getElementById(key);
      if (!target) return;
      const topbar = document.querySelector('.dawon-os-root .topbar, .app-nav-header');
      const offset = (topbar ? topbar.getBoundingClientRect().height : 88) + 12;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      try { history.replaceState(null, '', '#' + key); } catch (e) {}
    };
  }
})();


/*
  DAWON 운영 연결 설정
  - apiBase: 회원·기록·결제 API의 HTTPS 주소. 비워두면 안전한 게스트 로컬 모드입니다.
  - 결제는 브라우저에서 카드정보를 저장하지 않고 apiBase의 /payments/checkout 응답(checkoutUrl)으로 이동합니다.
*/
window.DAWON_CONFIG = Object.assign({
  apiBase: '',
  siteUrl: 'https://www.dawon84.com',
  environment: 'production'
}, window.DAWON_CONFIG || {});



/* --- next script --- */


/* DAWON LIFE DESIGN v28.0 — core interactions */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const VERSION = '28.0';
  const KEYS = {
    theme: 'dawon_theme_v28',
    days: 'dawon_days_v28',
    precision: 'dawon_precision_v28',
    one: 'dawon_one_history_v28',
    challenge: 'dawon_challenge_v28',
    first: 'dawon_first_complete_v28'
  };
  const CONFIG = window.DAWON_CONFIG = Object.assign({
    apiBase: '',
    tossClientKey: '',
    siteUrl: 'https://www.dawon84.com',
    version: VERSION
  }, window.DAWON_CONFIG || {});

  const state = {
    mood: '',
    member: null,
    apiOnline: false,
    currentPlan: null,
    speech: null
  };

  const memoryStorage = new Map();
  let storageFallbackNotified = false;
  function storageNotice() {
    if(storageFallbackNotified)return;
    storageFallbackNotified=true;
    console.warn('DAWON: 브라우저 영구 저장을 사용할 수 없어 현재 탭의 임시 저장소를 사용합니다.');
  }
  function storageGet(key) {
    try {
      const stored=localStorage.getItem(key);
      return stored===null?(memoryStorage.get(key)??null):stored;
    } catch (_) { storageNotice(); return memoryStorage.get(key)??null; }
  }
  function storageSet(key, value) {
    const stringValue=String(value);
    memoryStorage.set(key,stringValue);
    try { localStorage.setItem(key,stringValue); return true; }
    catch (_) { storageNotice(); return false; }
  }
  function storageRemove(key) {
    memoryStorage.delete(key);
    try { localStorage.removeItem(key); } catch (_) { storageNotice(); }
  }
  function safeParse(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; }
  }
  function load(key, fallback) { return safeParse(storageGet(key), fallback); }
  function save(key, value) { return storageSet(key, JSON.stringify(value)); }
  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }
  function text(id, value) { const el = $(id); if (el) el.textContent = value; }
  function value(id, next) { const el = $(id); if (!el) return ''; if (arguments.length > 1) el.value = next ?? ''; return el.value || ''; }
  function checked(id, next) { const el = $(id); if (!el) return false; if (arguments.length > 1) el.checked = Boolean(next); return el.checked; }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, Number(n) || 0)); }
  function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  function dateLabel(key) {
    const [y, m, d] = String(key).split('-').map(Number);
    if (!y || !m || !d) return key;
    return new Intl.DateTimeFormat('ko-KR', {year:'numeric',month:'short',day:'numeric',weekday:'short'}).format(new Date(y, m - 1, d));
  }
  function addDays(date, count) { const d = new Date(date); d.setDate(d.getDate() + count); return d; }
  function download(name, content, type = 'text/plain;charset=utf-8') {
    const blob = content instanceof Blob ? content : new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  async function copyText(content) {
    try {
      await navigator.clipboard.writeText(content);
      toast('복사했습니다.');
    } catch (_) {
      const ta = document.createElement('textarea'); ta.value = content; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('복사했습니다.');
    }
  }
  let toastTimer;
  const modalFocusHistory = new WeakMap();
  const MODAL_FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function toast(message, timeout = 2300) {
    const el = $('toast'); if (!el) return;
    el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), timeout);
  }
  function openModal(elOrId) {
    const el = typeof elOrId === 'string' ? $(elOrId) : elOrId;
    if (!el) return;
    if (document.activeElement instanceof HTMLElement) modalFocusHistory.set(el, document.activeElement);
    el.inert = false;
    el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open');
    const focusable = el.querySelector(MODAL_FOCUSABLE);
    setTimeout(() => focusable?.focus(), 20);
  }
  function closeModal(elOrId) {
    const el = typeof elOrId === 'string' ? $(elOrId) : elOrId;
    if (!el) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && el.contains(active)) active.blur();
    el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); el.inert = true;
    if (el.id === 'menuModal') $('menuBtn')?.setAttribute('aria-expanded','false');
    if (!document.querySelector('.modal.open,.first-complete-overlay.open,.motion-comic-modal.open')) document.body.classList.remove('modal-open');
    const previous = modalFocusHistory.get(el);
    modalFocusHistory.delete(el);
    if (previous?.isConnected && !el.contains(previous)) setTimeout(() => previous.focus(), 20);
  }
  function showSection(id) { if (window.dawonNavigateSection) window.dawonNavigateSection(id); else { const el = $(id); if (el) el.scrollIntoView({behavior:'smooth',block:'start'}); } }
  function getDays() { return load(KEYS.days, {}); }
  function setDays(data) { return save(KEYS.days, data); }
  function getPrecision() { return load(KEYS.precision, {}); }
  function getChallenge() { return load(KEYS.challenge, null); }
  function getCurrentDay() { return getDays()[todayKey()] || collectDay(); }
  function csvCell(v) { const s = String(v ?? '').replace(/"/g, '""'); return `"${s}"`; }

  function setTheme(theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    storageSet(KEYS.theme, next);
    try { localStorage.setItem('dawon_os95_theme', next); } catch (e) {}
    const btn = $('themeBtn'); if (btn) { btn.textContent = next === 'dark' ? '☀' : '◐'; btn.setAttribute('aria-label', next === 'dark' ? '밝은 화면으로 변경' : '어두운 화면으로 변경'); }
  }
  function initTheme() {
    const stored = storageGet(KEYS.theme);
    const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(stored || preferred);
    $('themeBtn')?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  }

  function initHeader() {
    text('heroDate', new Intl.DateTimeFormat('ko-KR', {year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date()));
    const menuBtn = $('menuBtn');
    menuBtn?.addEventListener('click', () => { menuBtn.setAttribute('aria-expanded','true'); openModal('menuModal'); });
    $('closeMenu')?.addEventListener('click', () => { menuBtn?.setAttribute('aria-expanded','false'); closeModal('menuModal'); });
    $$('#menuModal a').forEach(a => a.addEventListener('click', () => closeModal('menuModal')));
    $$('.modal').forEach((el) => { if (!el.classList.contains('open')) el.inert = true; });
    $('heroGuide')?.addEventListener('click', () => speak('다원 하루설계는 오늘 바꿀 딱 한 가지를 정하고, 약 3분 동안 오늘 한 일과 감정, 내일 첫 행동을 기록하는 생활설계입니다. 완벽하게 이어가는 것보다 쉬어도 다시 시작한 경험을 기록합니다.'));
    if (!window.__dawonOsChromeBound) {
      window.__dawonOsChromeBound = true;
      document.addEventListener('click', (event) => {
        const modal = event.target.classList?.contains('modal') ? event.target : null;
        if (modal) closeModal(modal);
      });
      document.addEventListener('keydown', (event) => {
        const openModals = $$('.modal.open,.first-complete-overlay.open,.motion-comic-modal.open');
        const topModal = openModals[openModals.length - 1];
        if (event.key === 'Escape' && topModal) {
          event.preventDefault();
          closeModal(topModal);
          return;
        }
        if (event.key !== 'Tab' || !topModal) return;
        const focusable = $$(MODAL_FOCUSABLE, topModal).filter(el => el.offsetParent !== null || el === document.activeElement);
        if (!focusable.length) { event.preventDefault(); topModal.focus?.(); return; }
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
    }
    const sections = ['one','school','works'];
    if ('IntersectionObserver' in window) {
      const navRoot = document.querySelector('.dawon-os-root .nav-links');
      const navMap = new Map((navRoot ? $$('a', navRoot) : []).map(a => [a.getAttribute('href')?.replace(/^[#/]/, ''), a]));
      const obs = new IntersectionObserver(entries => {
        entries.filter(e => e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio).slice(0,1).forEach(e => {
          navMap.forEach(a => a.removeAttribute('aria-current'));
          navMap.get(e.target.id)?.setAttribute('aria-current','page');
        });
      }, {rootMargin:'-30% 0px -60%',threshold:[0,.15,.5]});
      sections.forEach(id => { const el = $(id); if (el) obs.observe(el); });
    }
  }

  const ONE_SUGGESTIONS = {
    마음:['감사한 일 한 가지를 적어봅니다.','걱정 하나를 사실과 생각으로 나누어 적습니다.','나에게 따뜻한 문장 한 줄을 건넵니다.'],
    건강:['10분 천천히 걷습니다.','물 한 잔을 마시고 어깨를 1분 풉니다.','오늘 잠들 시간을 미리 정합니다.'],
    공간:['책상 한 구역을 3분 정리합니다.','버릴 것 한 가지를 정합니다.','자주 쓰는 물건 하나의 자리를 정합니다.'],
    관계:['고마운 사람에게 짧은 안부를 보냅니다.','상대의 말을 끊지 않고 3분 듣습니다.','미뤄 둔 연락 한 통을 합니다.'],
    배움:['배운 내용 한 문장을 내 말로 적습니다.','모르는 것 하나를 10분만 확인합니다.','읽은 정보를 오늘 행동 하나로 바꿉니다.'],
    창작:['원고 한 문단을 완성합니다.','사진 한 장에 제목을 붙입니다.','30초 노래의 첫 문장을 적습니다.'],
    돈:['오늘 지출 한 건을 기록합니다.','결제 예정 한 건을 확인합니다.','투자 판단 전에 가격과 가치를 따로 적습니다.']
  };
  function currentOneAction() {
    return value('oneCustom').trim() || textValue('oneSuggestion') || ONE_SUGGESTIONS[value('oneArea')]?.[0] || '';
  }
  function textValue(id) { return $(id)?.textContent?.trim() || ''; }
  function recommendOne() {
    const area = value('oneArea') || '마음';
    const list = ONE_SUGGESTIONS[area] || ONE_SUGGESTIONS.마음;
    const current = textValue('oneSuggestion');
    const candidates = list.filter(x => x !== current);
    text('oneSuggestion', candidates[Math.floor(Math.random() * candidates.length)] || list[0]);
  }
  function recordOne(kind) {
    const action = currentOneAction();
    if (!action) return toast('오늘 할 한 가지를 먼저 적어주세요.');
    const items = load(KEYS.one, []);
    items.unshift({id:crypto.randomUUID?.() || String(Date.now()),date:new Date().toISOString(),day:todayKey(),area:value('oneArea'),action,kind});
    save(KEYS.one, items.slice(0, 180));
    value('oneCustom',''); renderOne(); renderReports();
    toast(kind === 'done' ? '오늘 한 가지의 완료 기록을 남겼습니다.' : '다시 시작한 경험을 기록했습니다.');
  }
  function renderOne() {
    const items = load(KEYS.one, []);
    const cutoff = addDays(new Date(), -30);
    const recent = items.filter(x => new Date(x.date) >= cutoff);
    text('oneDoneCount', recent.filter(x => x.kind === 'done').length);
    text('oneRestartCount', recent.filter(x => x.kind === 'restart').length);
    const box = $('oneHistory'); if (!box) return;
    box.replaceChildren();
    if (!items.length) { const e = document.createElement('div'); e.textContent='아직 오늘 한 가지 기록이 없습니다.'; box.appendChild(e); return; }
    items.slice(0,5).forEach(item => {
      const div = document.createElement('div');
      const mark = item.kind === 'done' ? '✓ 완료' : '↻ 다시 시작';
      div.textContent = `${dateLabel(item.day)} · ${mark} · ${item.action}`; box.appendChild(div);
    });
  }
  function setAction(action, scroll = true) {
    value('action', action); updateDayPreview();
    if (scroll) showSection('today');
  }
  function initOne() {
    $('oneArea')?.addEventListener('change', recommendOne);
    $('oneRecommend')?.addEventListener('click', recommendOne);
    $('oneToToday')?.addEventListener('click', () => { const action=currentOneAction(); if (!action) return toast('오늘 한 가지를 적어주세요.'); setAction(action); toast('3분 오늘설계의 실천란에 넣었습니다.'); });
    $('oneToChallenge')?.addEventListener('click', () => { const action=currentOneAction(); if (!action) return toast('실천할 한 가지를 적어주세요.'); value('challengeTitle',action); showSection('challenge'); toast('7일 실천 이름에 넣었습니다.'); });
    $('oneDone')?.addEventListener('click', () => recordOne('done'));
    $('oneRestart')?.addEventListener('click', () => recordOne('restart'));
    recommendOne(); renderOne();
  }

  function collectDay() {
    return {
      date: todayKey(), updatedAt: new Date().toISOString(),
      done: value('done').trim(), mood: state.mood, action: value('action').trim(),
      tomorrow: value('tomorrow').trim(), selfWord: value('selfWord').trim(),
      area: value('area') || '나', energy: Number(value('energy') || 6),
      result: value('result').trim(), learn: value('learn').trim(), memo: value('memo').trim()
    };
  }
  function dayScore(day) {
    const core = [day.done,day.mood,day.action,day.tomorrow,day.selfWord];
    return core.reduce((sum,x)=>sum+(String(x||'').trim()?20:0),0);
  }
  function daySummary(day = collectDay()) {
    const lines = [];
    if (day.done) lines.push(`확인 · ${day.done}`);
    if (day.mood) lines.push(`감정 · ${day.mood}${day.energy ? ` · 에너지 ${day.energy}/10` : ''}`);
    if (day.action) lines.push(`오늘 하나 · ${day.action}`);
    if (day.result) lines.push(`결과 · ${day.result}`);
    if (day.learn) lines.push(`배움 · ${day.learn}`);
    if (day.tomorrow) lines.push(`내일 첫 행동 · ${day.tomorrow}`);
    if (day.selfWord) lines.push(`나에게 · ${day.selfWord}`);
    if (day.memo) lines.push(`메모 · ${day.memo}`);
    return lines.join('\n') || '핵심 5항목을 입력하면 3분 생활설계 요약이 만들어집니다.';
  }
  function updateDayPreview() {
    const day = collectDay(); const score = dayScore(day);
    text('energyValue',day.energy); text('dayScore',score); text('cardDate',dateLabel(todayKey()));
    text('cardTitle', day.action ? `오늘의 한 가지 · ${day.action}` : '오늘의 핵심을 확인합니다');
    text('summary',daySummary(day));
    const ring=$('scoreRing'); if(ring) ring.style.setProperty('--score',score);
    [['flow1',day.done||day.mood],['flow2',day.action],['flow3',day.result],['flow4',day.learn],['flow5',day.tomorrow]].forEach(([id,on])=>$(id)?.classList.toggle('on',Boolean(on)));
  }
  function fillDay(day = {}) {
    ['done','action','tomorrow','selfWord','result','learn','memo'].forEach(id => value(id,day[id] || ''));
    value('area',day.area || '나'); value('energy',day.energy || 6); state.mood = day.mood || '';
    $$('.mood').forEach(btn=>btn.classList.toggle('active',btn.dataset.mood===state.mood)); updateDayPreview();
  }
  function saveDay() {
    const day=collectDay();
    if (!day.done && !day.mood && !day.action && !day.tomorrow && !day.selfWord) return toast('핵심 항목 가운데 한 가지 이상을 입력해 주세요.');
    const days=getDays(); days[day.date]=day; const persisted=setDays(days);
    text('dayStatus',persisted?`${dateLabel(day.date)} 기록을 이 브라우저에 저장했습니다. 회원 서버가 연결되면 동기화할 수 있습니다.`:`${dateLabel(day.date)} 기록을 현재 탭의 임시 저장소에 보관했습니다. 브라우저 저장 권한을 확인해 주세요.`);
    renderReports(); renderSchool();
    if (!storageGet(KEYS.first)) {
      storageSet(KEYS.first,'1');
      openModal('firstCompleteOverlay');
    } else {
      $('firstUnlockChip')?.classList.add('show'); setTimeout(()=>$('firstUnlockChip')?.classList.remove('show'),3000);
    }
    toast('오늘설계를 완료했습니다.');
  }
  function sampleDay() {
    state.mood='감사';
    fillDay({done:'아침 산책을 하고 미뤄 둔 원고 한 문단을 정리했습니다.',mood:'감사',action:'저녁 식사 후 책상 3분 정리',tomorrow:'아침에 원고 파일을 먼저 열기',selfWord:'완벽하지 않아도 오늘 한 걸음은 분명하다.',area:'생활',energy:7,result:'정리할 공간이 보이니 마음도 가벼워졌습니다.',learn:'작게 시작하면 다음 행동이 쉬워집니다.',memo:'내일은 시작 시간을 정해 두기'});
    toast('3분 예시를 넣었습니다. 내 내용으로 바꿔보세요.');
  }
  function clearDay() {
    if (!confirm('현재 입력만 지울까요? 이미 저장한 기록은 유지됩니다.')) return;
    state.mood=''; fillDay({energy:6,area:'나'}); text('dayStatus','입력란을 비웠습니다. 저장된 이전 기록은 유지됩니다.');
  }
  function speak(content) {
    if (!('speechSynthesis' in window)) return toast('이 브라우저는 음성 읽기를 지원하지 않습니다.');
    speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(content); u.lang='ko-KR'; u.rate=.96; state.speech=u; speechSynthesis.speak(u);
  }
  function initSpeechInput() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    $$('.mic-btn').forEach(btn => btn.addEventListener('click', () => {
      if (!Recognition) return toast('Chrome 또는 Edge의 음성입력을 이용해 주세요.');
      const target=$(btn.dataset.target); if(!target) return;
      const rec=new Recognition(); rec.lang='ko-KR'; rec.interimResults=false; rec.maxAlternatives=1;
      btn.disabled=true; btn.textContent='듣는 중…';
      rec.onresult=e=>{ const heard=e.results?.[0]?.[0]?.transcript||''; target.value = target.value ? `${target.value} ${heard}` : heard; target.dispatchEvent(new Event('input',{bubbles:true})); };
      rec.onerror=()=>toast('음성을 인식하지 못했습니다. 다시 시도해 주세요.');
      rec.onend=()=>{btn.disabled=false;btn.textContent='🎙 음성';}; rec.start();
    }));
  }
  function initDay() {
    $$('.mood').forEach(btn=>btn.addEventListener('click',()=>{state.mood=btn.dataset.mood||'';$$('.mood').forEach(x=>x.classList.toggle('active',x===btn));updateDayPreview();}));
    ['done','action','tomorrow','selfWord','area','energy','result','learn','memo'].forEach(id=>$(id)?.addEventListener('input',updateDayPreview));
    $('saveDay')?.addEventListener('click',saveDay); $('sampleDay')?.addEventListener('click',sampleDay); $('clearDay')?.addEventListener('click',clearDay);
    $('copySummary')?.addEventListener('click',()=>copyText(daySummary())); $('speakSummary')?.addEventListener('click',()=>speak(daySummary()));
    const today=getDays()[todayKey()]; if(today) fillDay(today); else updateDayPreview();
    initSpeechInput();
  }

  const P_DOMAINS = [
    ['Emotion','감정'],['Relation','관계'],['Money','돈'],['Health','건강'],['Creation','창작'],['Business','사업']
  ];
  function collectPrecision() {
    const domains={};
    P_DOMAINS.forEach(([key,label])=>domains[key]={label,score:Number(value(`p${key}`)||6),note:value(`p${key}Note`).trim()});
    return {date:todayKey(),updatedAt:new Date().toISOString(),domains,priority:value('pPriority').trim(),reason:value('pReason').trim(),action:value('pAction').trim(),obstacle:value('pObstacle').trim(),method:value('pMethod').trim(),alternative:value('pAlternative').trim(),tomorrow:value('pTomorrow').trim(),insight:value('pInsight').trim()};
  }
  function precisionAnalysis(data=collectPrecision()) {
    const entries=Object.values(data.domains); const avg=entries.reduce((s,x)=>s+x.score,0)/entries.length; const lowest=[...entries].sort((a,b)=>a.score-b.score)[0];
    return {avg,lowest};
  }
  function precisionSummary(data=collectPrecision()) {
    const {avg,lowest}=precisionAnalysis(data); const lines=[`6영역 평균 · ${avg.toFixed(1)}/10`,`먼저 살필 영역 · ${lowest.label} ${lowest.score}/10`];
    if(data.priority)lines.push(`오늘 가장 중요한 한 가지 · ${data.priority}`); if(data.action)lines.push(`오늘 행동 · ${data.action}`); if(data.obstacle)lines.push(`방해요인 · ${data.obstacle}`); if(data.method)lines.push(`방안·방도 · ${data.method}`); if(data.alternative)lines.push(`대안 · ${data.alternative}`); if(data.tomorrow)lines.push(`내일 첫 행동 · ${data.tomorrow}`); if(data.insight)lines.push(`알게 된 점 · ${data.insight}`); return lines.join('\n');
  }
  function updatePrecisionUI() {
    const data=collectPrecision(); const {avg,lowest}=precisionAnalysis(data); text('pAverage',avg.toFixed(1));text('pLowest',lowest.label);text('precisionSummaryText',precisionSummary(data));
    P_DOMAINS.forEach(([key])=>text(`p${key}Value`,value(`p${key}`)));
    const box=$('precisionBars'); if(box){box.replaceChildren();Object.values(data.domains).forEach(x=>box.appendChild(makeBar(x.label,x.score*10,`${x.score}`)));}
  }
  function makeBar(label,percent,endText='') {
    const row=document.createElement('div');row.className='bar-row';
    const l=document.createElement('span');l.textContent=label;const track=document.createElement('div');track.className='bar-track';const i=document.createElement('i');i.style.width=`${clamp(percent,0,100)}%`;track.appendChild(i);const end=document.createElement('b');end.textContent=endText;row.append(l,track,end);return row;
  }
  function fillPrecision(data={}) {
    P_DOMAINS.forEach(([key])=>{value(`p${key}`,data.domains?.[key]?.score||6);value(`p${key}Note`,data.domains?.[key]?.note||'');});
    ['priority','reason','action','obstacle','method','alternative','tomorrow','insight'].forEach(k=>value(`p${k[0].toUpperCase()+k.slice(1)}`,data[k]||'')); updatePrecisionUI();
  }
  function savePrecision() {
    const data=collectPrecision();
    if(!data.priority&&!data.action&&!Object.values(data.domains).some(x=>x.note))return toast('우선순위나 영역별 메모를 한 가지 이상 적어주세요.');
    const all=getPrecision();all[data.date]=data;save(KEYS.precision,all);text('precisionStatus',`${dateLabel(data.date)} 정밀설계를 저장했습니다.`);renderPrecisionHistory();renderReports();toast('정밀설계를 저장했습니다.');
  }
  function renderPrecisionHistory() {
    const all=getPrecision();const items=Object.values(all).sort((a,b)=>b.date.localeCompare(a.date));text('precisionCount',`${items.length}건`);const box=$('precisionHistory');if(!box)return;box.replaceChildren();
    if(!items.length){const p=document.createElement('div');p.className='precision-history-item';p.textContent='아직 저장된 정밀설계가 없습니다.';box.appendChild(p);return;}
    items.slice(0,5).forEach(item=>{const btn=document.createElement('button');btn.type='button';btn.className='precision-history-item';const a=precisionAnalysis(item);btn.innerHTML=`<b>${escapeHtml(dateLabel(item.date))} · 평균 ${a.avg.toFixed(1)}</b><span>${escapeHtml(item.priority||`우선 영역: ${a.lowest.label}`)}</span>`;btn.addEventListener('click',()=>{fillPrecision(item);showSection('precision');});box.appendChild(btn);});
  }
  function samplePrecision(){fillPrecision({domains:{Emotion:{score:6,note:'해야 할 일이 많아 마음이 조금 조급합니다.'},Relation:{score:7,note:'가족과 짧게라도 대화할 시간이 필요합니다.'},Money:{score:6,note:'오늘 지출을 확인합니다.'},Health:{score:5,note:'수면이 부족해 오후 에너지가 떨어집니다.'},Creation:{score:8,note:'원고 방향은 분명합니다.'},Business:{score:6,note:'홈페이지 첫 행동을 더 단순하게 만듭니다.'}},priority:'수면과 에너지를 먼저 회복한다.',reason:'몸의 에너지가 있어야 창작과 관계도 이어갈 수 있습니다.',action:'오늘 밤 11시 전에 휴대전화를 내려놓고 잠자리를 준비한다.',obstacle:'늦은 시간까지 자료를 보는 습관',method:'10시 30분에 알림을 설정하고 책상 정리를 시작한다.',alternative:'바로 잠들기 어렵다면 조명을 낮추고 종이책을 10분 읽는다.',tomorrow:'기상 직후 수면 시간을 기록한다.',insight:'할 일을 더 늘리기보다 회복 시간을 먼저 확보해야 합니다.'});toast('정밀설계 예시를 넣었습니다.');}
  function clearPrecision(){if(!confirm('현재 정밀설계 입력을 비울까요? 저장 기록은 유지됩니다.'))return;fillPrecision({});}
  function initPrecision(){P_DOMAINS.forEach(([key])=>{ $(`p${key}`)?.addEventListener('input',updatePrecisionUI);$(`p${key}Note`)?.addEventListener('input',updatePrecisionUI);});['pPriority','pReason','pAction','pObstacle','pMethod','pAlternative','pTomorrow','pInsight'].forEach(id=>$(id)?.addEventListener('input',updatePrecisionUI));$('savePrecision')?.addEventListener('click',savePrecision);$('samplePrecision')?.addEventListener('click',samplePrecision);$('clearPrecision')?.addEventListener('click',clearPrecision);$('copyPrecision')?.addEventListener('click',()=>copyText(precisionSummary()));$('exportPrecision')?.addEventListener('click',()=>download(`dawon-precision-${todayKey()}.json`,JSON.stringify(getPrecision(),null,2),'application/json'));$('precisionToChallenge')?.addEventListener('click',()=>{const a=value('pAction').trim()||value('pPriority').trim();if(!a)return toast('7일 동안 반복할 행동을 먼저 적어주세요.');value('challengeTitle',a);showSection('challenge');toast('정밀설계 행동을 7일 실천으로 보냈습니다.');});const today=getPrecision()[todayKey()];if(today)fillPrecision(today);else updatePrecisionUI();renderPrecisionHistory();}

  function createChallenge(title,reason,reward){const now=new Date();return{title,reason,reward,startDate:todayKey(now),days:Array.from({length:7},(_,i)=>({date:todayKey(addDays(now,i)),done:false})),updatedAt:new Date().toISOString()};}
  function renderChallenge(){const c=getChallenge();const box=$('challengeDays');if(!box)return;box.replaceChildren();if(!c){text('challengeName','아직 시작한 실천설계가 없습니다');text('challengeCount','0/7');text('challengeMessage','실천 이름을 정하고 첫날을 체크해 보세요.');$('challengeBar')?.style.setProperty('width','0%');return;}text('challengeName',c.title);const done=c.days.filter(x=>x.done).length;text('challengeCount',`${done}/7`);$('challengeBar')?.style.setProperty('width',`${done/7*100}%`);text('challengeMessage',done===7?`7일 실천을 마쳤습니다. 보상: ${c.reward||'나를 충분히 칭찬하기'}`:done>=5?'씨앗과정 성공 기준 5일을 달성했습니다.':`${7-done}번의 작은 실천 기회가 남았습니다.`);c.days.forEach((day,index)=>{const btn=document.createElement('button');btn.type='button';btn.className=`day-check${day.done?' checked':''}`;btn.innerHTML=`<b>${day.done?'✓':index+1}</b>${escapeHtml(day.date.slice(5))}`;btn.setAttribute('aria-pressed',String(day.done));btn.addEventListener('click',()=>{const next=getChallenge();next.days[index].done=!next.days[index].done;next.updatedAt=new Date().toISOString();save(KEYS.challenge,next);renderChallenge();renderReports();renderSchool();});box.appendChild(btn);});}
  function initChallenge(){$('saveChallenge')?.addEventListener('click',()=>{const title=value('challengeTitle').trim();if(!title)return toast('7일 동안 반복할 실천 이름을 적어주세요.');save(KEYS.challenge,createChallenge(title,value('challengeReason').trim(),value('challengeReward').trim()));renderChallenge();renderReports();toast('7일 실천설계를 시작했습니다.');});$('challengeSample')?.addEventListener('click',()=>{value('challengeTitle','매일 10분 걷기');value('challengeReason','몸과 마음의 에너지를 생활 속에서 회복하기 위해');value('challengeReward','좋아하는 책 한 권 읽기');});$('resetChallenge')?.addEventListener('click',()=>{if(confirm('현재 7일 실천 기록을 초기화할까요?')){storageRemove(KEYS.challenge);renderChallenge();renderReports();}});$('firstStart7')?.addEventListener('click',()=>{closeModal('firstCompleteOverlay');const action=value('action').trim();if(action)value('challengeTitle',action);showSection('challenge');});$('firstExploreLater')?.addEventListener('click',()=>closeModal('firstCompleteOverlay'));renderChallenge();}

  function renderReports(){const days=getDays();const items=Object.values(days).sort((a,b)=>b.date.localeCompare(a.date));const one=load(KEYS.one,[]);const restarts=one.filter(x=>x.kind==='restart').length;const actions=items.filter(x=>x.action).length;const avg=items.length?Math.round(items.reduce((s,x)=>s+dayScore(x),0)/items.length):0;const freq={};items.forEach(x=>{const k=(x.action||'').trim();if(k)freq[k]=(freq[k]||0)+1;});const top=Object.entries(freq).sort((a,b)=>b[1]-a[1])[0]?.[0]||'-';text('metricCount',items.length);text('metricStreak',`${restarts}회`);text('metricTopHabit',top.length>18?`${top.slice(0,18)}…`:top);text('metricActions',actions);text('metricAvg',avg);text('heroRecords',items.length);text('heroStreak',`${restarts}회`);
    const c=getChallenge();const repeat=c?Math.round(c.days.filter(x=>x.done).length/7*100):0;const last30=items.filter(x=>new Date(`${x.date}T00:00:00`)>=addDays(new Date(),-29));const recordRate=Math.round(last30.length/30*100);const actionRate=items.length?Math.round(actions/items.length*100):0;const resultRate=items.length?Math.round(items.filter(x=>x.result).length/items.length*100):0;const restartScore=Math.min(100,restarts*10);const pi=Math.round(recordRate*.3+actionRate*.3+resultRate*.2+repeat*.15+restartScore*.05);text('practiceIndexTotal',pi);text('heroScore',pi);[['piRecord',recordRate],['piAction',actionRate],['piResult',resultRate],['piRepeat',repeat]].forEach(([id,n])=>{text(id,`${n}%`);$(`${id}Bar`)?.style.setProperty('width',`${n}%`);});text('piRestart',`${restarts}회`);$('piRestartBar')?.style.setProperty('width',`${restartScore}%`);
    const history=$('history');if(history){history.replaceChildren();if(!items.length){const d=document.createElement('div');d.className='empty';d.textContent='아직 저장된 기록이 없습니다.';history.appendChild(d);}items.slice(0,10).forEach(item=>{const b=document.createElement('button');b.type='button';b.className='history-item';b.innerHTML=`<b>${escapeHtml(dateLabel(item.date))} · ${escapeHtml(item.mood||'감정 미선택')}</b><small>${escapeHtml(item.action||item.done||'기록 확인')}</small>`;b.addEventListener('click',()=>{fillDay(item);showSection('today');});history.appendChild(b);});}
    const area={};items.forEach(x=>area[x.area||'나']=(area[x.area||'나']||0)+1);const max=Math.max(1,...Object.values(area));const bars=$('areaBars');if(bars){bars.replaceChildren();if(!Object.keys(area).length){const e=document.createElement('div');e.className='empty';e.textContent='기록이 쌓이면 생활영역 분포가 표시됩니다.';bars.appendChild(e);}Object.entries(area).sort((a,b)=>b[1]-a[1]).forEach(([k,n])=>bars.appendChild(makeBar(k,n/max*100,String(n))));}
    const ps=Object.values(getPrecision()).sort((a,b)=>b.date.localeCompare(a.date));text('precisionReportCount',ps.length);if(ps.length){const a=precisionAnalysis(ps[0]);text('precisionReportAvg',a.avg.toFixed(1));text('precisionReportLowest',a.lowest.label);text('precisionReportPriority',ps[0].priority||'-');}else{text('precisionReportAvg','-');text('precisionReportLowest','-');text('precisionReportPriority','-');}
  }
  function renderSchool(){const dates=Object.keys(getDays()).sort();const now=new Date();[[7,'school7Bar','school7Text',5],[30,'school30Bar','school30Text',20],[90,'school90Bar','school90Text',60],[365,'school365Bar','school365Text',240]].forEach(([span,barId,textId,target])=>{const count=dates.filter(k=>new Date(`${k}T00:00:00`)>=addDays(now,-(span-1))).length;$(barId)?.style.setProperty('width',`${Math.min(100,count/target*100)}%`);text(textId,`${count}일 기록 · 성공 기준 ${target}일`);});}
  function initSchool(){$$('[data-lesson]').forEach(btn=>btn.addEventListener('click',()=>{setAction(btn.dataset.lesson);toast('대표 작품의 질문을 오늘 행동에 연결했습니다.');}));$$('[data-flower]').forEach(btn=>btn.addEventListener('click',()=>{value('selfWord',btn.dataset.flower);updateDayPreview();showSection('today');toast('꽃인물화 질문을 오늘설계에 넣었습니다.');}));[['makeLifeBook',30,'30일 생활책'],['makeGrowthBook',90,'90일 성장책'],['makeLifeAlmanac',365,'365일 생활연감']].forEach(([id,span,title])=>$(id)?.addEventListener('click',()=>makeLifeBook(span,title)));renderSchool();}
  function makeLifeBook(span,title){const items=Object.values(getDays()).sort((a,b)=>a.date.localeCompare(b.date)).slice(-span);if(!items.length)return toast('먼저 하루 기록을 한 건 이상 저장해 주세요.');const rows=items.map(x=>`<article><h2>${escapeHtml(dateLabel(x.date))}</h2><p><b>오늘 한 일</b> ${escapeHtml(x.done||'-')}</p><p><b>감정</b> ${escapeHtml(x.mood||'-')}</p><p><b>오늘 하나</b> ${escapeHtml(x.action||'-')}</p><p><b>결과</b> ${escapeHtml(x.result||'-')}</p><p><b>배움</b> ${escapeHtml(x.learn||'-')}</p><p><b>내일 첫 행동</b> ${escapeHtml(x.tomorrow||'-')}</p></article>`).join('');const html=`<!doctype html><html lang="ko"><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{max-width:820px;margin:40px auto;font-family:system-ui;line-height:1.7;color:#222}header{padding:60px 30px;background:#143b31;color:#fff;border-radius:24px}article{padding:25px 5px;border-bottom:1px solid #ddd}h1{font-size:42px}h2{font-size:21px}b{color:#0c8877}@media print{body{margin:0}article{break-inside:avoid}}</style><header><small>DAWON LIFE DESIGN BOOK</small><h1>${escapeHtml(title)}</h1><p>${items.length}일의 기록으로 만든 현재까지의 생활책</p></header>${rows}<script>window.onload=()=>window.print()<\/script></html>`;download(`다원_${title}_${todayKey()}.html`,html,'text/html;charset=utf-8');toast(`${title} 파일을 만들었습니다.`);}
  function initExports(){$('exportCsv')?.addEventListener('click',()=>{const items=Object.values(getDays()).sort((a,b)=>a.date.localeCompare(b.date));const header=['날짜','오늘 한 일','감정','영역','에너지','오늘 하나','결과','배움','내일 첫 행동','나에게 한마디','메모'];const rows=items.map(x=>[x.date,x.done,x.mood,x.area,x.energy,x.action,x.result,x.learn,x.tomorrow,x.selfWord,x.memo].map(csvCell).join(','));download(`dawon-day-records-${todayKey()}.csv`,`\ufeff${header.map(csvCell).join(',')}\n${rows.join('\n')}`,'text/csv;charset=utf-8');});$('exportJson')?.addEventListener('click',()=>download(`dawon-backup-${todayKey()}.json`,JSON.stringify({version:VERSION,exportedAt:new Date().toISOString(),days:getDays(),precision:getPrecision(),one:load(KEYS.one,[]),challenge:getChallenge()},null,2),'application/json'));$('importJson')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.days)setDays(data.days);if(data.precision)save(KEYS.precision,data.precision);if(data.one)save(KEYS.one,data.one);if(data.challenge)save(KEYS.challenge,data.challenge);renderAll();toast('백업 기록을 불러왔습니다.');}catch(_){toast('올바른 다원 백업 JSON 파일이 아닙니다.');}e.target.value='';});}

  async function apiFetch(path, options={}){
    if(!CONFIG.apiBase)throw new Error('SERVER_NOT_CONFIGURED');
    const headers=new Headers(options.headers||{});
    headers.set('Accept','application/json');
    if(options.body && !(options.body instanceof FormData) && !headers.has('Content-Type'))headers.set('Content-Type','application/json');
    const method=String(options.method||'GET').toUpperCase();
    const csrf=document.querySelector('meta[name="csrf-token"]')?.content;
    if(csrf && !['GET','HEAD','OPTIONS'].includes(method))headers.set('X-CSRF-Token',csrf);
    const res=await fetch(`${CONFIG.apiBase.replace(/\/$/,'')}${path}`,{...options,credentials:'include',headers});
    const type=res.headers.get('content-type')||'';
    const data=type.includes('application/json')?await res.json().catch(()=>({})): {message:await res.text().catch(()=>'')};
    if(!res.ok)throw new Error(data.message||`요청 실패 (${res.status})`);
    return data;
  }
  function authPanels(which){['loginPanel','registerPanel','forgotPanel','resetPanel'].forEach(id=>{const el=$(id);if(el)el.hidden=id!==which;});$('authGuestPanels')?.toggleAttribute('hidden',which==='forgotPanel'||which==='resetPanel');if(which==='loginPanel'||which==='registerPanel')$('authGuestPanels')?.removeAttribute('hidden');}
  function setMember(member){state.member=member||null;const logged=Boolean(member);text('accountName',logged?(member.name||member.email||'회원'):'게스트');text('accountBtn',logged?'내 계정':'로그인');$('cloudDot')?.classList.toggle('online',logged&&state.apiOnline);$('authGuestPanels')?.toggleAttribute('hidden',logged);$('forgotPanel')?.toggleAttribute('hidden',true);$('resetPanel')?.toggleAttribute('hidden',true);$('memberPanel')?.toggleAttribute('hidden',!logged);if(logged){text('memberName',member.name||'회원');text('memberEmail',member.email||'');value('checkoutName',member.name||'');value('checkoutEmail',member.email||'');}window.dawonSetAccessState?.({authenticated:logged,active:Boolean(member?.subscription?.active),planName:member?.subscription?.planName||'무료',endsAt:member?.subscription?.endsAt||null});}
  function authMessage(msg,isError=false){const el=$('authMessage');if(el){el.textContent=msg;el.style.color=isError?'var(--red)':'var(--green-2)';}}
  async function checkSession(){if(!CONFIG.apiBase){text('authServerState','회원 서버 미연결 · 게스트 로컬 저장');text('syncStatus','현재 파일은 게스트 기록을 이 브라우저에 저장합니다. 실운영 회원가입·기기 동기화는 API 서버 주소를 연결해야 합니다.');state.apiOnline=false;setMember(null);return;}try{const data=await apiFetch('/auth/me',{method:'GET',headers:{}});state.apiOnline=true;text('authServerState','회원 서버 연결됨');setMember(data.user||data.member||null);}catch(e){state.apiOnline=e.message!=='SERVER_NOT_CONFIGURED';text('authServerState',state.apiOnline?'로그인 필요':'회원 서버 연결 실패');setMember(null);}}
  function initAuth(){const open=()=>{openModal('authModal');state.member?null:authPanels('loginPanel');};$('closeAuth')?.addEventListener('click',()=>closeModal('authModal'));$('showLoginPanel')?.addEventListener('click',()=>authPanels('loginPanel'));$('showRegisterPanel')?.addEventListener('click',()=>authPanels('registerPanel'));$('showForgotPanel')?.addEventListener('click',()=>authPanels('forgotPanel'));
    $('registerPassword')?.addEventListener('input',()=>{const p=value('registerPassword');let score=0;if(p.length>=15)score+=35;if(/[A-Z]/.test(p)&&/[a-z]/.test(p))score+=20;if(/\d/.test(p))score+=20;if(/[^\w]/.test(p))score+=25;const meter=$('passwordMeter');if(meter){meter.style.width=`${score}%`;meter.style.background=score>=80?'#31a66a':score>=55?'#d49f2c':'var(--red)';}});
    $('checkEmailBtn')?.addEventListener('click',async()=>{const email=value('registerEmail').trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email))return text('emailCheckStatus','올바른 이메일을 입력해 주세요.');if(!CONFIG.apiBase)return text('emailCheckStatus','서버 연결 후 실제 중복 확인을 사용할 수 있습니다.');try{const d=await apiFetch(`/auth/check-email?email=${encodeURIComponent(email)}`,{method:'GET',headers:{}});text('emailCheckStatus',d.available?'사용 가능한 이메일입니다.':'이미 가입된 이메일입니다.');}catch(e){text('emailCheckStatus',e.message);}});
    $('loginSubmit')?.addEventListener('click',async()=>{const email=value('loginEmail').trim().toLowerCase(),password=value('loginPassword');if(!/^\S+@\S+\.\S+$/.test(email))return authMessage('올바른 이메일을 입력해 주세요.',true);if(!password)return authMessage('비밀번호를 입력해 주세요.',true);if(!CONFIG.apiBase)return authMessage('회원 서버가 연결되지 않았습니다. 게스트 로컬 기능을 먼저 이용해 주세요.',true);try{const d=await apiFetch('/auth/login',{method:'POST',body:JSON.stringify({email,password})});setMember(d.user||d.member);authMessage('로그인했습니다.');setTimeout(()=>closeModal('authModal'),500);}catch(e){authMessage(e.message,true);}});
    $('registerSubmit')?.addEventListener('click',async()=>{const name=value('registerName').trim(),email=value('registerEmail').trim().toLowerCase(),p=value('registerPassword'),pc=value('registerPasswordConfirm');if(!name)return authMessage('이름을 입력해 주세요.',true);if(!/^\S+@\S+\.\S+$/.test(email))return authMessage('올바른 이메일을 입력해 주세요.',true);if(p.length<15)return authMessage('비밀번호는 15자 이상이어야 합니다.',true);if(p!==pc)return authMessage('비밀번호 확인이 일치하지 않습니다.',true);if(!['registerAgreeTerms','registerAgreePrivacy','registerAge14','registerAgreeRefund'].every(id=>checked(id)))return authMessage('필수 동의 항목을 모두 확인해 주세요.',true);if(!CONFIG.apiBase)return authMessage('회원 서버 연결 후 가입할 수 있습니다. 비밀번호는 브라우저에 저장하지 않습니다.',true);try{const agreedAt=new Date().toISOString();const d=await apiFetch('/auth/register',{method:'POST',body:JSON.stringify({name,email,password:p,agreements:{terms:true,privacy:true,age14:true,refund:true,policyVersion:'2026-08-17',agreedAt}})});setMember(d.user||d.member);authMessage('가입하고 로그인했습니다.');setTimeout(()=>closeModal('authModal'),500);}catch(e){authMessage(e.message,true);}});
    $('forgotSubmit')?.addEventListener('click',async()=>{const email=value('forgotEmail').trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email))return authMessage('올바른 이메일을 입력해 주세요.',true);if(!CONFIG.apiBase)return authMessage('비밀번호 재설정 메일은 서버 연결 후 사용할 수 있습니다.',true);try{await apiFetch('/auth/forgot-password',{method:'POST',body:JSON.stringify({email})});authMessage('등록된 계정이면 재설정 안내를 보냈습니다.');}catch(e){authMessage(e.message,true);}});
    $('resetSubmit')?.addEventListener('click',async()=>{const p=value('resetPassword');if(p.length<15||p!==value('resetPasswordConfirm'))return authMessage('15자 이상의 같은 비밀번호를 두 번 입력해 주세요.',true);const token=new URLSearchParams(location.search).get('reset_token');if(!token)return authMessage('유효한 재설정 링크가 필요합니다.',true);try{await apiFetch('/auth/reset-password',{method:'POST',body:JSON.stringify({token,password:p})});authMessage('비밀번호를 변경했습니다. 로그인해 주세요.');authPanels('loginPanel');}catch(e){authMessage(e.message,true);}});
    $('logoutBtn')?.addEventListener('click',async()=>{try{if(CONFIG.apiBase)await apiFetch('/auth/logout',{method:'POST',body:'{}'});}catch(_){ }setMember(null);closeModal('authModal');toast('로그아웃했습니다.');});
    $('pushCloud')?.addEventListener('click',async()=>{if(!state.member)return authMessage('먼저 로그인해 주세요.',true);const sensitive=checked('sensitiveCloudConsent');try{await apiFetch('/records/sync',{method:'PUT',body:JSON.stringify({days:getDays(),one:load(KEYS.one,[]),challenge:getChallenge(),precision:sensitive?getPrecision():null,sensitiveConsent:sensitive})});text('cloudUpdatedAt',new Date().toLocaleString('ko-KR'));authMessage('현재 기록을 서버에 동기화했습니다.');}catch(e){authMessage(e.message,true);}});
    $('pullCloud')?.addEventListener('click',async()=>{if(!state.member)return authMessage('먼저 로그인해 주세요.',true);try{const d=await apiFetch('/records',{method:'GET',headers:{}});if(d.days)setDays(d.days);if(d.one)save(KEYS.one,d.one);if(d.challenge)save(KEYS.challenge,d.challenge);if(d.precision)save(KEYS.precision,d.precision);renderAll();authMessage('서버 기록을 불러왔습니다.');}catch(e){authMessage(e.message,true);}});
    $('deleteAccountBtn')?.addEventListener('click',async()=>{const password=value('deletePassword');if(!password)return authMessage('현재 비밀번호를 입력해 주세요.',true);if(value('deleteConfirmText').trim()!=='탈퇴합니다')return authMessage('확인 문구에 “탈퇴합니다”를 입력해 주세요.',true);if(!confirm('회원정보와 서버 기록을 삭제할까요? 이 작업은 되돌릴 수 없습니다.'))return;try{await apiFetch('/auth/account',{method:'DELETE',body:JSON.stringify({password})});setMember(null);closeModal('authModal');toast('회원탈퇴 처리가 완료되었습니다.');}catch(e){authMessage(e.message,true);}});
    [['loginPassword','loginSubmit'],['registerPasswordConfirm','registerSubmit'],['forgotEmail','forgotSubmit'],['resetPasswordConfirm','resetSubmit']].forEach(([field,button])=>$(field)?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();$(button)?.click();}}));
    const token=new URLSearchParams(location.search).get('reset_token');if(token){openModal('authModal');authPanels('resetPanel');}checkSession();}

  function initQuickTools(){$$('.quick-tools [data-create]').forEach(btn=>btn.addEventListener('click',()=>{const day=collectDay();value('ideaTitle',day.action||'오늘의 생활설계');value('ideaSource',daySummary(day));const target=$(`typeGrid`)?.querySelector(`[data-type="${btn.dataset.create}"]`);target?.click();showSection('studio');setTimeout(()=>$('generateContent')?.click(),150);toast('오늘 기록을 창작스튜디오에 연결했습니다.');}));}
  function renderAll(){renderOne();renderChallenge();renderPrecisionHistory();renderReports();renderSchool();updateDayPreview();updatePrecisionUI();window.dispatchEvent(new CustomEvent('dawon-data-changed'));}

  window.Dawon = { $, $$, CONFIG, KEYS, state, load, save, storageGet, storageSet, storageRemove, escapeHtml, todayKey, dateLabel, addDays, download, copyText, toast, openModal, closeModal, showSection, getDays, setDays, getPrecision, getChallenge, getCurrentDay, collectDay, daySummary, setAction, renderAll, apiFetch, setMember, checkSession, speak, makeBar };

  initTheme(); initHeader(); initOne(); initDay(); initPrecision(); initChallenge(); initSchool(); initExports(); initAuth(); initQuickTools(); renderReports();
})();



/* --- next script --- */


/* DAWON LIFE DESIGN v28.0 — library, studio, video, policies and checkout */
(() => {
  'use strict';
  const D = window.Dawon;
  if (!D) throw new Error('DAWON core must load before features.');
  const {$, $$, CONFIG, escapeHtml, load, save, download, copyText, toast, openModal, closeModal, showSection, todayKey, dateLabel, getDays, getPrecision, getChallenge, getCurrentDay, daySummary, apiFetch} = D;

  const ACCESS_DEFAULT = {authenticated:false,active:false,planName:'무료',endsAt:null};
  window.DAWON_ACCESS_STATE = Object.assign({}, ACCESS_DEFAULT, window.DAWON_ACCESS_STATE || {});
  window.dawonSetAccessState = function(next) {
    window.DAWON_ACCESS_STATE = Object.assign({}, window.DAWON_ACCESS_STATE, next || {});
    window.dispatchEvent(new CustomEvent('dawon-subscription-changed', {detail:window.DAWON_ACCESS_STATE}));
  };

  /* ------------------------------------------------------------------
     Works library — 51 slots × 3 formats, real-path audit and admin UI
  ------------------------------------------------------------------- */
  const CATALOG_KEY = 'dawon_catalog_v28';
  const STATUS_KEY = 'dawon_catalog_status_v28';
  const FORMAT = {
    ebook:{label:'전자책',dir:'works/ebook',icon:'📘'},
    audio:{label:'오디오북 낭독본',dir:'works/audio',icon:'🎧'},
    comic:{label:'만화책',dir:'works/comic',icon:'🎨'}
  };
  const KNOWN_TITLES = ['자신과의 소통','힐링게임','하루 한 줄, 자신을 위한 대화','나는 내 생활의 설계자'];
  const pad = (n) => String(n).padStart(2,'0');
  const slug = (s) => String(s).trim().replace(/[\\/:*?"<>|]/g,'').replace(/\s+/g,'_');
  function defaultItem(format, index) {
    const title = KNOWN_TITLES[index] || `BOOK ${pad(index)} · 작품명 등록`;
    const known = Boolean(KNOWN_TITLES[index]);
    return {
      format,index,no:pad(index),title,
      pdfUrl: known ? `${FORMAT[format].dir}/${pad(index)}_${slug(title)}.pdf` : `${FORMAT[format].dir}/${pad(index)}.pdf`,
      audioUrl: '',videoUrl:'',customized:false
    };
  }
  function defaultCatalog() {
    return Object.fromEntries(Object.keys(FORMAT).map(format => [format,Array.from({length:51},(_,i)=>defaultItem(format,i))]));
  }
  function getCatalog() {
    const base=defaultCatalog(), custom=load(CATALOG_KEY,{});
    Object.keys(FORMAT).forEach(f=>{(custom[f]||[]).forEach((item,i)=>{if(item)base[f][i]=Object.assign(base[f][i],item);});});
    return base;
  }
  function setCatalog(catalog){save(CATALOG_KEY,catalog);}
  function getStatuses(){return load(STATUS_KEY,{});}
  function statusKey(format,index,kind='pdf'){return `${format}:${index}:${kind}`;}
  const worksState={format:'ebook',page:1,pageSize:12,query:'',selectedIndex:0,auditing:false};

  function accessAllowed(index){return index<3 || Boolean(window.DAWON_ACCESS_STATE.active);}
  function fileStatus(format,index,kind='pdf'){return getStatuses()[statusKey(format,index,kind)] || 'unknown';}
  function statusLabel(status){return status==='ok'?'파일 정상':status==='missing'?'파일 없음':status==='blocked'?'접근 제한':'점검 전';}
  function renderAccess(){const access=window.DAWON_ACCESS_STATE;const active=Boolean(access.active);textSafe('libraryAccessPill',active?'전체 이용 가능':'무료 미리보기');textSafe('libraryAccessTitle',active?`${access.planName||'유료'} 이용권 · PDF 153개 작품관 이용 가능`:'대표 3작품 미리보기 · 유료 이용권은 153개 PDF 전체 이용');textSafe('libraryAccessDetail',active?(access.endsAt?`이용 만료: ${new Date(access.endsAt).toLocaleDateString('ko-KR')}`:'활성 이용권이 확인되었습니다.'):'로그인 후 활성 이용권이 확인되면 전자책 51·오디오북 낭독 PDF 51·만화책 51 전체가 열립니다.');textSafe('libraryAccessCta',active?'작품 검색하기':'이용권 보기');const cta=$('libraryAccessCta');if(cta){cta.href=active?'/library':'/subscribe';cta.textContent=active?'작품관 열기':'이용권 결제';}renderWorks();renderSubscription();}
  function textSafe(id,v){const el=$(id);if(el)el.textContent=v;}

  function workCard(item) {
    const allowed=accessAllowed(item.index), status=fileStatus(item.format,item.index,'pdf');
    const article=document.createElement('article');article.className='work-card';
    const no=document.createElement('span');no.className='work-no';no.textContent=`${FORMAT[item.format].icon} ${FORMAT[item.format].label} · BOOK ${item.no}`;
    const h=document.createElement('h3');h.textContent=item.title;
    const p=document.createElement('p');p.textContent=allowed?'개별 파일 경로를 서버 응답으로 확인한 뒤 열립니다.':'유료 이용권 활성화 후 전체 작품을 이용할 수 있습니다.';
    const st=document.createElement('span');st.className=`work-status ${status==='ok'?'ok':status==='missing'?'missing':''}`;st.textContent=allowed?statusLabel(status):'이용권 필요';
    const actions=document.createElement('div');actions.className='work-actions';
    const openBtn=document.createElement('button');openBtn.type='button';openBtn.textContent=allowed?'PDF 열기':'잠금 해제';
    openBtn.addEventListener('click',()=>{
      if(!allowed){showSection('subscription');return toast('대표 3작품 외 전체 이용은 활성 이용권이 필요합니다.');}
      if(!item.pdfUrl)return toast('이 작품의 PDF 경로를 먼저 등록해 주세요.');
      if(status==='missing')return toast('서버에서 파일을 찾지 못했습니다. 등록 경로를 확인해 주세요.');
      window.open(item.pdfUrl,'_blank','noopener');
    });
    const checkBtn=document.createElement('button');checkBtn.type='button';checkBtn.textContent='파일 점검';checkBtn.addEventListener('click',async()=>{checkBtn.disabled=true;await auditItem(item,'pdf');checkBtn.disabled=false;renderWorks();});
    actions.append(openBtn,checkBtn);
    if(item.format==='audio'){
      const listen=document.createElement('button');listen.type='button';listen.textContent=item.audioUrl?'음원 재생':'실시간 낭독';listen.addEventListener('click',()=>{
        if(!allowed)return toast('활성 이용권이 필요합니다.');
        if(item.audioUrl){const audio=new Audio(item.audioUrl);audio.controls=true;audio.autoplay=true;const win=window.open('','_blank');if(win){win.document.write(`<title>${escapeHtml(item.title)}</title><body style="font-family:system-ui;padding:40px"><h1>${escapeHtml(item.title)}</h1>${audio.outerHTML}</body>`);}}else{D.speak(`${item.title}. 오디오북 원고 PDF를 열어 브라우저 낭독 기능으로 들을 수 있습니다.`);toast('별도 MP3가 없어 안내 문장을 읽습니다. PDF 원고의 실제 낭독은 파일 연결 후 이용합니다.');}
      });actions.appendChild(listen);
    }
    if(item.format==='comic'){
      const movie=document.createElement('button');movie.type='button';movie.textContent=item.videoUrl?'만화영화':'PDF 모션';movie.addEventListener('click',()=>{
        if(!allowed)return toast('활성 이용권이 필요합니다.');
        if(item.videoUrl){window.open(item.videoUrl,'_blank','noopener');}else{openMotionComic(item);}
      });actions.appendChild(movie);
    }
    article.append(no,h,p,st,actions);return article;
  }
  function filteredWorks(){const list=getCatalog()[worksState.format];const q=worksState.query.trim().toLowerCase();return q?list.filter(x=>x.title.toLowerCase().includes(q)||x.no.includes(q)):list;}
  function renderWorks(){const grid=$('worksGrid');if(!grid)return;const list=filteredWorks();const pages=Math.max(1,Math.ceil(list.length/worksState.pageSize));worksState.page=Math.min(pages,Math.max(1,worksState.page));const start=(worksState.page-1)*worksState.pageSize;grid.replaceChildren(...list.slice(start,start+worksState.pageSize).map(workCard));textSafe('worksPageLabel',`${worksState.page} / ${pages}`);if($('worksPrev'))$('worksPrev').disabled=worksState.page<=1;if($('worksNext'))$('worksNext').disabled=worksState.page>=pages;$$('.works-tab').forEach(btn=>btn.classList.toggle('active',btn.dataset.workFormat===worksState.format));updateAuditCounts();}
  function updateAuditCounts(){const statuses=getStatuses();Object.keys(FORMAT).forEach(format=>{const ok=Array.from({length:51},(_,i)=>statuses[statusKey(format,i,'pdf')]).filter(x=>x==='ok').length;const id=format==='ebook'?'ebookRegistered':format==='audio'?'audioRegistered':'comicRegistered';textSafe(id,`${ok}/51개 서버 확인`);});}
  async function checkUrl(url){if(!url)return'missing';if(location.protocol==='file:')return'blocked';try{let res=await fetch(url,{method:'HEAD',cache:'no-store',credentials:'same-origin'});if(res.ok)return'ok';if(res.status===405){res=await fetch(url,{method:'GET',headers:{Range:'bytes=0-1'},cache:'no-store',credentials:'same-origin'});if(res.ok||res.status===206)return'ok';}return res.status===401||res.status===403?'blocked':'missing';}catch(_){return'missing';}}
  async function auditItem(item,kind='pdf'){const url=kind==='pdf'?item.pdfUrl:kind==='audio'?item.audioUrl:item.videoUrl;const status=await checkUrl(url);const statuses=getStatuses();statuses[statusKey(item.format,item.index,kind)]=status;save(STATUS_KEY,statuses);toast(status==='ok'?`${item.title} 파일을 확인했습니다.`:status==='blocked'?'로컬 파일에서는 서버 점검을 할 수 없습니다. 배포 후 다시 점검하세요.':`${item.title} 파일을 찾지 못했습니다.`);return status;}
  async function auditAll(){if(worksState.auditing)return;worksState.auditing=true;const btn=$('worksCheckAll');if(btn){btn.disabled=true;btn.textContent='점검 중 0 / 153';}const catalog=getCatalog();const all=Object.keys(FORMAT).flatMap(f=>catalog[f].map(x=>x));let done=0;const queue=[...all];async function worker(){while(queue.length){const item=queue.shift();await auditItemSilent(item);done++;if(btn)btn.textContent=`점검 중 ${done} / 153`;textSafe('worksAuditHeadline',`153개 PDF 중 ${done}개 경로를 점검했습니다.`);}}await Promise.all(Array.from({length:6},worker));worksState.auditing=false;if(btn){btn.disabled=false;btn.textContent='153개 PDF 전체 점검';}const statuses=getStatuses();const ok=all.filter(x=>statuses[statusKey(x.format,x.index,'pdf')]==='ok').length;const missing=all.filter(x=>statuses[statusKey(x.format,x.index,'pdf')]==='missing').length;const blocked=all.filter(x=>statuses[statusKey(x.format,x.index,'pdf')]==='blocked').length;textSafe('worksAuditHeadline',`점검 결과 · 정상 ${ok} · 없음 ${missing} · 로컬 점검불가 ${blocked}`);textSafe('worksAuditDetail','제목이나 등록 숫자가 아니라 실제 서버 응답을 기준으로 표시했습니다.');renderWorks();toast('작품관 전체 경로 점검을 마쳤습니다.');}
  async function auditItemSilent(item){const status=await checkUrl(item.pdfUrl);const statuses=getStatuses();statuses[statusKey(item.format,item.index,'pdf')]=status;save(STATUS_KEY,statuses);}
  function exportMissing(){const catalog=getCatalog(),statuses=getStatuses();const lines=['형식,번호,작품명,PDF 경로,상태'];Object.keys(FORMAT).forEach(f=>catalog[f].forEach(item=>{const s=statuses[statusKey(f,item.index,'pdf')]||'점검 전';if(s!=='ok')lines.push([FORMAT[f].label,item.no,item.title,item.pdfUrl,statusLabel(s)].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','));}));download(`dawon-missing-files-${todayKey()}.csv`,`\ufeff${lines.join('\n')}`,'text/csv;charset=utf-8');}
  function loadAdmin(){const item=getCatalog()[valueOf('workAdminFormat','ebook')][Number(valueOf('workAdminNo',0))]||defaultItem('ebook',0);valueSet('workAdminTitle',item.title);valueSet('workAdminUrl',item.pdfUrl);valueSet('workAdminAudioUrl',item.audioUrl||'');valueSet('workAdminVideoUrl',item.videoUrl||'');worksState.selectedIndex=item.index;}
  function valueOf(id,fallback=''){const el=$(id);return el?el.value:fallback;}function valueSet(id,v){const el=$(id);if(el)el.value=v??'';}
  function saveAdmin(){const format=valueOf('workAdminFormat','ebook'),index=Number(valueOf('workAdminNo',0)),catalog=getCatalog();catalog[format][index]=Object.assign({},catalog[format][index],{title:valueOf('workAdminTitle').trim()||`BOOK ${pad(index)}`,pdfUrl:valueOf('workAdminUrl').trim(),audioUrl:valueOf('workAdminAudioUrl').trim(),videoUrl:valueOf('workAdminVideoUrl').trim(),customized:true});setCatalog(catalog);const statuses=getStatuses();['pdf','audio','video'].forEach(k=>delete statuses[statusKey(format,index,k)]);save(STATUS_KEY,statuses);textSafe('worksAdminStatus',`${FORMAT[format].label} BOOK ${pad(index)} 등록 정보를 이 브라우저에 저장했습니다. 웹 서버의 실제 파일은 “선택 파일 점검”으로 확인하세요.`);worksState.format=format;worksState.page=Math.floor(index/worksState.pageSize)+1;renderWorks();toast('작품 등록 정보를 저장했습니다.');}
  function resetAdmin(){const format=valueOf('workAdminFormat','ebook'),index=Number(valueOf('workAdminNo',0)),catalog=getCatalog();catalog[format][index]=defaultItem(format,index);setCatalog(catalog);loadAdmin();renderWorks();toast('기본 경로로 복원했습니다.');}
  function initWorks(){const no=$('workAdminNo');if(no){no.replaceChildren(...Array.from({length:51},(_,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`BOOK ${pad(i)}`;return o;}));}$$('.works-tab').forEach(btn=>btn.addEventListener('click',()=>{worksState.format=btn.dataset.workFormat;worksState.page=1;renderWorks();}));$('worksSearch')?.addEventListener('input',e=>{worksState.query=e.target.value;worksState.page=1;renderWorks();});$('worksPrev')?.addEventListener('click',()=>{worksState.page--;renderWorks();});$('worksNext')?.addEventListener('click',()=>{worksState.page++;renderWorks();});$('worksCheckAll')?.addEventListener('click',auditAll);$('worksMissingExport')?.addEventListener('click',exportMissing);$('workAdminFormat')?.addEventListener('change',()=>{worksState.format=valueOf('workAdminFormat');loadAdmin();renderWorks();});$('workAdminNo')?.addEventListener('change',loadAdmin);$('worksLoadCurrent')?.addEventListener('click',loadAdmin);$('workAdminSave')?.addEventListener('click',saveAdmin);$('workAdminCheckOne')?.addEventListener('click',async()=>{const item=getCatalog()[valueOf('workAdminFormat')][Number(valueOf('workAdminNo'))];await auditItem(item,'pdf');renderWorks();});$('workAdminClear')?.addEventListener('click',resetAdmin);$('workCatalogExport')?.addEventListener('click',()=>download(`dawon-work-catalog-${todayKey()}.json`,JSON.stringify(getCatalog(),null,2),'application/json'));window.addEventListener('dawon-subscription-changed',renderAccess);window.addEventListener('dawon-data-changed',renderWorks);loadAdmin();renderAccess();}

  /* ------------------------------------------------------------------
     Local template studio
  ------------------------------------------------------------------- */
  const studioState={type:'blog',output:'',story:[]};
  function studioSource(){return{title:valueOf('ideaTitle').trim()||'오늘의 생활설계',source:valueOf('ideaSource').trim()||'오늘의 경험과 배움을 입력하세요.'};}
  function sourceSentences(source){return source.split(/\n+|(?<=[.!?。])\s+/).map(x=>x.trim()).filter(Boolean);}
  function generateStudio(){const {title,source}=studioSource(),sent=sourceSentences(source);let out='';const core=sent[0]||source;switch(studioState.type){
      case 'song': out=`[로컬 초안 · 30초 노래]\n제목｜${title}\n\n[VERSE]\n오늘 한 걸음, 작아도 좋아\n${core.slice(0,34)}\n확인하고 해보면 길이 보여\n결과 속에 내 답이 남아\n\n[HOOK]\n오오오, 다시 시작해\n오오오, 내일을 설계해\n오늘의 경험이 나를 키워\n나는 내 생활의 설계자\n\n[FINAL HOOK]\n확인하고, 실천하고\n내일의 나를 다시 설계해`;break;
      case 'comic': out=`[로컬 초안 · 7컷 만화]\n제목｜${title}\n\n1컷｜문제 발견 — ${sent[0]||'생각만으로 달라지지 않았다.'}\n2컷｜사실 확인 — 오늘 실제로 일어난 일을 적는다.\n3컷｜감정 발견 — 감정은 잘못이 아니라 정보다.\n4컷｜작은 선택 — 10분 안에 할 한 가지를 정한다.\n5컷｜실천 — 작게라도 직접 해본다.\n6컷｜결과와 배움 — 잘된 점과 막힌 이유를 확인한다.\n7컷｜다음 설계 — 내일 첫 행동을 한 문장으로 남긴다.`;break;
      case 'video': studioState.story=[sent[0]||'생각만으로 달라지지 않았다','오늘의 사실을 확인합니다','감정은 잘못이 아니라 정보입니다','10분 안에 할 한 가지를 정합니다','작은 행동은 결과를 남깁니다','경험은 나만의 답을 만듭니다','오늘을 확인하고, 내일을 설계하세요'];out=`[로컬 초안 · 7장면 영상]\n제목｜${title}\n\n${studioState.story.map((x,i)=>`장면 ${i+1}｜${x}`).join('\n')}\n\n마지막 CTA｜dawon84.com · 오늘 한 가지 시작하기`;break;
      case 'proposal': out=`[로컬 초안 · 파트너 제안]\n제안명｜${title}\n\n1. 문제\n${core}\n\n2. 해결 방향\n오늘 한 가지 → 3분 기록 → 7일 실천 → 성장리포트의 생활설계 흐름을 제공합니다.\n\n3. 제공물\n- 참여자용 생활설계 화면\n- 7일·30일 실천 프로그램\n- 성장리포트와 결과물\n- 전자책·오디오북·만화 콘텐츠 연계\n\n4. 측정 지표\n참여율 · 기록률 · 실천 설정률 · 결과 확인률 · 재시작 경험`;break;
      case 'daily': out=`[로컬 초안 · 오늘 실천카드]\n\n오늘 확인｜${sent[0]||source}\n오늘 하나｜10분 안에 할 수 있는 행동으로 줄입니다.\n실천 시간｜오늘 가능한 시간을 정합니다.\n막힐 때 대안｜5분 행동으로 더 작게 시작합니다.\n마무리 질문｜무엇이 달라졌고, 내일 첫 행동은 무엇인가?`;break;
      default: out=`[로컬 초안 · 검색형 기사]\n메타 제목｜${title}｜정보를 행동으로 바꾸는 생활설계\n메타 설명｜${title}의 핵심을 오늘 한 가지 행동으로 번역하고, 실천 결과에서 배우는 방법을 정리합니다.\n추천 URL｜${slug(title).toLowerCase()}-daily-life-design\n\n# ${title}\n\n정보가 많아도 생활이 바뀌지 않는 이유는 아는 것과 적용하는 것이 다른 일이기 때문입니다.\n\n## 먼저 사실을 확인합니다\n${source}\n\n## 한 가지 행동으로 번역합니다\n오늘 10분 안에 직접 할 수 있는 행동 하나를 정합니다. 너무 크다면 더하기보다 빼기로 시작합니다.\n\n## 결과를 기록합니다\n잘되었는지보다 무엇이 달라졌고 무엇이 막았는지 확인합니다. 실패한 방법도 다음 대안을 만드는 자료가 됩니다.\n\n## 오늘의 체크리스트\n□ 확인한 사실 한 줄\n□ 오늘 실천할 행동 하나\n□ 실천 결과 한 줄\n□ 배운 점 한 줄\n□ 내일 첫 행동 한 줄\n\n#태그\n#생활설계 #자기확인 #습관만들기 #다원하루설계 #정보활용 #실천기록`;}
    studioState.output=out;textSafe('contentOutput',out);return out;}
  function openStudioTab(page){$$('.studio-tab').forEach(x=>x.classList.toggle('active',x.dataset.page===page));$$('.studio-page').forEach(x=>x.classList.toggle('active',x.id==='page-'+page));showSection('studio');try{window.dispatchEvent(new CustomEvent('dawon:studio-tab',{detail:page}));}catch(e){}if(page==='video')setTimeout(updateVideoCanvasSize,50);}
  function initStudio(){$$('.studio-tab').forEach(btn=>btn.addEventListener('click',()=>openStudioTab(btn.dataset.page)));$$('.type-card').forEach(btn=>btn.addEventListener('click',()=>{studioState.type=btn.dataset.type;$$('.type-card').forEach(x=>x.classList.toggle('active',x===btn));}));$('generateContent')?.addEventListener('click',generateStudio);$('useToday')?.addEventListener('click',()=>{const day=getCurrentDay();valueSet('ideaTitle',day.action||'오늘의 생활설계');valueSet('ideaSource',daySummary(day));toast('오늘 기록을 불러왔습니다.');});$('contentSample')?.addEventListener('click',()=>{valueSet('ideaTitle','정보가 생활을 바꾸는 순간');valueSet('ideaSource','좋은 정보를 읽고도 행동하지 않으면 생활은 크게 달라지지 않습니다. 정보 하나를 오늘 행동 하나로 번역하고, 결과를 기록해야 나의 기준이 됩니다.');generateStudio();});$('copyContent')?.addEventListener('click',()=>copyText(studioState.output||textOf('contentOutput')));$('downloadContent')?.addEventListener('click',()=>download(`dawon-content-${todayKey()}.txt`,studioState.output||textOf('contentOutput')));$('openVideoStudioFromTransform')?.addEventListener('click',()=>{if(!studioState.story.length)generateStudio();valueSet('dvsTitle',valueOf('ideaTitle'));if(studioState.story.length)valueSet('dvsStory',studioState.story.join('\n'));openStudioTab('video');});$('openVideoStudioFromTransform')?.toggleAttribute('disabled',false);$$('[data-open-video-studio]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();openStudioTab('video');}));$('openVideoStudioFromTransform')?.addEventListener('keydown',()=>{});}
  function textOf(id){return $(id)?.textContent||'';}

  /* ------------------------------------------------------------------
     DAWON Video Studio — image/PDF canvas preview and MediaRecorder export
  ------------------------------------------------------------------- */
  const videoState={slides:[],duration:30,previewing:false,previewRAF:0,rendering:false,renderRAF:0,blob:null,mime:'',objectUrls:[],external:false};
  const RATIO={ '9:16':[720,1280], '16:9':[1280,720], '1:1':[900,900], '4:5':[864,1080] };
  let pdfLibPromise=null;
  async function pdfLib(){if(!pdfLibPromise){pdfLibPromise=import('https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.min.mjs').then(lib=>{lib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.worker.min.mjs';return lib;});}return pdfLibPromise;}
  function clearObjectUrls(){videoState.objectUrls.forEach(URL.revokeObjectURL);videoState.objectUrls=[];}
  async function imageFromFile(file){const url=URL.createObjectURL(file);videoState.objectUrls.push(url);const img=new Image();img.decoding='async';await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url;});return{image:img,label:file.name,type:'image'};}
  async function pdfSlides(file){try{const lib=await pdfLib();const data=await file.arrayBuffer();const pdf=await lib.getDocument({data}).promise;const count=Math.min(7,pdf.numPages);const pages=count===pdf.numPages?Array.from({length:count},(_,i)=>i+1):Array.from({length:count},(_,i)=>Math.round(1+i*(pdf.numPages-1)/(count-1)));const slides=[];for(const pageNo of pages){const page=await pdf.getPage(pageNo);const base=page.getViewport({scale:1});const scale=Math.min(2,1100/Math.max(base.width,base.height));const viewport=page.getViewport({scale});const c=document.createElement('canvas');c.width=Math.ceil(viewport.width);c.height=Math.ceil(viewport.height);await page.render({canvasContext:c.getContext('2d'),viewport}).promise;const img=new Image();img.src=c.toDataURL('image/jpeg',.9);await img.decode();slides.push({image:img,label:`${file.name} · ${pageNo}/${pdf.numPages}`,type:'pdf',pageNo});}return slides;}catch(e){console.warn('PDF render fallback',e);const c=document.createElement('canvas');c.width=1000;c.height=1400;const ctx=c.getContext('2d');ctx.fillStyle='#143b31';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#e8c76a';ctx.font='bold 80px sans-serif';ctx.textAlign='center';ctx.fillText('PDF',500,540);ctx.fillStyle='#fff';ctx.font='34px sans-serif';wrapCanvasText(ctx,file.name,500,650,800,48);const img=new Image();img.src=c.toDataURL('image/jpeg',.9);await img.decode();toast('PDF.js를 불러오지 못해 PDF 표지 대체 장면을 만들었습니다. 온라인 배포 후 다시 시도하세요.');return[{image:img,label:file.name,type:'pdf-fallback'}];}}
  async function handleMedia(files){if(!files.length)return;stopPreview();clearObjectUrls();videoState.slides=[];videoState.external=false;textSafe('dvsStatus','사진·PDF를 장면으로 준비하고 있습니다.');for(const file of files.slice(0,20)){if(file.type.startsWith('image/')){try{videoState.slides.push(await imageFromFile(file));}catch(_){toast(`${file.name} 이미지를 읽지 못했습니다.`);}}else if(file.type==='application/pdf'){videoState.slides.push(...await pdfSlides(file));}}textSafe('dvsFileSummary',videoState.slides.length?`${files.length}개 파일에서 ${videoState.slides.length}개 영상 장면을 준비했습니다.`:'지원되는 사진 또는 PDF가 없습니다.');textSafe('dvsStatus',videoState.slides.length?'미리보기와 영상 만들기를 사용할 수 있습니다.':'사진·PDF를 다시 선택해 주세요.');drawVideoFrame(0,0);$('dvsEmpty')?.toggleAttribute('hidden',Boolean(videoState.slides.length));}
  function updateVideoCanvasSize(){const ratio=valueOf('dvsRatio','9:16'),dims=RATIO[ratio]||RATIO['9:16'],canvas=$('dvsCanvas'),stage=$('dvsStage');if(canvas){canvas.width=dims[0];canvas.height=dims[1];}if(stage)stage.style.aspectRatio=`${dims[0]} / ${dims[1]}`;textSafe('dvsPreviewLabel',`${ratio} · ${videoState.duration}초`);drawVideoFrame(0,0);}
  function captions(){return valueOf('dvsStory').split('\n').map(x=>x.trim()).filter(Boolean);}
  function coverDraw(ctx,img,w,h,progress,motion){const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;if(!iw||!ih)return;const base=Math.max(w/iw,h/ih);const zoom=motion==='still'?1:motion==='gentle'?1.02+progress*.025:1.05+progress*.08;const dw=iw*base*zoom,dh=ih*base*zoom;let dx=(w-dw)/2,dy=(h-dh)/2;if(motion==='gentle'){dx+=Math.sin(progress*Math.PI*2)*w*.018;dy+=Math.cos(progress*Math.PI)*h*.012;}else if(motion==='cinema'){dx-=progress*w*.03;dy-=progress*h*.018;}ctx.drawImage(img,dx,dy,dw,dh);}
  function wrapCanvasText(ctx,content,x,y,maxWidth,lineHeight,maxLines=3){const words=String(content||'').split(/\s+/);let line='',lines=[];for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);lines=lines.slice(0,maxLines);lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));return lines.length;}
  function drawVideoFrame(slideIndex=0,progress=0){const canvas=$('dvsCanvas');if(!canvas)return;const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#0a251f';ctx.fillRect(0,0,w,h);const slide=videoState.slides[slideIndex%Math.max(1,videoState.slides.length)];if(slide?.image)coverDraw(ctx,slide.image,w,h,progress,valueOf('dvsMotion','cinema'));else{const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#0c332b');g.addColorStop(1,'#b7953f');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
    const shade=ctx.createLinearGradient(0,h*.25,0,h);shade.addColorStop(0,'rgba(0,0,0,0)');shade.addColorStop(.58,'rgba(0,0,0,.16)');shade.addColorStop(1,'rgba(0,0,0,.78)');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
    const title=valueOf('dvsTitle').trim()||'다원 하루설계';const lines=captions();const caption=lines[slideIndex%Math.max(1,lines.length)]||slide?.label||'오늘을 확인하고, 내일을 설계하세요';ctx.textAlign='left';ctx.fillStyle='#f2d985';ctx.font=`800 ${Math.max(20,w*.028)}px sans-serif`;ctx.fillText('DAWON LIFE DESIGN',w*.07,h*.09);ctx.fillStyle='#fff';ctx.font=`800 ${Math.max(34,w*.054)}px sans-serif`;wrapCanvasText(ctx,title,w*.07,h*.17,w*.86,Math.max(44,w*.066),2);
    if(checkedValue('dvsCaptions')){ctx.fillStyle='rgba(0,0,0,.55)';roundRect(ctx,w*.055,h*.70,w*.89,h*.17,w*.025);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font=`700 ${Math.max(30,w*.045)}px sans-serif`;wrapCanvasText(ctx,caption,w*.5,h*.765,w*.78,Math.max(42,w*.057),3);}
    if(checkedValue('dvsBrand')){ctx.textAlign='left';ctx.fillStyle='#e8c76a';ctx.fillRect(w*.07,h*.925,w*.12,Math.max(3,h*.004));ctx.fillStyle='#fff';ctx.font=`700 ${Math.max(18,w*.025)}px sans-serif`;ctx.fillText('dawon84.com',w*.07,h*.96);ctx.textAlign='right';ctx.fillText(`${slideIndex+1} / ${Math.max(1,videoState.slides.length)}`,w*.93,h*.96);}
  }
  function checkedValue(id){return Boolean($(id)?.checked);}
  function roundRect(ctx,x,y,w,h,r){if(ctx.roundRect){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}else{ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}}
  function stopPreview(){videoState.previewing=false;if(videoState.previewRAF)cancelAnimationFrame(videoState.previewRAF);videoState.previewRAF=0;}
  function previewVideo(){if(!videoState.slides.length)return toast('사진 또는 PDF를 먼저 선택해 주세요.');if(videoState.previewing){stopPreview();textSafe('dvsProgressText','미리보기 일시정지');return;}videoState.previewing=true;const start=performance.now(),previewDuration=Math.min(14,Math.max(7,videoState.slides.length*2))*1000;const tick=now=>{if(!videoState.previewing)return;const elapsed=(now-start)%previewDuration;const overall=elapsed/previewDuration;const pos=overall*videoState.slides.length;const index=Math.min(videoState.slides.length-1,Math.floor(pos));drawVideoFrame(index,pos-index);$('dvsProgress')?.style.setProperty('width',`${overall*100}%`);textSafe('dvsProgressText','빠른 미리보기');textSafe('dvsTimeText',`${formatTime(elapsed/1000)} / ${formatTime(previewDuration/1000)}`);videoState.previewRAF=requestAnimationFrame(tick);};videoState.previewRAF=requestAnimationFrame(tick);}
  function formatTime(sec){const s=Math.max(0,Math.floor(sec));return`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
  function supportedMime(){const list=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];return list.find(x=>window.MediaRecorder?.isTypeSupported?.(x))||'';}
  async function audioMix(stream){const files=[[$('dvsMusic')?.files?.[0],.35,true],[$('dvsNarrationAudio')?.files?.[0],.95,false]].filter(x=>x[0]);if(!files.length)return{stream,cleanup:()=>{}};const context=new (window.AudioContext||window.webkitAudioContext)();const dest=context.createMediaStreamDestination();const elements=[];for(const [file,vol,loop] of files){const url=URL.createObjectURL(file);videoState.objectUrls.push(url);const audio=new Audio(url);audio.volume=vol;audio.loop=loop;audio.crossOrigin='anonymous';const src=context.createMediaElementSource(audio);const gain=context.createGain();gain.gain.value=vol;src.connect(gain);gain.connect(dest);gain.connect(context.destination);elements.push(audio);}dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));await context.resume();await Promise.all(elements.map(a=>a.play().catch(()=>{})));return{stream,cleanup:()=>{elements.forEach(a=>{a.pause();a.currentTime=0;});context.close().catch(()=>{});}};}
  async function renderVideo(){if(videoState.rendering)return;if(!videoState.slides.length)return toast('사진 또는 PDF를 먼저 선택해 주세요.');if(!window.MediaRecorder||!$('dvsCanvas')?.captureStream)return toast('이 브라우저는 영상 파일 생성을 지원하지 않습니다. 최신 Chrome 또는 Edge를 이용해 주세요.');stopPreview();videoState.rendering=true;videoState.blob=null;$('dvsRender').disabled=true;$('dvsSave').disabled=true;$('dvsResult')?.toggleAttribute('hidden',true);const canvas=$('dvsCanvas'),fps=30;let stream=canvas.captureStream(fps);const mix=await audioMix(stream);stream=mix.stream;const mime=supportedMime();videoState.mime=mime||'video/webm';textSafe('dvsStatus',`${videoState.duration}초 영상을 실시간 렌더링합니다. 이 탭을 닫지 마세요.`);textSafe('dvsFormatChip',videoState.mime.includes('mp4')?'MP4 직접 저장':'WebM 안전 저장');const chunks=[];let recorder;try{recorder=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:5_000_000}:undefined);}catch(e){videoState.rendering=false;$('dvsRender').disabled=false;mix.cleanup();return toast(`영상 녹화를 시작하지 못했습니다: ${e.message}`);}recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};const finished=new Promise(resolve=>recorder.onstop=resolve);recorder.start(500);const start=performance.now(),total=videoState.duration*1000;await new Promise(resolve=>{const tick=now=>{const elapsed=Math.min(total,now-start),overall=elapsed/total,pos=overall*videoState.slides.length,index=Math.min(videoState.slides.length-1,Math.floor(pos)),local=pos-index;drawVideoFrame(index,Math.min(1,local));$('dvsProgress')?.style.setProperty('width',`${overall*100}%`);textSafe('dvsProgressText',`렌더링 ${Math.round(overall*100)}%`);textSafe('dvsTimeText',`${formatTime(elapsed/1000)} / ${formatTime(videoState.duration)}`);if(elapsed>=total){resolve();return;}videoState.renderRAF=requestAnimationFrame(tick);};videoState.renderRAF=requestAnimationFrame(tick);});recorder.stop();await finished;mix.cleanup();stream.getTracks().forEach(t=>t.stop());videoState.blob=new Blob(chunks,{type:recorder.mimeType||videoState.mime});const url=URL.createObjectURL(videoState.blob);videoState.objectUrls.push(url);const video=$('dvsResultVideo');if(video)video.src=url;$('dvsResult')?.removeAttribute('hidden');$('dvsSave').disabled=false;const ext=(recorder.mimeType||'').includes('mp4')?'MP4':'WEBM';textSafe('dvsResultType',ext);$('dvsSave').textContent=`${ext} 저장`;textSafe('dvsExportNote',ext==='MP4'?'이 브라우저가 MP4 녹화를 지원해 MP4로 생성했습니다.':'현재 브라우저는 MP4 직접 녹화를 지원하지 않아 표준 WebM으로 안전하게 생성했습니다. MP4가 필요하면 서버 FFmpeg 변환을 연결하세요.');textSafe('dvsStatus','영상 파일 생성이 완료되었습니다. 미리 확인한 뒤 저장하세요.');videoState.rendering=false;$('dvsRender').disabled=false;toast('영상 만들기를 완료했습니다.');}
  function saveVideo(){if(!videoState.blob)return toast('먼저 영상을 만들어 주세요.');const ext=videoState.blob.type.includes('mp4')?'mp4':'webm';download(`${slug(valueOf('dvsTitle')||'dawon-video')}-${todayKey()}.${ext}`,videoState.blob,videoState.blob.type);}
  function resetVideo(){stopPreview();if(videoState.renderRAF)cancelAnimationFrame(videoState.renderRAF);clearObjectUrls();videoState.slides=[];videoState.blob=null;videoState.rendering=false;valueSet('dvsMedia','');valueSet('dvsMusic','');valueSet('dvsNarrationAudio','');textSafe('dvsFileSummary','선택한 파일이 없습니다.');textSafe('dvsStatus','사진·PDF를 선택하면 준비 상태를 확인합니다.');$('dvsResult')?.toggleAttribute('hidden',true);$('dvsEmpty')?.removeAttribute('hidden');$('dvsProgress')?.style.setProperty('width','0%');drawVideoFrame(0,0);}
  function setExternalSlides(slides,title,story=[]){stopPreview();videoState.slides=slides;videoState.external=true;valueSet('dvsTitle',title);if(story.length)valueSet('dvsStory',story.join('\n'));textSafe('dvsFileSummary',`PDF 모션 플레이어에서 ${slides.length}개 장면을 가져왔습니다.`);$('dvsEmpty')?.toggleAttribute('hidden',Boolean(slides.length));drawVideoFrame(0,0);openStudioTab('video');}
  function initVideo(){textSafe('dvsCapability',window.MediaRecorder&&HTMLCanvasElement.prototype.captureStream?'실제 영상 생성 지원':'미리보기만 지원');textSafe('dvsFormatChip',supportedMime().includes('mp4')?'MP4 직접 저장 가능':'WebM 저장 · MP4 서버 변환 권장');$('dvsMedia')?.addEventListener('change',e=>handleMedia(Array.from(e.target.files||[])));$$('#dvsDuration button').forEach(btn=>btn.addEventListener('click',()=>{videoState.duration=Number(btn.dataset.seconds)||30;$$('#dvsDuration button').forEach(x=>x.classList.toggle('active',x===btn));updateVideoCanvasSize();}));$('dvsRatio')?.addEventListener('change',updateVideoCanvasSize);$('dvsMotion')?.addEventListener('change',()=>drawVideoFrame(0,0));['dvsTitle','dvsStory','dvsCaptions','dvsBrand'].forEach(id=>$(id)?.addEventListener('input',()=>drawVideoFrame(0,0)));$('dvsPreview')?.addEventListener('click',previewVideo);$('dvsRender')?.addEventListener('click',renderVideo);$('dvsSave')?.addEventListener('click',saveVideo);$('dvsNew')?.addEventListener('click',resetVideo);$('dvsUseStory')?.addEventListener('click',()=>{if(studioState.story.length)valueSet('dvsStory',studioState.story.join('\n'));else{generateStudio();valueSet('dvsStory',studioState.story.join('\n'));}drawVideoFrame(0,0);});$('dvsUseToday')?.addEventListener('click',()=>{const day=getCurrentDay();valueSet('dvsTitle',day.action||'오늘의 생활설계');valueSet('dvsStory',[day.done||'오늘의 사실을 확인합니다',day.mood?`지금 감정은 ${day.mood}`:'감정을 알아차립니다',day.action||'오늘 하나를 정합니다',day.result||'작은 행동을 실천합니다',day.learn||'결과에서 배웁니다',day.tomorrow||'내일 첫 행동을 정합니다',day.selfWord||'나는 내 생활의 설계자'].join('\n'));drawVideoFrame(0,0);});updateVideoCanvasSize();window.DawonVideo={setExternalSlides,open:()=>openStudioTab('video')};}

  /* ------------------------------------------------------------------
     Motion comic player
  ------------------------------------------------------------------- */
  const motion={item:null,slides:[],index:0,playing:false,timer:0,narration:true,blob:null,urls:[]};
  async function openMotionComic(item){motion.item=item;motion.slides=[];motion.index=0;motion.playing=false;textSafe('motionComicTitle',item.title);textSafe('motionComicSub','PDF → 실시간 모션 만화');textSafe('motionComicStatus','PDF 불러오는 중');textSafe('motionComicLoading','PDF를 영화 장면으로 변환하는 중…');$('motionComicLoading')?.removeAttribute('hidden');$('motionOriginalPdf').href=item.pdfUrl||'#';openModal('motionComicModal');try{if(!item.pdfUrl)throw new Error('PDF 경로 없음');const res=await fetch(item.pdfUrl);if(!res.ok)throw new Error(`HTTP ${res.status}`);const file=new File([await res.blob()],`${item.no}.pdf`,{type:'application/pdf'});motion.slides=await pdfSlides(file);$('motionComicLoading')?.toggleAttribute('hidden',true);textSafe('motionComicStatus',`${motion.slides.length}개 장면 준비`);renderMotion();playMotion();}catch(e){console.warn(e);$('motionComicLoading')?.toggleAttribute('hidden',true);const iframe=$('motionComicFallback');if(iframe){iframe.src=item.pdfUrl;iframe.classList.add('active');}textSafe('motionComicStatus','PDF 원본 보기 모드');toast('PDF 모션 변환이 어려워 원본 보기로 전환했습니다.');}}
  function renderMotion(){const canvas=$('motionComicCanvas');if(!canvas||!motion.slides.length)return;const slide=motion.slides[motion.index];canvas.width=slide.image.naturalWidth||slide.image.width;canvas.height=slide.image.naturalHeight||slide.image.height;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(slide.image,0,0,canvas.width,canvas.height);canvas.classList.add('active');$('motionComicFallback')?.classList.remove('active');$('motionComicVideo')?.classList.remove('active');textSafe('motionComicPage',`${motion.index+1} / ${motion.slides.length}`);const cap=`${motion.item?.title||'다원 만화'} · 장면 ${motion.index+1}`;textSafe('motionComicCaption',cap);if(motion.narration&&motion.playing)D.speak(cap);}
  function motionDelay(){return(Number(valueOf('motionSpeed',6.5))||6.5)*1000;}
  function playMotion(){if(!motion.slides.length)return;motion.playing=true;textSafe('motionPlay','❚❚ 일시정지');clearTimeout(motion.timer);motion.timer=setTimeout(()=>{motion.index=(motion.index+1)%motion.slides.length;renderMotion();if(motion.playing)playMotion();},motionDelay());}
  function pauseMotion(){motion.playing=false;clearTimeout(motion.timer);textSafe('motionPlay','▶ 재생');window.speechSynthesis?.cancel?.();}
  async function recordMotion(){if(!motion.slides.length)return toast('변환된 PDF 장면이 없습니다.');if(!window.MediaRecorder)return toast('이 브라우저는 영상 녹화를 지원하지 않습니다.');pauseMotion();const canvas=$('motionComicCanvas'),stream=canvas.captureStream(30),mime=supportedMime(),chunks=[],rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:4_000_000}:undefined),count=valueOf('motionCutCount','auto')==='auto'?Math.min(7,motion.slides.length):Math.min(Number(valueOf('motionCutCount')),motion.slides.length),delay=Math.min(9,Math.max(2,Number(valueOf('motionSpeed'))||6.5));rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};const finish=new Promise(r=>rec.onstop=r);rec.start(400);textSafe('motionComicStatus','영화 파일 만드는 중');for(let i=0;i<count;i++){motion.index=i;renderMotion();await new Promise(r=>setTimeout(r,delay*1000));}rec.stop();await finish;motion.blob=new Blob(chunks,{type:rec.mimeType||'video/webm'});const url=URL.createObjectURL(motion.blob);motion.urls.push(url);const video=$('motionComicVideo');video.src=url;video.classList.add('active');canvas.classList.remove('active');$('motionSaveMovie').disabled=false;textSafe('motionComicStatus','영화 파일 완성');toast('PDF 만화영화 파일을 만들었습니다.');}
  function initMotion(){$('motionComicClose')?.addEventListener('click',()=>{pauseMotion();closeModal('motionComicModal');});$('motionPlay')?.addEventListener('click',()=>motion.playing?pauseMotion():playMotion());$('motionPrev')?.addEventListener('click',()=>{pauseMotion();if(motion.slides.length){motion.index=(motion.index-1+motion.slides.length)%motion.slides.length;renderMotion();}});$('motionNext')?.addEventListener('click',()=>{pauseMotion();if(motion.slides.length){motion.index=(motion.index+1)%motion.slides.length;renderMotion();}});$('motionNarration')?.addEventListener('click',()=>{motion.narration=!motion.narration;textSafe('motionNarration',motion.narration?'🔊 낭독 켜짐':'🔇 낭독 꺼짐');});$('motionFullscreen')?.addEventListener('click',()=>$('motionComicShell')?.requestFullscreen?.());$('motionMakeMovie')?.addEventListener('click',recordMotion);$('motionSaveMovie')?.addEventListener('click',()=>{if(!motion.blob)return;const ext=motion.blob.type.includes('mp4')?'mp4':'webm';download(`${slug(motion.item?.title||'dawon-comic')}.${ext}`,motion.blob,motion.blob.type);});$('motionBackLive')?.addEventListener('click',()=>{const v=$('motionComicVideo');v?.pause();v?.classList.remove('active');$('motionComicCanvas')?.classList.add('active');renderMotion();});$('motionToStudio')?.addEventListener('click',()=>{if(!motion.slides.length)return toast('먼저 PDF 장면을 준비해 주세요.');pauseMotion();closeModal('motionComicModal');setExternalSlides(motion.slides,motion.item?.title||'다원 만화영화',motion.slides.map((_,i)=>`${motion.item?.title||'다원 만화'} · 장면 ${i+1}`));});}

  /* ------------------------------------------------------------------
     Book and proposal builders
  ------------------------------------------------------------------- */
  function bookUpdate(){textSafe('bpTitle',valueOf('bookTitle').trim()||'도서명을 입력하세요');textSafe('bpSubtitle',valueOf('bookSubtitle').trim()||'부제를 입력하면 표지에 반영됩니다.');textSafe('bpAuthor',valueOf('bookAuthor').trim()||'다원작가');textSafe('bpBody',valueOf('bookManuscript').trim()||'원고를 입력하면 이곳에 표시됩니다.');}
  function standaloneBook(){const title=valueOf('bookTitle').trim()||'다원 생활설계 전자책',subtitle=valueOf('bookSubtitle').trim(),author=valueOf('bookAuthor').trim()||'다원작가',body=escapeHtml(valueOf('bookManuscript')).replace(/\n/g,'<br>');return`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{margin:0;font-family:system-ui;line-height:1.8;color:#202622}.cover{min-height:90vh;padding:8vw;background:#143b31;color:#fff;display:flex;flex-direction:column;justify-content:flex-end}.cover small{color:#e8c76a}.cover h1{font-size:clamp(44px,8vw,82px)}main{max-width:780px;margin:auto;padding:70px 28px;font-size:18px}@media print{.cover{min-height:250mm;break-after:page}}</style></head><body><section class="cover"><small>DAWON LIFE DESIGN BOOK</small><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p><b>${escapeHtml(author)}</b></section><main>${body}</main></body></html>`;}
  function proposalUpdate(){textSafe('ppTitle',valueOf('proposalTitle').trim()||'자료를 입력하면 제안서가 완성됩니다');textSafe('ppCompany',valueOf('company').trim()||'제안 기업·기관');textSafe('ppProblem',[valueOf('target').trim(),valueOf('problem').trim()].filter(Boolean).join('\n')||'핵심 고객과 생활 문제를 입력하세요.');textSafe('ppSolution',valueOf('solution').trim()||'해결 방법을 입력하세요.');const ul=$('ppDeliverables');if(ul){ul.replaceChildren();const lines=valueOf('deliverables').split('\n').map(x=>x.trim()).filter(Boolean);(lines.length?lines:['검색형 기사·영상·실천 프로그램']).forEach(x=>{const li=document.createElement('li');li.textContent=x;ul.appendChild(li);});}textSafe('ppBudget',valueOf('budget').trim()||'기간·예산 협의');textSafe('ppContact',valueOf('contact').trim()||'연락처 입력 대기');}
  function proposalHtml(){const paper=$('proposalPaper')?.outerHTML||'';return`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${escapeHtml(valueOf('proposalTitle')||'다원 제안서')}</title><style>body{background:#eee;margin:0;font-family:system-ui;color:#202622}.proposal-paper{max-width:820px;margin:30px auto;background:#fff}.proposal-cover{min-height:500px;padding:60px;background:#143b31;color:#fff;display:flex;flex-direction:column;justify-content:flex-end}.proposal-body{padding:55px}.proposal-section{padding:25px 0;border-top:1px solid #ddd}.proposal-box{padding:18px;background:#f4f0e8}@media print{body{background:#fff}.proposal-paper{margin:0;max-width:none}.proposal-cover{min-height:250mm;break-after:page}}</style></head><body>${paper}</body></html>`;}
  function initBuilders(){['bookTitle','bookSubtitle','bookAuthor','bookManuscript'].forEach(id=>$(id)?.addEventListener('input',bookUpdate));$('bookSample')?.addEventListener('click',()=>{valueSet('bookTitle','나는 내 생활의 설계자');valueSet('bookSubtitle','확인하고 실천하며 다음을 만드는 기록법');valueSet('bookAuthor','다원작가');valueSet('bookManuscript','# 1장 오늘의 나를 확인하다\n\n생활설계는 거창한 계획이 아닙니다. 오늘 실제로 한 일과 감정을 확인하고, 지금 가능한 행동 하나를 정하는 일입니다.\n\n# 2장 행동은 결과를 남긴다\n\n작은 실천 뒤에 무엇이 달라졌는지 기록하면 경험이 나만의 답이 됩니다.');bookUpdate();});$('bookHtml')?.addEventListener('click',()=>download(`${slug(valueOf('bookTitle')||'dawon-book')}.html`,standaloneBook(),'text/html;charset=utf-8'));$('bookPrint')?.addEventListener('click',()=>{bookUpdate();const w=window.open('','_blank');if(w){w.document.write(standaloneBook());w.document.close();setTimeout(()=>{try{w.focus();w.print();}catch(_){toast('브라우저의 인쇄 기능을 이용해 PDF로 저장해 주세요.');}},350);}});$('bookTxt')?.addEventListener('click',()=>download(`${slug(valueOf('bookTitle')||'dawon-manuscript')}.txt`,`${valueOf('bookTitle')}\n${valueOf('bookSubtitle')}\n저자 ${valueOf('bookAuthor')}\n\n${valueOf('bookManuscript')}`));
    ['company','proposalTitle','target','problem','solution','deliverables','budget','contact'].forEach(id=>$(id)?.addEventListener('input',proposalUpdate));$('proposalSample')?.addEventListener('click',()=>{valueSet('company','○○도서관');valueSet('proposalTitle','다원 30일 생활설계 프로그램 협업 제안');valueSet('target','중장년 이용자와 자기관리 관심 지역주민');valueSet('problem','정보와 강의는 많지만 생활 속 실천과 결과 기록으로 이어지는 구조가 부족합니다.');valueSet('solution','3분 오늘설계와 7일 실천, 성장리포트를 도서관 프로그램에 연결합니다.');valueSet('deliverables','참여자용 3분 오늘설계\n7일 실천카드\n전자책·오디오북 연계 수업\n30일 성장리포트\n성과 공유회 자료');valueSet('budget','4주 / 예산 협의');valueSet('contact','다원 · book8453@naver.com');proposalUpdate();});$('proposalHtml')?.addEventListener('click',()=>download(`${slug(valueOf('proposalTitle')||'dawon-proposal')}.html`,proposalHtml(),'text/html;charset=utf-8'));$('proposalPrint')?.addEventListener('click',()=>{proposalUpdate();const w=window.open('','_blank');if(w){w.document.write(proposalHtml());w.document.close();setTimeout(()=>{try{w.focus();w.print();}catch(_){toast('브라우저의 인쇄 기능을 이용해 PDF로 저장해 주세요.');}},350);}});bookUpdate();proposalUpdate();}

  /* ------------------------------------------------------------------
     Subscription and server-safe checkout
  ------------------------------------------------------------------- */
  const PLANS={trial:{label:'14일 이용권',price:6900,days:14},monthly:{label:'30일 이용권',price:12900,days:30},annual:{label:'365일 이용권',price:99000,days:365}};
  function planOpen(key){const plan=PLANS[key];if(!plan)return;D.state.currentPlan=key;textSafe('checkoutPlanLabel',plan.label);textSafe('checkoutPrice',`${plan.price.toLocaleString('ko-KR')}원`);textSafe('checkoutPeriod',`승인 시점부터 ${plan.days}일`);textSafe('checkoutRenewal','없음');openModal('checkoutModal');checkoutGuard();}
  function checkoutGuard(){const logged=Boolean(window.DAWON_ACCESS_STATE.authenticated),server=Boolean(CONFIG.apiBase);const all=['agreeTerms','agreePrivacy','agreeRefund','agreeCharge'].every(id=>$(id)?.checked);const btn=$('checkoutConfirm');if(!btn)return;if(!logged){btn.disabled=true;btn.textContent='로그인 후 결제';textSafe('checkoutGuard','결제 전에 회원 로그인이 필요합니다. 게스트 기록은 로그인 후 계정에 연결할 수 있습니다.');return;}if(!server){btn.disabled=true;btn.textContent='결제 서버 연결 필요';textSafe('checkoutGuard','정적 홈페이지에는 카드정보를 저장하지 않습니다. 운영 API와 결제대행사 서버 연동 후 결제가 활성화됩니다.');return;}btn.disabled=!all;btn.textContent=all?'안전한 결제창으로 이동':'필수 확인 후 결제';textSafe('checkoutGuard','카드번호·유효기간·CVC는 다원 서버나 이 화면에 저장하지 않고 결제대행사 안전창에서 처리합니다.');}
  async function checkout(){const key=D.state.currentPlan,plan=PLANS[key];if(!plan)return;try{const data=await apiFetch('/payments/checkout',{method:'POST',body:JSON.stringify({plan:key,amount:plan.price,days:plan.days,returnUrl:`${location.origin}${location.pathname}?payment=return`})});if(!data.checkoutUrl)throw new Error('결제창 주소를 받지 못했습니다.');location.href=data.checkoutUrl;}catch(e){textSafe('checkoutMessage',e.message);toast('결제 준비 중 문제가 발생했습니다.');}}
  function renderSubscription(){const a=window.DAWON_ACCESS_STATE;textSafe('subStatus',a.active?'이용 중':a.authenticated?'무료 회원':'로그인 필요');textSafe('subPlan',a.planName||'무료');textSafe('subEndsAt',a.endsAt?new Date(a.endsAt).toLocaleDateString('ko-KR'):'-');textSafe('subAutoRenew','없음');textSafe('subscriptionSummary',a.active?`${a.planName} 이용권이 활성화되어 있습니다. 자동갱신은 없습니다.`:a.authenticated?'현재 무료 회원입니다. 필요한 기간형 이용권을 선택할 수 있습니다.':'로그인하면 현재 이용권과 만료일, 최근 결제 상태를 확인할 수 있습니다.');textSafe('paymentReadiness','토스페이먼츠 안전결제 · /subscribe');}
  async function refreshSubscription(){if(!CONFIG.apiBase)return toast('이용권 서버가 아직 연결되지 않았습니다.');try{const d=await apiFetch('/billing/subscription',{method:'GET',headers:{}});window.dawonSetAccessState({authenticated:true,active:Boolean(d.active),planName:d.planName||'무료',endsAt:d.endsAt||null});textSafe('subLastPayment',d.lastPayment||'-');textSafe('subRefundState',d.refundState||'-');renderOrders(d.orders||[]);toast('이용권 상태를 새로고침했습니다.');}catch(e){toast(e.message);}}
  function renderOrders(orders){const box=$('subscriptionOrderList');if(!box)return;box.replaceChildren();if(!orders.length){const e=document.createElement('div');e.className='empty';e.textContent='최근 결제내역이 없습니다.';box.appendChild(e);return;}orders.slice(0,5).forEach(o=>{const d=document.createElement('div');d.className='readiness-item';d.innerHTML=`<i>₩</i><span>${escapeHtml(o.planName||o.orderName||'이용권')}<br><small>${escapeHtml(o.paidAt||o.createdAt||'')}</small></span><strong>${Number(o.amount||0).toLocaleString('ko-KR')}원</strong>`;box.appendChild(d);});}
  async function refundLatest(){if(!CONFIG.apiBase)return toast('환불 요청은 운영 결제 서버 연결 후 사용할 수 있습니다.');if(!confirm('최근 결제에 대한 환불 요청을 접수할까요? 실제 환불 여부는 정책과 이용내역 확인 후 결정됩니다.'))return;try{const d=await apiFetch('/billing/refund-latest',{method:'POST',body:JSON.stringify({reason:valueOf('refundReason')})});textSafe('subRefundState',d.status||'접수');toast('환불 요청을 접수했습니다.');}catch(e){toast(e.message);}}
  function initSubscription(){$$('.demo-plan').forEach(btn=>btn.addEventListener('click',()=>planOpen(btn.dataset.plan)));$('closeCheckout')?.addEventListener('click',()=>closeModal('checkoutModal'));$('checkoutCancel')?.addEventListener('click',()=>closeModal('checkoutModal'));['agreeTerms','agreePrivacy','agreeRefund','agreeCharge'].forEach(id=>$(id)?.addEventListener('change',checkoutGuard));$('checkoutConfirm')?.addEventListener('click',checkout);$('refreshSubscription')?.addEventListener('click',refreshSubscription);$('refundLatest')?.addEventListener('click',refundLatest);window.addEventListener('dawon-subscription-changed',renderAccess);renderSubscription();}

  /* ------------------------------------------------------------------
     Policy modal and integrity helpers
  ------------------------------------------------------------------- */
  function initPolicies(){$$('[data-policy]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const type=a.dataset.policy;$$('.policy-content').forEach(x=>x.hidden=x.dataset.policyContent!==type);openModal('policyModal');}));$('closePolicy')?.addEventListener('click',()=>closeModal('policyModal'));}
  function initIntegrity(){document.documentElement.classList.add('js');$$('img[data-dawon-logo]').forEach(img=>{if(!img.getAttribute('src'))img.src='data:image/webp;base64,UklGRjBJAABXRUJQVlA4ICRJAADwCwGdASoAAgACPikSiEMhoSERqBTUGAKEsrd+P8f0yaOFqLYBadmX43InkVE1xr/G/l94248PFf4z9of7r+zvz/Wn+g/3r8pf3v/6f3n5sf6r0Z6l88vx38w/u/9+/yX+4/t//////3a/0vqJ/qH7o+4B/FP5B/hf7Z/nP+j/gP/////zR/gPUb+8f+79gX66f+n/Nfv/8z3+g/aD3O/5H/Uf9L/If5z5Af6J/Yf+l+f/eL/u37Af9H/0H/i9br/3f6P/d////8/Z1/VP9V/7f9p/uP/////sT/o39+/735////6AP/h6gH+9/////9wDzv/Bv2h/uns1+NfZ7++ftn7Z9Z3219irbH2PZnvtb+r/uH7ifFj+J/6XgrwAvyP+df5/8v/71wsQAP1L+y/8j0dfp/MX7O+wB+tv/g8tXwG/wn/K9gD+ff4/6gPpk/rP/j/m/9v6Wfz7/T//T/Y/AZ/Pv7b/2fW6///um/b///+5v+xf/4G5Khsqhj6L4LqZUMfRfBdTKhj6L3dnLB8E7+HtmCGUMU1jOqgmsVW+rULZBb0t7iqHiNBIPJjhQjNTMulQ6mVDH0Xu7kkCd/+0tzfBuGs0oE9CbLtuztUvapdbY9HzRJpbmlZHcI+eutd7FNuBrviS8H0XwXUyoYc57W9THLzguf++Mq9C8T+orkea0WodoM4iYHffIIf8Y2YNEuOVDH0XvVGAmz8h3ZfwXJ1eSph9oK8+qtB1MuNNTTItHFav2qDflLsByyqGPm9sllAfubdsp9K0I49sipMMzVYVfGGEofcelO2Ohe3Bl5Gx/bG+iYoVmZ3SdLqa/gsa6Q9ipd20hTlRQ3mpnK+Jdt3BB3FtbX7PdhWPYTh0z2LPbTCcwINE2VmRCywkBMa3JsvD+eafmLIWB8nXdjrz74gRuuYtx3Lqmc0moRds96y/ZTKuz4Xfhv/E59xPvvKG0iUz+2S5Mfmm/Ir/nUxFjxZgG9vQVSzjLmzuEeFIaNQx8W93S1d23F1E7Hq4VLWa97GFO84XA9QWwKGdlh4aVMct+qZkr7X4zgyGRuvMiQZN1UU21gl4pway6af//BJcpHuRqH40jlNknBR14viM3hITFI5vVDN2BUVsM4r7pmAHTbBK/1bnagTQqevFyO/OW2ro2v8hSIgKc3M3QYJ3nr/gm5dzMJKG7ffA69qhg7LnHU03hKJIKR2lL4Eercf4xitOvQ8svuQ62A+6IAwUYcsSbZ4d865llOyDq18MouI4NBwrFUeTcyZ5E+okVYQ5yLzF1RbV1ZalCsbc6ImvTtKpu15KLq2t+0bajAcE0wQ7GbMKyrccy4C9SKg9+6MegY+9S52axpc2UzUSmYlDCHc/iKrRsNGKbBt2zVrylNuwmHJDHt2sW7a0/n9Dz96NofEb6ju9Na5Lian9MgkfEhsni4ke1ljf6ybdjtSa69aE+yl9vmrnjqssuS4XAHv+fN2rMuY0LOjJ+Bj0SblF58pZ5qsxw9QIDqaw4blOUaZgVViT4imdY50noX9i52qx4U76+HQxgLbu1ds6AidvtsJp4QNz01s/rs+04ez9vjxCvjq2d6DbOmceaR+aeXor8aBDFGmriy4XdLJi0Q7ujW+1SfB4cbUog7+V8gfeGSMg2WpwkKMdDt0Q3nbP1fzEdqrcg7e0HnaEGrvFju7UX2BfxCqpmrJ6d1D/EP//GC4z2JOwBB4f4XmSS3R1CTKUDtiqYDs1l8hAs/7HnSPM4ZLkJ/dV+bvOFJOaPeklrNTmjx1RdOynXZQpiys5cIVxOCLEzpSP/VOlKCz3cX0mXt8MYPsYdlbTr+tOzqkpbb+SjxcqL97BmY+9xMyhtZe8R5LXnXeot4a6G0z85pp87ohVcvb3MoaKWN61S/aUByJpA2/MtYFss/Aabb0xlATy1stDDeljBbxIZk1oxYXJ4UWfLY1w0DDOWhFFzRLuUcJvidQ+FijaivOdGzW3yBLZbWO6P2/FghSGi4CriTq59m96JCf6OB4I1zRh9K3o3MmfnYFOx9jUK9OMsfa4eyqG/eIt1qvBJ4Cw/kApqHE0K2x/ZVA3N06IsJvE3d7ixkXjCT9NX3UtQMhacjEXzEemVoUeh/8YHDK3MSRdzbhPZt220Lzh1ZXjDQU3A2JuszBgl3aU8cfKhO0dG9VAB6KqHMIYi5f9qW4EMFi5jzpoAW/IkvOAqnuUNn9r9/mZn9/tjQXe/N2xveQVVhyZpmQY0cbD9eRY3NrbG4lvp/4fr7y33tOYtlqN8m/0zbyax+UEzu2YpE/NRdNUH8qoZ7/kFjge4v0QS3pHiaWKt+b4WJ4GATxjDXw621Zggs9VSaEBfWULbyz2JT/sIxlQzRYs87OyruSGAy+AmM3lwALJUyb0xbi9DkxDfZzNdgNy+wJqcCVeGpAYHmCTrCP40IOVcJMTSh6hjxIWgNAY3eiD9H/T1MZjsVZeLQZ1OxMTJg9qyRETacUFbi3ZtaesLY30ZUgn7RxXeFRdQy5fQh2Lp8j03VkO6D3oeSePxtDTkbjOq7yd16RvLWteJvovd3biLJgKUVgg3UKo5D+lV1aEoBagME+6C6JgIOB3cB1YDkdEbQJUNlTQna+s4G506fY0iE5183XHD7IUBPYKMa8IkMPb8240nf6chzI/DY30XwXcds0XhWDuHd6T2SusFezl1KeM/6MJKYU6ASO8vGn4u2psbcr/BKh1MqGPmVzlxcgcutHaFwxnBJ0xX4mDooPhwIziol3rb30K4Ouo/9xa/hC0dp6XGXwXUyoY+i+CMXZ99/K6cZCyRtn67yFZEqN9Oy+aXx2eo8IcbhhH2NJY1MqGPovguplQx9GCV63A/4ei+C6mVB4AAP7/q/QAAAAAAAAAAAExrrfRwswyJBTJbYhqlLSmoC3BgTahOQ8BX06lQ/L6LNpg3Lk90IuFQiQHx1K6HknnMFPkdGwDQR047ZSE77kB25yq3bdj/N2Mx5ZClL+XYfyu6pinp2dOoDqFbxSvRF58AbJQim71JWIBWD9eOX1kMw+PsXqjmmDJIyozTac7gHSredKwP2tCPP4/G847lXw/4S03qiRxlaO5T/f6MIroG2v64Zk8jCrJfHzjvitLFT/6ohFPj00h3RLvDW8XNG5zw9S1m13IyZ6CSSpu9AjhLp7rcb9HrVqgsmUmo5N6yyrRUXnOxBj7KFkBSMScVD8Lcr5EDnJxLdnKN480167zk6CK8Q86l91cRqghevpJXYGbAy8E93BzPlgbHrhvRYEU67qNUdym21MAKZcZ91ulGi024SNKJO83gnyQzsSoTrRvUEi81IjZBMw8AFdDVyNF28nHRIYQAz+vFqTS24pCvyaLD0pYcP4YKoGM+SWpoYi3fp67nc6Tp4AWAdeSjDjWoEEVYWOlu56hCvUKhzlvPf4AAAAAXdilnZtIqq3MSzCXRhy6ZFQsP/fYCeDg9aOUskRSL5Dad7fTtpFWcgiKBqlqkL3EtgObsGrWDIT7oivD5Ma1Gc68yGj5JqwTaVCR4ZXufMlaHhkIqUk0Y7q5Oj1g0JQslJTmkMpZUPgqJMJnpBcHNqFCL3jzE12H4+UKjvM7ig/pqe7iEAtHv9iQbEdLAcroQHiAeNdrKdL2TsEOJSwziFdDYcpPCDivnw/LXRJXHHQa7NWB0KYovZv/ELXukJMGL0cN28DH8JQXtyXbOxT3uq4lk6X3ppQCdplckqHTTlV1md3dAx9IktxNjlg0Lneuxo8dCFvyYdiVR1sW01ougVSLWksUg26R+plgMAVTc6/T8c5tzQEgl6UumYfgqQyybuSBRSjHCSVJYJrtmIOKuMx2ZkHzGYoDbr+SGwe21+r0riINibgcRCFjb4fIgNAAi4gwJe72QcF6ZlakRcrBFOE6XwuQ3tBpEol56FecX3uA41rFf8KpYtqfd41veDZqVDAyHH7vZgYs1cdJVbRU3BB7cICfCrYcMcnlLUV7B/w08P91hoP9JzeXx1EcFu8v5hDuoH6HQtFvMYtcLqiEeWmumgPtoIlFdExYqAAeBthToYShGL26I225PRAT2eq/i0908nQ8EzuWAVkSndvv13Yl2qwMwFgM2br5cyiyzwzW6gAAACmlzVsdhq3fj/VCU+6J61ucZnFSJVL/ZyHECXr+kVF7HnQx01/5XfEvEwVY1hQ2Sh6uq171P3ARIDtxUwxTtV4bhnwXeDBtLf5/JaT7+mJYmjZDSMKljdLkmSpXptJzXY8hLi2acexd1XwLx/Y6p04kkuZRApjLAtab/u+JSeZBeYHuMT++QzYyNfBPB8N7fGpTXVjeQ39y50BqBGWLa3KxzbAJkUD+kjS+SF+I1BwYcmjWmEUiaRQJYgKOR6N4U74k7aXv1uba0s68GWbaB9r7cQdFh6ylIbd24p5KyJrXd9bf7CMkfJQ9wl7ZM6tHXCaPOZPM6HDBJF2UeFbrtvsk3CvqSZghi/Nsnj5zrTi0DdCDLIw9wevE3RD4NeYInSYu2iQFglnXu7yOiSmH/JVOtDKydVS5arLA7GOrUNv5lSrEDyAJRyBnrgWRxg118yNbUs5pbTOqlnuY+CnnXw0SNYAAABl3cTstADPOJJQJAhXtXbPRQfjxyxPlNUcdVuMXmGRdu37fp99Ksqjfz+KjcnWUuXx/W4cEH7YGvLnQgZQ1QHpdtS/e7ozWy2mg6aCl4r64mXFAM1kvua1pkHxc8pO6KGPyCTHkeWFILOIY3Tec2qiT5Wkaefp289MSESu+U8fJ/b2V/FlMPU5Xbj6fI9N5w1gZEmHToA35BJ9istma7nfYk+6+LM2F3++2wSTbHUBV8M175ymNXJlC/bK19m3SdrQasi5QgT930zoDJF3ViXeZ0Lp99TIJ0bpKFzzJxEDLXzKC+pSxl5gFt8pvTM53viz8exmQ+YmhmFlyJ4Dn4FCrwSK8VOG7zPGwx8+hWIFJ9mZCmMj5V1tgcBLaHxvo6e/Ha9cN9XWKocQyiOqYoEqRc6WzDHxhevmBFUrj+5J7hVvHfFnsvAZ63IS3V3BFDUkzCqVDXkAAA26oJ3DVX4c2WM9ox8mxmCIJ4fsQWPcWYEWe46Kklqke71RG323nxvMN4CPKV0+1THzT6ZVi+Lk8qpXfr2xcyqcgO8Di5Z6an0X+D011w7NuAOxbuDEpBrlfhzCSaQhpMqS3MWXxdT5j1gZD1kFvm6hDTLKZuu6AH9O05Ccv0Q8qOgCqf9A1ClvFLyKRjbzfl/YYU5T8kGeDT4bS452qiTW1IZjiNNKuXgFAcDPGws0YWoVCFFBtrKWbafyPZZrpsxSlVfYS916M7wIo8+/60VbbSU6yvoTWxT0ntvp7j8WuFYdlZox/1Sn0zd6mQsZJHcFwnHahlmFtwl7q3Mw1Gbnvoke/lSsyzhibgAFPh3e0D7G+MvNiAJpFBIqnKXatWDt3vWdUNeQAMajI+Ve112zyfKTHQ7HNxIYMjmmaCM/osCi+MX5uO6qlFi7CJD2wT6Iy+Twiaj7tbYHpY8btBLHvx8f3lJq+1XoX2F9eD+okKyXxV3/OsOTIsC/UPfdaZx9LD5kZpMCQHhKSGhvF3Izf2Fp4HrZwBZb40OEwoBpFz1/dsQO680Y8Rvh5hJqMR80LwkFljr3rjGmyCT002uQzXHfF4SYS0pft9+FUXKxTqGa24B9AbQmqd/BGGgiNLJsuyBvBLR4rOOmdeNmiMmXYPAVpwKtTnFrJPtHgKpbcHWfw4pKEsuyJbYpzC5O0/c4jQ0eRqEqjthPmfzwllIGwlF6WG3dUfeDveS3UM2RAFGCqHLkPqOwJKyvpKhs2WgniBIQiRNuSoTFAHBgEp0zYAMO2rCJqzIws2RyrM0by/SvalUlxvqjF4s0OO+ADyDznO8AAw2Km+c90gc7AYaqE5+yR0vRco3SkQV1ej5JXXnmWN2GFxS0iz0wg5FGvuW0FWDfDvqyqh2kmqLyqNKGf+xGZNt6eLMVwEQOyUEWWqNe3CXYzpnR0xUaTyAvwQFa79vZIu9xY56bx2koyyKXxPcklGVB3ZpnmdUkNCHP/pEK/qMfisAg2ley6VnKolVOdGCXns556X3TVC/yxjmEO+B1dXsPvZ0y4vvQZlNX/OZUnnm6DDWkyrdrixA0vJ/qy1KzzYfK9xvx3HB9soYSy3ZE4HEsQBImL/w1iqFmPGpIxcJMqIXb4QP/ADDRYxpvU4Wlqo8tszg8drfOzgBXYEX3yj32Ud0gfKVKHS/MILSsnwFhY+XxRKmDjQ9nsfZyeJ4czzyGzkGUozmOL9z9h4l3tzDoM+7/XPdzOIplWUjxHW8WXPeQwWc+/EjbMnm1GyJ0LwUpEJHLK2cy6wp2/1196PcT5x0G9uQMJSknSiCjCUYVWvtSKbkv/QBHbVrZRn29ooLGIctNYr2Zlz3RXu5hABRZCBA2CTtFmKCch//lLIUfl2eF7k1YlgtnYPmOUg5b25ZXBu11mCJ0BeqXwrmy/EbQz09aQ+IFKp1eyNb4bVea6//C8bIJJtJNZJ7EsFvxOjDDOSH74Yc9Gr0Uil+/OMRwCzly4cRy284CzDh5E/VF2Ep6vyXFvJspMJyAo3JZqXx88ajslt97YKWNnaCvR0kM23cjukenJYhoSCL+njRPg9uR9AHtkD93mt4GS8iDnO/hudOl6s8FP6yU59r1+kIVPyalqvvJz/O9U7+oYKAKN8cs8/0+Y99ZdIvKSFJwa5wvSwjhacHM640PiyK95QeIXEW95h2TBsxGdkaahYe3rje10WaFh0Uv/O+YjcFaMfzQ5LoiPRxA///6jTNZBYxwaPbi/rgXqGX0OrwQp/OxmpH6AODvD0CFB1v7pkVoqvBmSsWTlA3ofOf1YIiTBJaWxFMYhPW6/ZJCTv5GKDLsG5mBHE+ZOwdk8cSzD5YLcvFyTNMDtvCKjkrXXs1i/H6Ar3WMg42hbUJbM6IhR0xyt/+Xh6yLskP6xhr/7p2X6BfGOCCHwthoerPXCYvQEyocoQarwxuR3Xqlh4zU4Mx6xVn5EYhNSkilgrv3HXHy7k+SMYc0iIVs/Z9EaXw2/0LX2e32xAfRdzrJEZDygA9iz3NxfKjPCq3yyCu935q4AV8B9HbCrvjTKnQjoUuoWXL0geFbkKuIY2YhZNcPYBIkeEZS6H4TDDobojS352TscnIt+Rr2YfZ4gjsFH6/prAu2o03lXAlb++ADY3uIxgA9LcT9bZxib6oWm6uZIsK5CK8fcUd3epOOIWDv6Em0Ex56wzHyxV89F6ZUWcXmgv5vEUfRnt3FFbsEGNQ9RVNPlhMjfw1+hI5Z8dG6tU4nSZYUwJSPOJgiUgdUKV8GuFX+c/dr05CWGX57SE2ZJKMNgfq2tu4TpDDBSahsA3RhiFt7uw/QhEt1EckWrUvbED04rgiq4+RG4cUYKtTmnmgw3UdWbmwguQrj4QlFzN+PAhmawpjTuuDqxsgJFmXWrvFpdbSNlqE3SN9sx2xF/7aqoM0upXp27q5sdTRKVaonfsAQ6av8WJzzmsYFlmPpMOWGxt4dT8qeykdnzfh4Sz1rjojQ7/ekUJAsoE9rWZylyrHs5ZmVt68gptxm7JHJXYuNHAv5fewAy4cEm/U4CplHCubZl1iZgPP8aZ76Z19p7HdfyxcHpFfUyTL6JAtuPBERK4qHjPr7O02/p7bZVFfdoDWxRMfseOHWKdpcXbzzW1o5/eg8a/Gmciqg8ARLbywSN2ep86VuPPws5elpK6IIEn4cFYRcWKqS4riR519oFIscaPRqko2YUqjsnqLFP1YPjNOal83/1oErv9KIFX+MwOxGiTRFGyKYUg8uTV+qenAqdIdITP7W6R909TO+J70CZVoWN62Oeaxp5/64CNhVYZT/RNqJJ4PRxS+IZvcOyZkhvMmbx2ILIcAJSX3LmhU5IFtlwING3DZSsrhInMNtn1fWvnPO//4/HkoVRig6cn1sW1ip6ShUhzLJ2IoOz8woKSOw89zWMHJwU2MJyCj+UaAHA7WRQjvyu3EjKXWpmHV0wHCD8+8hku+Hi/x3FCVa8/Zq4S9ghQc3eRVE5hI89dtL0W9FUmd+wsZ9IcF99OJGh2e6yHMRPVyr6uxYXuoEu/t6E318AJjeagv86bJkZqXb3md0VLo3hX4V6t5YR332tHyhMfXvichi1XW1UppHYIOmGsvBVz+AtDwzTdp3kYB8d9lOExN6uUoVEY6t4VlaRzNlhDb8dv3aO1CWMebft0ygGGpRQB6aIBre7YwAhNgPb4CDnm1fWzppdiB/r6xE0IcRPiV4Frgn9DhqUtVjgzAEuPyLGfOC7McMEsoayAcj7P0KvkXQBwzqOBOKRyG6y+LKTcZn7dYeoIRC6WhCSH3Wx7gyg5Ud2cVUDUNh+AflAHOV6wwQUQLOv8mb18zkepNwtu215JE/5kNNYmYqVj3KC2NnHh5Bhgwh7Yl8iAI165k9MIQy+nCbG9K75/hVvkeCbjOrOV0bmq66c0EIwm1bzazEBlr6gfXaqCD0/MsKhp35hwGedI1bfthj64AXjirVPT1P+npGp3EXO33Y+eUXhwMqASEexocnZ97Ul3p3axFYfjpcy2+bewbpQ1dj1JuS4ccf/W3PL6N4KevFfrYWydgr8Wz6/7o1eIfaMgVHmsfaVXU+OxujjA6mpGTVBdHHciaHT6Xwjd+P80jGse7SAh98SYkPP93MPZnuFsDdc/RF64zWlJDF0GjgHBOO0GQ0/eZMOOC9l61++NqbhIj+lU9XV5g0d+ShqhNiYUxA2Dvw+TBmc39nfs7ckM4htmD+aB/2ycvLgHfZXvUwxxEqijfIce/Te7T8Wihh8gFtfzWF/FGy1Hd1CyI/NrY0oXrJM3tRV42Ax8x65NpadFr32PQv5NZAGHLxgUAj/vDixIII6XySI7rAUytfDkrVfqQHK9XE0Jm1KgwAoSjlE0j6alqjraPgSD9VrvbIB4cApKVtZFdZjFoNFskIijPPKiyHsw3+jHGg2jb9xvVrPZgDmUtOUsOKbPlG7tUuObKNqyJnkCLj6iUiAPQ0rEIFcie2TMNLqsK7ZaUB+S1uN8MZN0vyFUT5KxS/4sj4bd7uvTQvwChCbCT59Qnkaw+zPLSJGSGKFAvNzybXqWI1dSFI2e8XDzHFK1xDv0yuKJOAyw34cEsl0YLCAG5eiWCRiSeUfKOxU4UWYGs73NqbfyimCx7McXf4IR22DFzOZc+CVWD81wD4oqMxd6nQpxkb7QS4vLnQyUCGOEshh7iVuFGr/nl/igt/lMkLSqiKv7nFshdK3eA3wqBrlKpRIj4XCKS2ksafzor4U8vUrBkpvyFMB1EhptQwu+O8f9y7uDAMg/k33QoxOW26qjn0Wj/iz6dG0q+RiFXKms0nutyLXOb6C9M3GQDGU3vLqMVV/tuIHQDr897QWC81hQ1jC4N/CSM8XRtF414tLkktAfcZ/zNSpPpAhHaHM7Cp07ULfsitOpsYhz/rFnDje1FiLr8RKnrFAtAEQl/3U1Or9Mg7AyA1fC6DPy84fPeSfApgbddKQWXhTOUX4uM7U0AiJ04fxMtsOkQqcrSWM5cUYwG5YrUPeAA7h/4+fFR4nWQDQeRYVlXQ/zOtRqvVT1NOybKkkVq8/yxcIJVGt7PqMmJZ7B1lhS70xrBC/i1c70dDZlDdC30x9+yHjrrZUsEPDzpCQABlCo55W5FgdbhIKSwbkvYulS4SEloglBDGB5xLkTPhSfJ4KImELzQ5nj7NfbD/ikb4ViDpfrMXX0vKDthwYKc8BKWuop7KcSzanZLj0MqG9HxdVHsxMT09H5bfugise0wPXuiqGRl2lOwy6LYin7YJLuMVPzZaK1bRyP/jmnjZtpbhjMG2wyXuD0i24J6ijgNptaXadJg9/sok4l/7ZanSqyPkYUC+TC2LPo+x9+aTjwePvrIXU2BKrMzVjNGR1IqLOVqWllzDGjBFFgz6nMTB4mtQ5r88CqWArxrTqRudSmCKsY1eX2KGBhwMlLDcyXOSUitrZ3vMzrqfSUGZXkNBzMwMYGCoZuaFcnUjFIAey9QhRTjhE7fB1TDyUYw6yv0KqJC/a9XzajKytLCodsYBCvtzv0VuYtxLxt23WKkbwMvW/wEdA5Jjm3msdoseT9P0yJPw+RURVQ585mTWOcnl6Pa4HNlIaTmKvFagtbA6YgR71qepMd9ihxTrLFvYPndXwlVyqMIiXU0OCFlEd8TKjFb006bCLGCqi3bsR+rCL92I7PKXx1l5Gzlm4x0pr6+cwN7Ins4Y3oHK1CItp2dt5Gr/Mzp4TrjPTTO3O9C5QUa20rVOkw7mUuCGFyTXLlZ0Ez4hEaUNvu4rWAJwro607t6BYyo2G3w79SFvBgKJuCnp/OgKzADntra0Y4W/XaNG9Oy3U5FGgnM1aOKnRzJj4v2PS3QAscL5g1gomA/9LND5BjFbCnm6PKMCP394l6jFJemH4lRx86VukzU3DrLYh/5vW3TQSsyrPA3HMbqbOSHeSbV8Hc7xq/vIZOwoUMxx34vb4X2BOoyBTUg1+39tU2Kf54c5XPHuv1W4FEaHDBgfPmlye+jnm4sEwMujI4le3IL1yyUxmMlYja36FGzH3P9NPXkawyUowydBFA7RVIpIZMVg/XXnQ33kUEpw4jwK3y+G8czjEozxCxPIoqJKuGyExoG6xMPU51MmouJ4X2BGbbCAPXGJEjOEg++GqEcHe+jit3hx6Cy2TlGM44j/DGZoX6MTbxO2H7mnhSX9aDgzEWYkXZIr/434bSafcQBp6OuZu/4ONBfAF9EMhO7VGTm4xaJaj+nPydP3jQglAsuFfXIi8JKBjJUWyxWzQT4QsHJ/alZUMJGwBjDCwYbKXJjI+h9+jnJRGcty5IXXlMZSKFlunIP0itTxrSPjTOX634WWeCniAOE7p2H1zZinEfmC6EjH7ZYVKAUIUcVWG1na++dmkj9jCZmZlirpiBDvwtsZnrM9lum15nEWxVwJd3lHUR4rwvD9Bw/J0lUTpCEcePIoVjCRKOxAKFvYjLUgMm8OQpYJHugIinAqQ6OHTV8zH9wBelyq+vCmtJ4f+DMq5JWngQFoiG5g81hsU+zZ6/pWHUAc1yOPQFTNoZPsjBpJK5sFe6M/EK036A8/TVmyKMrBLPtwOXsFS9YSd9/CeMcGVIKx+47QGCpEaWfOyu6PHO5nVAe241OtxsbAmkQuTTMUXyTZFmImTub7ZXXaW0AFweywxmjP2RlpkxTfZowtBxWWUrf/KOPShc9fLGzmM1W6AYzjZOCcD7vK6eQGnemNsyf6GZF9+RK/JTW2XWmcpiXtO8h2fdOGetQLqgDy01tcwHFo9X5ihXxThhm+l/DcR4QlZwEb/I7fadfDq+Jb/fab+6ZXQqUBv2/CgRhXUyL9w/UCjHrCaDgz3D0cUGclf89Cbsd+RN4MfkriiDbDUTBeUy9uw/dxxYeJjBdfKjz17CmoSmLDOXWwt2NlTZEzBUdwFYM8oFRP8rsLmB6DhtbzrR+ikWLlWSDfaAk+4kipxL4TnWhBLoKuIBjIPbuY99k8sV8R2Z84sN99RQkLtkl6/9atUJv9rk0ssr3W2vXCHLgWU9HyPTVgfGVtmR44EUfWQMETMmbpmN/5LFWli65o3y7SKZEk9rROttOhQalrno9bGRbcsvj7hjMSesJE1ePx0gLpmz1c0Egp2ZbxKYEANK5u/s5lDNtLtlhtUlhKS4/KV8+VnWj/1dbbAV9nH9PfjafDmOgY1OC36cGwWdzV5jLn+FAA5kN9y7T1yCP2whYoTuMgBvanVpJFKXdP2lRZDCHEoogyLoge3+lQ9zZ9rhySz7k9OeOCM8s3U3dTpKCzNswvyhU2aOzZJZg+GWlknv3t8pr5+l4xNOfhvybLPuTeFup2DN1VJ7fTxwm7nBa+B6W73q3O8LwFqI1uAEAyoAoStMvDypPe9Dz72F0Pkn6/aRgkOdKFXl6SbdFbmZLKJ/J55lYrFA8X787Jnw+hZIIe8KEskH4mheWTbjEyHVmCj0oxFkr3NFTz1I7p4zo5QbsPrnBptGc6AH5w5NobTVs+vUMq5iKh1SI+H0rWoBsGmh+VzBcznm/fluT6w+u3vrOw3pVmQJs4+Kmhb5HYCYjp2q4IMNQVK5F8UCr4CSvLcGheJCeg76RHqUa5dwYPeS3PKp3cAeux4uYTCZEUIpHJzkcXTVNH6VQuws48MAMBjD0jKg4irFPl+u5py7Ft7mgjcA+iLrXjo1FHGuXGFZWbh6oW1gvKf3PIg0zIeu6ZT5z/ax1ck50x/u5ywut3Zy4gGk4VppcKvaPlply0ZjYMmfWO/JybTFLDnWtcL4yZygGivCIrjGhUZwOuQYytYG2A+4YffNtgiz8bubjW14EStzghBZTn4IwNn6f93eY0ytp0cWgC8OUL/WYc+LNBuB3BpFHX4MDfAUJ9m6PCiuWUgbim7WVW3AMqF/dirU4iHm6KRTLd8wGiGSJl8US2GkZ2c76NYKjyk2/oQzvUwAS2PDkqiOzp0Slwf7UE7GSV8bfbP415ObRUuLTlNzA4zTnU6fF3oxQCHDDCJmPRwl0Du5l435yFjiCHFuL6aoLPOjmt3/93Rfr7ia/8S5/wvDKrJGgPNKbaEuvNPmt6nUKHrU39w0Igfce23qoE9OgrhqDn8ZdyBoa3QFlSyz/n6jceD6aHAjQk4shzRL+R0NYCH7efzyD92n7RG9McWyAm6i6gonC8UUjaUX9NkjzfD09vCCzsVYnV3c/eE40fpy6vjV8UK78lMry0pOUaHgRi9fCuUMeaj+O592L6frOk3r6lSCDrCEDElEPP7R96PQlVunIYDqi/tAHq2pk3+lgsB0VsTd7U5/Ls6aP7hCn3fMD1sEYkN8lJRqfh+cQQh7IwIFwVlz7CHzbQwbOk5jF2qJbmkjE3QStHMwUgwi7/IZp/VN+hjs5bsMU2p+gY11ZJQHB5OQjt3iDAR9YH8QCEO4/JchRabeKfMNO/zftQIbXaF8IFM1YSYeVO53vCpiFqi+CatFN1C48RJWSTBnTBzzLjyxhAjbJrZjNadg2tFuvM6rHBkEl95ATxlkA9icOjuYvzsXOVKXpSznUEh8NO9wL0Mh1aobH8ZDRDZWCSa6TJmYY/Mne2jSPi40bwyMVJX+h5XEj4tm9+PUt0Quiu3fdaJ6GkSDnk/EaCBIbq0Ofl2A8BSCkpvbE26yz/XMG0XSvzxPKBY76fLWWgEc7P0juq8nlDOCirAIDa31nGm9LGuFIt8qbeknx9oT/Pq5kwoBiFH5DyerfvMaLt2cyNcRBfx4IVH9TzWbwDr6+3Bxk/GQygFyFB1erNZTNIoQB2liDW4jhtPC+lMsSsAAKorokK0o13fzwSN6gAP/FDeXWVbC0A+/4jztKrLQmcMqgQ10fHYHfBtcSvn9HJ33ILYbNxfackdvb+Jf5Z7rZZf35PQ1bZCVrQKEYmQgbod598/pARQ5ebDBerGrneoL3n6yKx4jV4hgeN9oJ8E4DbFbUHECVwxfJTZVDT9XS7eA04hsAr8uhMi6P1WSx7P13gJUehdr9w+zh8tv24jdNkzojia8kC5Z72MVZw7w7F4YCcTsyiv86IV0r8aoehydhZ2Ree6gm8ImTmWLhap79zD8aS6rl4PvZZ+jI78WFiojD7zKXjp8GaFrmjntsPSW5EoissLb6dyKIVBC7+ry6qN3+rNnxNU8r7KUejJOdyLRhIaxsmWUV/anad7Fl4cYt7OSAF+75oIQ5NFgUH9KmBbmQXwtsKqNQO9a3djmGGYyK9TfZw8HoLU2o+/qFOokvnPcqZTQwk4r20dmN9kKorDkaskvS6qx9XvpuYKE4XOjZZ4hwSgMwLenrba2fvGiKgCTzMCgxlt8ZAjyQNFLRzZs58I87rqTrGX6TVZda2275oM2zQo3LmEyD8OHgei+AK7RodM1o/4A5ed1H7GtEodeTeJ/JkA/WUeedI/xYIx0KnvlemxrgSbSb9NSf5bhbaPMhKQr+fpy2/Qf0qjdCvaFVcxpIcEVdfqZzby+93HyLE2r5udOJarDUYYryD7U6uHcugXWHmhCwMQBiMW53wTscOVW1MgNi6DLKHtBhoO2pRufAe1Y51SEhql6kdIHNlp7hK+TrSmRgikZt9ujXBb0cm4MjBORPO568Hx7HbJMYEmvm9N9ACt0y+Hkts0HgexO3Ni7AylxiuT8RsdqEmIHHJWh0YIxYlPLiBVwD6iQlO0nHip8wxX80KHFTbp0Fs8gaGD2R/W7BG/+Ba17wmF/FlXax42CeIjvUn9YLNKtAFkJn+xfnsWidmaRimhw7mvTQqN6J5vgRYdTaGL5PIMvdoqP2Oxo3nQ7h5zZrAf4ZPxSZ0uco+P3mN2C08vnPfUW3uk/vbMfMwJ0Oh9glnQkPG2ZJCXvPCglLjCd1g4sfxC9U6aacuJoHIvTAXN2tTgP59ffdcwTR1Y/2vt5LkXTA5ylgFN/+1MBwFKSWLs7S6t6AwgUNlayDjAHkc6k77aE/YiCYH8yPHUTarkXqcxUl0iWwyugyteM91jbkuXcePhD2O86nwE+GFm16UihphWax07zPqu4KOp1m9O+tiAqzwbIYLxis8vSppR8IrruzE6QBc3E6Let5pNkKMcwvg/fDUG00dfn80MYOk/JYT/Sj25xh2txL2UtaGKoWM3YkcCCYZ34LeO86MfbOO9H+f96YaQ2GwXUUmMuBs5B9K40ob3T7e5NRUbBBe9trgN0HFPsLUNckckgjFU1rvXCCcjiqerL8fO/4CogwM3GdQmqz2fc0abiNqy6WoOC9Ww57BzZkJSqRJMYZBQppJ7TD0zzahbU2NWaiDNBorNiqifQIPWYm+tcAsXHEmxIdAxFGoYiUQ027wm8yhe85NwdMu4ENG22KQOK9Z32yRDLownKszOfbHE88gj/cEjKQgFGVxK8IKbc5hGcqWDptm3dcbO7ZWtJAAJpGlOqJNj0rET5ICVTRpiOzWq63ekMEJUotJf9bTWvbu2Ofl4dimgcNSJsQSYRrv8BG8gkJsh3D9KvjwMfQt2dXTIgn6gjapvXJBGVIvoW6TfR9X+2mpihLZF+HY2bWZnCsOSsEPldmpkACujTZjBi5Cx8AwBY1ZpkBLCT8/A7s863j+X93avfaCGsR0gFMRQ12bWdQBBLafoh5Wdx0pkYb7p+lELWkjKQQ7gn6F1Kn/7NmKZsrgSW7qUT7DOatrHCyjukhGkSCeGdU6vG64LXbg6xrKrI1rdVAZJA7lDjAyujgTBohNFh8gi8jwxTE5U9gU3Huj0Xlg1puPa0iIjrM/Ga589DqrAesDyjF7r4+BDMv3Brc87EseReXa4Ur0s+i9aYRYNtLcTHZyanbUMfodPOgF7lQFoYqBaNGS1+CQjLLB94h2fbyn2B13DlJptWxGPwMkZNp920wFBynXGntX33+rKqBSjz+w8IUZySaa12HbzSEEUu13a75aiw+ME0rguD0bunkSdZ0+BuvrvR2T1HvOtubqRJGxcnB9O55jXNcrNGkKhpMg8KfY370vT/C739IPM5jSX7dVuSvrV7t9exlZ1HCpEqvic8OLKWSTrgONAR3tpPwPovF5w84SVz+JyWC5PvMyLRTrVCxlwolsJWfIBLiBxd8LopcPDRUeJ8Iar7G0gpPWEJuTr0t93CXqD/o4++r2OzAWfuzQ3cSSMrtv8qST8w2iAFWMp+O8/zkd9Ab5hOrdOI6dw99SUxo9aucI9oTf1EN6ZAIcUpReAzJ/554FXsj6FvyRLgBScNH9uVu4tdiurs8dh8SXLPhEqk8uXmDUxkoWq76tyf3Ke9lVeNl/DCk6iAz3kCgD7JsM6tnrf/009ZhLHXXhDxN6WKL17hO03ASRnCeZHzvRG2py0zfLFQhcul850LmT+JV9zMUwtr4ioxpfs2EDoifkWtTvDe5F+nCuPDYc3WwFDybGqb0bfn0JxWCP+ZhHzItziMcCPlAww3qfr6L3vvHJebF4xi0VBYGbD8lPjBimBslUPKnbzgJX6rSuiIje3Ml936V0PHTOtblxX6+k6D88ykoyvRmdh/QJBruPFtMzMI/KePQWI5z7i+b/zWl8fLvy/qM6v6wuT1qIx31EPJoVcJe7h68sS3ZR9j4uqVQzd0Q80YOAqFhI3Ub9OYDkTxq7M83XKeP9H09HC9S+sBAvy7mUqqiTDoJB1Ni/tkjny0jE0xLajegx/ZzxLOMj7sxzZxPOO3qjaYD5cp9mWZfTZVMMed9/gptomzKuFA+D+qOisM4j68GEXy4WM5UA5yDkx91NOXMTXvAny5RsB5FtNdCmxaVbtYWanNqH/s7Blx5PRCoMh7UiSJK7OZRkhvOzRKgfs577Kf6Vpj6WB161+XoFMGF/cgUpLGH3VXlFEOAHoLXJtxVulQQOSmyl7NXmKtr6oiGYA7Ch95Jghx8tOWkgYGhlKfV5/mMBmQVfnf7ix8PHceKe/4OFKGo6B4h49/4vssKk8zYMgoxetdWAVT2RrLO9KOua1uJU9C9YWXn6hmRHZ+WZV4kROBkjFmfIbJBaHkTV/6F47ycqBueEeNoe35P+z8RSV/QbHGToyectQwd4LL5Dl6jcXwC5douvcth7viIHUHNZ892tQ/7MzHHy4s/dF/9P2+fNxQ+KwtZ3q/aHA+eNtNgzeLLTRx4TFptsmYZ/8UXmkp/VzbFl4A/IsIFs73ZKg/O3VWFm++FwyFBHEwzyovFSdyC06Mk6xFeN9q9LxXFbUShIWxF0ICNsOFkt2HrzGzyH383c312SctQSiqYgA6hlqCbE/ycu+ZzzejYclIWKhP2k6vryHh8dFRzDCqMPRD8An4vb5gciOwDzhjCSW89yuAUBbsi2+xeL/ydgb3kMzFXNGFThIW2EWM3GKz283NUVECDGVlVq3uVRGGpq33ovWGjq2zV41ryV38cW8Axq4woV+f2lHCyu4/zZ2qstXX59esD8x3GxE6N0wgm3mWEiD2uWDEUNDFxaZDav++2lAt+ZIozsLtdCj9SeheQZIWujCJiOcbJU7n/ikpZhDyD4TPWGAOXriEmKJCScV/ys+2+BjuwXjL0DsUVMpUwhiccBJgOvvdahWgZqP+96k0+fzEiTdnfiR986qe/Bv7Fp0McKf+25bu1sPhP9v1/qbUIQC7yJMblJMAR7643asC1aVQQNkpw0CDh2lHMWEMPPiv/0Q/mBIh9aE0/boTvKVZlyVvUq02kUF42cV4UNnhZCh/6rRP9jyY1DOH/wa2a+97QcUv3WwMxE4fawrVHw6qJsl8Y0TOnk1fQlU/fXKw1yd6D0VMRRMZ2hUbdXx/I190xBs0Gsj9F3aBX1vI7LYBwY0ZUtBBvZAEqVVIpbN+fsifZu6hrxo2g4dU0RoAYC3bZPc4gTvPrBomBpziUr6oWJTAEkcHxLphw3d9JESn2lLGpxqzDK+s2HvWgQ2Q+fb78qSrLfoj2KngQJ8vuc5mX2QzVkIOGpMW9Lsz7c5ufOqsUu6zrwSU9E4YwdHAC8xEx/R/VDgenTRdLNVm2lpzJoZpKeGbSHfSOF6X35bjr0bI1jc+Gzr+e95LkVth6vRmxuGiCvJU1TkVWH50gbG02/gsn40LcygD/PkBzTWm6HbRA5tkGUBDJb0RE+e2Eo1nWKDIonWnSUahTOLEbMcbz2ve3NEOhDyHI8FlAB7O5jg/vXYo5kY9Ybj9fpiqHP3ciNno0QYKhL0Vccw1r57byTYm/o44LNqHrcRRs85Rh9v1n5I8bEV86MiFL/EhtFb/Yd9pArUx7jA0U+pHpXtcs8Q2bv/ooNCSKWDZgViqLi6H1tT5N/nexlfTzsh8DdjORuLPZoL0gmLHtUq4Iyz4Tg5o8hJHmZDDxhmcYv31Gmb+DMA2mhGt8LPDQy5xrcwfJfdQzQxN9y2MFD4Z4aVCl6LO68EjcYiyo/iEvUVRDVupdxxPKsEDSPzs9EsSMarru8+1DmIy+gg94ZBZy4QHYSwTv7dHi/NV/rXg+w0nMY/hOUfufyPH9ZJKbMJLgM1UkY/47C3XZ46PBIYz/PejxB3ImetJp/W5kUherpv2mtvQMABFsRe4luIg2IKMZz28fwRnz8P7LVgyt5I1SmcZ9xB4XpFEoiMyBgOYGbGz2Hl5noXtKekuygmFN7nSD4EIHsL5cI3xQQ0iNa35uPcoV1cqSprvXheFIdFlYV1zMEFPMt4g5nKCQvdo5Aj635QGEAYoamx6mCv7Yn4mw/tt0VCkshkho1opjUZzXq281pKpZ5HWYFWAelT9U9OTWAbSk+YB07Al6VDP1fhaL1oVQdMxWBBNqx4MrlqI8MyyYEcs0OJzAijZ5Kn8iwooZnWL5rPzy7/nqJO35QEtLmKeh85hhZlml2llvFLhh318TSs/CbfrtIQBEvdkDbD8mHRHgXQTjKvpUcbrf0NV7xmfGXa6W1VvO+oin6FXG8xi3I/S2AKG4na/b9QHBIfW/xUQ7BPSbr0lFn5KC+vJsUtxhhzS/CI0GIGHcvyti+vJkt7apJ8nidxXrTs22YZomTm0GSz9oPf+DmqKwsrA8LpDRxto88GhDgQGA9nbJ/M5vVQ6TrFRiyBGxrSLxKHGFilNHB7UJW2T00T1QdnRtyg/PUjxkZ+qv+FsnyQYIq71Yj5RPr9Cqt7IIwWJScQ8VRQehxNxr6Er/hM0U2mtH945qcIVVWEu7EZZykdrworRKHjX54Bsk7iW2Fhac6zTpqwyRpkI3xxy8LEndwCNmBr8GZBUXQ4UhsrmKfi6PtOIuZsMh6eXOT4ItLYu8whylyzOE3Xa4jN5d5mFnVf3PC0kyHH83anBPwlzEdtu56WEbbr05FWf2kHW+P3WwARQd+En7V2dcazjnpad2wP3eM3cvNZCOf7c0+QXgHntPGfKUevQs/9t4pLNtOlwAq/uLXq6mnF6h6dtQjukUrIedBX0J3mBaaDuvmHXWX9W4nPJ5pSKQpgEsMwCEGfh4nG/45vj6AXUh15Nhck4VNWUHj7cK1/o62gvoEw9uEwR7baKagGdddSTtJsGzPGqPRVlmxqBeE/PbhwIMpGQKgz7uYl+xdOE1xdGSY9nR7eMM2zRbha38r4/feGPOvfiMJ6jjwOv8WtwuKJTGE4331xtRQveu6VNzaJEuGlN6Z0ABjRvwqOOzkHc1VLCnTH+oE+tZ+zP0KBlx4Eji0zG1/smGOSMuLTQfERfkKRWAdGeQhzUKVJKuZUfZmHYtjmY8Y40X+1WT/kdYmwi2RT1oAI2OdgxLTA+78Ft+cCs9p16sX+KgPE9tsaVBxlmNIU4M39Uq4eb6NSo7gRXZRim9P2QGBQ9YwKP82OSQi93dnBy9SsJtEYwo42nPfDPNdSFslxXNMsvAuSgTJGDnP+boXB0I0PYTz7KC/TeuzRsnXYXTML22bSr4zNMUyBWbCfeTB9Akx0Lxw7qXc0P6P5JBNvP3Nq54FIpL+HeVJn5xbP3Tibr9arLjDpolXbYSiQFgI7c9IU07qDS9tZ+xyL5a/LhIkeEwcs8k2ktLGe2Y3Jk2M+rYpgdmHI4i+l5GRE2101xBcYc22dYEpz5Cv+e0IzH+xRhQJfYBf4PPNbtfQ5Litf5Dxmo4A7rAbTVeqd4yUemDBA7PLTyJWsFsPqsHUXm5Qj6dwwpdZo+h7obzN785LQO862YJ200X3VV6GnTR9ptetYxDSWKn1tW+VPjWKrRZJPTiuTziaSbgDJpb51JL2tOTZCeHpdRM8L+faeGj1FwRiIxjt881TUaIbEiJO6CNng1iKGTZf/SVzihyMHguyXwsMcF52ORaeq14l+yvD7bwWrOPa2UXNmNeinfA0O36I11HGu/vgBTET5vYEW9S82PHfR6AXTGJdJdZ+92WWNCgXqQj+3maBSDSLJ86nNAkOQ4nAyxFo1+M4KzsL1gj3MFJ8ZfraavPQ8dLi0JF+3Ou2007VeVIi5D3VbLOnW57d5ZOpffMKftt/oXGflT2Qh0dDEU9KdGDinEKM3j1kprchLHAU9Xeiv70iRnS1bpZcYITcE9PsoSboAqV0UDGNl+5xyjfkWRNZe2otg9sFnEkl4kResIeY1GmWwwE5jM6Zzs4mi36QQZmgxFZUlSwRZoUVQBLgYQ4KnvDX0kSGKz/pBOzxlZ2OoKD2UFqDurIZAbLgLhTVydEypaSIqoPl7H04lg8HK6GdfoJponGwdEt+p6zf5dQ+6dYDGU2ACg+H9M2yd9w0vLL8DBoGIuWpnJFOQs10jONXjz9IPlto7TYPN3Uwk/Jeb6uCSALKQ9OXLUcTsCBskLgb3WdY/HLMdRIWvLVz8trtvuhu/uszBmbZwggENGAhi/UH9mXynUp9Wb5kETY0FUotAT76COGfSFF9B4W6J/sOAOoZrke4jo2sc1NTGLc2lZe6o12siGd0Odiu9QlxXWtmftnt42QoZTp1/y+ilrMBfPYjF/B1PZo6QrTh2DTLa2EwkJj7gpqP2rhAfnv/AAceKIq1F4zxDgv7by+3Ih6Rkc7VCgEtbRyQsdv2hf31sbl/xXtx317Sag2ABeO2HYOzRvJX31+5lC0JkJwvixFtUXnTezMMfONOnXgjT+igTeDL4x1NuK7uAoLDVgcbZYuloowFePutIGQ+R1mxRUUrdXloJJ9Ifwq6SeNmpxsUBPO2x8hSmVJt0z3nJ1s3Z3X+rwzcoptEa7Wr31TMsadZAxpSC0Nacf9SQEAc/EcSwk09/7XcQ4CTp80UZlPeXctl7vCV8Px6dbxSYwlrAS4cRMhQML5rv0qCa27s/oMb2CmLTVUlPxtXQIm5lf/zRCeh6+kNmgdCWjRw+M4ev1KyZ4ZB1hc/0OO7UsWv9+KtNifpVwUeUD6m7Qq9GT/rhqTxScx1BZU/OfoWtkN1E6HjPGgX8XOFClkpFpKWDaFT0ioF2wgEtCvP41xMbHOD98pgbsZ1LP3ndGGIeOD3KJo3Scps0PkyFZ9Jugp0jvbQC+PnBMjIM/U2m1ghsslhN/Og3fLS4AqCHG6zGNsjuma13PtFT2VKm4iBXYKp93wDHaMcnIvY5voAMEQ44vwG9CsCDFdj8vFcDYOThQjoUbmYbRC6IW7q2fS9ADHzKHw5tAD6FvX7WhpuOgLkfx3/Wuz9AFWPzrGBs5lvQHYbqwyfyRQ5Vv5PCC9ROAY3BnnS8SYTnebpoWT3mxIaEL1akeLg9iZZNVo7Kt6UvloTFdgu4gnAwzv8JmV14RiuNsPVdtnDfyTUhejV+hJNksfckZgm1dw30Xf0aJvrqcF4av/fl/8ah0SPN/VxvOK50wei91BTRIl0nlK4D/kIMlKDMqxi1HHecpt3ooKff1iGLjptnIsH1+MWu0cmCzD21zTmCsrNjjtz3CHZOlaLG7OxrbrMUuAQM7cqwBu8nISb0f0T+fWnym0X+JzrmSMzuI6ascQw2f21+C82p8JKMWzCA/glsEhtIRALI6tAFdrrdgDZPmXFKa9TSB57nnem+2zpyQQMNGMmtkHekzC2DPNcD5Q3LQzr2TWI6rF1FvW569rJZAHSnix0NyUPzAcnLAfwEkseuG7vk2vHsBUza+avChEwaju7+Krt7Fd3f4ddvYtC4RysOxmCoPW6zufhJYzDdYBh1N5IKiDypQkFEy17CHW9RUzCTI5eeA/zuj0luzJSsrPyuMUeJRHUCvPTwbACAj6n5s0WsWaZHomD32DzjxFWrlT1djbZnLR21W90zce9tIf4KrpAmC2r8fdUxRCqe++5VmISQSIgiUbFZ7XJFg3gdhypCq0GFrWP2fT2RNAt8bykTlsAKGvbp/UrvTrE8BFnw/QSayrW2OWZaIM+Kcp48XU4PhXEeoxUPAbfVFictCor4FMQO1VlJWS6W4kI9oQ9ljR6iNaCAQBXcsoKP6akmonvQOFrx0YKw3jYGSAYEBU18SaYueki3K4w6S7t/NoutyHZbcT/XKGwAAP7hl6E1wzGHQ7BDkSo40Lhmb0+GMqTbUfZrV+AT4zOFQUUVHcBKLZo5duA35glDNuxA+V+YjRCAFuH+HnZiDt2eNJU2CMuTvS0WAHX+Fepua6IaIzJ9xlmI3CmfNXrAwDU3GXFyKB0S4uOEpfLulynbRcouEasUvJ6fxeQH+0TdvkzLR9CdAawDqmwP1Z1v3ql1kpFget+MPBO3LTqETlEsyoI2SxjWgsC1PTBX+HbCEextHpqZd6OnmXtV/Gf9BKccgYJtqV9Uyes3AAAZHvNrcdge0wrc4z9SpxVqmL2wjmOYjZaLn02L2VmJWKq3JkwE7FYRauqrq2CU9/o7a9gh+xQU9XktWI9iEY1vn6klh3Bl8LIbSf49uXz1J7HSY9HbxeYuUcjk2YAPWXF8KNy0YsWcptp4IHZCifwQdLcdvH9QlveDMOeSaxoi33MfRBUsY9G33NJiKFX4qg8Nd9iykIYTsNid6Hr83dMEs3m7EZa8o8s0EEm5gDtOmVV9lbjbfkQbM7SLQ4sXTHpgZGXbC6FE5tgDzKFjbByxVEzHlU3HxWGITwwQBzoNiMYHDr8TJaNLD/uFz/7to4QwwxhAZvzAAJ4uXdB0xVH0alV6utl0FmOJaaDijIhOR2S8uUpRAjZ8CMQv+jlLuW+VBbK+yMLmMA2C2pvH5yE84iv6iRAMAPrBJhtRG1vHaJY6iZbUjNG4DNKHB65V6oCu38BHmoA2xgeGNcGBb5UhUXxb7Vj6Ch029w/eB+3KTsr4ggS8tD0sX5ieX7C7N+QN5G6MqUgUG6BO88/wwhbnUQImArtjn/+Q0Ddpbsm6qZWFLk2nSHxQRlYnjmJADreimzFpcE5lOBHSZ1p42FDkUQgJCxXbqYvkSCQzKq7dPfG4o/xAk4ISpjvjCmvY9cOcBNWSRBgVujUYX4Ix5qDrtfOP2EdyD2mF4lAAADzqHZzwrqk/sqq4XN841+7Dc5lmYosDB5A622iVjHT4v9dxX7opFM35+xlZPStQ6Y/ZUE9WgcEk6sRO1wn3vjSre+xs9F2GmwXonOQc5QUDTKu6otreyBP2i2M8+Ink4t3xwyAJ7kxku6hIBMV/qZrBP2WBrYWbY8Vhtl4hjeJHeGBHnf7I1XBBBcVER+a76DfYWdURvMt+VZ8X2RE9258alC5MnhVXCDnUkMmLWNNMmvXN79J6Wwz5jvL41tXKiLXpk5VyKhABDfkAbqdfp5oQKioMC5xYNhzc3Q9Nlfs5tZWZ5PxHtlCFjbhsPx7pG6lHF7jyWG/hZ2G9fX9CNupevz7E/W4+2KHQNt1sTnApkSek+0U+rSEQklOOY3NIhVoaxs/wqGTOuk3SMoIXICV0svVuaM/DxbQRGlqKuP3pNCf+ZAAAABh3y12OJlOoT3nf4EPpSEmA2T7RpWEgCCyj6i3ZMgq5XBI371ilK4mA0aQf+DHj2bb3lbrNJ175V74GEoU62AwrNHsR5zG+XxEoXxZKRC0ua6g8SqciRz3knGEKt0uNsdrf+gfI9o11D/kU4jpLJuclYIdkPmw0asTnH0zWKRLYx3SaA82FUoYXb7gWMXjQGWCNoXe1mffxldpOoZT3v03TiQMe1rk2n8z+lpoc6L95jkoQZxCp1hWHJfOQJhqArKjAU4MjWJjNmM7tIJwDOa2HC7K4bQ5Ddvgt6wmLw3toDB/s0jjgXDZpuQjCCe19K1KJlrFL+3dCpnQa0GH3NSqU1gACrAJnto6XQlzHo+OEc/jYzMSUZ3Bfhcp4EXj+Gs3bq9MfB7J2uJL7pDpzvnqO9uKYpE2Bm30hHoC2ikPVDbDvxioBUcZoiAmjSbbQAAAABQaAM7QeO4YCoMoLjPSStzuEJo5+QW9n5E4G+vybdZ1TdP0wQibvV79gfvNy9pZO2ikMVlPzPRtXuV2MTJl0Wb1PXFGKMdV/n6vT9e9HRmjEu/fbbD27tj12ZgOud6YxMmxWcOib2GLiIc1++6pj5h2wgkkxCXKOA2bBX1tML02RupVYPwP9f+qiOaSC0K8X3B+9ZXweOeiZwpCtcEPxkH7S8tEnmjdGG1kCf6u9uiNixTBrEQnIB5LNmO17pycGt+SZEwpGn9gLqugPIy3gaQW27DveEIrUBccx00IVKANBHeypEv6DoxPHWiEigp2lyqHMro9bMcu2u88slhcVKe+Ta4PZvNjn1qf47rwQFaDAmihPex58sz/Woxez14HqK6lPjOUEP4254hSiMLZOrflPtZF2Qb07RMk/l16S1A7YmZCX/RK95i0DftaGWcfv2KQZDhGbqN0yckxHAKlOksSAjeQu6MHGAYge7xhswGTeY4NDiDnqRoMVi4YcKGstr/m8wFCUKIbX2YqlJtC30REF419/PaxHo82DILiWk76K00mDN4clfP9lTbER+tBzDosVk5DU/SQPG83Y7MPi7LFkFPp9fb/dFpvAdgz7ruJWydI42g2PHRX/TF903iRAAAAAAAOYcIuyQncqgyCdcTF56pvCjYcitHlvUM/BR2S9yVjl9XIZV1wCxC97F7gghiKs0vMXiU0f0vs0rANoF5HsQBI5aQSeeGHflXjaliEMkmu5F1NKj44MOka/PgQK7jLivIN11bhHuYqnQryPtBd5V8eNW65D7DqkdDLa0uqs5g9xfDxdBJH2S3dDJMJ00a3WNSedeLDwuAIP84B3OxOm2wMVuBXpimMMG+uYoAgUwgjbZKc/hIUaj/dLVuBdJ0/O6wp1XrZg2h/Ek0F3EUHdFNKuXxYjGz4NXo0E93SKWHQI0z7JLVq1de+Qi2L/OhJCFNBIHA7iGNbmIk/GuZHSCTzSFUECeOVD4xUCSThrGbxV7VCwpuj5C90CiEe2bQ5hu7rcwA2oKHRQtYxO1xJfSfQBiX60Gt/GbE57tkjPSQ8n9G9CuPrifM4ACKBtiZrycHUDLr3ItnEQ5EwlgbILZzz1YB3JZkAAAAAAAAAAAAAAAAAAAAAA';});const logo=$('dawonLogoSource');if(logo)logo.addEventListener('error',()=>{logo.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIHJvbGU9ImltZyIgYXJpYS1sYWJlbGxlZGJ5PSJ0aXRsZSBkZXNjIj4KICA8dGl0bGUgaWQ9InRpdGxlIj7ri6Tsm5Ag6rO17IudIOq4iOuwlSDstpTsg4Eg66Gc6rOgPC90aXRsZT4KICA8ZGVzYyBpZD0iZGVzYyI+7KeZ7J2AIOy0iOuhnSDsm5Ag7JWI7JeQIOyCtuydmCDtnZDrpoTqs7wg7ISx7J6l7J2EIOyDgeynle2VmOuKlCDquIjruZsg6rOh7ISg7ZiVIOyLrOuyjDwvZGVzYz4KICA8ZGVmcz4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iYmciIGN4PSIzOCUiIGN5PSIzMCUiIHI9IjgwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzI0NWU0ZSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjAuNTUiIHN0b3AtY29sb3I9IiMxNDNiMzEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDkyNTFmIi8+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJnb2xkIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2ZmZjFhOCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjAuMjIiIHN0b3AtY29sb3I9IiNlOGM3NmEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIwLjUyIiBzdG9wLWNvbG9yPSIjYjk4OTJmIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMC43OCIgc3RvcC1jb2xvcj0iI2YzZDk4NyIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM4YjYxMWQiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii0zMCUiIHk9Ii0zMCUiIHdpZHRoPSIxNjAlIiBoZWlnaHQ9IjE2MCUiPgogICAgICA8ZmVEcm9wU2hhZG93IGR4PSIwIiBkeT0iMTIiIHN0ZERldmlhdGlvbj0iMTIiIGZsb29kLWNvbG9yPSIjMDAwIiBmbG9vZC1vcGFjaXR5PSIuMzIiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8Y2lyY2xlIGN4PSI1MTIiIGN5PSI1MTIiIHI9IjQ4MCIgZmlsbD0idXJsKCNiZykiLz4KICA8Y2lyY2xlIGN4PSI1MTIiIGN5PSI1MTIiIHI9IjQ1MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDliNzViIiBzdHJva2Utb3BhY2l0eT0iLjI1IiBzdHJva2Utd2lkdGg9IjMiLz4KICA8ZyBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZ29sZCkiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiPgogICAgPHBhdGggZD0iTTI2MCA2NDhDMzQ4IDU5OCA0MDggNTI1IDQzOCA0MjVDNDYzIDM0MSA1MTIgMjgxIDYwMCAyNDYiIHN0cm9rZS13aWR0aD0iNDMiLz4KICAgIDxwYXRoIGQ9Ik0zOTcgNzQyQzQ3MiA2NjggNTIwIDU3MyA1MzQgNDU5QzU0NCAzODAgNTg5IDMyMSA2OTAgMjk0IiBzdHJva2Utd2lkdGg9IjM0Ii8+CiAgICA8cGF0aCBkPSJNNTIwIDc2MkM2MTUgNjc5IDY1OCA1NzkgNjQ1IDQ2MkM2MzggMzk0IDY3MiAzMzcgNzY0IDMxMCIgc3Ryb2tlLXdpZHRoPSIyNyIvPgogICAgPHBhdGggZD0iTTI5MSA2ODdDMzgzIDcxNiA0NzEgNzAzIDU0NyA2NTFDNjMzIDU5MyA2OTAgNTA4IDcxNiAzOTciIHN0cm9rZS13aWR0aD0iMTkiIG9wYWNpdHk9Ii45NCIvPgogIDwvZz4KICA8Y2lyY2xlIGN4PSIyNzIiIGN5PSI2NDYiIHI9IjIyIiBmaWxsPSIjZjVkYzhjIi8+CiAgPGNpcmNsZSBjeD0iNzYzIiBjeT0iMzA5IiByPSIxNSIgZmlsbD0iI2Y1ZGM4YyIvPgo8L3N2Zz4K';},{once:true});}

  initIntegrity();initWorks();initStudio();initVideo();initMotion();initBuilders();initSubscription();initPolicies();
})();

