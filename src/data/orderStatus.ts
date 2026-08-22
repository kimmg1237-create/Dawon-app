export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: '결제대기',
  paid: '결제완료',
  failed: '결제실패',
  cancelled: '취소',
  refunded: '환불완료',
}

export const FULFILL_LABEL: Record<string, string> = {
  pending: '지급대기',
  fulfilled: '지급완료',
  revoked: '지급회수',
}

export const ORDER_EVENT_LABEL: Record<string, string> = {
  order_created: '주문서 작성',
  payment_requested: '결제 요청',
  paid: '결제 승인',
  payment_failed: '결제 실패',
  shipping_queued: '배송 준비',
  refunded: '환불',
}

export function orderStatusLabel(status: string) {
  return ORDER_STATUS_LABEL[status] || status || '-'
}

export function fulfillLabel(status: string) {
  return FULFILL_LABEL[status] || status || '-'
}
