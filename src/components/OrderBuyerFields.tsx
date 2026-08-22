import type { OrderBuyer } from '../data/orderBuyer'

type Props = {
  value: OrderBuyer
  onChange: (next: OrderBuyer) => void
  disabled?: boolean
}

export function OrderBuyerFields({ value, onChange, disabled }: Props) {
  return (
    <fieldset className="order-buyer-fields" disabled={disabled}>
      <legend>주문자 정보</legend>
      <label>
        이름
        <input
          type="text"
          autoComplete="name"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="홍길동"
        />
      </label>
      <label>
        이메일 (영수증)
        <input
          type="email"
          autoComplete="email"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="you@example.com"
        />
      </label>
      <label>
        연락처
        <input
          type="tel"
          autoComplete="tel"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          placeholder="010-0000-0000"
        />
      </label>
    </fieldset>
  )
}
