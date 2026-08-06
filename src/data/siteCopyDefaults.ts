export type PageCopy = {
  title: string
  description: string
  kicker: string
  h2: string
  lead: string
}

export type SiteCopy = {
  nav: {
    strategy: string
    lifeStage: string
    quickDesign: string
    records: string
    report: string
    library: string
    operations: string
    subscribe: string
    startCta: string
  }
  dock: {
    home: string
    practice: string
    content: string
    subscribe: string
    account: string
  }
  footer: {
    tagline: string
    strategy: string
    library: string
    operations: string
    subscribe: string
  }
  chrome: {
    topline: string
    styleBanner: string
  }
  pages: {
    strategy: PageCopy
    lifeStage: PageCopy
    quickDesign: PageCopy
    records: PageCopy
    report: PageCopy
    library: PageCopy
    operations: PageCopy
  }
}

export const SITE_COPY_DEFAULTS: SiteCopy = {
  nav: {
    strategy: '실행지도',
    lifeStage: '계획방법',
    quickDesign: '오늘설계',
    records: '7일 설계',
    report: '성장리포트',
    library: '전자책·오디오북·만화',
    operations: '운영 상담',
    subscribe: '구독',
    startCta: '오늘 시작',
  },
  dock: {
    home: '홈',
    practice: '실천',
    content: '콘텐츠',
    subscribe: '구독',
    account: '계정',
  },
  footer: {
    tagline: '다원 인생설계 · DAWON Life Design · 확인하고 실천하며 다음 하루를 설계합니다',
    strategy: '실행지도',
    library: '전자책·오디오북·만화',
    operations: '운영 상담',
    subscribe: '구독·결제',
  },
  chrome: {
    topline: '오늘을 확인하고, 내일을 설계합니다 · Check Today. Design Tomorrow.',
    styleBanner: 'DAWON LIFE DESIGN · CHECK → CHOOSE → ACT → RECORD → LEARN → NEXT',
  },
  pages: {
    strategy: {
      title: '실행지도',
      description: '전략 관점과 행동 루프를 한눈에 보고, 오늘설계·7일 설계·성장리포트로 이어지는 실행신호를 확인합니다.',
      kicker: 'SONG · CHEY · NOH · DAWON',
      h2: '세 전략 관점을 읽고,\n다원식 행동체계로 통합합니다',
      lead: '공개 활동에서 연상되는 전략 강점을 그대로 복제하지 않고 다원작가의 생활설계 철학에 맞게 독립적으로 재해석했습니다. 방문자가 이해하고, 선택하고, 실행하고, 결과를 기록하는 흐름이 중심입니다.',
    },
    lifeStage: {
      title: '계획방법',
      description: '생애단계별 과제·질문·7일 계획과 추천 콘텐츠로, 나에게 맞는 설계 방법을 확인합니다.',
      kicker: 'LIFE STAGE SELF DESIGN',
      h2: '지금의 나에게 맞는\n삶의 설계를 시작합니다',
      lead: '나이는 정답이 아니라 출발점입니다. 가장 가까운 단계를 선택하면 현재 과제, 필요한 역량, 오늘 행동과 7일 실천을 확인할 수 있습니다.',
    },
    quickDesign: {
      title: '오늘설계',
      description: '오늘 한 일과 감정, 하나의 실천, 내일의 첫 행동을 남기고, 아래에서 바람설계 설문으로 더 자세히 확인할 수 있습니다.',
      kicker: 'TODAY DESIGN · CHECK → ACT → NEXT',
      h2: '오늘을 확인하고\n내일의 첫 행동을 정합니다',
      lead: '길게 쓰지 않아도 됩니다. 확인·실천·결과·내일만 남기면 성장리포트와 7일 설계로 이어집니다.',
    },
    records: {
      title: '7일 설계',
      description: '하루만 가볍게 기록하고, 저장하면 다음 날이 열립니다. 오늘설계에서 가져온 한 줄이 있으면 여기에 이어집니다.',
      kicker: '7-DAY · ONE DAY AT A TIME',
      h2: '오늘은 하루만\n가볍게 기록합니다',
      lead: '7일을 한꺼번에 채우지 않아도 됩니다. 오늘 칸만 열고, 저장하면 다음 날이 열립니다. 어려웠던 날도 괜찮습니다.',
    },
    report: {
      title: '성장리포트',
      description: '연속 기록, 영역 분포, 평균 완성도를 한눈에 보고 TXT·CSV로 내보냅니다.',
      kicker: 'GROWTH REPORT · STREAK · AREA · SCORE',
      h2: '쌓인 하루가\n나의 성장 패턴이 됩니다',
      lead: '오늘설계 기록을 모아 연속일수, 주요 영역, 최근 흐름을 확인합니다. 점수는 완벽함이 아니라 남긴 흔적의 밀도입니다.',
    },
    library: {
      title: '전자책·오디오북·만화',
      description: '50개의 길 전자책, 오디오북, 만화형 전자책을 검색하고 바로 엽니다.',
      kicker: 'DAWON CONTENT LIBRARY · BOOK · COMIC · AUDIO',
      h2: '50개의 길,\n읽고 · 보고 · 들으며 만납니다',
      lead: '다원작가의 생활설계 전자책과 만화형 전자책을 표지와 함께 바로 열어볼 수 있고, 오디오북으로 귀로 들을 수도 있습니다. 모든 콘텐츠는 이 홈페이지 안에서 열립니다.',
    },
    operations: {
      title: '운영 상담',
      description: 'AI 안내(규칙형), 직원·업무, 아이디어, 전략설계, 안전 실행안, 기관 운영안을 다룹니다.',
      kicker: 'AI · TEAM · IDEA · STRATEGY',
      h2: '개인 설계 뒤에는\n운영과 사업 설계가 이어집니다',
      lead: '관리자·직장인·예비창업자·기관 담당자를 위한 도구입니다. 일반 사용자는 위의 오늘설계와 7일 기록만 이용해도 됩니다.',
    },
  },
}

function isObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
}

function mergeDeep<T>(base: T, patch: unknown): T {
  if (!isObject(base) || !isObject(patch)) {
    return (patch === undefined || patch === null ? base : (patch as T))
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [key, value] of Object.entries(patch)) {
    const prev = out[key]
    out[key] = isObject(prev) && isObject(value) ? mergeDeep(prev, value) : value ?? prev
  }
  return out as T
}

export function mergeSiteCopy(patch: unknown): SiteCopy {
  return mergeDeep(SITE_COPY_DEFAULTS, patch)
}

export function h2ToHtml(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('<br>')
}
