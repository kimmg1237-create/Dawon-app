import { Link } from 'react-router-dom'
import { BUSINESS_INFO, PRODUCT_SPEC, formatKrw } from '../data/productSpec'

export function RefundPolicyPage() {
  return (
    <article className="container legal-page">
      <div className="page-banner">
        <div className="eyebrow">REFUND · WITHDRAWAL</div>
        <h1>환불·청약철회 정책</h1>
        <p>
          전자상거래법상 청약철회와 디지털 콘텐츠 이용 개시 제한, 구독 해지와의 차이를 안내합니다.
        </p>
      </div>

      <div className="legal-body">
        <p className="legal-note">
          본 정책은 표준 운영 초안입니다. 법률 자문이 아니며, 사업자 정보·실제 운영에 맞게 확정 후
          사용하세요.
        </p>

        <h2>1. 적용 대상</h2>
        <p>
          {PRODUCT_SPEC.productName} 웹에서 토스페이먼츠로 결제하는 유료 이용권(월{' '}
          {formatKrw(PRODUCT_SPEC.monthlyPriceKrw)}, 기관 상품 등)에 적용됩니다. 현재 웹 결제는{' '}
          <strong>자동 갱신 없는 {PRODUCT_SPEC.subscriptionDays}일 이용권</strong>입니다.
        </p>

        <h2>2. 청약철회(환불) 가능 경우 — 전액</h2>
        <ul>
          <li>
            결제일로부터 <strong>{PRODUCT_SPEC.coolingOffDays}일 이내</strong>이고,
          </li>
          <li>
            전자책·만화·오디오북 등 <strong>디지털 콘텐츠를 아직 이용하지 않은</strong> 경우
          </li>
        </ul>
        <p>
          위 조건을 충족하면 구독 관리 화면에서 <strong>전액 환불</strong>을 신청할 수 있습니다.
          승인 시 토스페이먼츠 결제 취소가 진행되며, 카드사 반영까지 영업일 기준 3~7일 정도 소요될
          수 있습니다.
        </p>

        <h2>3. 청약철회가 제한되는 경우</h2>
        <ul>
          <li>
            결제 전 “디지털 콘텐츠이며 이용 개시 후 청약철회가 제한될 수 있음”에 <strong>동의</strong>
            한 뒤, 콘텐츠를 <strong>열람·재생(이용 개시)</strong>한 경우
          </li>
          <li>결제일로부터 {PRODUCT_SPEC.coolingOffDays}일이 지난 경우</li>
          <li>이미 환불·취소 처리된 결제</li>
        </ul>
        <p>
          다만 서비스 장애로 이용이 불가능했거나, 이중 결제·금액 오류 등 회원 귀책이 없는 사유는
          고객센터({PRODUCT_SPEC.supportEmail})로 접수해 주시면 개별 심사합니다.
        </p>

        <h2>4. “해지”와 “환불”의 차이</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th>구분</th>
              <th>의미</th>
              <th>이용 권한</th>
              <th>대금</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>기간 종료형 해지</td>
              <td>더 이상 연장·재결제하지 않음</td>
              <td>만료일까지 유지</td>
              <td>환불 없음</td>
            </tr>
            <tr>
              <td>환불(청약철회)</td>
              <td>조건 충족 시 결제 취소</td>
              <td>즉시 종료</td>
              <td>전액 환불(해당 시)</td>
            </tr>
          </tbody>
        </table>

        <h2>5. 신청 방법</h2>
        <ol>
          <li>
            로그인 후 <Link to="/subscribe">구독·결제</Link> → <strong>구독 관리</strong>
          </li>
          <li>환불 가능 여부 확인 후 「환불 신청」 또는 「기간 종료형 해지」 선택</li>
          <li>
            앱에서 처리되지 않는 경우 {PRODUCT_SPEC.supportEmail}로 주문번호·결제일을 기재해
            신청
          </li>
        </ol>

        <h2>6. 처리 기한</h2>
        <p>
          자동 환불 조건을 충족하면 즉시 결제 취소를 시도합니다. 카드사·은행 사정에 따라 대금 환급
          표시는 영업일 기준 수일이 더 걸릴 수 있습니다. 거절 시 사유를 안내합니다.
        </p>

        <h2>7. 사업자·문의</h2>
        <ul>
          <li>상호: {BUSINESS_INFO.companyName}</li>
          <li>이메일: {BUSINESS_INFO.email}</li>
          <li>전화: {BUSINESS_INFO.phone}</li>
          <li>주소: {BUSINESS_INFO.address}</li>
        </ul>

        <p className="legal-effective">시행일: 2026년 7월 21일</p>
        <p>
          <Link to="/terms">이용약관</Link> · <Link to="/privacy">개인정보처리방침</Link> ·{' '}
          <Link to="/subscribe">구독 관리</Link>
        </p>
      </div>
    </article>
  )
}
