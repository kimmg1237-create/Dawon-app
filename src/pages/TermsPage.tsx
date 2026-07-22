import { Link } from 'react-router-dom'
import { BUSINESS_INFO, PRODUCT_SPEC, formatKrw } from '../data/productSpec'

export function TermsPage() {
  return (
    <article className="container legal-page">
      <div className="page-banner">
        <div className="eyebrow">TERMS OF SERVICE</div>
        <h1>이용약관</h1>
        <p>디지털 콘텐츠·기간제 이용권 서비스에 적용되는 이용 조건입니다.</p>
      </div>

      <div className="legal-body">
        <p className="legal-note">
          본 문서는 표준 초안이며 법률 자문이 아닙니다. 정식 공개 전 사업자 정보 확인 및 변호사 검토를
          권장합니다.
        </p>

        <h2>제1조 (목적)</h2>
        <p>
          본 약관은 {BUSINESS_INFO.companyName}(이하 “회사”)가 제공하는 {PRODUCT_SPEC.productName}{' '}
          웹 서비스(이하 “서비스”)의 이용조건 및 절차, 회사와 회원 간 권리·의무를 정합니다.
        </p>

        <h2>제2조 (정의)</h2>
        <ol>
          <li>“회원”이란 본 약관에 동의하고 계정을 만든 자를 말합니다.</li>
          <li>
            “유료 이용권”이란 월 {formatKrw(PRODUCT_SPEC.monthlyPriceKrw)} 등 결제로 일정 기간
            프리미엄 콘텐츠를 이용하는 권리를 말합니다.
          </li>
          <li>
            “디지털 콘텐츠”란 전자책·만화형 전자책·오디오북 등 무형의 정보 콘텐츠를 말합니다.
          </li>
          <li>
            “이용 개시”란 회원이 디지털 콘텐츠를 열람·재생하는 등 실질적으로 이용한 시점을 말합니다.
          </li>
        </ol>

        <h2>제3조 (약관의 게시와 개정)</h2>
        <p>
          회사는 본 약관과{' '}
          <Link to="/refund-policy">환불·청약철회 정책</Link>,{' '}
          <Link to="/privacy">개인정보처리방침</Link>을 서비스에 게시합니다. 약관 변경 시 시행일 및
          변경 사유를 공지합니다.
        </p>

        <h2>제4조 (서비스의 내용)</h2>
        <p>
          서비스는 자기설계·기록·설문·라이브러리(전자책·만화·오디오북) 등을 제공합니다. 무료 체험(
          {PRODUCT_SPEC.freeTrialDays}일) 이후 일부 기능은 유료 이용권 또는 회사가 정한 대체
          이용(광고 등)이 필요할 수 있습니다.
        </p>

        <h2>제5조 (유료 이용권·결제)</h2>
        <ol>
          <li>
            월 이용권 가격은 {formatKrw(PRODUCT_SPEC.monthlyPriceKrw)}이며, 이용 기간은{' '}
            {PRODUCT_SPEC.subscriptionDays}일입니다. 현재 웹 결제는{' '}
            <strong>자동 갱신되지 않는 단건 결제</strong>입니다.
          </li>
          <li>결제는 토스페이먼츠 등 회사가 지정한 결제대행사를 통해 처리됩니다.</li>
          <li>
            회원은 결제 전 상품명·금액·기간·청약철회·환불 조건을 확인하고, 디지털 콘텐츠 특성에 따른
            청약철회 제한에 동의한 뒤 결제할 수 있습니다.
          </li>
        </ol>

        <h2>제6조 (해지)</h2>
        <ol>
          <li>
            회원은 구독 관리 화면에서 <strong>기간 종료형 해지</strong>를 신청할 수 있습니다. 이 경우
            남은 이용 기간까지는 서비스를 이용할 수 있으며, 기간 종료 후 유료 권한이 종료됩니다.
            자동 갱신이 없으므로 추가 결제는 발생하지 않습니다.
          </li>
          <li>
            결제 대금 환불을 원하는 경우 <Link to="/refund-policy">환불·청약철회 정책</Link>에 따라
            환불을 신청합니다. 해지와 환불은 별개의 절차입니다.
          </li>
        </ol>

        <h2>제7조 (청약철회·환불)</h2>
        <p>
          청약철회 및 환불은 「전자상거래 등에서의 소비자보호에 관한 법률」 및{' '}
          <Link to="/refund-policy">환불·청약철회 정책</Link>에 따릅니다. 디지털 콘텐츠는 이용 개시
          후 청약철회가 제한될 수 있으며, 회사는 결제 전 이를 고지하고 동의를 받습니다.
        </p>

        <h2>제8조 (회사의 의무·면책)</h2>
        <p>
          회사는 안정적인 서비스 제공을 위해 노력합니다. 천재지변, 통신장애, 회원 귀책 사유 등으로
          인한 손해에 대해서는 관련 법령이 허용하는 범위에서 책임이 제한될 수 있습니다.
        </p>

        <h2>제9조 (분쟁 해결)</h2>
        <p>
          서비스 이용과 관련한 문의는 {BUSINESS_INFO.email}로 접수합니다. 분쟁 발생 시 관련 법령 및
          관할 기관의 조정·소송 절차에 따를 수 있습니다.
        </p>

        <h2>제10조 (사업자 정보)</h2>
        <ul>
          <li>상호: {BUSINESS_INFO.companyName}</li>
          <li>대표자: {BUSINESS_INFO.representative}</li>
          <li>사업자등록번호: {BUSINESS_INFO.businessNumber}</li>
          <li>통신판매업 신고번호: {BUSINESS_INFO.mailOrderNumber}</li>
          <li>주소: {BUSINESS_INFO.address}</li>
          <li>이메일: {BUSINESS_INFO.email}</li>
          <li>전화: {BUSINESS_INFO.phone}</li>
        </ul>

        <p className="legal-effective">시행일: 2026년 7월 21일</p>
      </div>
    </article>
  )
}
