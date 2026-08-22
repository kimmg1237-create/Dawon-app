export type BookFormat = 'ebook' | 'paper'

export type OrderBuyer = {
  name: string
  email: string
  phone: string
  zip?: string
  address1?: string
  address2?: string
  receiverName?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function emptyBuyer(email = ''): OrderBuyer {
  return { name: '', email, phone: '', zip: '', address1: '', address2: '', receiverName: '' }
}

export function normalizeBuyer(input: OrderBuyer): OrderBuyer {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.replace(/[^\d]/g, ''),
    zip: (input.zip || '').replace(/[^\d]/g, '').slice(0, 6),
    address1: (input.address1 || '').trim(),
    address2: (input.address2 || '').trim(),
    receiverName: (input.receiverName || input.name || '').trim(),
  }
}

export function validateBuyer(input: OrderBuyer): string | null {
  const b = normalizeBuyer(input)
  if (b.name.length < 2) return '이름을 입력해 주세요.'
  if (!EMAIL_RE.test(b.email)) return '이메일을 확인해 주세요.'
  if (b.phone.length < 9 || b.phone.length > 11) return '연락처(숫자 9~11자리)를 입력해 주세요.'
  return null
}

export function validateShipping(input: OrderBuyer): string | null {
  const b = normalizeBuyer(input)
  if (!b.receiverName || b.receiverName.length < 2) return '받는 분 이름을 입력해 주세요.'
  if (!b.zip || b.zip.length < 5) return '우편번호를 입력해 주세요.'
  if (!b.address1) return '기본 주소를 입력해 주세요.'
  if (!b.address2) return '상세 주소를 입력해 주세요.'
  return null
}

export function formatPhone(phone: string): string {
  const d = phone.replace(/[^\d]/g, '')
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
  return d
}

export function formatAddress(input: OrderBuyer): string {
  const b = normalizeBuyer(input)
  const zip = b.zip ? `(${b.zip}) ` : ''
  return `${zip}${b.address1} ${b.address2}`.trim()
}
