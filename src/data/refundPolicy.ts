import { PRODUCT_SPEC } from './productSpec'

export type PaymentOrderRow = {
  order_id: string
  user_id: string
  amount: number
  product: 'monthly' | 'b2b'
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'
  payment_key: string | null
  paid_at: string | null
  created_at: string
  refunded_at?: string | null
}

export type RefundDecision = {
  eligible: boolean
  amount: number
  code: 'full_unused' | 'already_refunded' | 'used_digital' | 'cooling_off_expired' | 'no_paid_order' | 'not_paid'
  title: string
  reason: string
}

/** 결제 시각 기준 청약철회 기간 내인지 */
export function withinCoolingOff(paidAt: string | null | undefined, now = Date.now()): boolean {
  if (!paidAt) return false
  const paid = new Date(paidAt).getTime()
  const limit = PRODUCT_SPEC.coolingOffDays * 24 * 60 * 60 * 1000
  return now - paid <= limit
}

/**
 * 환불 가능 여부 판정
 * - 7일 이내 + 콘텐츠 미이용 → 전액
 * - 7일 이내 + 이용 개시(동의 고지) → 디지털 콘텐츠 청약철회 제한
 * - 7일 경과 → 원칙 불가(서비스 하자 등은 별도 문의)
 */
export function evaluateRefund(params: {
  order: PaymentOrderRow | null
  contentFirstUsedAt: string | null | undefined
}): RefundDecision {
  const { order, contentFirstUsedAt } = params

  if (!order) {
    return {
      eligible: false,
      amount: 0,
      code: 'no_paid_order',
      title: '환불 가능한 결제 없음',
      reason: '완료된 유료 결제가 없습니다. 결제 내역을 확인해 주세요.',
    }
  }

  if (order.status === 'refunded' || order.status === 'cancelled') {
    return {
      eligible: false,
      amount: 0,
      code: 'already_refunded',
      title: '이미 처리된 결제',
      reason: '이미 환불·취소된 주문입니다.',
    }
  }

  if (order.status !== 'paid') {
    return {
      eligible: false,
      amount: 0,
      code: 'not_paid',
      title: '결제 미완료',
      reason: '결제가 완료되지 않은 주문입니다.',
    }
  }

  if (!withinCoolingOff(order.paid_at)) {
    return {
      eligible: false,
      amount: 0,
      code: 'cooling_off_expired',
      title: '청약철회 기간 경과',
      reason: `결제일로부터 ${PRODUCT_SPEC.coolingOffDays}일이 지나 원칙적으로 청약철회·환불이 제한됩니다. 서비스 장애 등 특별한 사유는 ${PRODUCT_SPEC.supportEmail}로 문의해 주세요.`,
    }
  }

  if (contentFirstUsedAt) {
    return {
      eligible: false,
      amount: 0,
      code: 'used_digital',
      title: '디지털 콘텐츠 이용 개시',
      reason:
        '전자책·만화·오디오북 등 디지털 콘텐츠를 이미 이용하셨습니다. 결제 시 동의한 바에 따라 청약철회가 제한됩니다. 서비스 하자·오결제 등은 고객센터로 문의해 주세요.',
    }
  }

  return {
    eligible: true,
    amount: order.amount,
    code: 'full_unused',
    title: '전액 환불 가능',
    reason: `결제일로부터 ${PRODUCT_SPEC.coolingOffDays}일 이내이며 디지털 콘텐츠를 이용하지 않아 전액 환불이 가능합니다.`,
  }
}
