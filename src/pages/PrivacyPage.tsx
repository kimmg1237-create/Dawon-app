import { Link } from 'react-router-dom'
import { BUSINESS_INFO, PRODUCT_SPEC } from '../data/productSpec'

export function PrivacyPage() {
  return (
    <article className="container legal-page">
      <div className="page-banner">
        <div className="eyebrow">PRIVACY POLICY</div>
        <h1>개인정보처리방침</h1>
        <p>서비스 이용에 따라 수집·이용하는 개인정보의 처리 기준을 안내합니다.</p>
      </div>

      <div className="legal-body">
        <p className="legal-note">
          본 문서는 표준 초안입니다. 실제 수집 항목·위탁사에 맞게 수정하고 필요 시 법률 검토를
          받으세요.
        </p>

        <h2>1. 수집 항목</h2>
        <ul>
          <li>회원: 이메일, 비밀번호(암호화), 서비스 이용 기록</li>
          <li>결제: 주문번호, 결제 금액·일시, 결제 키(토스페이먼츠 처리), 환불 신청 내역</li>
          <li>콘텐츠: 디지털 콘텐츠 첫 이용 시각(청약철회 판정용)</li>
        </ul>

        <h2>2. 이용 목적</h2>
        <ul>
          <li>회원 인증, 설계·기록·설문 저장</li>
          <li>유료 이용권 제공, 결제·환불·해지 처리</li>
          <li>고객 문의 대응, 법령상 의무 이행</li>
        </ul>

        <h2>3. 보유 기간</h2>
        <p>
          회원 탈퇴 시까지 보유하며, 전자상거래 등 관련 법령에 따라 계약·청약철회·결제 기록은 일정
          기간 별도 보관할 수 있습니다.
        </p>

        <h2>4. 제3자 제공·처리 위탁</h2>
        <ul>
          <li>토스페이먼츠: 결제·취소·정산</li>
          <li>Supabase: 인증·데이터베이스·Edge Function 호스팅</li>
        </ul>

        <h2>5. 이용자 권리</h2>
        <p>
          열람·정정·삭제·처리정지 요청은 {PRODUCT_SPEC.supportEmail}로 할 수 있습니다.
        </p>

        <h2>6. 개인정보 보호책임</h2>
        <ul>
          <li>상호: {BUSINESS_INFO.companyName}</li>
          <li>이메일: {BUSINESS_INFO.email}</li>
        </ul>

        <p className="legal-effective">시행일: 2026년 7월 21일</p>
        <p>
          <Link to="/terms">이용약관</Link> · <Link to="/refund-policy">환불정책</Link>
        </p>
      </div>
    </article>
  )
}
