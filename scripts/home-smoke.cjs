/**
 * Homepage functional smoke test against local Vite.
 * Run: npx --yes playwright install chromium && node scripts/home-smoke.cjs
 */
const { chromium } = require('playwright');

const BASE = process.env.HOME_URL || 'http://localhost:5173/';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const consoleErrors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const results = [];
  const pass = (name, ok, detail = '') => {
    results.push({ name, ok: !!ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  };

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);

  // Clear first-run focus residue
  await page.evaluate(() => {
    document.body.classList.remove('first-run-focus', 'first-step-1', 'first-step-2');
  });

  pass('페이지 로드', await page.locator('.hero').count() > 0);
  pass('히어로 CTA', await page.locator('.hero-actions a.btn-primary').count() > 0);
  pass('경로 게이트 3카드', (await page.locator('.path-gate-card').count()) >= 3);

  // Critical IDs present
  const ids = [
    'one', 'today', 'precision', 'challenge', 'school', 'report', 'life',
    'works', 'studio', 'guide', 'subscription', 'author', 'recruit',
    'saveDay', 'oneToToday', 'saveChallenge', 'heroScore', 'precisionDrawer',
    'studioTools', 'worksCheckAll', 'generateContent', 'themeBtn',
  ];
  const missing = await page.evaluate((list) =>
    list.filter((id) => !document.getElementById(id)), ids);
  pass('핵심 DOM ID 존재', missing.length === 0, missing.join(', ') || 'all ok');

  const clickId = async (id) => {
    await page.evaluate((elId) => {
      const el = document.getElementById(elId);
      if (!el) throw new Error('missing ' + elId);
      el.scrollIntoView({ block: 'center' });
      el.click();
    }, id);
  };

  // Theme toggle (OS topbar may be visually covered by React nav)
  const themeToggle = await page.evaluate(() => {
    const btn = document.getElementById('themeBtn');
    if (!btn) return { ok: false, reason: 'no btn' };
    const before = document.body.classList.contains('dark');
    btn.click();
    const mid = document.body.classList.contains('dark');
    btn.click();
    const after = document.body.classList.contains('dark');
    return { ok: before !== mid && before === after, before, mid, after };
  });
  pass('테마 토글', themeToggle.ok, JSON.stringify(themeToggle));

  // Path → #one
  await page.evaluate(() => {
    document.querySelector('.path-gate-card.primary a')?.click();
  });
  await page.waitForTimeout(500);
  const oneVisible = await page.locator('#one').isVisible();
  pass('경로→오늘하나 이동', oneVisible);

  // One: recommend + to today
  await clickId('oneRecommend');
  await page.waitForTimeout(150);
  const suggestion = await page.locator('#oneSuggestion').textContent();
  pass('오늘하나 다른제안', !!suggestion && suggestion.length > 2, suggestion?.slice(0, 40));

  await clickId('oneToToday');
  await page.waitForTimeout(600);
  const actionVal = await page.inputValue('#action');
  pass('오늘하나→3분설계 넣기', !!actionVal, actionVal?.slice(0, 40));

  // Save day
  await page.fill('#done', '점검용 기록: 책상 정리');
  await page.evaluate(() => document.querySelector('#moods .mood')?.click());
  await page.fill('#tomorrow', '물 한 잔');
  await page.fill('#selfWord', '잘했어');
  await clickId('saveDay');
  await page.waitForTimeout(400);
  const dayStatus = await page.locator('#dayStatus').textContent();
  pass('3분 기록 저장', /저장/.test(dayStatus || ''), dayStatus?.slice(0, 60));

  // Precision drawer open + sample + save
  await page.evaluate(() => {
    const d = document.getElementById('precisionDrawer');
    if (d) d.open = true;
    window.dawonNavigateSection?.('precision');
  });
  await page.waitForTimeout(400);
  await clickId('samplePrecision');
  await page.waitForTimeout(200);
  await clickId('savePrecision');
  await page.waitForTimeout(400);
  const pStatus = await page.locator('#precisionStatus').textContent();
  pass('정밀설계 예시·저장', /저장|갱신|정밀/.test(pStatus || ''), pStatus?.slice(0, 60));

  // Challenge
  await page.evaluate(() => window.dawonNavigateSection?.('challenge'));
  await page.waitForTimeout(300);
  await clickId('challengeSample');
  await clickId('saveChallenge');
  await page.waitForTimeout(300);
  const cName = await page.locator('#challengeName').textContent();
  pass('7일 실천 저장', /걷기|실천|일/.test(cName || ''), cName);

  // Report pulse metrics
  await page.evaluate(() => window.dawonNavigateSection?.('report'));
  await page.waitForTimeout(300);
  const heroScore = await page.locator('#heroScore').textContent();
  const metricCount = await page.locator('#metricCount').textContent();
  pass('성장리포트 지표', Number(metricCount) >= 1 && heroScore !== null, `records=${metricCount} score=${heroScore}`);

  // Works public + vault
  await page.evaluate(() => window.dawonNavigateSection?.('works'));
  await page.waitForTimeout(300);
  const worksPublic = await page.locator('#works .works-featured').isVisible();
  const vaultHidden = await page.evaluate(() => {
    const v = document.querySelector('.home-tool-vault');
    if (!v) return false;
    const cs = getComputedStyle(v);
    return cs.display === 'none';
  });
  const worksIdsAlive = await page.evaluate(() =>
    !!(document.getElementById('worksCheckAll') && document.getElementById('worksGrid')));
  pass('작품관 공개 UI', worksPublic);
  pass('작품 관리 UI 숨김', vaultHidden);
  pass('작품 관리 DOM 유지(스크립트용)', worksIdsAlive);

  // Studio
  await page.evaluate(() => window.dawonNavigateSection?.('studio'));
  await page.waitForTimeout(300);
  const studioPublic = await page.locator('.studio-public').isVisible();
  await page.evaluate(() => {
    const d = document.getElementById('studioTools');
    if (d) d.open = true;
  });
  await page.waitForTimeout(200);
  await clickId('contentSample');
  await clickId('generateContent');
  await page.waitForTimeout(300);
  const out = await page.locator('#contentOutput').textContent();
  pass('스튜디오 공개 영역', studioPublic);
  pass('콘텐츠 생성', !!(out && out.length > 40 && !/왼쪽에서 형식/.test(out)), out?.slice(0, 50));

  // Author / recruit / subscription — scroll into view for visibility checks
  await page.evaluate(() => {
    document.getElementById('author')?.scrollIntoView();
    document.getElementById('recruit')?.scrollIntoView();
  });
  await page.waitForTimeout(200);
  pass('작가 섹션', await page.locator('#author').isVisible());
  pass('30일 모집', await page.locator('#recruit').isVisible());
  await page.evaluate(() => window.dawonNavigateSection?.('subscription'));
  await page.waitForTimeout(300);
  pass('이용권 섹션', await page.locator('#subscription .plan-grid').isVisible());
  pass('결제 브리지 링크', await page.locator('a[href="/subscribe"]').count() > 0);

  // Library link
  const lib = page.locator('a[href="/library"]').first();
  pass('서재 링크 존재', (await lib.count()) > 0);

  // Movie studio link
  pass('영화스튜디오 링크', await page.locator('a[href="/movie-studio"]').count() > 0);

  // School flower / lesson buttons
  await page.evaluate(() => window.dawonNavigateSection?.('school'));
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-lesson]')?.click());
  await page.waitForTimeout(400);
  const memoAfterLesson = await page.inputValue('#memo');
  pass('365학교 질문→오늘설계', !!memoAfterLesson, memoAfterLesson?.slice(0, 40));

  // Life section
  await page.evaluate(() => window.dawonNavigateSection?.('life'));
  await page.waitForTimeout(200);
  pass('생애맞춤 카드', (await page.locator('#life .life-card').count()) >= 7);

  // Guide
  await page.evaluate(() => window.dawonNavigateSection?.('guide'));
  await page.waitForTimeout(200);
  pass('사용가이드', await page.locator('#guide .guide-core').isVisible());

  // Navigate library briefly
  await page.goto(BASE.replace(/\/$/, '') + '/library', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(600);
  pass('서재 페이지 로드', /library|서재|작품|전자책|오디오/i.test(await page.content()));

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Trust / SEO / conversion (8.6 → 9.3 levers)
  await page.evaluate(() => window.dawonNavigateSection?.('subscription'));
  await page.waitForTimeout(300);
  const trustStrip = await page.locator('.home-trust-strip').isVisible();
  const trustLinks = await page.evaluate(() => {
    const root = document.querySelector('.home-trust-strip');
    if (!root) return [];
    return [...root.querySelectorAll('a')].map((a) => a.getAttribute('href'));
  });
  pass('신뢰 스트립', trustStrip);
  pass(
    '정책 링크',
    ['/privacy', '/terms', '/refund'].every((h) => trustLinks.includes(h)),
    trustLinks.join(', '),
  );
  const payReady = await page.evaluate(() => {
    const el = document.getElementById('paymentReadiness');
    return el && el.classList.contains('ready') && !el.classList.contains('blocked');
  });
  pass('결제 배지 ready', payReady);
  const guestCopy = await page.locator('#subscriptionSummary').textContent();
  pass('게스트 이용권 카피', /로그인하면/.test(guestCopy || '') && !/확인할 수 없습니다/.test(guestCopy || ''), guestCopy?.slice(0, 40));
  const stageKo = await page.evaluate(() =>
    [...document.querySelectorAll('.growth-stage')].every((el) => !/STAGE/i.test(el.textContent || '')),
  );
  pass('이용권 단계 한국어', stageKo);
  const recruitPrice = await page.locator('#recruit p').textContent();
  pass('모집 가격 표기', /12,?900/.test(recruitPrice || ''), recruitPrice);
  const worksAiGone = await page.evaluate(() => !document.body.innerHTML.includes('다원 하루설계 AI'));
  pass('작품관 자기참조 AI 링크 제거', worksAiGone);

  // SEO meta from document (Vite injects index.html)
  const seo = await page.evaluate(() => {
    const g = (sel) => document.querySelector(sel)?.getAttribute('content') || '';
    const ld = document.querySelector('script[type="application/ld+json"]')?.textContent || '';
    return {
      title: document.title,
      keywords: g('meta[name="keywords"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      ogImage: g('meta[property="og:image"]'),
      colorScheme: g('meta[name="color-scheme"]'),
      edition: document.body.getAttribute('data-site-edition') || '',
      hasJsonLd: /Organization/.test(ld) && /WebSite/.test(ld),
    };
  });
  pass('SEO 브랜드 keywords', /다원 하루설계/.test(seo.keywords) && !/다원 인생설계/.test(seo.keywords), seo.keywords.slice(0, 50));
  pass('canonical www', seo.canonical === 'https://www.dawon84.com/');
  pass('OG 전용 이미지', /og-dawon84\.png/.test(seo.ogImage), seo.ogImage);
  pass('color-scheme light dark', seo.colorScheme === 'light dark');
  pass('site-edition day-design', seo.edition === 'day-design-2026');
  pass('JSON-LD Organization/WebSite', seo.hasJsonLd);

  // Legal pages no longer say draft
  await page.goto(BASE.replace(/\/$/, '') + '/terms', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const termsText = await page.locator('.legal-body').innerText();
  pass('이용약관 초안 문구 없음', !/표준 초안|법률 자문이 아닙니다/.test(termsText));
  await page.goto(BASE.replace(/\/$/, '') + '/privacy', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const privacyText = await page.locator('.legal-body').innerText();
  pass('개인정보 초안 문구 없음', !/표준 초안/.test(privacyText));
  await page.goto(BASE.replace(/\/$/, '') + '/refund', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const refundText = await page.locator('.legal-body').innerText();
  pass('환불정책 초안 문구 없음', !/표준 운영 초안|법률 자문이 아니며/.test(refundText));
  pass('사업자 실정보', /다원/.test(refundText) && !/【상호명】/.test(refundText));

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Soft-check console: ignore known benign
  const hardConsole = consoleErrors.filter((t) =>
    !/favicon|Download the React DevTools|React Router Future Flag/i.test(t));
  pass('콘솔 치명 오류 없음', hardConsole.length === 0, hardConsole.slice(0, 3).join(' | '));
  pass('pageerror 없음', errors.length === 0, errors.slice(0, 3).join(' | '));

  const failed = results.filter((r) => !r.ok);
  console.log('\n=== SUMMARY ===');
  console.log(`총 ${results.length}항 · 통과 ${results.length - failed.length} · 실패 ${failed.length}`);
  if (failed.length) {
    failed.forEach((f) => console.log(' -', f.name, f.detail));
  }

  await browser.close();
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
