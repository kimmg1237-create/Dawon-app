export type PathCategory = 'life' | 'mind' | 'relation' | 'future' | 'age'

export interface PathCard {
  id: string
  category: PathCategory
  title: string
  description: string
  pathNo: string
  tag: string
  searchTitle: string
}

export const PATH_CARDS: PathCard[] = [
  {
    id: "00",
    category: "future",
    title: "나는 내 생활의 설계자",
    description: "50개의 길을 연결하는 하루 3분 생활설계 지도.",
    pathNo: "00 · 대표 지도",
    tag: "대표 1권",
    searchTitle: "나는 내 생활의 설계자 대표 지도 하루 3분 생활설계"
  },
  {
    id: "01",
    category: "life",
    title: "그냥 하는 일이 능력이 된다",
    description: "잘하지 못해도 반복하며 시작하는 힘.",
    pathNo: "01 · 생활실천",
    tag: "반복·습관",
    searchTitle: "그냥 하는 일이 능력이 된다 잘하지 못해도 반복하며 시작하는 힘. 반복·습관"
  },
  {
    id: "02",
    category: "life",
    title: "기도하는 손, 일하는 마음",
    description: "원함을 정리하고 행동으로 옮기는 시간.",
    pathNo: "02 · 생활실천",
    tag: "바람·행동",
    searchTitle: "기도하는 손, 일하는 마음 원함을 정리하고 행동으로 옮기는 시간. 바람·행동"
  },
  {
    id: "03",
    category: "life",
    title: "청소는 마음의 길을 닦는 일",
    description: "공간을 정리하며 생각의 막힘도 정리하기.",
    pathNo: "03 · 생활실천",
    tag: "공간·마음",
    searchTitle: "청소는 마음의 길을 닦는 일 공간을 정리하며 생각의 막힘도 정리하기. 공간·마음"
  },
  {
    id: "04",
    category: "life",
    title: "요리는 사랑을 실천하는 생활기술",
    description: "재료 선택부터 식탁까지 기획과 돌봄을 배우기.",
    pathNo: "04 · 생활실천",
    tag: "요리·돌봄",
    searchTitle: "요리는 사랑을 실천하는 생활기술 재료 선택부터 식탁까지 기획과 돌봄을 배우기. 요리·돌봄"
  },
  {
    id: "05",
    category: "life",
    title: "세탁은 다시 시작하는 연습",
    description: "분류하고 씻고 기다리며 회복을 배우기.",
    pathNo: "05 · 생활실천",
    tag: "회복·순환",
    searchTitle: "세탁은 다시 시작하는 연습 분류하고 씻고 기다리며 회복을 배우기. 회복·순환"
  },
  {
    id: "06",
    category: "life",
    title: "정리정돈은 삶의 질서를 세우는 힘",
    description: "더할 것과 뺄 것을 정해 생활의 시스템 만들기.",
    pathNo: "06 · 생활실천",
    tag: "정리·시스템",
    searchTitle: "정리정돈은 삶의 질서를 세우는 힘 더할 것과 뺄 것을 정해 생활의 시스템 만들기. 정리·시스템"
  },
  {
    id: "07",
    category: "life",
    title: "효자효녀는 생활로 복을 짓는다",
    description: "효를 강요가 아닌 감사·돌봄·세대공존으로 보기.",
    pathNo: "07 · 생활실천",
    tag: "가족·세대",
    searchTitle: "효자효녀는 생활로 복을 짓는다 효를 강요가 아닌 감사·돌봄·세대공존으로 보기. 가족·세대"
  },
  {
    id: "08",
    category: "life",
    title: "실수는 다시 시작하라는 알림",
    description: "실수를 실패가 아닌 다음 방법을 찾는 신호로 보기.",
    pathNo: "08 · 생활실천",
    tag: "실수·재시작",
    searchTitle: "실수는 다시 시작하라는 알림 실수를 실패가 아닌 다음 방법을 찾는 신호로 보기. 실수·재시작"
  },
  {
    id: "09",
    category: "life",
    title: "생활습관이 일의 실력이 된다",
    description: "집안일의 반복을 품질·시간·비용 감각으로 연결하기.",
    pathNo: "09 · 생활실천",
    tag: "생활·업무",
    searchTitle: "생활습관이 일의 실력이 된다 집안일의 반복을 품질·시간·비용 감각으로 연결하기. 생활·업무"
  },
  {
    id: "10",
    category: "life",
    title: "하루 한 줄, 나를 확인하는 사람",
    description: "오늘 한 일과 감정을 기록해 삶의 방향을 확인하기.",
    pathNo: "10 · 생활실천",
    tag: "자기확인",
    searchTitle: "하루 한 줄, 나를 확인하는 사람 오늘 한 일과 감정을 기록해 삶의 방향을 확인하기. 자기확인"
  },
  {
    id: "11",
    category: "mind",
    title: "자신과의 소통",
    description: "지금의 나를 확인하는 첫 번째 생활기술.",
    pathNo: "11 · 마음정리",
    tag: "자기확인",
    searchTitle: "자신과의 소통 지금의 나를 확인하는 첫 번째 생활기술. 자기확인"
  },
  {
    id: "12",
    category: "mind",
    title: "힐링게임",
    description: "마음을 놀이처럼 탐험하며 회복의 실마리를 찾기.",
    pathNo: "12 · 마음정리",
    tag: "회복·놀이",
    searchTitle: "힐링게임 마음을 놀이처럼 탐험하며 회복의 실마리를 찾기. 회복·놀이"
  },
  {
    id: "13",
    category: "mind",
    title: "감정 이름 붙이기",
    description: "이름 없는 마음을 바라볼 수 있게 만드는 첫 단계.",
    pathNo: "13 · 마음정리",
    tag: "감정",
    searchTitle: "감정 이름 붙이기 이름 없는 마음을 바라볼 수 있게 만드는 첫 단계. 감정"
  },
  {
    id: "14",
    category: "mind",
    title: "마음을 정리하는 시간",
    description: "복잡한 하루를 사실·감정·할 일로 다시 배열하기.",
    pathNo: "14 · 마음정리",
    tag: "마음정리",
    searchTitle: "마음을 정리하는 시간 복잡한 하루를 사실·감정·할 일로 다시 배열하기. 마음정리"
  },
  {
    id: "15",
    category: "mind",
    title: "나에게 묻고 나에게 답하다",
    description: "좋은 질문으로 나의 방향과 선택을 확인하기.",
    pathNo: "15 · 마음정리",
    tag: "질문",
    searchTitle: "나에게 묻고 나에게 답하다 좋은 질문으로 나의 방향과 선택을 확인하기. 질문"
  },
  {
    id: "16",
    category: "mind",
    title: "두려움을 지나가는 통로",
    description: "불안 속에서도 작은 선택을 이어가는 법.",
    pathNo: "16 · 마음정리",
    tag: "두려움·통로",
    searchTitle: "두려움을 지나가는 통로 불안 속에서도 작은 선택을 이어가는 법. 두려움·통로"
  },
  {
    id: "17",
    category: "mind",
    title: "상처는 내 잘못이 아니다",
    description: "책임과 상처를 구분하고 건강한 경계를 세우기.",
    pathNo: "17 · 마음정리",
    tag: "상처·경계",
    searchTitle: "상처는 내 잘못이 아니다 책임과 상처를 구분하고 건강한 경계를 세우기. 상처·경계"
  },
  {
    id: "18",
    category: "mind",
    title: "다시 나를 세우는 통로",
    description: "무너진 날에도 기본생활과 작은 질서부터 회복하기.",
    pathNo: "18 · 마음정리",
    tag: "회복",
    searchTitle: "다시 나를 세우는 통로 무너진 날에도 기본생활과 작은 질서부터 회복하기. 회복"
  },
  {
    id: "19",
    category: "mind",
    title: "하루 한 줄, 나를 살리는 말",
    description: "자기비난 대신 오늘 필요한 생활언어를 고르기.",
    pathNo: "19 · 마음정리",
    tag: "자기언어",
    searchTitle: "하루 한 줄, 나를 살리는 말 자기비난 대신 오늘 필요한 생활언어를 고르기. 자기언어"
  },
  {
    id: "20",
    category: "mind",
    title: "하루 한 줄, 나를 위로하는 노래",
    description: "읽고 듣고 다시 일어서는 30초 음악 습관.",
    pathNo: "20 · 마음정리",
    tag: "위로·음악",
    searchTitle: "하루 한 줄, 나를 위로하는 노래 읽고 듣고 다시 일어서는 30초 음악 습관. 위로·음악"
  },
  {
    id: "21",
    category: "relation",
    title: "욕구와 요청의 언어",
    description: "관찰·느낌·욕구·요청으로 관계를 다시 연결하기.",
    pathNo: "21 · 관계·가족",
    tag: "대화",
    searchTitle: "욕구와 요청의 언어 관찰·느낌·욕구·요청으로 관계를 다시 연결하기. 대화"
  },
  {
    id: "22",
    category: "relation",
    title: "관계를 살리는 말",
    description: "사실·나는-메시지·질문·사과·감사의 기술.",
    pathNo: "22 · 관계·가족",
    tag: "관계언어",
    searchTitle: "관계를 살리는 말 사실·나는-메시지·질문·사과·감사의 기술. 관계언어"
  },
  {
    id: "23",
    category: "relation",
    title: "가족도 마음정리가 필요합니다",
    description: "가족의 기대와 감정을 안전하게 확인하는 시간.",
    pathNo: "23 · 관계·가족",
    tag: "가족",
    searchTitle: "가족도 마음정리가 필요합니다 가족의 기대와 감정을 안전하게 확인하는 시간. 가족"
  },
  {
    id: "24",
    category: "relation",
    title: "부모와 자녀가 서로를 듣는 시간",
    description: "비교보다 질문과 경청으로 연결되는 가족 대화.",
    pathNo: "24 · 관계·가족",
    tag: "부모자녀",
    searchTitle: "부모와 자녀가 서로를 듣는 시간 비교보다 질문과 경청으로 연결되는 가족 대화. 부모자녀"
  },
  {
    id: "25",
    category: "relation",
    title: "부부도 자기확인이 필요합니다",
    description: "가까운 관계에서도 각자의 감정과 필요를 확인하기.",
    pathNo: "25 · 관계·가족",
    tag: "부부",
    searchTitle: "부부도 자기확인이 필요합니다 가까운 관계에서도 각자의 감정과 필요를 확인하기. 부부"
  },
  {
    id: "26",
    category: "relation",
    title: "갈등은 관계의 끝이 아니다",
    description: "갈등을 감정 조절·욕구 확인·대안 찾기로 전환하기.",
    pathNo: "26 · 관계·가족",
    tag: "갈등",
    searchTitle: "갈등은 관계의 끝이 아니다 갈등을 감정 조절·욕구 확인·대안 찾기로 전환하기. 갈등"
  },
  {
    id: "27",
    category: "relation",
    title: "다름과 함께 살아가는 법",
    description: "다름과 틀림을 구분하며 공동의 규칙을 만들기.",
    pathNo: "27 · 관계·가족",
    tag: "다름·공존",
    searchTitle: "다름과 함께 살아가는 법 다름과 틀림을 구분하며 공동의 규칙을 만들기. 다름·공존"
  },
  {
    id: "28",
    category: "relation",
    title: "타자의 통로",
    description: "내 관점의 한계를 넘어 다른 사람의 경험을 이해하기.",
    pathNo: "28 · 관계·가족",
    tag: "타인이해",
    searchTitle: "타자의 통로 내 관점의 한계를 넘어 다른 사람의 경험을 이해하기. 타인이해"
  },
  {
    id: "29",
    category: "relation",
    title: "세대와 세대를 잇는 생활",
    description: "시대와 세대의 다른 경험을 생활 속 대화로 잇기.",
    pathNo: "29 · 관계·가족",
    tag: "세대공존",
    searchTitle: "세대와 세대를 잇는 생활 시대와 세대의 다른 경험을 생활 속 대화로 잇기. 세대공존"
  },
  {
    id: "30",
    category: "relation",
    title: "함께 살아가는 설계",
    description: "개인과 공동체가 함께 만드는 규칙·협력·책임.",
    pathNo: "30 · 관계·가족",
    tag: "공존",
    searchTitle: "함께 살아가는 설계 개인과 공동체가 함께 만드는 규칙·협력·책임. 공존"
  },
  {
    id: "31",
    category: "future",
    title: "메모는 삶의 방향이다",
    description: "기억을 기록으로, 기록을 삶의 데이터로 바꾸기.",
    pathNo: "31 · 공부·일·미래",
    tag: "기록",
    searchTitle: "메모는 삶의 방향이다 기억을 기록으로, 기록을 삶의 데이터로 바꾸기. 기록"
  },
  {
    id: "32",
    category: "future",
    title: "배운 것을 살아내다",
    description: "지식을 작은 실험과 반복으로 생활기술로 바꾸기.",
    pathNo: "32 · 공부·일·미래",
    tag: "실천학습",
    searchTitle: "배운 것을 살아내다 지식을 작은 실험과 반복으로 생활기술로 바꾸기. 실천학습"
  },
  {
    id: "33",
    category: "future",
    title: "질문하는 사람이 미래를 만든다",
    description: "문제를 정의하고 더 나은 질문으로 미래를 설계하기.",
    pathNo: "33 · 공부·일·미래",
    tag: "질문·미래",
    searchTitle: "질문하는 사람이 미래를 만든다 문제를 정의하고 더 나은 질문으로 미래를 설계하기. 질문·미래"
  },
  {
    id: "34",
    category: "future",
    title: "문해력은 생활 방어력이다",
    description: "뉴스·광고·계약·AI 답변을 제대로 읽고 판단하기.",
    pathNo: "34 · 공부·일·미래",
    tag: "문해력",
    searchTitle: "문해력은 생활 방어력이다 뉴스·광고·계약·AI 답변을 제대로 읽고 판단하기. 문해력"
  },
  {
    id: "35",
    category: "future",
    title: "기획은 생활에서 시작된다",
    description: "불편을 발견하고 작은 테스트로 아이디어를 키우기.",
    pathNo: "35 · 공부·일·미래",
    tag: "기획",
    searchTitle: "기획은 생활에서 시작된다 불편을 발견하고 작은 테스트로 아이디어를 키우기. 기획"
  },
  {
    id: "36",
    category: "future",
    title: "전문 설계자가 됩시다",
    description: "생활습관을 품질·시간·비용·고객 경험으로 확장하기.",
    pathNo: "36 · 공부·일·미래",
    tag: "전문성",
    searchTitle: "전문 설계자가 됩시다 생활습관을 품질·시간·비용·고객 경험으로 확장하기. 전문성"
  },
  {
    id: "37",
    category: "future",
    title: "돈을 지키는 설계",
    description: "돈의 목적·지출·비상자금·위험을 생활의 언어로 확인하기.",
    pathNo: "37 · 공부·일·미래",
    tag: "생활경제",
    searchTitle: "돈을 지키는 설계 돈의 목적·지출·비상자금·위험을 생활의 언어로 확인하기. 생활경제"
  },
  {
    id: "38",
    category: "future",
    title: "생활비를 지키는 작은 습관",
    description: "고정비와 충동지출을 작게 점검하는 생활비 루틴.",
    pathNo: "38 · 공부·일·미래",
    tag: "절약·생활비",
    searchTitle: "생활비를 지키는 작은 습관 고정비와 충동지출을 작게 점검하는 생활비 루틴. 절약·생활비"
  },
  {
    id: "39",
    category: "future",
    title: "AI와 함께 생각하는 사람",
    description: "AI를 대신 판단하는 존재가 아닌 사고를 돕는 도구로 쓰기.",
    pathNo: "39 · 공부·일·미래",
    tag: "AI·질문",
    searchTitle: "AI와 함께 생각하는 사람 AI를 대신 판단하는 존재가 아닌 사고를 돕는 도구로 쓰기. AI·질문"
  },
  {
    id: "40",
    category: "future",
    title: "큰 시대, 작은 실천",
    description: "큰 변화를 읽되 오늘 통제할 수 있는 작은 행동에 집중하기.",
    pathNo: "40 · 공부·일·미래",
    tag: "시대·실천",
    searchTitle: "큰 시대, 작은 실천 큰 변화를 읽되 오늘 통제할 수 있는 작은 행동에 집중하기. 시대·실천"
  },
  {
    id: "41",
    category: "age",
    title: "나는 내 하루의 작은 설계자",
    description: "어린이가 감정·정리·실수·친구·가족을 쉽게 확인하는 책.",
    pathNo: "41 · 생애주기",
    tag: "어린이",
    searchTitle: "나는 내 하루의 작은 설계자 어린이가 감정·정리·실수·친구·가족을 쉽게 확인하는 책. 어린이"
  },
  {
    id: "42",
    category: "age",
    title: "괜찮아, 오늘의 나도 자라고 있어",
    description: "청소년이 감정·공부·관계·진로를 스스로 확인하는 책.",
    pathNo: "42 · 생애주기",
    tag: "청소년",
    searchTitle: "괜찮아, 오늘의 나도 자라고 있어 청소년이 감정·공부·관계·진로를 스스로 확인하는 책. 청소년"
  },
  {
    id: "43",
    category: "age",
    title: "청년 자기설계 노트",
    description: "공부·일·돈·관계·불안을 90일 단위로 설계하기.",
    pathNo: "43 · 생애주기",
    tag: "청년",
    searchTitle: "청년 자기설계 노트 공부·일·돈·관계·불안을 90일 단위로 설계하기. 청년"
  },
  {
    id: "44",
    category: "age",
    title: "무너진 하루에도 나는 나를 세운다",
    description: "기본생활과 작은 성취로 다시 일어서는 청년·성인 회복서.",
    pathNo: "44 · 생애주기",
    tag: "재시작",
    searchTitle: "무너진 하루에도 나는 나를 세운다 기본생활과 작은 성취로 다시 일어서는 청년·성인 회복서. 재시작"
  },
  {
    id: "45",
    category: "age",
    title: "중년의 마음정리",
    description: "역할의 피로와 인생 후반전을 정리하는 생활설계.",
    pathNo: "45 · 생애주기",
    tag: "중년",
    searchTitle: "중년의 마음정리 역할의 피로와 인생 후반전을 정리하는 생활설계. 중년"
  },
  {
    id: "46",
    category: "age",
    title: "살아온 나에게 건네는 따뜻한 말",
    description: "지나온 삶을 돌아보고 오늘의 나를 다독이는 시니어 도서.",
    pathNo: "46 · 생애주기",
    tag: "시니어",
    searchTitle: "살아온 나에게 건네는 따뜻한 말 지나온 삶을 돌아보고 오늘의 나를 다독이는 시니어 도서. 시니어"
  },
  {
    id: "47",
    category: "age",
    title: "나는 내 노후의 생활 설계자",
    description: "건강·집·돈·관계·디지털생활을 준비하는 노후 설계.",
    pathNo: "47 · 생애주기",
    tag: "노후",
    searchTitle: "나는 내 노후의 생활 설계자 건강·집·돈·관계·디지털생활을 준비하는 노후 설계. 노후"
  },
  {
    id: "48",
    category: "age",
    title: "혼자 살아도 내 생활은 나를 지킨다",
    description: "식사·청소·돈·안전·비상연락망을 만드는 1인 생활서.",
    pathNo: "48 · 생애주기",
    tag: "1인가구",
    searchTitle: "혼자 살아도 내 생활은 나를 지킨다 식사·청소·돈·안전·비상연락망을 만드는 1인 생활서. 1인가구"
  },
  {
    id: "49",
    category: "age",
    title: "사람을 살리는 설계자",
    description: "듣기·경계·생활기술·조직을 사람을 돕는 시스템으로 연결하기.",
    pathNo: "49 · 생애주기",
    tag: "돌봄·조직",
    searchTitle: "사람을 살리는 설계자 듣기·경계·생활기술·조직을 사람을 돕는 시스템으로 연결하기. 돌봄·조직"
  },
  {
    id: "50",
    category: "age",
    title: "나는 내 삶의 전문 설계자",
    description: "경험·반복·브랜드·수익모델을 나만의 전문성으로 연결하기.",
    pathNo: "50 · 생애주기",
    tag: "전문설계",
    searchTitle: "나는 내 삶의 전문 설계자 경험·반복·브랜드·수익모델을 나만의 전문성으로 연결하기. 전문설계"
  }
]
