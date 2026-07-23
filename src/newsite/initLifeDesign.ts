// @ts-nocheck
/**
 * DAWON Life Design — full home page scripts from prototype HTML.
 */
export function initLifeDesignSite() {
  document.body.dataset.mood = 'warm';
  document.body.dataset.siteEdition = 'life-design-2026';
  document.body.classList.add('large-text');
  document.body.classList.remove('high-contrast');
function __dawonStubEl(){
  const d=document.createElement('div');
  d.hidden=true;
  d.dataset.dawonStub='1';
  Object.defineProperty(d,'value',{get:()=>'',set:()=>{},configurable:true});
  Object.defineProperty(d,'checked',{get:()=>false,set:()=>{},configurable:true});
  Object.defineProperty(d,'disabled',{get:()=>false,set:()=>{},configurable:true});
  Object.defineProperty(d,'elements',{get:()=>new Proxy({},{get:()=>d}),configurable:true});
  d.classList={add(){},remove(){},toggle(){return false},contains(){return false},item(){return null}};
  d.setAttribute=()=>{};
  d.getAttribute=()=>null;
  d.addEventListener=()=>{};
  d.removeEventListener=()=>{};
  d.focus=()=>{};
  d.click=()=>{};
  d.scrollIntoView=()=>{};
  d.submit=()=>{};
  d.reset=()=>{};
  d.appendChild=(c)=>c;
  d.remove=()=>{};
  d.innerHTML='';
  d.textContent='';
  d.style={setProperty(){},removeProperty(){}};
  try{document.body&&document.body.appendChild(d)}catch(e){}
  return d;
}
function __dawonDollar(s,r){
  r=r||document;
  const n=r.querySelector(s);
  return n||__dawonStubEl();
}
function __dawonDollars(s,r){
  return [...(r||document).querySelectorAll(s)];
}

  /* script-0 */
  try {
    (()=>{
'use strict';
const DRAFT_KEY='dawonLifeStageWishDraft_v3', RESPONSE_KEY='dawonLifeStageWishResponses_v3';
const memoryStore={};
const storage={getItem(k){try{return window.localStorage.getItem(k)}catch{return memoryStore[k]??null}},setItem(k,v){try{window.localStorage.setItem(k,v)}catch{memoryStore[k]=String(v)}},removeItem(k){try{window.localStorage.removeItem(k)}catch{delete memoryStore[k]}}};
const $=__dawonDollar, $$=__dawonDollars;
const form=$('#surveyForm'), pages=$$('.survey-page'), totalPages=pages.length; let page=0, saveTimer;
const meta=[
 ['PARTICIPANT','기본정보와 동의','상담 경로와 결과 해석을 위해 최소한의 정보를 확인합니다.'],
 ['WISH','바람 확인','내가 정말 원하는 변화와 분야를 구체적으로 기록합니다.'],
 ['WHY','의미와 중요도','이 바람이 나에게 중요한 이유와 현재의 우선순위를 확인합니다.'],
 ['EXPERIENCE','경험 발견','이미 해본 경험 속에서 시작점과 가능성을 찾습니다.'],
 ['STRENGTH','강점과 근거','반복해서 잘한 행동과 실제 경험을 함께 확인합니다.'],
 ['OBSTACLE','어려움과 지원','막히는 지점과 필요한 도움의 수준을 구분합니다.'],
 ['ACTION','첫 실천 설계','7일 안에 해볼 가장 작은 행동과 확인 기준을 정합니다.'],
 ['EXPERT','전문가 공동설계','필요한 전문분야와 상담방식을 선택합니다.'],
 ['REVIEW','제출 전 검토','전체 응답을 확인하고 생활설계 보고서를 만듭니다.']
];
const labels={respondentType:'작성자 유형',name:'이름·별칭',lifeStage:'생애단계',lifeSubtype:'현재 상황',lifeDomain:'설계 분야',region:'지역·국가',contact:'연락처',consent:'저장방식 동의',wishAreas:'바람 분야',wishText:'핵심 바람',wishWhy:'원하는 이유',importance:'중요도',experienceText:'실행 경험',experienceLevel:'경험 단계',strengths:'강점',strengthEvidence:'강점 근거',obstacles:'현재 어려움',urgency:'시작 시점',supportNeed:'도움 필요 정도',firstAction:'7일 실천',actionWhen:'실행 시점',firstCustomer:'첫 대상',successMetric:'결과 기준',experts:'전문가 분야',consultMode:'상담방식',budget:'상담예산',expertQuestion:'전문가 질문'};
const stageData={
      elementary:{name:'초등학생',en:'ELEMENTARY',kicker:'01 · 기초생활과 호기심 설계',title:'작은 습관으로 “나는 할 수 있다”를 배웁니다',intro:'초등 시기는 성적보다 생활 리듬, 질문하는 힘, 감정 표현, 작은 책임을 익히는 때입니다. 저학년은 놀이와 반복, 고학년은 선택과 기록을 조금씩 늘립니다.',tags:['생활습관','호기심','감정표현','작은 책임','부모 대화'],tasks:['잠·식사·준비·정리의 기본 리듬 만들기','좋아하는 것과 궁금한 것을 말과 그림으로 표현하기','작은 약속을 스스로 정하고 끝까지 해보기'],concerns:['공부하기 싫고 집중이 오래되지 않음','친구와 다투거나 비교되어 속상함','실수하면 혼날까 봐 숨기고 싶음'],skills:['자기관리: 가방·준비물·공간 정리','표현력: 기분과 필요한 도움 말하기','실행력: 10분 안에 끝낼 작은 일 선택'],questions:['오늘 내가 스스로 한 일은 무엇인가?','지금 내 마음은 어떤 이름인가?','내일 한 가지 더 해보고 싶은 것은?'],today:'내가 스스로 한 일을 하나 찾아 “내가 해냈다”라고 적고, 내일 할 10분 행동을 정합니다.',measure:'성공 기준: 혼자 또는 도움을 받아 실제로 끝내고 표시하기.',week:['내가 한 일 찾기','감정 이름 붙이기','책상 10분 정리','궁금한 것 질문','친구에게 좋은 말','가족과 함께하기','잘한 점 발표'],support:['부모: 대신 해주기보다 선택지를 두 개 주고 기다리기','교사: 결과보다 시도와 질문을 구체적으로 칭찬하기','친구: 함께 정한 작은 약속을 확인해주기']},
      middle:{name:'중학생',en:'MIDDLE SCHOOL',kicker:'02 · 감정과 관계 속 자기이해',title:'흔들리는 마음 속에서 나의 기준을 만듭니다',intro:'사춘기의 몸과 감정 변화, 부모·친구·선생님과의 갈등을 실패로 보지 않고 자기이해의 자료로 봅니다. 감정과 사실을 나누고 안전하게 표현하는 연습이 중요합니다.',tags:['감정조절','관계경계','자기이해','공부습관','디지털균형'],tasks:['감정과 행동을 구분해 기록하기','친구 관계에서 나의 경계와 존중 기준 세우기','짧은 공부 루틴과 휴식 루틴 만들기'],concerns:['친구 관계와 소속감 때문에 불안함','부모·선생님이 나를 이해하지 못한다고 느낌','공부·게임·휴대전화 조절이 어려움'],skills:['감정문해력: 감정의 원인과 필요 구분','대화력: 관찰·감정·욕구·요청으로 말하기','자기조절: 시작시간과 종료시간 정하기'],questions:['지금 사실과 내 해석은 어떻게 다른가?','내가 지키고 싶은 관계 기준은 무엇인가?','오늘 20분 집중한다면 무엇을 할까?'],today:'가장 큰 고민 하나를 “사실·감정·원하는 것·부탁할 것” 네 줄로 나누어 적습니다.',measure:'성공 기준: 화내기 전 또는 포기하기 전 한 번 기록하고 말해보기.',week:['고민 한 문장','사실과 해석 분리','감정 이름 3개','필요한 도움 정리','20분 집중 실험','대화 한 번 시도','결과와 배움 기록'],support:['부모: 충고 전에 5분간 판단 없이 듣기','교사: 공개 비교보다 개인 목표와 진전 확인','친구: 싫은 것과 가능한 것을 존중하며 말하기']},
      high:{name:'고등학생',en:'HIGH SCHOOL',kicker:'03 · 진로와 학습 선택 설계',title:'성적만이 아니라 강점과 경험으로 진로를 검증합니다',intro:'고등 시기는 한 번의 완벽한 진로 선택보다 여러 가설을 세우고 공부·활동·대화로 검증하는 때입니다. 회복 가능한 학습계획과 현실적인 지원전략이 필요합니다.',tags:['진로가설','학습전략','시간관리','회복탄력성','입시정보'],tasks:['흥미·강점·가치·현실 조건을 함께 확인하기','과목별 공부법을 결과로 비교하고 조정하기','진로 가설을 활동·인터뷰·작은 결과물로 검증하기'],concerns:['성적과 입시 압박으로 자신감이 낮아짐','하고 싶은 것과 잘하는 것이 다르게 느껴짐','계획은 세우지만 지키지 못해 자책함'],skills:['우선순위: 중요한 일과 급한 일 구분','학습설계: 시간보다 결과 단위로 계획','진로탐색: 직업정보를 실제 경험과 연결'],questions:['내가 오래 집중했던 경험에는 무엇이 있었나?','이번 주 성적보다 개선할 공부 행동은 무엇인가?','진로 가설을 확인할 가장 작은 경험은?'],today:'원하는 진로 하나를 정답이 아닌 “가설”로 적고, 관련 과목·활동·사람 한 가지씩 연결합니다.',measure:'성공 기준: 7일 안에 자료 3개 확인하고 한 사람에게 질문하기.',week:['진로 가설 작성','흥미 경험 3개','강점 증거 3개','현실 조건 확인','관련자 인터뷰','작은 결과물 제작','유지·수정 결정'],support:['부모: 대학 이름보다 아이의 근거와 경험을 질문하기','교사: 과목 성취와 진로 경험을 연결해 피드백하기','멘토: 직업의 장점뿐 아니라 실제 일과 준비과정 설명하기']},
      college:{name:'대학생',en:'COLLEGE',kicker:'04 · 탐색과 경험 포트폴리오',title:'수업 밖의 경험을 나의 능력과 기회로 바꿉니다',intro:'대학 시기는 전공을 확정된 운명으로 보기보다 프로젝트·인턴·동아리·연구·봉사로 적성과 역량을 확인하는 시기입니다. 경험을 기록하고 설명하는 힘이 중요합니다.',tags:['전공탐색','프로젝트','인턴·연구','네트워크','포트폴리오'],tasks:['전공 지식을 실제 문제와 프로젝트에 적용하기','경험을 결과·역할·배움으로 기록하기','경제적·생활적 독립을 위한 기본 시스템 만들기'],concerns:['전공이 나와 맞는지 확신이 없음','스펙은 쌓지만 방향이 연결되지 않음','취업·대학원·창업 중 무엇을 선택할지 고민'],skills:['프로젝트 설계: 문제·고객·결과물 정의','포트폴리오: 과정과 결과를 증거로 정리','네트워킹: 도움을 요청하고 피드백 받기'],questions:['이번 학기에 남기고 싶은 결과물은 무엇인가?','내 경험은 누구의 어떤 문제를 해결했나?','다음 기회를 위해 누구에게 질문할까?'],today:'최근 경험 하나를 “문제·내 역할·행동·결과·배움” 다섯 줄로 정리합니다.',measure:'성공 기준: 정리한 경험을 한 사람에게 보여주고 질문 한 개 받기.',week:['경험 목록 10개','대표 경험 1개 선택','문제와 역할 정리','결과 증거 찾기','소개문 작성','멘토 피드백','포트폴리오 수정'],support:['교수·멘토: 학생이 만들 결과물과 연결될 기회를 소개하기','친구·팀원: 역할과 마감, 기대 품질을 먼저 합의하기','학교 자원: 상담·취업·창업·연구 프로그램을 실제로 사용하기']},
      youth:{name:'청년',en:'YOUTH',kicker:'05 · 자립과 정체성 설계',title:'일·돈·관계·주거의 현실 속에서 나의 기반을 만듭니다',intro:'청년기는 가능성과 불확실성이 함께 큽니다. 한 번에 인생을 정하기보다 생계 기반, 직무 경험, 관계 경계, 건강 루틴을 동시에 무너지지 않게 설계합니다.',tags:['경제자립','직무탐색','관계경계','생활기반','작은도전'],tasks:['월 고정비·수입·시간을 파악해 자립의 최소조건 만들기','직무 가설을 단기 프로젝트와 실제 지원으로 검증하기','관계와 비교에서 벗어나 나의 기준과 속도 정하기'],concerns:['취업과 미래가 불확실해 불안함','친구·SNS와 비교하며 뒤처진 느낌','하고 싶은 일과 생계 사이에서 갈등'],skills:['현실관리: 돈·시간·건강의 기본 지표 확인','기회설계: 지원·면담·프로젝트를 숫자로 실행','자기소개: 경험과 강점을 상대의 필요에 맞게 설명'],questions:['나의 한 달 생존과 성장에 필요한 최소비용은?','이번 달 검증할 직무 가설은 무엇인가?','내가 반복해서 잘해온 일은 누구에게 가치가 있나?'],today:'원하는 일 하나를 정하고, 오늘 30분 안에 할 수 있는 지원·연락·결과물 행동을 실행합니다.',measure:'성공 기준: 생각이 아니라 실제 전송·제출·공개·약속 중 하나 남기기.',week:['현실 숫자 확인','직무 가설 1개','강점 증거 3개','결과물 1개','사람 1명 연락','지원 또는 공개','반응과 다음 선택'],support:['가족: 비교와 재촉보다 현실적으로 필요한 지원 범위 합의','멘토: 추상적 조언보다 다음 행동과 피드백 기준 제시','친구: 서로의 실행을 확인하되 속도와 선택을 존중']},
      worker:{name:'직장인',en:'WORKER',kicker:'06 · 성과와 전문성 설계',title:'바쁜 업무를 반복하지 않고 경력 자산으로 바꿉니다',intro:'직장인은 많은 일을 하지만 무엇을 성장시켰는지 남기지 못하기 쉽습니다. 업무를 문제·행동·성과·배움으로 기록하고, 조직의 목표와 개인 전문성을 함께 설계합니다.',tags:['업무성과','전문성','협업','경력자산','번아웃예방'],tasks:['반복 업무를 개선하고 측정 가능한 성과로 남기기','핵심 전문성 한 가지를 의도적으로 깊게 만들기','건강·가족·학습이 무너지지 않는 업무 경계 세우기'],concerns:['일은 많지만 인정과 성장감이 부족함','상사·동료와 역할과 기대가 불명확함','이직·승진·전문가 성장 중 방향이 고민됨'],skills:['업무기획: 목적·고객·완료기준·기한 정의','성과기록: 숫자·피드백·전후 차이 남기기','협상과 소통: 우선순위·자원·위험을 명확히 전달'],questions:['이번 주 가장 중요한 결과 한 가지는 무엇인가?','내가 해결한 문제를 숫자나 사례로 말할 수 있나?','다음 기회를 위해 더 깊게 만들 전문성은?'],today:'오늘 업무 하나를 “목적·완료기준·첫 행동·마감” 네 줄로 다시 설계합니다.',measure:'성공 기준: 하루 종료 전에 결과 또는 다음 장애물을 한 줄 기록하기.',week:['핵심 결과 1개','이해관계자 확인','완료기준 합의','집중 실행','중간 피드백','성과 증거 정리','주간 회고와 조정'],support:['상사: 우선순위와 완료기준을 명확히 합의','동료: 역할·의존사항·마감을 문서로 공유','가족·자신: 퇴근 경계와 회복 시간을 일정에 먼저 확보']},
      family:{name:'부모·가족',en:'PARENT & FAMILY',kicker:'04 · 함께 살아가는 생활설계',title:'서로를 바꾸기보다 대화와 역할을 함께 설계합니다',intro:'부모와 가족의 생활은 자녀교육만으로 설명되지 않습니다. 부부의 대화, 돌봄, 돈과 시간, 집안 역할, 세대 간 존중을 작은 약속과 기록으로 조정합니다.',tags:['부부대화','자녀소통','가족역할','돌봄','생활약속'],tasks:['가족 구성원의 감정과 필요를 판단 없이 듣기','돈·시간·집안일·돌봄 역할을 구체적으로 나누기','가족이 함께할 수 있는 작은 생활습관 만들기'],concerns:['말할수록 잔소리와 방어가 반복됨','집안일·돌봄·돈의 부담이 한 사람에게 몰림','자녀·부모 세대와 기대가 달라 갈등함'],skills:['가족대화: 사실·감정·필요·요청을 나누어 말하기','역할협의: 누가·언제·어디까지 할지 정하기','관계회복: 잘못을 따지기 전 다음 행동 합의'],questions:['우리 가족이 지금 가장 힘든 것은 무엇인가?','서로에게 고마웠던 작은 행동은 무엇인가?','오늘 함께 바꿀 수 있는 약속 한 가지는?'],today:'가족 한 사람에게 평가 없이 안부를 묻고, 이번 주 함께할 작은 행동 한 가지를 협의합니다.',measure:'성공 기준: 상대의 말을 끊지 않고 듣고, 가능한 요청을 한 문장으로 합의하기.',week:['안부와 감정 묻기','고마운 일 말하기','집안 역할 확인','휴대전화 없는 대화','가족 10분 걷기','돈·시간 한 가지 협의','다음 주 약속 정하기'],support:['부모·배우자: 충고보다 먼저 사실과 감정을 듣기','자녀: 가능한 것과 어려운 것을 솔직하게 말하기','기관·전문가: 갈등이 크거나 안전 문제가 있으면 적절한 도움 연결']},
      midlife:{name:'중년',en:'MIDLIFE',kicker:'07 · 전환과 균형 재설계',title:'살아온 경험을 두 번째 역할과 안정으로 연결합니다',intro:'중년은 책임이 가장 큰 시기이면서 건강·가족·직업의 변화가 동시에 나타납니다. 기존 성취를 지키는 것과 새로운 역할을 준비하는 것을 함께 설계해야 합니다.',tags:['건강전환','가족관계','재정점검','두번째직업','경험자산'],tasks:['건강·가족·재정·일의 위험과 여유를 동시에 점검하기','살아온 경험에서 다른 사람에게 줄 수 있는 가치 찾기','작은 실험으로 두 번째 역할·수입·활동을 준비하기'],concerns:['직업 안정성과 은퇴 이후가 불안함','부모 돌봄·자녀 지원·부부 관계가 겹침','체력 저하와 성취감 감소를 느낌'],skills:['전환설계: 유지할 것·줄일 것·새로 시작할 것 구분','자산화: 경험·관계·기술을 서비스나 콘텐츠로 정리','위험관리: 건강·보험·현금흐름·돌봄 계획 확인'],questions:['앞으로 10년 지키고 싶은 세 가지는 무엇인가?','내 경험 중 다른 사람에게 가장 유용한 것은?','이번 달 작은 두 번째 역할 실험은 무엇인가?'],today:'지금의 삶을 건강·가족·재정·일 네 영역으로 나누어 “유지·주의·변화”를 한 줄씩 적습니다.',measure:'성공 기준: 가장 위험한 한 영역의 다음 행동을 예약하거나 실행하기.',week:['네 영역 진단','지킬 것 3개','줄일 것 3개','경험자산 목록','두번째 역할 가설','가족·전문가 협의','30일 실행 결정'],support:['배우자·가족: 돈·돌봄·시간의 기대를 구체적으로 협의','의료·재정 전문가: 확인이 필요한 위험을 공식 자료로 점검','동료·지역사회: 경험을 나눌 작은 역할과 활동 찾기']},
      senior:{name:'노년',en:'SENIOR',kicker:'08 · 건강·안전·의미·전승 설계',title:'오늘의 생활을 지키고 살아온 경험을 다음 세대에 전합니다',intro:'노년의 자기설계는 활동을 무조건 늘리는 것이 아니라 건강과 안전을 지키면서 관계·의미·기여를 이어가는 일입니다. 기억과 경험을 기록하는 것도 중요한 작품이 됩니다.',tags:['건강관리','생활안전','관계유지','의미활동','경험전승'],tasks:['복약·수면·식사·걷기·검진의 안전한 생활체계 만들기','고립되지 않도록 정기적인 사람·장소·활동 연결하기','살아온 이야기와 생활지혜를 글·음성·사진으로 남기기'],concerns:['건강 저하와 사고에 대한 불안','역할이 줄어 외롭거나 쓸모없게 느낌','디지털·행정·금융 정보가 복잡함'],skills:['자기돌봄: 몸의 변화와 위험 신호 알리기','도움요청: 비상연락망과 지원기관 사용','전승과 기여: 경험을 쉽게 말하고 남기기'],questions:['오늘 몸 상태와 마음 상태는 어떠한가?','이번 주 누구와 언제 만날 것인가?','내가 가족에게 남기고 싶은 생활지혜는?'],today:'나의 비상연락망과 이번 주 연락할 사람 한 명을 확인하고, 살아온 이야기 한 문장을 녹음하거나 적습니다.',measure:'성공 기준: 연락·예약·기록 중 하나를 실제로 남기기.',week:['몸 상태 확인','복약·일정 점검','연락할 사람 정하기','20분 안전 걷기','옛 사진 이야기','생활지혜 기록','가족과 나누기'],support:['가족: 대신 결정하기보다 본인의 선택과 속도를 존중','의료·복지기관: 위험 신호·지원서비스·비상연락 체계 확인','친구·이웃: 정기 연락과 함께할 활동을 약속']}
    };

let currentStage='elementary';
const stageList=(items)=>items.map(x=>`<li>${escapeHtml(x)}</li>`).join('');
function renderStage(key,scroll=false,syncSurvey=false){
  const d=stageData[key]||stageData.elementary;currentStage=key;
  $$('.stage-tab').forEach(b=>{const active=b.dataset.stage===key;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});
  $('#stageKicker').textContent=d.kicker;$('#stageTitle').textContent=d.title;$('#stageIntro').textContent=d.intro;
  $('#stageTags').innerHTML=d.tags.map(x=>`<span>${escapeHtml(x)}</span>`).join('');
  $('#stageTasks').innerHTML=stageList(d.tasks);$('#stageConcerns').innerHTML=stageList(d.concerns);$('#stageSkills').innerHTML=stageList(d.skills);$('#stageQuestions').innerHTML=stageList(d.questions);
  $('#stageToday').textContent=d.today;$('#stageMeasure').textContent=d.measure;
  $('#stageWeek').innerHTML=d.week.map((x,i)=>`<div class="week-day"><b>${i+1}일</b><span>${escapeHtml(x)}</span></div>`).join('');
  $('#stageSupport').innerHTML=d.support.map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  const select=form.elements.lifeStage;if(syncSurvey&&select)select.value=key;
  if(typeof upgradeRenderStageRecommendation==='function')upgradeRenderStageRecommendation();
  if(scroll)$('#life-stage').scrollIntoView({behavior:'smooth',block:'start'});
}

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2200)}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]))}
function renderSteps(){const box=$('#steps');box.innerHTML=meta.map((m,i)=>`<div class="step ${i===page?'active':''} ${i<page?'done':''}"><b>${i<8?i+1:'✓'}</b><span>${m[1]}</span></div>`).join('')}
function showPage(i,scroll=true){page=Math.max(0,Math.min(i,totalPages-1));pages.forEach((p,n)=>p.classList.toggle('active',n===page));$('#pageKicker').textContent=meta[page][0];$('#pageTitle').textContent=meta[page][1];$('#pageDesc').textContent=meta[page][2];const pct=Math.round(page/(totalPages-1)*100);$('#progressText').textContent=pct+'%';$('#progressBar').style.width=pct+'%';$('#prevBtn').style.visibility=page===0?'hidden':'visible';$('#nextBtn').hidden=page===totalPages-1;$('#submitBtn').hidden=page!==totalPages-1;renderSteps();if(page===totalPages-1)renderReview();if(scroll)$('#survey').scrollIntoView({behavior:'smooth',block:'start'})}
function getValues(){const out={};new FormData(form).forEach((v,k)=>{if(out[k]!==undefined)out[k]=Array.isArray(out[k])?[...out[k],v]:[out[k],v];else out[k]=v});return out}
function fillValues(data={}){$$('input,select,textarea',form).forEach(el=>{const v=data[el.name];if(v===undefined)return;if(el.type==='checkbox'||el.type==='radio')el.checked=Array.isArray(v)?v.includes(el.value):String(v)===el.value;else el.value=v});updateCounters()}
function validatePage(i){let ok=true;$$('.question[data-required]',pages[i]).forEach(q=>{q.classList.remove('invalid');const type=q.dataset.required,name=q.dataset.name,els=$$(`[name="${name}"]`,q);let valid=true;if(type==='radio'||type==='consent')valid=els.some(e=>e.checked);if(type==='checkbox'){const n=els.filter(e=>e.checked).length;valid=n>=Number(q.dataset.min||1)&&n<=Number(q.dataset.max||999)}if(type==='text'){const e=els[0];valid=(e?.value.trim().length||0)>=Number(q.dataset.minlength||1)}if(type==='select')valid=Boolean(els[0]?.value);if(!valid){q.classList.add('invalid');ok=false}});if(!ok){$('.question.invalid',pages[i])?.scrollIntoView({behavior:'smooth',block:'center'});toast('필수항목을 확인해 주세요.')}return ok}
function saveDraft(silent=false){storage.setItem(DRAFT_KEY,JSON.stringify({page,data:getValues(),savedAt:new Date().toISOString()}));const text='자동저장 '+new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});$('#saveState').textContent=text;$('#inlineSaveState').textContent=text;if(!silent)toast('작성 내용이 임시저장되었습니다.')}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveDraft(true),500)}
function loadDraft(go=true){try{const d=JSON.parse(storage.getItem(DRAFT_KEY)||'null');if(!d){toast('저장된 설문이 없습니다.');return}fillValues(d.data);if(d.data.lifeStage)renderStage(d.data.lifeStage);showPage(go?Number(d.page||0):page);toast('저장된 설문을 불러왔습니다.')}catch(e){toast('저장된 설문을 읽지 못했습니다.')}}
function resetDraft(){if(!confirm('작성 중인 설문을 모두 초기화할까요?'))return;form.reset();storage.removeItem(DRAFT_KEY);$('#saveState').textContent='아직 저장되지 않았습니다.';$('#inlineSaveState').textContent='';updateCounters();showPage(0);toast('작성 내용이 초기화되었습니다.')}
function updateCounters(){$$('textarea[maxlength]',form).forEach(t=>{const c=$(`[data-count="${t.name}"]`);if(c)c.textContent=t.value.length})}
function textValue(v){return Array.isArray(v)?v.join(', '):(v||'미입력')}
function renderReview(){const d=getValues();const groups=[['기본정보',['respondentType','name','lifeStage','region','contact']],['바람과 이유',['wishAreas','wishText','wishWhy','importance']],['경험과 강점',['experienceText','experienceLevel','strengths','strengthEvidence']],['어려움과 지원',['obstacles','urgency','supportNeed']],['첫 실천',['firstAction','actionWhen','firstCustomer','successMetric']],['전문가 협의',['experts','consultMode','budget','expertQuestion']]];$('#reviewList').innerHTML=groups.map((g,idx)=>`<div class="review-item"><b>${g[0]}</b><span>${g[1].map(k=>`${labels[k]}: ${k==='lifeStage'?(stageData[d[k]]?.name||'미입력'):textValue(d[k])}`).join('\n')}</span><button type="button" data-edit="${idx===0?0:idx===1?1:idx===2?3:idx===3?5:idx===4?6:7}">수정</button></div>`).join('');$$('[data-edit]').forEach(b=>b.onclick=()=>showPage(Number(b.dataset.edit)))}
function score(d){let complete=0;const required=['respondentType','lifeStage','consent','wishAreas','wishText','wishWhy','importance','experienceText','experienceLevel','strengths','strengthEvidence','obstacles','urgency','supportNeed','firstAction','actionWhen','firstCustomer','successMetric','experts','consultMode'];required.forEach(k=>{if(d[k]&&(Array.isArray(d[k])?d[k].length:String(d[k]).trim().length))complete++});const completeness=Math.round(complete/required.length*100);let r=30;r+=Math.min((d.wishText||'').length,120)/120*10;r+=Math.min((d.experienceText||'').length,140)/140*10;r+=({"생각만 해봄":2,"한두 번 시도":6,"반복 경험 있음":10,"다른 사람에게 제공":14}[d.experienceLevel]||0);r+=Math.min((d.firstAction||'').length,90)/90*18;r+=d.successMetric?8:0;r+=d.actionWhen?5:0;r+=d.firstCustomer?5:0;return{completeness,readiness:Math.min(100,Math.round(r))}}
function makeReport(d,id){const s=score(d),stage=stageData[d.lifeStage]||stageData.elementary;$('#responseId').textContent=id;$('#reportTitle').textContent=d.wishText||'나의 핵심 바람';$('#reportSubtitle').textContent=`${stage.name} · ${d.lifeSubtype||'세부유형 미선택'} · ${d.lifeDomain||textValue(d.wishAreas)} · ${d.urgency||''} · ${d.consultMode||''}`;$('#completionScore').textContent=s.completeness;$('#readinessScore').textContent=s.readiness;const summaries=[['나의 생애단계',`${stage.name} · ${d.lifeSubtype||''} · ${stage.title}`],['집중 설계 분야',d.lifeDomain||textValue(d.wishAreas)],['원하는 모습',d.wishText],['왜 중요한가',d.wishWhy],['이미 가진 경험',d.experienceText],['강점과 근거',`${textValue(d.strengths)}
${d.strengthEvidence||''}`],['현재 어려움',`${textValue(d.obstacles)} · ${d.supportNeed||''}`],['7일 첫 행동',`${d.firstAction||''}
언제: ${d.actionWhen||''}
첫 대상: ${d.firstCustomer||''}`]];$('#summaryGrid').innerHTML=summaries.map(x=>`<div class="summary"><h4>${escapeHtml(x[0])}</h4><p>${escapeHtml(x[1]||'')}</p></div>`).join('');const contentRec=typeof upgradeRecommendation==='function'?upgradeRecommendation(d.lifeStage,d.lifeDomain||'마음'):{book:'관련 도서 추천',music:'관련 음악 추천',action:stage.today};const rec=[['추천 책',contentRec.book],['추천 음악',contentRec.music],['추천 행동',contentRec.action],['생애단계 오늘 행동',stage.today],['생애단계 성공 기준',stage.measure],['7일 기본 리듬',stage.week.map((x,i)=>`${i+1}일차 ${x}`).join(' → ')],['검증 기준',d.successMetric||'실행 전 확인 기준을 더 구체화하세요.'],['전문가 공동설계',`${textValue(d.experts)} 분야와 ${d.consultMode||'선호 방식 미정'} 방식으로 상의하세요.`],['다원식 다음 질문','실천 후 무엇이 달라졌고, 무엇을 유지·수정·중단할지 기록하세요.'],['주의 문구','이 보고서는 자기확인과 상담 준비용이며 의료·법률·재무 진단이 아닙니다.']];$('#recommendGrid').innerHTML=rec.map(x=>`<div class="recommend"><h4>${escapeHtml(x[0])}</h4><p>${escapeHtml(x[1])}</p></div>`).join('');$('#result').classList.add('show');setTimeout(()=>$('#result').scrollIntoView({behavior:'smooth'}),100)}
function submit(e){e.preventDefault();for(let i=0;i<8;i++){if(!validatePage(i)){showPage(i);return}}const d=getValues(),id='DW-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+Math.random().toString(36).slice(2,7).toUpperCase(),item={id,submittedAt:new Date().toISOString(),data:d,scores:score(d),version:'life-stage-wish-v4'};const all=JSON.parse(storage.getItem(RESPONSE_KEY)||'[]');all.unshift(item);storage.setItem(RESPONSE_KEY,JSON.stringify(all));storage.removeItem(DRAFT_KEY);makeReport(d,id);renderAdmin();toast('응답이 제출되고 보고서가 생성되었습니다.')}
function reportText(){return `다원 인생설계 보고서\n${$('#responseId').textContent}\n\n핵심 바람\n${$('#reportTitle').textContent}\n\n`+$$('.summary,.recommend').map(x=>`${$('h4',x).textContent}\n${$('p',x).textContent}`).join('\n\n')}
function openAdmin(){if(!document.body.classList.contains('admin-mode')){$('#loginOpen')?.click();toast('관리센터는 관리자 데모 로그인 후 표시됩니다.');return}renderAdmin();$('#adminDrawer').classList.add('open');$('#adminDrawer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}function closeAdmin(){$('#adminDrawer').classList.remove('open');$('#adminDrawer').setAttribute('aria-hidden','true');document.body.style.overflow=''}
function renderAdmin(){const all=JSON.parse(storage.getItem(RESPONSE_KEY)||'[]');$('#adminList').innerHTML=all.length?all.map((x,i)=>`<article class="admin-item"><header><h4>${escapeHtml(x.id)}</h4><small>${new Date(x.submittedAt).toLocaleString('ko-KR')}</small></header><p><b>${escapeHtml((stageData[x.data.lifeStage]||{}).name||'생애단계 미선택')} · ${escapeHtml(textValue(x.data.wishAreas))}</b><br>${escapeHtml((x.data.wishText||'').slice(0,170))}</p><div><span class="pill" style="color:var(--ink);border-color:var(--line)">완성도 ${x.scores?.completeness??'-'}</span> <span class="pill" style="color:var(--ink);border-color:var(--line)">준비도 ${x.scores?.readiness??'-'}</span> <button class="btn btn-light btn-sm" data-view="${i}">보고서 보기</button> <button class="btn btn-danger btn-sm" data-del="${i}">삭제</button></div></article>`).join(''):'<div class="empty">저장된 제출 응답이 없습니다.</div>';$$('[data-view]').forEach(b=>b.onclick=()=>{const x=all[Number(b.dataset.view)];makeReport(x.data,x.id);closeAdmin()});$$('[data-del]').forEach(b=>b.onclick=()=>{if(!confirm('이 응답을 삭제할까요?'))return;all.splice(Number(b.dataset.del),1);storage.setItem(RESPONSE_KEY,JSON.stringify(all));renderAdmin()})}
function exportJson(){const data=storage.getItem(RESPONSE_KEY)||'[]',blob=new Blob([data],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='dawon-wish-responses-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(a.href)}
function portalSearch(e){e.preventDefault();const q=$('#searchInput').value.trim();if(!q)return toast('찾고 싶은 주제를 입력해 주세요.');const stageRoutes=[['elementary',/초등|어린이|아동/],['middle',/중학|사춘기/],['high',/고등|입시|수능/],['college',/대학|전공|캠퍼스/],['youth',/청년|취업|사회초년/],['worker',/직장|회사|이직|업무/],['midlife',/중년|은퇴준비|두번째/],['senior',/노년|노후|시니어|고령/]];const sr=stageRoutes.find(x=>x[1].test(q));if(sr){renderStage(sr[0],true,true);toast(`“${q}” 생애단계를 안내합니다.`);return}const routes=[[/생애|단계|나이|학생|성인/,'#life-stage'],[/직원|업무|팀|인사|마감/,'admin'],[/아이디어|아이템|상품|제품|신사업/,'admin'],[/전략|기획|계획|로드맵|KPI/,'#integrated-strategy'],[/정보|브리핑|자동재생|안내|AI|인공지능/,'#content-recommend'],[/설문|상태|원하|상담|진로|마음|관계/,'#lookup-start'],[/과정|실천|생활설계/,'#process'],[/책|전자책|노래|음악|오디오|콘텐츠/,'#content-recommend'],[/전문가|보안|개인정보|기관|기업|가족/,'#trust'],[/응답|관리|결과/, 'admin']];const r=routes.find(x=>x[0].test(q));if(r?.[1]==='admin')openAdmin();else document.querySelector(r?.[1]||'#life-stage').scrollIntoView({behavior:'smooth'});toast(`“${q}” 관련 영역으로 이동했습니다.`)}
$('#menuBtn').onclick=()=>{const n=$('#navLinks');n.classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',n.classList.contains('open'))};$$('#navLinks a').forEach(a=>a.onclick=()=>$('#navLinks').classList.remove('open'));
$$('.stage-tab').forEach(b=>b.addEventListener('click',()=>renderStage(b.dataset.stage,false,true)));$('#stageToSurvey').onclick=()=>{form.elements.lifeStage.value=currentStage;if($('#quickStage'))$('#quickStage').value=currentStage;upgradeSyncStage?.(currentStage);$('#quick-design').scrollIntoView({behavior:'smooth',block:'start'});toast(`${stageData[currentStage].name} 오늘 설계를 시작합니다.`)};form.elements.lifeStage.addEventListener('change',e=>{if(e.target.value)renderStage(e.target.value)});
$('#nextBtn').onclick=()=>{if(validatePage(page)){saveDraft(true);showPage(page+1)}};$('#prevBtn').onclick=()=>{saveDraft(true);showPage(page-1)};$('#saveDraft').onclick=()=>saveDraft();$('#resetDraft').onclick=resetDraft;$('#resumeHero')?.addEventListener('click',()=>{document.querySelector('#survey').scrollIntoView({behavior:'smooth'});setTimeout(()=>loadDraft(true),250)});form.addEventListener('input',()=>{updateCounters();scheduleSave()});form.addEventListener('change',scheduleSave);form.addEventListener('submit',submit);$('#portalSearch').addEventListener('submit',portalSearch);
['adminOpen','adminQuick','adminMobile','adminResult'].forEach(id=>$('#'+id)?.addEventListener('click',openAdmin));$('#adminClose').onclick=closeAdmin;$('#drawerBg').onclick=closeAdmin;$('#exportJson').onclick=exportJson;$('#deleteAll').onclick=()=>{if(confirm('저장된 모든 제출 응답을 삭제할까요?')){storage.removeItem(RESPONSE_KEY);renderAdmin();toast('전체 응답을 삭제했습니다.')}};$('#copyReport').onclick=async()=>{try{await navigator.clipboard.writeText(reportText());toast('보고서가 복사되었습니다.')}catch{toast('복사 권한을 확인해 주세요.')}};$('#downloadReport').onclick=()=>{const blob=new Blob([reportText()],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='DAWON_Life_Design_생활설계_보고서_'+new Date().toISOString().slice(0,10)+'.txt';a.click();URL.revokeObjectURL(a.href);toast('TXT 보고서를 저장했습니다.')};$('#printBtn').onclick=()=>window.print();$('#newSurvey').onclick=()=>{form.reset();updateCounters();showPage(0);$('#result').classList.remove('show');$('#survey').scrollIntoView({behavior:'smooth'})};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAdmin()});
const d=storage.getItem(DRAFT_KEY);if(d){try{const p=JSON.parse(d);$('#saveState').textContent='저장본 있음 · '+new Date(p.savedAt).toLocaleString('ko-KR');$('#inlineSaveState').textContent='저장된 설문을 이어갈 수 있습니다.'}catch{}}

// AI · TEAM · IDEA · STRATEGY local prototype
const TEAM_KEY='dawonTeamOps_v1', IDEA_KEY='dawonSavedIdeas_v1';
const opsRead=(key,fallback=[])=>{try{return JSON.parse(storage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
const opsWrite=(key,value)=>storage.setItem(key,JSON.stringify(value));
const downloadFile=(name,text,type='text/plain;charset=utf-8')=>{const blob=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),400)};
const copyAny=async(text)=>{try{await navigator.clipboard.writeText(text);toast('내용을 복사했습니다.')}catch{const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();toast('내용을 복사했습니다.')}};

// autoplay briefing
const aiSlides=$$('.ai-slide'), aiDotsBox=$('#aiDots'); let aiIndex=0, aiTimer=null, aiPlaying=true, voiceOn=false;
aiDotsBox.innerHTML=aiSlides.map((_,i)=>`<button class="ai-dot ${i===0?'active':''}" type="button" data-ai-dot="${i}" aria-label="${i+1}번 안내"></button>`).join('');
function speakSlide(){if(!voiceOn||!('speechSynthesis' in window))return;window.speechSynthesis.cancel();const s=aiSlides[aiIndex],utter=new SpeechSynthesisUtterance(`${s.dataset.title}. ${$('h3',s).textContent}. ${$('p',s).textContent}`);utter.lang='ko-KR';utter.rate=.95;window.speechSynthesis.speak(utter)}
function showAi(i){aiIndex=(i+aiSlides.length)%aiSlides.length;aiSlides.forEach((s,n)=>s.classList.toggle('active',n===aiIndex));$$('[data-ai-dot]').forEach((d,n)=>d.classList.toggle('active',n===aiIndex));speakSlide()}
function startAi(){clearInterval(aiTimer);if(aiPlaying)aiTimer=setInterval(()=>showAi(aiIndex+1),6000)}
$('#aiPrev').onclick=()=>{showAi(aiIndex-1);startAi()};$('#aiNext').onclick=()=>{showAi(aiIndex+1);startAi()};$('#aiToggle').onclick=()=>{aiPlaying=!aiPlaying;$('#aiToggle').textContent=aiPlaying?'일시정지':'자동재생';$('#aiStatusText').textContent=aiPlaying?'자동재생 중 · 6초 간격':'자동재생 멈춤';startAi()};$$('[data-ai-dot]').forEach(d=>d.onclick=()=>{showAi(Number(d.dataset.aiDot));startAi()});
$('#voiceToggle').onclick=()=>{voiceOn=!voiceOn;$('#voiceToggle').textContent=voiceOn?'음성안내 끄기':'음성안내 켜기';if(voiceOn){speakSlide();toast('브라우저 음성안내를 시작합니다.')}else if('speechSynthesis' in window){speechSynthesis.cancel()}};startAi();

// needed information
$('#infoForm').addEventListener('submit',e=>{e.preventDefault();const role=$('#infoRole').value,urgency=$('#infoUrgency').value,goal=$('#infoGoal').value.trim(),known=$('#infoKnown').value.trim();if(!goal)return toast('이루려는 목표를 입력해 주세요.');const info=[`고객·대상: ${goal}의 직접 사용자는 누구이며 가장 큰 불편은 무엇인가?`,`현재 숫자: 직원·고객·예산·기간 중 확인 가능한 기준값은 무엇인가?`,`담당자: 누가 결정하고, 누가 실행하며, 어디에서 도움이 필요한가?`,`검증자료: 기존 자료·사례·반응 중 바로 재사용할 수 있는 것은 무엇인가?`,`위험·제약: 법률·개인정보·비용·기술·마감 중 먼저 확인할 것은 무엇인가?`];const first=urgency==='오늘'?'30분 안에 목표를 한 문장으로 정리하고 담당자 한 명에게 확인합니다.':urgency==='7일 안'?'7일 동안 작은 결과물 1개를 만들고 첫 사용자 5명의 반응을 기록합니다.':urgency==='30일 안'?'1주 설계·2주 시제품·3주 검증·4주 개선의 30일 계획을 세웁니다.':'유지할 자산과 새로 배울 역량을 나누어 90일 탐색계획을 만듭니다.';$('#infoResult').innerHTML=`<h4>${escapeHtml(role)}에게 필요한 정보설계</h4><p><b>목표</b> · ${escapeHtml(goal)}</p>${known?`<p><b>현재 자산</b> · ${escapeHtml(known)}</p>`:''}<ol>${info.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol><p><b>첫 행동</b> · ${escapeHtml(first)}</p><div class="tool-actions"><button class="btn btn-light btn-sm" type="button" id="infoCopy">복사</button><a class="btn btn-mint btn-sm" href="#strategy">전략설계로 이동</a></div>`;$('#infoResult').classList.add('show');$('#infoCopy').onclick=()=>copyAny($('#infoResult').innerText);toast('필요정보 초안을 만들었습니다.')});

// team management
const statusNames={working:'진행 중',check:'확인 필요',done:'완료',hold:'보류'};
function teamData(){return opsRead(TEAM_KEY,[])}
function renderTeam(){const all=teamData(),q=($('#teamSearch')?.value||'').trim().toLowerCase(),items=all.filter(x=>[x.name,x.department,x.role,x.task,x.support].join(' ').toLowerCase().includes(q));$('#teamTotal').textContent=all.length;$('#teamWorking').textContent=all.filter(x=>x.status==='working').length;$('#teamCheck').textContent=all.filter(x=>x.status==='check').length;$('#teamDone').textContent=all.filter(x=>x.status==='done').length;$('#teamList').innerHTML=items.length?items.map(x=>`<article class="team-item"><div><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.department||'팀 미입력')}</small></div><div><strong>${escapeHtml(x.role)}</strong><small>${x.due?`마감 ${escapeHtml(x.due)}`:'마감 미정'}</small></div><div class="task-cell"><strong>${escapeHtml(x.task)}</strong><small>${x.support?`지원: ${escapeHtml(x.support)}`:'필요 지원 없음'}</small></div><div><span class="status-pill ${x.status}">${statusNames[x.status]}</span></div><div><select data-team-status="${x.id}" aria-label="상태 변경"><option value="working" ${x.status==='working'?'selected':''}>진행 중</option><option value="check" ${x.status==='check'?'selected':''}>확인 필요</option><option value="done" ${x.status==='done'?'selected':''}>완료</option><option value="hold" ${x.status==='hold'?'selected':''}>보류</option></select> <button class="btn btn-danger btn-sm" type="button" data-team-del="${x.id}">삭제</button></div></article>`).join(''):'<div class="empty-state">등록된 직원·업무가 없습니다. 사람을 평가하는 정보보다 역할과 오늘의 완료기준부터 적어보세요.</div>';$$('[data-team-status]').forEach(s=>s.onchange=()=>{const data=teamData(),item=data.find(x=>x.id===s.dataset.teamStatus);if(item)item.status=s.value;opsWrite(TEAM_KEY,data);renderTeam()});$$('[data-team-del]').forEach(b=>b.onclick=()=>{if(!confirm('이 직원·업무 항목을 삭제할까요?'))return;opsWrite(TEAM_KEY,teamData().filter(x=>x.id!==b.dataset.teamDel));renderTeam()})}
$('#employeeForm').addEventListener('submit',e=>{e.preventDefault();const item={id:'TM-'+Date.now(),name:$('#empName').value.trim(),department:$('#empDepartment').value.trim(),role:$('#empRole').value.trim(),due:$('#empDue').value,task:$('#empTask').value.trim(),status:$('#empStatus').value,support:$('#empSupport').value.trim(),createdAt:new Date().toISOString()};if(!item.name||!item.role||!item.task)return toast('이름·역할·핵심업무를 입력해 주세요.');const data=teamData();data.unshift(item);opsWrite(TEAM_KEY,data);e.target.reset();renderTeam();toast('직원·업무를 저장했습니다.')});$('#teamSearch').addEventListener('input',renderTeam);
$('#teamBrief').onclick=()=>{const all=teamData();if(!all.length)return toast('직원·업무를 먼저 등록해 주세요.');const check=all.filter(x=>x.status==='check'),hold=all.filter(x=>x.status==='hold'),due=all.filter(x=>x.due).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,3);const text=[`전체 ${all.length}명·항목 중 진행 ${all.filter(x=>x.status==='working').length}, 확인 필요 ${check.length}, 완료 ${all.filter(x=>x.status==='done').length}, 보류 ${hold.length}.`,check.length?`먼저 결정할 업무: ${check.slice(0,3).map(x=>`${x.name}—${x.task}`).join(' / ')}`:'확인 필요 업무가 없습니다.',due.length?`가까운 마감: ${due.map(x=>`${x.due} ${x.name}`).join(' / ')}`:'마감일 입력 항목이 없습니다.',`오늘 관리자 행동: 확인 필요 업무 한 건의 목적·완료기준·지원결정을 10분 안에 정리합니다.`];$('#teamBriefResult').innerHTML=`<h4>AI 규칙형 업무요약</h4>${text.map(x=>`<p>${escapeHtml(x)}</p>`).join('')}<div class="tool-actions"><button class="btn btn-light btn-sm" type="button" id="teamBriefCopy">복사</button></div>`;$('#teamBriefResult').classList.add('show');$('#teamBriefCopy').onclick=()=>copyAny(text.join('\n'));};
$('#teamCsv').onclick=()=>{const all=teamData();if(!all.length)return toast('내보낼 직원·업무가 없습니다.');const escCsv=v=>`"${String(v??'').replaceAll('"','""')}"`;const rows=[['이름','부서','역할','핵심업무','상태','마감','필요지원'],...all.map(x=>[x.name,x.department,x.role,x.task,statusNames[x.status],x.due,x.support])];downloadFile('DAWON_직원업무_'+new Date().toISOString().slice(0,10)+'.csv','\ufeff'+rows.map(r=>r.map(escCsv).join(',')).join('\n'),'text/csv;charset=utf-8');};
$('#teamClear').onclick=()=>{if(confirm('저장된 직원·업무를 모두 삭제할까요?')){opsWrite(TEAM_KEY,[]);renderTeam();toast('직원·업무를 모두 삭제했습니다.')}};

// idea lab
let generatedIdeas=[];
function ideaScores(seed,index){const base=Math.min(95,65+Math.floor(seed.length/8)+(index*3));return{value:Math.min(96,base+6-index),feasibility:Math.min(95,base+(index===1?8:2)),difference:Math.min(94,base+(index===2?9:3))}}
$('#ideaForm').addEventListener('submit',e=>{e.preventDefault();const customer=$('#ideaCustomer').value.trim(),problem=$('#ideaProblem').value.trim(),strength=$('#ideaStrength').value.trim(),type=$('#ideaType').value,channel=$('#ideaChannel').value,limit=$('#ideaLimit').value;if(!customer||!problem||!strength)return toast('고객·문제·강점을 입력해 주세요.');const raw=[{title:`${customer}를 위한 7일 ${type} 실험`,desc:`${problem}을 줄이기 위해 ${strength}을 활용한 가장 작은 결과물을 만들고 ${channel}에서 첫 반응을 확인합니다.`,mvp:`1페이지 안내 또는 10분 체험을 만들어 5명에게 보여주기`},{title:`${customer} 맞춤 체크·추천 아이템`,desc:`고객이 자신의 현재를 확인하면 필요한 한 가지를 추천하는 ${type}입니다. 기존 경험을 질문과 카드로 재구성합니다.`,mvp:`질문 3개와 결과카드 3종으로 수동 서비스 운영`},{title:`경험을 제품화한 ${type} 패키지`,desc:`${strength}을 콘텐츠·도구·상담 흐름으로 묶어 ${problem}을 반복적으로 해결하는 패키지입니다.`,mvp:`대표 콘텐츠 1개 + 실천도구 1개 + 피드백 질문 1개`}];generatedIdeas=raw.map((x,i)=>({...x,id:'ID-'+Date.now()+'-'+i,customer,problem,strength,type,channel,limit,scores:ideaScores(customer+problem+strength,i)}));$('#ideaResults').innerHTML=generatedIdeas.map((x,i)=>`<article class="idea-card"><span class="rank">OPTION 0${i+1}</span><h4>${escapeHtml(x.title)}</h4><p>${escapeHtml(x.desc)}</p><p><b>7일 MVP</b><br>${escapeHtml(x.mvp)}</p><div class="score-row"><div class="score-chip"><b>${x.scores.value}</b>고객가치</div><div class="score-chip"><b>${x.scores.feasibility}</b>실행성</div><div class="score-chip"><b>${x.scores.difference}</b>차별성</div></div><button class="btn btn-primary btn-sm idea-pick" type="button" data-idea-pick="${i}">선택·저장</button></article>`).join('');$$('[data-idea-pick]').forEach(b=>b.onclick=()=>saveIdea(Number(b.dataset.ideaPick)));toast('아이디어 3종을 만들었습니다.')});
function saveIdea(i){const x=generatedIdeas[i];if(!x)return;const all=opsRead(IDEA_KEY,[]);all.unshift({...x,savedAt:new Date().toISOString()});opsWrite(IDEA_KEY,all.slice(0,20));$('#strategyIdea').value=x.title;renderSavedIdeas();toast('아이디어를 저장하고 전략설계에 연결했습니다.')}
function renderSavedIdeas(){const all=opsRead(IDEA_KEY,[]);$('#savedIdeas').innerHTML=all.length?`<h4 style="margin:14px 0 0;color:var(--navy)">저장한 아이디어</h4>`+all.map((x,i)=>`<div class="saved-idea"><span><b>${escapeHtml(x.title)}</b><small style="display:block;color:var(--muted)">${escapeHtml(x.type||'')}</small></span><span><button type="button" data-idea-use="${i}">전략 연결</button> <button type="button" data-idea-del="${i}">삭제</button></span></div>`).join(''):'';$$('[data-idea-use]').forEach(b=>b.onclick=()=>{$('#strategyIdea').value=all[Number(b.dataset.ideaUse)].title;$('#strategy').scrollIntoView({behavior:'smooth'});toast('전략설계 입력에 연결했습니다.')});$$('[data-idea-del]').forEach(b=>b.onclick=()=>{all.splice(Number(b.dataset.ideaDel),1);opsWrite(IDEA_KEY,all);renderSavedIdeas()})}

// strategy design
let strategyText='';
$('#strategyForm').addEventListener('submit',e=>{e.preventDefault();const idea=$('#strategyIdea').value.trim(),goal=$('#strategyGoal').value.trim(),owner=$('#strategyOwner').value.trim()||'책임자 지정 필요',kpi=$('#strategyKpi').value.trim(),budget=$('#strategyBudget').value,risk=$('#strategyRisk').value.trim()||'사용자가 시작하지 않거나 결과 확인이 늦어질 위험';if(!idea||!goal||!kpi)return toast('아이디어·30일 목표·확인지표를 입력해 주세요.');const add=`고객이 첫 30초 안에 이해할 핵심 문장과, 사용 후 남길 결과기록을 추가합니다.`;const cut=`기능과 대상 고객을 한 번에 늘리지 않고, 첫 고객 1유형·핵심 행동 1개·지표 1개로 줄입니다.`;const plan=`1) ${owner}가 완료기준을 확정합니다.\n2) 기존 자료로 7일 MVP를 만듭니다.\n3) 첫 사용자 5~10명에게 직접 보여줍니다.\n4) ${kpi}를 기록하고 30일 목표와 비교합니다.`;const alt=`${risk}이 나타나면 기능 개발을 멈추고 수동상담·간단한 카드·전화 인터뷰 방식으로 고객가치부터 다시 확인합니다.`;const blocks=[['ADD · 더할 것',add],['CUT · 줄일 것',cut],['PLAN · 실행순서',plan],['ALTERNATIVE · 대안',alt]];const road=[['1주차','고객과 문제를 한 문장으로 고정하고 7일 MVP 제작'],['2주차','첫 사용자에게 제공하고 행동·반응·질문 기록'],['3주차','잘된 점 1개 강화, 불필요한 기능과 문장 제거'],['4주차',`${goal} 달성도를 ${kpi}로 판단하고 다음 투자 결정`]];$('#strategyTitle').textContent=idea;$('#strategySubtitle').textContent=`30일 목표 · ${goal} / 책임 · ${owner} / 자원 · ${budget}`;$('#strategyQuads').innerHTML=blocks.map(x=>`<div class="strategy-block"><h4>${escapeHtml(x[0])}</h4><p>${escapeHtml(x[1])}</p></div>`).join('');$('#strategyRoadmap').innerHTML=road.map(x=>`<div><b>${escapeHtml(x[0])}</b>${escapeHtml(x[1])}</div>`).join('');$('#strategyOutput').classList.add('show');strategyText=`DAWON 기획·전략설계\n${new Date().toLocaleString('ko-KR')}\n\n[아이디어]\n${idea}\n\n[30일 목표]\n${goal}\n\n[책임자]\n${owner}\n\n[확인지표]\n${kpi}\n\n[사용 자원]\n${budget}\n\n`+blocks.map(x=>`[${x[0]}]\n${x[1]}`).join('\n\n')+'\n\n[30일 로드맵]\n'+road.map(x=>`${x[0]}: ${x[1]}`).join('\n');toast('기획·전략 보고서를 만들었습니다.')});
$('#strategyCopy').onclick=()=>copyAny(strategyText);$('#strategyDownload').onclick=()=>{if(!strategyText)return toast('전략 보고서를 먼저 생성해 주세요.');downloadFile('DAWON_기획전략_'+new Date().toISOString().slice(0,10)+'.txt',strategyText)};$('#strategyPrint').onclick=()=>window.print();
renderTeam();renderSavedIdeas();

// FINAL UX UPGRADE: subtype, quick design, 7-day result log, recommendations, accessibility and local-data control.
const UPGRADE_QUICK_KEY='dawonQuickDesign_v5', UPGRADE_TRACKER_KEY='dawonSevenDayTracker_v5', UPGRADE_CONSULT_KEY='dawonConsultDrafts_v1';
const publicStageKeys=['elementary','middle','youth','family','midlife','senior'];
const upgradeDomains=['마음','건강','가족','관계','진로와 일','돈과 생활'];
const upgradeSubtypes={
  elementary:['저학년·놀이와 기본습관','고학년·선택과 책임','친구관계가 고민','공부 시작이 어려움'],
  middle:['사춘기 감정·관계','공부·휴대전화 균형','진로가 궁금함','부모·교사와 갈등'],
  high:['입시·학습전략','진로 가설 탐색','예체능·전공 준비','회복·자신감 관리'],
  college:['전공 탐색','프로젝트·포트폴리오','취업·인턴 준비','대학원·창업 탐색'],
  youth:['취업 준비','재직 초기','창업 준비','생활·정서 회복'],
  worker:['신입·적응','성과·승진','이직·경력전환','관리자·팀 운영','번아웃 예방'],
  family:['부부 대화','자녀와 소통','가족 역할 나누기','부모 돌봄','세대 간 갈등'],
  midlife:['직장 전환','자영업·사업','부모 돌봄','자녀 독립','은퇴 준비'],
  senior:['활동형','건강관리형','독거·관계지원형','경험전승형']
};
const upgradeContents={
  '가족':{book:'《함께 살아가는 설계》',music:'가족의 마음을 잇는 따뜻한 대화 음악',action:'가족 한 사람에게 판단 없이 안부를 묻고 가능한 부탁 한 가지 말하기'},
  '진로와 일':{book:'《기획은 생활에서 시작된다》',music:'도전과 실행을 돕는 응원 음악',action:'관심 분야의 실제 사람·자료·결과물 하나 확인하기'},
  '마음':{book:'《자신과의 소통》',music:'위로·회복·감정 이름 붙이기 음악',action:'사실·감정·원하는 것을 세 줄로 적기'},
  '관계':{book:'《욕구와 요청의 언어》',music:'가족대화와 관계회복 음악',action:'평가 없이 관찰한 사실과 부탁 한 가지를 말하기'},
  '건강':{book:'《나는 내 생활의 설계자》',music:'걷기·호흡·회복 루틴 음악',action:'몸 상태를 확인하고 10분 걷기 또는 휴식 예약하기'},
  '돈과 생활':{book:'《돈을 지키는 설계》',music:'생활안정과 자기응원 음악',action:'오늘의 지출·시간·정리 중 한 가지 숫자를 확인하기'}
};
let upgradeSelectedDomain='마음', upgradeQuickText='';
function upgradeStageName(key){return (stageData[key]||stageData.elementary).name}
function upgradeFillSubtype(select,key,value=''){
  if(!select)return;const arr=upgradeSubtypes[key]||[];select.innerHTML=arr.map(x=>`<option ${x===value?'selected':''}>${escapeHtml(x)}</option>`).join('');
}
function upgradeRenderDomains(box,selected,onPick){
  if(!box)return;box.innerHTML=upgradeDomains.map(x=>`<button type="button" class="${x===selected?'active':''}" data-domain="${x}">${x}</button>`).join('');
  $$('[data-domain]',box).forEach(b=>b.onclick=()=>{onPick(b.dataset.domain);upgradeRenderDomains(box,b.dataset.domain,onPick)});
}
function upgradeApplyMode(key){
  const easy=key==='elementary'||key==='middle';
  $('#quickModeBadge').textContent=easy?'어린이·청소년 쉬운 말 모드':'성인 자기설계 모드';
  $('#quickGuideTitle').textContent=key==='elementary'?'오늘 무엇을 해보고 싶나요?':key==='middle'?'지금 가장 마음에 걸리는 것은 무엇인가요?':key==='family'?'우리 가족에게 필요한 작은 변화는 무엇인가요?':'오늘 가장 바꾸고 싶은 것은 무엇인가요?';
  $('#quickGuideText').textContent=easy?'길게 쓰지 않아도 됩니다. 기분 한 가지와 오늘 해볼 작은 행동 한 가지만 적어보세요.':'현재 상황과 바람을 짧게 적고 오늘 실행할 가장 작은 행동을 정합니다.';
  $('#quickWishLabel').textContent='2. 오늘 한 일 또는 지금 확인한 것';
  $('#quickActionLabel').textContent='4. 오늘 실천할 한 가지';
}
function upgradeSyncStage(key){
  if(!stageData[key])key='elementary';currentStage=key;
  if($('#quickStage'))$('#quickStage').value=key;
  upgradeFillSubtype($('#quickSubtype'),key);
  upgradeFillSubtype($('#stageSubtype'),key);
  const detailStage=form?.elements?.lifeStage;if(detailStage)detailStage.value=key;
  upgradeFillSubtype(form?.elements?.lifeSubtype,key);
  if($('#recommendStage'))$('#recommendStage').value=key;
  upgradeApplyMode(key);
  const minor=key==='elementary'||key==='middle';if($('#minorNotice'))$('#minorNotice').hidden=!minor;
}
function upgradeRecommendation(stage,domain){
  const c=upgradeContents[domain]||upgradeContents['마음'];const s=stageData[stage]||stageData.elementary;
  return {book:c.book,music:c.music,action:c.action,tool:stage==='elementary'?'그림·칭찬형 오늘의 미션카드':stage==='middle'?'사실·감정·욕구·요청 4줄 카드':stage==='family'?'가족 안부·역할·약속 3단계 카드':stage==='high'?'진로가설 7일 검증표':stage==='college'?'경험 포트폴리오 5줄 기록':stage==='worker'?'업무 목적·완료기준 카드':stage==='midlife'?'건강·가족·재정·일 4영역 점검표':stage==='senior'?'건강·연락·경험기록 안전카드':'생활·직무·관계 7일 체크'};
}
function upgradeRenderStageRecommendation(){
  const r=upgradeRecommendation(currentStage,upgradeSelectedDomain);$('#stageRecommendGrid').innerHTML=[['BOOK',r.book],['MUSIC',r.music],['ACTION TOOL',r.tool]].map(x=>`<div class="stage-rec-card"><b>${x[0]}</b><span>${escapeHtml(x[1])}</span></div>`).join('');
}
upgradeRenderDomains($('#quickDomains'),upgradeSelectedDomain,d=>{upgradeSelectedDomain=d;upgradeRenderStageRecommendation()});
upgradeRenderDomains($('#stageDomains'),upgradeSelectedDomain,d=>{upgradeSelectedDomain=d;upgradeRenderStageRecommendation();if($('#recommendDomain'))$('#recommendDomain').value=d});
upgradeFillSubtype($('#quickSubtype'),'elementary');upgradeFillSubtype($('#stageSubtype'),'elementary');upgradeApplyMode('elementary');upgradeRenderStageRecommendation();
$('#quickStage')?.addEventListener('change',e=>{upgradeSyncStage(e.target.value);renderStage(e.target.value);upgradeRenderStageRecommendation()});
$('#stageSubtype')?.addEventListener('change',e=>{if(form?.elements?.lifeSubtype)form.elements.lifeSubtype.value=e.target.value});
form?.elements?.lifeStage?.addEventListener('change',e=>{upgradeFillSubtype(form.elements.lifeSubtype,e.target.value);if($('#minorNotice'))$('#minorNotice').hidden=!(e.target.value==='elementary'||e.target.value==='middle')});
form?.elements?.lifeDomain?.addEventListener('change',e=>{if(e.target.value){upgradeSelectedDomain=e.target.value;upgradeRenderStageRecommendation()}});
$$('.stage-tab').forEach(b=>b.addEventListener('click',()=>{upgradeSyncStage(b.dataset.stage);upgradeRenderStageRecommendation()}));
$('#stageToSurvey')?.addEventListener('click',()=>{upgradeFillSubtype(form.elements.lifeSubtype,currentStage,$('#stageSubtype').value);form.elements.lifeDomain.value=upgradeSelectedDomain;form.elements.lifeSubtype.value=$('#stageSubtype').value||form.elements.lifeSubtype.value});
$('#simpleModeToggle')?.addEventListener('click',()=>{const on=$('#life-stage').classList.toggle('simple-stage');$('#simpleModeToggle').setAttribute('aria-pressed',String(on));$('#simpleModeToggle').textContent=on?'전체 내용 보기':'쉬운 화면 켜기'});

$$('[data-emotion]').forEach(b=>b.addEventListener('click',()=>{$$('[data-emotion]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('#quickEmotion').value=b.dataset.emotion}));
function upgradeSpeechInput(target){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return toast('이 브라우저는 음성 입력을 지원하지 않습니다.');const r=new SR();r.lang='ko-KR';r.interimResults=false;r.onresult=e=>{target.value=(target.value+' '+e.results[0][0].transcript).trim();target.dispatchEvent(new Event('input',{bubbles:true}))};r.onerror=()=>toast('음성 입력을 완료하지 못했습니다.');r.start();toast('말씀해 주세요.')}
$$('[data-voice-target]').forEach(b=>b.addEventListener('click',()=>upgradeSpeechInput($('#'+b.dataset.voiceTarget))));
$('#quickDesignForm')?.addEventListener('submit',e=>{e.preventDefault();const stage=$('#quickStage').value,subtype=$('#quickSubtype').value,todayDone=$('#quickWish').value.trim(),priority=$('#quickPriority').value.trim()||'오늘 가장 중요한 한 가지를 정합니다.',action=$('#quickAction').value.trim(),selfMessage=$('#quickSelfMessage').value.trim()||'완벽하지 않아도 시작한 나를 칭찬합니다.',emotion=$('#quickEmotion').value.trim()||'아직 이름 붙이지 않음',time=$('#quickTime').value,domain=upgradeSelectedDomain;if(!todayDone||!action)return toast('오늘 확인한 것과 오늘의 한 가지를 적어주세요.');const s=stageData[stage],r=upgradeRecommendation(stage,domain);const measure=`${time} 안에 실제로 시작하고, 완료·어려움·느낌 중 하나를 기록합니다.`;const week=`1일차 시작 → 2~5일차 반복과 수정 → 6일차 반응 확인 → 7일차 유지·수정·중단 결정`;$('#missionStage').textContent=`${s.name} · ${subtype} · ${domain}`;$('#missionTitle').textContent=action;$('#missionIntro').textContent=`지금 감정은 “${emotion}”입니다. 오늘 확인: ${todayDone} / 우선순위: ${priority}`;$('#missionAction').textContent=action;$('#missionMeasure').textContent=measure;$('#missionSupport').textContent=selfMessage;$('#missionWeek').textContent=week;$('#missionRecommend').innerHTML=`<b>맞춤 추천</b><p>책: ${escapeHtml(r.book)}<br>음악: ${escapeHtml(r.music)}<br>도구: ${escapeHtml(r.tool)}</p>`;$('#quickResult').classList.add('show');upgradeQuickText=`DAWON LIFE DESIGN · 오늘 3분 설계
${new Date().toLocaleString('ko-KR')}

[생애단계]
${s.name} · ${subtype}

[생활 영역]
${domain}

[지금 기분]
${emotion}

[오늘 한 일·확인]
${todayDone}

[가장 중요한 일]
${priority}

[오늘의 한 가지]
${action}

[나에게 전하는 말]
${selfMessage}

[완료 기준]
${measure}

[7일 연결]
${week}

[추천]
${r.book}
${r.music}
${r.tool}`;storage.setItem(UPGRADE_QUICK_KEY,JSON.stringify({stage,subtype,domain,wish:todayDone,priority,action,selfMessage,emotion,time,savedAt:new Date().toISOString()}));upgradeSyncStage(stage);upgradeSelectedDomain=domain;upgradeRenderStageRecommendation();toast('오늘의 한 가지가 정해졌습니다.');});
$('#quickCopy')?.addEventListener('click',()=>copyAny(upgradeQuickText));$('#quickDownload')?.addEventListener('click',()=>{if(!upgradeQuickText)return toast('실천카드를 먼저 만들어 주세요.');downloadFile('DAWON_3분자기설계_'+new Date().toISOString().slice(0,10)+'.txt',upgradeQuickText)});$('#quickReset')?.addEventListener('click',()=>{$('#quickDesignForm').reset();$('#quickResult').classList.remove('show');upgradeSyncStage('elementary');upgradeSelectedDomain='마음';upgradeRenderDomains($('#quickDomains'),upgradeSelectedDomain,d=>{upgradeSelectedDomain=d;upgradeRenderStageRecommendation()})});$('#quickToTracker')?.addEventListener('click',()=>{$('#action-log').scrollIntoView({behavior:'smooth'});toast('7일 기록에서 오늘 행동을 확인해보세요.')});
try{const q=JSON.parse(storage.getItem(UPGRADE_QUICK_KEY)||'null');if(q){$('#quickStage').value=q.stage;upgradeFillSubtype($('#quickSubtype'),q.stage,q.subtype);upgradeSelectedDomain=q.domain||'마음';upgradeRenderDomains($('#quickDomains'),upgradeSelectedDomain,d=>{upgradeSelectedDomain=d;upgradeRenderStageRecommendation()});$('#quickWish').value=q.wish||'';$('#quickPriority').value=q.priority||'';$('#quickAction').value=q.action||'';$('#quickSelfMessage').value=q.selfMessage||'';$('#quickEmotion').value=q.emotion||'';$('#quickTime').value=q.time||'10분';upgradeApplyMode(q.stage)}}catch{}

// Seven-day action tracker — one day at a time.
const TRACKER_DONE = new Set(['완료', '어려움', '중단', '쉬어감'])
let trackerActiveDay = 0
let trackerDaysData = Array.from({ length: 7 }, () => ({ status: '', emotion: '', note: '' }))

function upgradeIsDayLogged(d) {
  return Boolean(d && TRACKER_DONE.has(d.status))
}
function upgradeFindActiveDay(days) {
  const idx = days.findIndex((d) => !upgradeIsDayLogged(d))
  return idx === -1 ? 7 : idx
}
function upgradeSetChoiceGroup(root, attr, value) {
  if (!root) return
  $$('button.tracker-choice', root).forEach((b) => {
    b.classList.toggle('active', b.getAttribute(attr) === value)
  })
}
function upgradeBindChoiceGroup(rootId, attr, hiddenId) {
  const root = $('#' + rootId)
  if (!root || root.dataset.bound === '1') return
  root.dataset.bound = '1'
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('button.tracker-choice')
    if (!btn) return
    const val = btn.getAttribute(attr)
    if (!val) return
    $('#' + hiddenId).value = val
    upgradeSetChoiceGroup(root, attr, val)
  })
}
function upgradeRenderProgress() {
  const box = $('#trackerProgress')
  if (!box || box.dataset.dawonStub === '1') return
  const frontier = upgradeFindActiveDay(trackerDaysData)
  box.innerHTML = Array.from({ length: 7 }, (_, i) => {
    const d = trackerDaysData[i] || {}
    const logged = upgradeIsDayLogged(d)
    const canOpen = logged || i === frontier
    const active = i === trackerActiveDay
    const cls = active ? 'is-active' : logged ? 'is-done' : i === frontier ? 'is-open' : 'is-locked'
    const label = logged ? d.status || '기록됨' : i === frontier ? '오늘' : '잠금'
    return `<button type="button" class="tracker-step ${cls}" data-step="${i}" ${canOpen ? '' : 'disabled'}><b>${i + 1}</b><span>${label}</span></button>`
  }).join('')
  $$('.tracker-step', box).forEach((btn) => {
    btn.onclick = () => {
      const i = Number(btn.dataset.step)
      if (Number.isNaN(i)) return
      const openTo = upgradeFindActiveDay(trackerDaysData)
      if (!upgradeIsDayLogged(trackerDaysData[i]) && i !== openTo) return
      upgradeShowDay(i)
    }
  })
}
function upgradeRenderHistory() {
  const box = $('#trackerGrid')
  if (!box || box.dataset.dawonStub === '1') return
  const items = trackerDaysData
    .map((d, i) => ({ d, i }))
    .filter((x) => upgradeIsDayLogged(x.d) && x.i !== trackerActiveDay)
  if (!items.length) {
    box.innerHTML = '<div class="tracker-history-empty">지난 기록은 여기에 쌓입니다. 오늘은 위 카드만 채우면 됩니다.</div>'
    return
  }
  box.innerHTML = items
    .map(
      ({ d, i }) =>
        `<article class="day-log history ${d.status === '완료' ? 'done' : ''}" data-day="${i}"><h3>${i + 1}일차 · ${escapeHtml(d.status)}</h3><p>${escapeHtml(d.emotion || '')}</p><p>${escapeHtml(d.note || '한 줄 기록 없음')}</p><button type="button" class="btn btn-light btn-sm" data-edit-day="${i}">수정</button></article>`,
    )
    .join('')
  $$('[data-edit-day]', box).forEach((b) => {
    b.onclick = () => upgradeShowDay(Number(b.dataset.editDay))
  })
}
function upgradeShowDay(dayIndex) {
  const today = $('#trackerToday')
  const finalBox = $('#trackerFinal')
  if (dayIndex >= 7) {
    trackerActiveDay = 7
    if (today) today.hidden = true
    if (finalBox) finalBox.hidden = false
    upgradeRenderProgress()
    upgradeRenderHistory()
    $('#trackerMicro').textContent = '7일을 모두 남겼습니다. 아래에서 다음 한 가지만 정해 보세요.'
    return
  }
  trackerActiveDay = dayIndex
  if (today) today.hidden = false
  if (finalBox) finalBox.hidden = true
  const d = trackerDaysData[dayIndex] || { status: '완료', emotion: '자신감', note: '' }
  const status = TRACKER_DONE.has(d.status) ? d.status : '완료'
  const emotion = d.emotion && d.emotion !== '감정 선택' ? d.emotion : '자신감'
  $('#todayStatus').value = status === '중단' ? '쉬어감' : status
  $('#todayEmotion').value = emotion
  $('#todayNote').value = d.note || ''
  upgradeSetChoiceGroup($('#todayStatusChoices'), 'data-status', $('#todayStatus').value)
  upgradeSetChoiceGroup($('#todayEmotionChoices'), 'data-emotion', emotion)
  $('#trackerTodayBadge').textContent = `${dayIndex + 1}일차 · ${dayIndex === upgradeFindActiveDay(trackerDaysData) ? '오늘' : '기록 수정'}`
  $('#trackerTodayHint').textContent =
    dayIndex === 0
      ? '처음이에요. 잘한 날·어려운 날·쉬는 날 모두 괜찮습니다.'
      : '어제보다 조금만 나아도 충분합니다. 한 줄이면 됩니다.'
  const nextLabel = dayIndex >= 6 ? '마무리로 이동' : `${dayIndex + 2}일차가 열립니다`
  $('#trackerMicro').textContent = `저장하면 ${nextLabel}.`
  upgradeRenderProgress()
  upgradeRenderHistory()
}
function upgradeBuildTracker(data = {}) {
  trackerDaysData = Array.from({ length: 7 }, (_, i) => {
    const d = (data.days || [])[i] || {}
    return { status: d.status || '', emotion: d.emotion || '', note: d.note || '' }
  })
  trackerActiveDay = upgradeFindActiveDay(trackerDaysData)
  upgradeBindChoiceGroup('todayStatusChoices', 'data-status', 'todayStatus')
  upgradeBindChoiceGroup('todayEmotionChoices', 'data-emotion', 'todayEmotion')
  upgradeShowDay(trackerActiveDay)
}
function upgradeReadTracker() {
  try {
    return JSON.parse(storage.getItem(UPGRADE_TRACKER_KEY) || '{}')
  } catch {
    return {}
  }
}
function upgradeGatherTracker() {
  return {
    before: Number($('#beforeScore').value),
    after: Number($('#afterScore').value),
    days: trackerDaysData.map((d) => ({ ...d })),
    reaction: $('#trackerReaction').value.trim(),
    decision: $('#trackerDecision').value,
    next: $('#trackerNext').value.trim(),
    activeDay: trackerActiveDay,
    savedAt: new Date().toISOString(),
  }
}
function upgradeSaveCurrentDay(statusOverride) {
  if (trackerActiveDay >= 7) {
    storage.setItem(UPGRADE_TRACKER_KEY, JSON.stringify(upgradeGatherTracker()))
    toast('마무리 기록을 저장했습니다.')
    return
  }
  const status = statusOverride || $('#todayStatus').value || '완료'
  const emotion = $('#todayEmotion').value || '자신감'
  const note = $('#todayNote').value.trim()
  trackerDaysData[trackerActiveDay] = { status, emotion, note }
  const next = upgradeFindActiveDay(trackerDaysData)
  storage.setItem(UPGRADE_TRACKER_KEY, JSON.stringify(upgradeGatherTracker()))
  window.dispatchEvent(new CustomEvent('dawon:tracker-saved'))
  if (statusOverride === '쉬어감') toast(`${trackerActiveDay + 1}일차는 쉬어가기로 남겼습니다.`)
  else toast(`${trackerActiveDay + 1}일차 기록을 저장했습니다.`)
  upgradeShowDay(next)
}
function upgradeScore() {
  const a = Number($('#beforeScore').value)
  const b = Number($('#afterScore').value)
  const diff = b - a
  $('#beforeScoreValue').textContent = a + '점'
  $('#afterScoreValue').textContent = b + '점'
  $('#scoreDifference').textContent = (diff > 0 ? '+' : '') + diff + '점'
  $('#scoreMessage').textContent =
    diff > 0
      ? '작은 실천이 자신감을 키우고 있습니다.'
      : diff < 0
        ? '흔들려도 괜찮습니다. 오늘의 기록만 남기면 됩니다.'
        : '점수보다 오늘 한 일을 남기는 것이 중요합니다.'
}
const trackerSaved = upgradeReadTracker()
$('#beforeScore').value = trackerSaved.before || 5
$('#afterScore').value = trackerSaved.after || 5
$('#trackerReaction').value = trackerSaved.reaction || ''
$('#trackerDecision').value = trackerSaved.decision || '유지한다'
$('#trackerNext').value = trackerSaved.next || ''
upgradeBuildTracker(trackerSaved)
upgradeScore()
;['beforeScore', 'afterScore'].forEach((id) => $('#' + id)?.addEventListener('input', upgradeScore))
$('#saveTracker')?.addEventListener('click', () => upgradeSaveCurrentDay())
$('#skipTrackerDay')?.addEventListener('click', () => upgradeSaveCurrentDay('쉬어감'))
$('#saveTrackerFinal')?.addEventListener('click', () => {
  storage.setItem(UPGRADE_TRACKER_KEY, JSON.stringify(upgradeGatherTracker()))
  toast('7일 마무리를 저장했습니다.')
})
$('#exportTracker')?.addEventListener('click', () => {
  const d = upgradeGatherTracker()
  const text =
    `DAWON 7일 설계 기록\n${new Date().toLocaleString('ko-KR')}\n\n시작 전 자신감: ${d.before}점\n현재 자신감: ${d.after}점\n\n` +
    d.days
      .map((x, i) => `${i + 1}일차 · ${x.status || '미기록'} · ${x.emotion || ''}\n${x.note || ''}`)
      .join('\n\n') +
    `\n\n[다른 사람 반응]\n${d.reaction}\n\n[다음 선택]\n${d.decision}\n${d.next}`
  downloadFile('DAWON_7일설계기록_' + new Date().toISOString().slice(0, 10) + '.txt', text)
})
$('#resetTracker')?.addEventListener('click', () => {
  if (!confirm('7일 기록을 처음부터 다시 할까요?')) return
  storage.removeItem(UPGRADE_TRACKER_KEY)
  $('#beforeScore').value = 5
  $('#afterScore').value = 5
  $('#trackerReaction').value = ''
  $('#trackerNext').value = ''
  $('#todayNote').value = ''
  upgradeBuildTracker({})
  upgradeScore()
  toast('7일 기록을 초기화했습니다.')
})

// Content recommendation engine.
function upgradeFillRecommendSelects(){const rs=$('#recommendStage'),rd=$('#recommendDomain');rs.innerHTML=publicStageKeys.map(k=>`<option value="${k}">${stageData[k].name}</option>`).join('');rd.innerHTML=upgradeDomains.map(x=>`<option>${x}</option>`).join('');rs.value=currentStage;rd.value=upgradeSelectedDomain}
function upgradeShowContent(){const stage=$('#recommendStage').value,domain=$('#recommendDomain').value,r=upgradeRecommendation(stage,domain),s=stageData[stage];$('#contentGrid').innerHTML=[['BOOK',r.book,`${domain}을 이해하고 스스로에게 질문하는 읽기 경로`],['MUSIC',r.music,'감정을 정리하고 행동을 시작하도록 돕는 짧은 음악 경로'],['ACTION',r.action,`${s.name}에게 맞춘 오늘의 작은 실행`]].map(x=>`<article class="content-card"><span class="content-type">${x[0]}</span><h3>${escapeHtml(x[1])}</h3><p>${escapeHtml(x[2])}</p><strong>확인 → 실천 → 결과 기록</strong></article>`).join('')}
upgradeFillRecommendSelects();upgradeShowContent();$('#refreshRecommend')?.addEventListener('click',()=>{upgradeSelectedDomain=$('#recommendDomain').value;upgradeShowContent();toast('맞춤 콘텐츠를 다시 추천했습니다.')});

// Institution program and consultation draft.
$('#institutionForm')?.addEventListener('submit',e=>{e.preventDefault();const type=$('#institutionType').value,goal=$('#institutionGoal').value,people=$('#institutionPeople').value,weeks=$('#institutionWeeks').value;const sessions=weeks.includes('1회')?['도입: 현재 확인','활동: 작은 실천 설계','마무리: 결과 약속']:weeks.includes('7일')?['1일 자기확인','2~5일 실천','6일 피드백','7일 결과 공유']:weeks.includes('4주')?['1주 현재·바람','2주 경험·강점','3주 실천·피드백','4주 결과·다음 설계']:['1~2주 자기확인','3~4주 관계·진로','5~6주 프로젝트 실행','7~8주 결과와 확장'];$('#institutionResult').innerHTML=`<h3>${escapeHtml(type)} · ${escapeHtml(goal)}</h3><p><b>규모</b> ${escapeHtml(people)}명 / <b>기간</b> ${escapeHtml(weeks)}</p><ul>${sessions.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><p><b>필수 도구</b> 생애단계 카드, 3분 설계지, 7일 기록표, 익명 만족도, 운영자 안내서</p><p><b>운영 원칙</b> 진단·평가보다 자기확인과 작은 실천, 보호자·교사·관리자의 적절한 지원을 중심으로 합니다.</p><button class="btn btn-light btn-sm" type="button" id="institutionCopy">운영안 복사</button>`;$('#institutionCopy').onclick=()=>copyAny($('#institutionResult').innerText);toast('기관 운영안을 만들었습니다.')});
$('#consultForm')?.addEventListener('submit',e=>{e.preventDefault();const item={id:'CS-'+Date.now(),name:$('#consultName').value.trim(),purpose:$('#consultPurpose').value.trim(),contact:$('#consultContact').value.trim(),savedAt:new Date().toISOString()};if(!item.purpose)return toast('상담 목적을 입력해 주세요.');const all=opsRead(UPGRADE_CONSULT_KEY,[]);all.unshift(item);opsWrite(UPGRADE_CONSULT_KEY,all.slice(0,20));$('#consultResult').innerHTML=`<h4>상담 요청 초안을 저장했습니다</h4><p>${escapeHtml(item.purpose)}</p><p>현재는 이 기기의 브라우저에만 저장되며 실제 전송되지 않습니다.</p>`;$('#consultResult').classList.add('show');toast('상담 요청 초안을 저장했습니다. 실제 전송은 되지 않습니다.')});

// Accessibility and local data controls.
$('#fontToggle')?.addEventListener('click',()=>{const on=document.body.classList.toggle('large-text');$('#fontToggle').setAttribute('aria-pressed',String(on));storage.setItem('dawonLargeText',String(on))});$('#contrastToggle')?.addEventListener('click',()=>{const on=document.body.classList.toggle('high-contrast');$('#contrastToggle').setAttribute('aria-pressed',String(on));storage.setItem('dawonHighContrast',String(on))});if(storage.getItem('dawonLargeText')==='true')document.body.classList.add('large-text');if(storage.getItem('dawonHighContrast')==='true')document.body.classList.add('high-contrast');
$('#exportAllLocal')?.addEventListener('click',()=>{const data={exportedAt:new Date().toISOString(),items:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.toLowerCase().includes('dawon'))data.items[k]=localStorage.getItem(k)}downloadFile('DAWON_로컬저장정보_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(data,null,2),'application/json;charset=utf-8')});
$('#deleteAllLocal')?.addEventListener('click',()=>{if(!confirm('이 홈페이지가 브라우저에 저장한 모든 DAWON 정보를 삭제할까요?'))return;const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.toLowerCase().includes('dawon'))keys.push(k)}keys.forEach(k=>localStorage.removeItem(k));toast('이 홈페이지의 로컬 저장정보를 삭제했습니다.');setTimeout(()=>location.reload(),700)});

updateCounters();renderStage('elementary');upgradeSyncStage('elementary');upgradeRenderStageRecommendation();showPage(0,false);
})();
  } catch (error) {
    console.warn('[dawon] script-0 init skipped:', error);
  }

  /* dawon-style-upgrade-script */
  try {
    (function(){
  const stageColors={
    elementary:'#f0c94d',
    middle:'#26a7c7',
    high:'#1976b8',
    college:'#8b5fbf',
    youth:'#2f8f58',
    worker:'#5a3728',
    family:'#d06a58',
    midlife:'#c4933b',
    senior:'#7fa168'
  };
  function applyStageTheme(stage){
    const c=stageColors[stage]||'#2f8f58';
    document.documentElement.style.setProperty('--stage-accent', c);
  }
  document.querySelectorAll('.stage-tab').forEach(btn=>{
    btn.addEventListener('click',()=>applyStageTheme(btn.dataset.stage));
  });
  const quickStage=document.getElementById('quickStage');
  if(quickStage){
    applyStageTheme(quickStage.value);
    quickStage.addEventListener('change',()=>applyStageTheme(quickStage.value));
  }
  const styleBanner=document.querySelector('.style-banner');
  if(styleBanner){
    styleBanner.title='요청 색상: 녹색 · 밤색 · 빨강 · 노랑 · 청파랑 · 흰글씨 · 검정글씨';
  }
})();
  } catch (error) {
    console.warn('[dawon] dawon-style-upgrade-script init skipped:', error);
  }

  /* dawon-innovation-script */
  try {
    (function(){
  'use strict';
  const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>Array.from(r.querySelectorAll(q));
  const safeStorage={get(k,f=''){try{return localStorage.getItem(k)??f}catch{return f}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
  const progress=$('#pageProgress');
  const updateProgress=()=>{if(!progress)return;const h=document.documentElement.scrollHeight-innerHeight;progress.style.width=(h>0?Math.min(100,scrollY/h*100):0)+'%'};
  addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);updateProgress();

  const quests=[
    {tag:'생활 · 10분',text:'오늘 가장 눈에 띄는 한 곳을 10분만 정리해 보세요.',tip:'완벽하게 끝내기보다 시작 전과 후의 느낌을 한 문장으로 남겨 보세요.'},
    {tag:'마음 · 3분',text:'지금 감정을 한 단어로 쓰고 “그럴 수 있구나”라고 말해 보세요.',tip:'감정을 해결하려 하기보다 먼저 정확한 이름을 붙이는 것이 시작입니다.'},
    {tag:'관계 · 5분',text:'고마운 사람 한 명에게 구체적인 감사 한 문장을 보내 보세요.',tip:'“고마워” 뒤에 무엇이 고마웠는지 행동을 붙이면 마음이 더 정확하게 전달됩니다.'},
    {tag:'건강 · 10분',text:'휴대전화를 내려놓고 천천히 10분 걸어 보세요.',tip:'속도보다 호흡, 발바닥 감각, 주변의 색 세 가지를 알아차려 보세요.'},
    {tag:'미래 · 7분',text:'원하는 미래를 한 문장으로 쓰고 오늘 가능한 첫 행동을 동그라미 치세요.',tip:'큰 목표보다 7일 안에 확인할 수 있는 행동이 좋은 설계입니다.'},
    {tag:'배움 · 10분',text:'오늘 배운 것 하나를 내 말로 세 문장만 정리해 보세요.',tip:'아는 것과 설명할 수 있는 것 사이의 차이가 다음 학습 방향을 알려줍니다.'},
    {tag:'돈 · 5분',text:'오늘 지출 하나를 “필요·기쁨·습관” 중 하나로 분류해 보세요.',tip:'절약보다 먼저 내가 돈을 쓰는 이유를 확인하면 선택이 선명해집니다.'},
    {tag:'가족 · 10분',text:'가족에게 조언 없이 질문 하나만 하고 끝까지 들어 보세요.',tip:'“요즘 가장 힘든 것은 뭐야?”처럼 답을 정하지 않은 질문이 좋습니다.'},
    {tag:'일 · 10분',text:'오늘 해야 할 일 중 결과가 가장 분명한 한 가지부터 시작하세요.',tip:'할 일 목록보다 “끝났다고 판단할 기준”을 먼저 적어 보세요.'},
    {tag:'자기칭찬 · 2분',text:'오늘 이미 해낸 작은 일 세 가지를 찾아 소리 내어 칭찬해 보세요.',tip:'성과의 크기보다 내가 시작하고 이어온 사실을 구체적으로 인정합니다.'},
    {tag:'창작 · 10분',text:'떠오르는 아이디어를 평가하지 말고 제목 다섯 개로 만들어 보세요.',tip:'좋은 아이디어를 고르기 전에 여러 가능성을 밖으로 꺼내는 단계가 필요합니다.'},
    {tag:'휴식 · 5분',text:'아무것도 고치지 않는 5분 휴식을 일정에 넣어 보세요.',tip:'휴식도 실천입니다. 끝난 뒤 몸의 긴장도가 어떻게 달라졌는지 확인하세요.'}
  ];
  const qTag=$('#questTag'),qText=$('#questText'),qTip=$('#questTip'),qCard=$('#questCard'),qStreak=$('#questStreak'),qDots=$('#questDots');
  let lastIndex=Number(safeStorage.get('dawonQuestIndex','0'))||0;
  function dateKey(offset=0){const d=new Date();d.setDate(d.getDate()+offset);return d.toISOString().slice(0,10)}
  function completedDays(){try{return JSON.parse(safeStorage.get('dawonQuestDays','[]'))}catch{return []}}
  function renderQuest(i){lastIndex=(i+quests.length)%quests.length;const q=quests[lastIndex];if(qTag)qTag.textContent=q.tag;if(qText)qText.textContent=q.text;if(qTip)qTip.textContent=q.tip;safeStorage.set('dawonQuestIndex',String(lastIndex));if(qCard){qCard.classList.remove('celebrate');void qCard.offsetWidth;qCard.classList.add('celebrate')}}
  function streak(days){let n=0;for(let i=0;i<365;i++){if(days.includes(dateKey(-i)))n++;else if(i===0)continue;else break}return n}
  function renderHistory(){const days=completedDays();if(qStreak)qStreak.textContent='연속 실천 '+streak(days)+'일';if(qDots)qDots.innerHTML=Array.from({length:7},(_,i)=>{const key=dateKey(i-6);return '<i class="'+(days.includes(key)?'done':'')+'" title="'+key+'"></i>'}).join('')}
  function confetti(){for(let i=0;i<22;i++){const x=(Math.random()-.5)*520,y=(Math.random()-.7)*420;const el=document.createElement('i');el.className='confetti';el.style.setProperty('--x',x+'px');el.style.setProperty('--y',y+'px');el.style.left=(48+Math.random()*4)+'%';el.style.background=['#ef877a','#8ed4b2','#82b9df','#f3cf53','#e94c5b'][i%5];document.body.appendChild(el);setTimeout(()=>el.remove(),1050)}}
  $('#questDraw')?.addEventListener('click',()=>{let i=lastIndex;while(i===lastIndex)i=Math.floor(Math.random()*quests.length);renderQuest(i)});
  $('#questComplete')?.addEventListener('click',()=>{const days=completedDays(),today=dateKey();if(!days.includes(today))days.push(today);safeStorage.set('dawonQuestDays',JSON.stringify(days.slice(-120)));renderHistory();confetti();if(qText)qText.textContent='잘했습니다. 오늘의 작은 실천이 경험이 되었습니다.';if(qTip)qTip.textContent='무엇이 달라졌는지 한 문장으로 적고 7일 기록에 남겨 보세요.'});
  renderQuest(lastIndex);renderHistory();

  const setMood=m=>{document.body.dataset.mood=m;safeStorage.set('dawonMood',m);$$('[data-mood-choice]').forEach(b=>b.classList.toggle('active',b.dataset.moodChoice===m))};
  $$('[data-mood-choice]').forEach(b=>b.addEventListener('click',()=>setMood(b.dataset.moodChoice)));
  setMood(safeStorage.get('dawonMood','warm'));

  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12});$$('.reveal-up').forEach(el=>io.observe(el))}else{$$('.reveal-up').forEach(el=>el.classList.add('is-visible'))}
})();
  } catch (error) {
    console.warn('[dawon] dawon-innovation-script init skipped:', error);
  }

  /* dawon-integrated-strategy-js */
  try {
    (function(){
  'use strict';
  const $=(q,r=document)=>r.querySelector(q);
  const read=(key,fallback)=>{try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v)}catch{return fallback}};
  const setText=(id,v)=>{const el=$(id);if(el)el.textContent=v};
  const setBar=(id,v)=>{const el=$(id);if(el)el.style.width=Math.max(0,Math.min(100,v))+'%'};
  function renderLifeSignal(){
    const quickSaved=read('dawonQuickDesign_v5',null); const quick=(quickSaved||$('#quickResult')?.classList.contains('show'))?1:0;
    const quest=read('dawonQuestDays',[]); let questDays=Array.isArray(quest)?quest.length:0; if(!questDays&&($('#questText')?.textContent||'').includes('잘했습니다'))questDays=1;
    const tracker=read('dawonSevenDayTracker_v5',{}); let trackerDays=Array.isArray(tracker.days)?tracker.days.filter(x=>x&&x.status==='완료').length:0; if(!trackerDays)trackerDays=Array.from(document.querySelectorAll('[data-log="status"]')).filter(x=>x.value==='완료').length;
    const reports=read('dawonLifeStageWishResponses_v3',[]); let reportCount=Array.isArray(reports)?reports.length:0; if(!reportCount&&$('#result')?.classList.contains('show'))reportCount=1;
    const parts=[quick?25:0,Math.min(25,questDays/7*25),Math.min(25,trackerDays/7*25),Math.min(25,reportCount*25)];
    const score=Math.round(parts.reduce((a,b)=>a+b,0));
    setText('#lifeSignalScore',score);setText('#signalQuick',quick?'완료':'미작성');setText('#signalQuest',questDays+'일');setText('#signalTracker',trackerDays+'일');setText('#signalReport',String(reportCount));
    setBar('#signalQuickBar',quick*100);setBar('#signalQuestBar',questDays/7*100);setBar('#signalTrackerBar',trackerDays/7*100);setBar('#signalReportBar',Math.min(100,reportCount*100));
    const ring=$('#lifeSignalRing');if(ring)ring.style.setProperty('--score',score);
    const next=$('#lifeSignalNext'); if(!next)return;
    let href='#quick-design',message='3분 자기설계로 오늘 하나를 정하세요.';
    if(quick && questDays===0){href='#today-quest';message='오늘의 작은 퀘스트를 직접 완료해 보세요.'}
    else if(quick && questDays>0 && trackerDays<3){href='#action-log';message='실행 결과와 감정 변화를 7일 기록에 남기세요.'}
    else if(quick && trackerDays>=3 && reportCount===0){href='#survey';message='상세 상태 확인으로 경험과 다음 방향을 연결하세요.'}
    else if(reportCount>0){href='#institution';message='개인의 경험을 가족·학교·기업 프로그램으로 확장해 보세요.'}
    next.href=href;const strong=$('strong',next);if(strong)strong.textContent=message;
  }
  function download(name,text){const b=new Blob([text],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
  $('#refreshLifeSignal')?.addEventListener('click',renderLifeSignal);
  $('#downloadIntegratedGuide')?.addEventListener('click',()=>download('DAWON_3인전략모티프_통합전략.txt',`DAWON LIFE DESIGN
송길영 · 최태원 · 노희영 전략 모티프 × 다원 실행체계

※ 공식 자문·공동사업·투자·추천이 아닌 다원작가의 독립 통합기획입니다.

[01 송길영 전략 모티프 · LIFE SIGNAL]
사람의 달라진 생활, 반복 고민, 행동 기록에서 다음 수요를 읽습니다.
KPI: 반복 고민 상위 10, 추천 수용률

[02 최태원 전략 모티프 · SHARED VALUE]
개인의 변화를 가족·학교·기업·지역 파트너의 공동가치로 확장합니다.
KPI: 7일 지속률, 기관 파일럿, 파트너 재계약률

[03 노희영 전략 모티프 · BRAND EXPERIENCE]
철학을 팔리는 언어, 기억되는 장면, 선택하기 쉬운 상품으로 번역합니다.
KPI: 첫 화면 CTA 클릭률, 3분 설계 시작률

[04 다원 실행체계 · ACTION OS]
확인 → 실천 → 결과 → 배움 → 다음 설계
KPI: 행동 완료율, 결과 기록률, 재방문율

[90일 로드맵]
0–30일: 대표문장·핵심고객·3분 설계·7일 기록·분석지표 정렬
31–60일: 사용자 인터뷰 20명·문구 A/B·기관 1곳 파일럿·사례 5건
61–90일: 회원제·추천·파트너센터·기관 패키지 유료전환 검증

[목표]
방문→3분 설계 시작 40% / 7일 중 3일 이상 실천 25% / 변화사례 5건 / 기관 파일럿 1곳`));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderLifeSignal()});
  window.addEventListener('storage',renderLifeSignal);renderLifeSignal();
})();
  } catch (error) {
    console.warn('[dawon] dawon-integrated-strategy-js init skipped:', error);
  }

  /* dawon-small-proposal-js */
  try {
    (function(){
  'use strict';
  const $=s=>document.querySelector(s);
  let resultText='';
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const download=(n,t)=>{const b=new Blob([t],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
  $('#smallProposalForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const title=$('#proposalTitle').value.trim(),benefit=$('#proposalBenefit').value.trim();
    if(!title||!benefit)return;
    const area=$('#proposalArea').value,scale=$('#proposalScale').value,approver=$('#proposalApprover').value.trim();
    const stop=$('#proposalStop').value.trim()||'참여자의 거부·불편, 안전 문제, 민원 또는 예상 밖 비용이 발생하면 즉시 중단';
    const flags=[['개인정보',$('#proposalPersonal').checked],['민감정보·미성년',$('#proposalSensitive').checked],['금전·계약',$('#proposalMoney').checked],['외부공개·권리',$('#proposalPublic').checked]].filter(x=>x[1]).map(x=>x[0]);
    const high=$('#proposalSensitive').checked||scale==='불특정 다수 공개';
    const review=flags.length>0||['학교·교육','직장·기업','공공·기관','상품·서비스'].includes(area);
    const decision=high?'전문 검토 후 진행':review?'승인 확인 후 소규모 진행':'소규모 실행 가능';
    const steps=[['범위','대상 '+scale+' · 7일 이내 · 핵심 행동 1개'],['사전 확인',flags.length?flags.join(' · ')+' 관련 동의·권한·보관 기준 확인':'추가 수집 없이 자발적 참여와 중단권 안내'],['책임',approver||((review||high)?'시행 전 책임자 또는 해당 분야 전문가 지정':'본인이 기록하고 즉시 중단 가능하도록 운영')],['중단 기준',stop],['결과 판단','기대 변화: '+benefit+' / 사실·반응·부작용을 함께 기록'],['다음 단계',high?'법령·내부규정·전문가 검토 전 공개·수집·결제 금지':review?'승인 후 2~5명 수동 시범부터 시작':'오늘 1회 실행 후 결과 한 줄 기록']];
    $('#proposalDecision').textContent=decision;
    $('#proposalResultTitle').textContent=title;
    $('#proposalResultSummary').textContent=`${area}에서 ${scale} 규모로 시작하는 안전 실행 초안입니다.`;
    $('#proposalSteps').innerHTML=steps.map(x=>`<div><b>${esc(x[0])}</b><p>${esc(x[1])}</p></div>`).join('');
    $('#smallProposalResult').classList.add('show');
    resultText=`DAWON 작은 제안 안전 실행안\n\n[제안]\n${title}\n\n[판정]\n${decision}\n\n[적용]\n${area} / ${scale}\n\n${steps.map(x=>`[${x[0]}]\n${x[1]}`).join('\n\n')}\n\n※ 일반 사전점검용 초안이며 전문 자문이 아닙니다.`;
    $('#smallProposalResult').scrollIntoView({behavior:'smooth',block:'center'});
  });
  $('#proposalCopy')?.addEventListener('click',async()=>{if(!resultText)return;try{await navigator.clipboard.writeText(resultText)}catch{const t=document.createElement('textarea');t.value=resultText;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}});
  $('#proposalDownload')?.addEventListener('click',()=>resultText&&download('DAWON_작은제안_안전실행안.txt',resultText));
})();
  } catch (error) {
    console.warn('[dawon] dawon-small-proposal-js init skipped:', error);
  }

  /* dawon-intuitive-lookup-js */
  try {
    (function(){
  'use strict';
  const $=s=>document.querySelector(s), $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
  const state={stage:'',domain:'',time:'',page:1};
  const key='dawon_lookup_start_v1';
  const metricsKey='dawon_lookup_metrics_v1';
  const status=['','1단계 · 현재 위치 선택','2단계 · 필요한 분야 선택','3단계 · 사용 시간 선택','추천 경로 확인'];
  const groupForPage={1:'stage',2:'domain',3:'time'};
  const pageForGroup={stage:1,domain:2,time:3};
  const safeRead=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||fallback}catch{return fallback}};
  const safeWrite=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
  const bump=name=>{const m=safeRead(metricsKey,{visits:0,starts:0,recommendations:0});m[name]=(m[name]||0)+1;safeWrite(metricsKey,m)};
  const saved=safeRead(key,null);
  bump('visits');

  function updateUI(){
    const selected=[state.stage,state.domain,state.time].filter(Boolean).length;
    $('#lookupProgressText').textContent=selected;
    $('#lookupProgressBar').style.width=(selected/3*100)+'%';
    $('#lookupStatusText').textContent=status[state.page]||status[4];
    $$('[data-lookup-step-indicator]').forEach(el=>{
      const n=Number(el.dataset.lookupStepIndicator);el.classList.toggle('active',n===state.page);el.classList.toggle('done',n<state.page || (n===4&&selected===3));
    });
    $$('[data-lookup-page]').forEach(el=>{const active=Number(el.dataset.lookupPage)===state.page;el.hidden=!active;el.classList.toggle('active',active)});
    const group=groupForPage[state.page];
    $('#lookupPrev').disabled=state.page===1;
    $('#lookupNext').disabled=!group||!state[group];
    $('#lookupNext').textContent=state.page===3?'추천 보기':'다음';
    $('#lookupLiveSummary').textContent=[state.stage,state.domain,state.time].filter(Boolean).join(' · ') || '현재 위치를 선택해 주세요.';
  }

  function select(group,value,button){
    state[group]=value;
    const wrap=button.closest('[data-lookup-group]');
    $$('button',wrap).forEach(b=>b.classList.toggle('selected',b===button));
    safeWrite(key,{stage:state.stage,domain:state.domain,time:state.time});
    updateUI();
  }

  function recommendation(){
    let title='오늘 3분 설계', href='#quick-design', action=`${state.domain} 분야에서 오늘 할 수 있는 가장 작은 행동 한 가지를 적습니다.`, score=96;
    if(state.time==='1분'){
      title=`${state.stage} 생애단계 핵심 안내`;
      href='#life-stage';
      action=`${state.stage} 단계의 핵심 질문을 읽고 ${state.domain}에 관한 오늘 한 가지를 고릅니다.`;
      score=93;
    }else if(state.time==='10분'){
      title='10분 상세 상태 확인';
      href='#survey';
      action=`${state.domain}에 대한 바람·이유·경험·강점·어려움을 차례로 정리합니다.`;
      score=98;
    }
    if(state.stage==='가족·기관' && state.time!=='10분'){
      title='기관·가족 활용 도구'; href='#institution'; score=94;
      action=`구성원과 함께 ${state.domain}의 현재 상태와 7일 공동 행동을 정합니다.`;
    }
    return {title,href,action,score};
  }

  function showResult(){
    const r=recommendation();state.page=4;
    $$('[data-lookup-page]').forEach(el=>el.hidden=true);
    $('#lookupResult').hidden=false;$('#lookupNav').hidden=true;
    $('#lookupResultMeta').textContent=`${state.stage} · ${state.domain} · ${state.time}`;
    $('#lookupResultTitle').textContent=r.title;
    $('#lookupMatchScore').textContent=r.score;
    $('#lookupResultReason').textContent=`${state.stage} 단계에서 ${state.domain}을(를) 바꾸고 싶고, 지금 ${state.time}을 사용할 수 있으므로 ‘${r.title}’ 경로가 가장 부담이 적습니다.`;
    $('#lookupCheckText').textContent=`지금의 ${state.domain} 상태를 한 문장으로 확인합니다.`;
    $('#lookupActionText').textContent=r.action;
    $('#lookupGoButton').href=r.href;
    $('#lookupGoButton').textContent=`${r.title}으로 이동`;
    bump('recommendations'); updateUI();
  }

  $$('[data-lookup-group] button').forEach(btn=>btn.addEventListener('click',()=>select(btn.closest('[data-lookup-group]').dataset.lookupGroup,btn.dataset.value,btn)));
  $('#lookupNext')?.addEventListener('click',()=>{const group=groupForPage[state.page];if(!state[group])return;if(state.page<3){state.page++;updateUI()}else showResult()});
  $('#lookupPrev')?.addEventListener('click',()=>{if(state.page>1){state.page--;updateUI()}});
  $('#lookupRestart')?.addEventListener('click',()=>{state.stage=state.domain=state.time='';state.page=1;$$('[data-lookup-group] button').forEach(b=>b.classList.remove('selected'));$('#lookupResult').hidden=true;$('#lookupNav').hidden=false;safeWrite(key,{});updateUI();$('#lookup-start').scrollIntoView({behavior:'smooth',block:'start'})});
  $('#lookupBegin')?.addEventListener('click',()=>bump('starts'));
  $$('[href="#lookup-start"]').forEach(a=>a.addEventListener('click',()=>{if(a.id!=='lookupBegin')bump('starts')}));
  $$('[data-search-keyword]').forEach(btn=>btn.addEventListener('click',()=>{const input=$('#searchInput');if(input){input.value=btn.dataset.searchKeyword;input.focus()}}));

  if(saved){
    ['stage','domain','time'].forEach(k=>{if(saved[k]){state[k]=saved[k];const btn=$(`[data-lookup-group="${k}"] button[data-value="${saved[k]}"]`);if(btn)btn.classList.add('selected')}});
  }
  updateUI();
})();
  } catch (error) {
    console.warn('[dawon] dawon-intuitive-lookup-js init skipped:', error);
  }

  /* dawon-commerce-studio-js */
  try {
    (function(){
'use strict';
const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>Array.from(r.querySelectorAll(q));
const CART_KEY='dawonCommerceCart_v1', APPROVAL_KEY='dawonBannerApprovals_v1', ORDER_KEY='dawonCommerceOrders_v1';
const safe={get(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const money=n=>Number(n||0).toLocaleString('ko-KR')+'원';
const products={plate:{name:'꽃인물화 아트 접시',price:39000},bag:{name:'꽃인물화 아트 가방',price:49000},board:{name:'꽃인물화 아트 도마',price:59000}};
function toastMsg(t){const el=$('#toast');if(el){el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)}}
function switchTab(name){$$('[data-commerce-tab]').forEach(b=>{const on=b.dataset.commerceTab===name;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});$$('[data-commerce-panel]').forEach(p=>{const on=p.dataset.commercePanel===name;p.classList.toggle('active',on);p.hidden=!on});if(name==='checkout')renderCart();}
$$('[data-commerce-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.commerceTab)));
$$('[data-add-product]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.addProduct,p=products[id],card=btn.closest('[data-product-card]'),option=$('[data-product-option]',card).value,cart=safe.get(CART_KEY,[]),same=cart.find(x=>x.id===id&&x.option===option);if(same)same.qty+=1;else cart.push({id,name:p.name,price:p.price,option,qty:1});safe.set(CART_KEY,cart);renderCart();toastMsg(p.name+'을 장바구니에 담았습니다.');}));
function totals(cart){const subtotal=cart.reduce((s,x)=>s+x.price*x.qty,0),shipping=subtotal===0?0:(subtotal>=100000?0:4000);return{subtotal,shipping,total:subtotal+shipping}}
function renderCart(){const cart=safe.get(CART_KEY,[]),list=$('#commerceCartList');if(!list)return;list.innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-item"><div><b>${x.name}</b><small>${x.option} · ${money(x.price)}</small></div><input type="number" min="1" max="20" value="${x.qty}" aria-label="${x.name} 수량" data-cart-qty="${i}"><button type="button" data-cart-remove="${i}">삭제</button></div>`).join(''):'<div class="cart-empty">아직 담은 상품이 없습니다.<br>상품개발 탭에서 접시·가방·도마를 선택하세요.</div>';const t=totals(cart);$('#commerceSubtotal').textContent=money(t.subtotal);$('#commerceShipping').textContent=t.shipping?money(t.shipping):(t.subtotal?'무료':'0원');$('#commerceTotal').textContent=money(t.total);$$('[data-cart-qty]').forEach(el=>el.addEventListener('change',()=>{const c=safe.get(CART_KEY,[]);c[Number(el.dataset.cartQty)].qty=Math.max(1,Number(el.value)||1);safe.set(CART_KEY,c);renderCart()}));$$('[data-cart-remove]').forEach(el=>el.addEventListener('click',()=>{const c=safe.get(CART_KEY,[]);c.splice(Number(el.dataset.cartRemove),1);safe.set(CART_KEY,c);renderCart()}));}
$('#clearCommerceCart')?.addEventListener('click',()=>{safe.set(CART_KEY,[]);renderCart();toastMsg('장바구니를 비웠습니다.')});
function syncBanner(){const title=$('#bannerTitleInput').value.trim()||'배너 제목',copy=$('#bannerCopyInput').value.trim()||'배너 설명',cta=$('#bannerCtaInput').value.trim()||'자세히 보기';$('#bannerPreviewTitle').textContent=title;$('#bannerPreviewCopy').textContent=copy;$('#bannerPreviewCta').textContent=cta;$('#bannerPlacementLabel').textContent=$('#bannerPlacement').value;}
['bannerTitleInput','bannerCopyInput','bannerCtaInput','bannerPlacement'].forEach(id=>$('#'+id)?.addEventListener('input',syncBanner));
$$('[data-banner-device]').forEach(b=>b.addEventListener('click',()=>{$$('[data-banner-device]').forEach(x=>x.classList.toggle('active',x===b));$('#bannerPreview').classList.toggle('mobile',b.dataset.bannerDevice==='mobile')}));
const decisionNames={approved:'승인',revision:'수정 요청',hold:'보류'};
function renderApprovals(){const items=safe.get(APPROVAL_KEY,[]);$('#approvalStat').textContent=items.length+'건';const list=$('#bannerApprovalHistory');if(!list)return;list.innerHTML=items.slice(0,5).map(x=>`<div class="approval-item"><div><b>${x.campaign}</b><span>${x.placement} · ${x.when}</span></div><i class="decision-pill ${x.decision}">${decisionNames[x.decision]}</i></div>`).join('')||'<div class="cart-empty">저장된 배너 결재 이력이 없습니다.</div>';}
$$('[data-decision]').forEach(btn=>btn.addEventListener('click',()=>{syncBanner();const item={id:'BA-'+Date.now(),decision:btn.dataset.decision,campaign:$('#bannerCampaign').value.trim()||'배너 캠페인',placement:$('#bannerPlacement').value,title:$('#bannerTitleInput').value.trim(),copy:$('#bannerCopyInput').value.trim(),cta:$('#bannerCtaInput').value.trim(),url:$('#bannerUrlInput').value.trim(),when:new Date().toLocaleString('ko-KR')},items=safe.get(APPROVAL_KEY,[]);items.unshift(item);safe.set(APPROVAL_KEY,items.slice(0,30));$('#bannerApprovalResult').innerHTML=`<strong>${decisionNames[item.decision]}</strong> · ${item.when} · ${item.placement}`;renderApprovals();toastMsg('배너를 '+decisionNames[item.decision]+' 상태로 저장했습니다.')}));
const paymentCatalog={
 simple:{label:'간편결제',providers:['카카오페이','네이버페이','토스페이','PAYCO'],methods:['간편결제']},
 pg:{label:'PG사 일반결제',providers:['토스페이먼츠','KG이니시스','NHN KCP','NICE페이먼츠'],methods:['신용·체크카드','실시간 계좌이체','가상계좌','휴대폰 결제']},
 institution:{label:'기관·수기결제',providers:['견적서·무통장입금','세금계산서·기관후불'],methods:['담당자 확인 후 결제']}
};
const paymentState={route:'simple',provider:'카카오페이'};
function paymentPanelId(route){return route==='simple'?'simplePaymentPanel':route==='pg'?'pgPaymentPanel':'institutionPaymentPanel'}
function updatePaymentSummary(){
 const cfg=paymentCatalog[paymentState.route],env=$('#paymentEnvironment')?.value||'test',method=$('#paymentMethod')?.value||cfg.methods[0];
 $('#paymentSummaryRoute').textContent=cfg.label;$('#paymentSummaryProvider').textContent=paymentState.provider;$('#paymentSummaryMethod').textContent=method;$('#paymentSummaryEnvironment').textContent=env==='live'?'운영 모드 준비':'테스트 모드';
 $('#paymentLiveWarning')?.classList.toggle('show',env==='live');
 const submit=$('#commercePaymentSubmit');if(submit)submit.textContent=env==='live'?'실결제 연동정보 확인':'선택한 방식으로 테스트 주문';
 const badge=$('#paymentConnectBadge');if(badge){badge.textContent=env==='live'?'서버 연동 필요':'실결제 미연동';badge.style.background=env==='live'?'#fbe7e9':'#fff3d7';badge.style.color=env==='live'?'#8c3036':'#76570c'}
}
function setPaymentRoute(route){
 if(!paymentCatalog[route])return;paymentState.route=route;paymentState.provider=paymentCatalog[route].providers[0];$('#paymentRoute').value=route;
 $$('[data-payment-route]').forEach(b=>{const on=b.dataset.paymentRoute===route;b.classList.toggle('active',on);b.setAttribute('aria-checked',String(on))});
 ['simple','pg','institution'].forEach(x=>{const p=$('#'+paymentPanelId(x));if(p)p.hidden=x!==route});
 $$('[data-provider-group]').forEach(g=>$$('.provider-choice',g).forEach((b,i)=>b.classList.toggle('active',g.dataset.providerGroup===route&&i===0)));
 const method=$('#paymentMethod');method.innerHTML=paymentCatalog[route].methods.map(x=>`<option>${x}</option>`).join('');
 updatePaymentSummary();
}
$$('[data-payment-route]').forEach(b=>b.addEventListener('click',()=>setPaymentRoute(b.dataset.paymentRoute)));
$$('.provider-choice').forEach(b=>b.addEventListener('click',()=>{const group=b.closest('[data-provider-group]');if(!group||group.dataset.providerGroup!==paymentState.route)return;$$('.provider-choice',group).forEach(x=>x.classList.toggle('active',x===b));paymentState.provider=b.dataset.provider;updatePaymentSummary()}));
$('#paymentMethod')?.addEventListener('change',updatePaymentSummary);$('#paymentEnvironment')?.addEventListener('change',updatePaymentSummary);
function renderOrders(){const items=safe.get(ORDER_KEY,[]);$('#orderStat').textContent=items.length+'건';const list=$('#commerceOrderHistory');if(!list)return;list.innerHTML=items.slice(0,4).map(x=>`<article><b>${x.orderNo}</b><span>${money(x.total)}</span><div>${x.name} · ${x.routeLabel||'결제'} / ${x.provider||''} / ${x.method} · ${x.environment==='live'?'연동대기':'테스트'}</div></article>`).join('');}
$('#commerceCheckoutForm')?.addEventListener('submit',e=>{e.preventDefault();const cart=safe.get(CART_KEY,[]);if(!cart.length){toastMsg('장바구니에 상품을 먼저 담아주세요.');switchTab('products');return}const t=totals(cart),env=$('#paymentEnvironment').value,route=paymentState.route,cfg=paymentCatalog[route],configured=Boolean($('#merchantId').value.trim()&&$('#clientKey').value.trim()),order={orderNo:'DW'+new Date().toISOString().replace(/\D/g,'').slice(2,14),createdAt:new Date().toISOString(),name:$('#orderName').value.trim(),contact:$('#orderContact').value.trim(),address:$('#orderAddress').value.trim(),route,routeLabel:cfg.label,provider:paymentState.provider,method:$('#paymentMethod').value,environment:env,merchantConfigured:configured,returnUrl:$('#paymentReturnUrl').value.trim(),request:$('#orderRequest').value.trim(),items:cart,total:t.total,status:env==='live'?'integration_required':'payment_test_ready'};const orders=safe.get(ORDER_KEY,[]);orders.unshift(order);safe.set(ORDER_KEY,orders.slice(0,50));const live=env==='live';$('#commerceOrderResult').innerHTML=`<h4>${live?'실결제 연동정보를 확인했습니다':'테스트 주문이 준비되었습니다'}</h4><p><b>주문번호</b> ${order.orderNo}</p><p><b>선택 경로</b> ${order.routeLabel} · ${order.provider} · ${order.method}</p><p><b>결제 예정금액</b> ${money(order.total)}</p><p>${live?'실제 승인은 실행하지 않았습니다. 서버 API와 제공사 계약을 연결한 뒤 운영 전환하세요.':'현재는 테스트 주문이며 실제 금액은 결제되지 않았습니다.'}</p>`;$('#commerceOrderResult').classList.add('show');safe.set(CART_KEY,[]);renderCart();renderOrders();e.target.reset();setPaymentRoute('simple');$('#paymentEnvironment').value='test';updatePaymentSummary();toastMsg(live?'연동 준비 주문을 저장했습니다. 실제 승인은 실행하지 않았습니다.':'테스트 주문을 저장했습니다. 실제 결제는 되지 않았습니다.')});
setPaymentRoute('simple');renderCart();renderApprovals();renderOrders();syncBanner();
})();
  } catch (error) {
    console.warn('[dawon] dawon-commerce-studio-js init skipped:', error);
  }

  /* dawon-life-design-login-js */
  try {
    (function(){
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const KEY='dawonLifeDesignSession_v1';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
  const save=v=>{try{v?localStorage.setItem(KEY,JSON.stringify(v)):localStorage.removeItem(KEY)}catch{}};
  function apply(session){
    const admin=session?.role==='admin';document.body.classList.toggle('admin-mode',admin);
    const adminBtn=$('#adminOpen');if(adminBtn)adminBtn.hidden=!admin;
    const loginBtn=$('#loginOpen');if(loginBtn)loginBtn.textContent=session?`${session.name||'나의 기록'} · ${admin?'Admin':'기록'}`:'로그인 · Sign In';
    const box=$('#loginSession');if(box){box.classList.toggle('show',Boolean(session));$('#loginSessionTitle').textContent=session?`${session.name||'사용자'}님 · ${admin?'관리자 데모':'개인 기록 모드'}`:'';$('#loginSessionText').textContent=session?(admin?'관리 기능이 화면에 표시되었습니다. 관리센터에서 운영 도구로 이동할 수 있습니다.':'이 브라우저에 저장된 오늘 설계와 7일 기록을 이어볼 수 있습니다.'):'';}
  }
  function open(){const l=$('#loginLayer');if(!l)return;l.classList.add('open');l.setAttribute('aria-hidden','false');const s=read();if(s&&$('#loginName'))$('#loginName').value=s.name||'';apply(s);document.body.style.overflow='hidden'}
  function close(){const l=$('#loginLayer');if(!l)return;l.classList.remove('open');l.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  $('#loginOpen')?.addEventListener('click',open);$('#loginClose')?.addEventListener('click',close);$('#loginBackdrop')?.addEventListener('click',close);
  $('#userDemoLogin')?.addEventListener('click',()=>{const name=$('#loginName').value.trim()||'사용자';const s={name,role:'user',signedAt:new Date().toISOString()};save(s);apply(s);close();$('#quick-design')?.scrollIntoView({behavior:'smooth'});});
  $('#adminDemoLogin')?.addEventListener('click',()=>{const name=$('#loginName').value.trim()||'관리자';const s={name,role:'admin',signedAt:new Date().toISOString()};save(s);apply(s);close();setTimeout(()=>$('#adminOpen')?.click(),100);});
  $('#demoLogout')?.addEventListener('click',()=>{save(null);apply(null);close();location.hash='#home'});
  $$('[data-admin-jump]').forEach(a=>a.addEventListener('click',()=>{$('#adminClose')?.click()}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});apply(read());
})();
  } catch (error) {
    console.warn('[dawon] dawon-life-design-login-js init skipped:', error);
  }
}
