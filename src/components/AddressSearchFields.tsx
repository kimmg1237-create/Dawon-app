import { useState } from 'react'
import type { OrderBuyer } from '../data/orderBuyer'
import { openRoadAddressSearch } from '../lib/daumPostcode'

type Props = {
  value: OrderBuyer
  onChange: (next: OrderBuyer) => void
  showReceiver?: boolean
}

export function AddressSearchFields({ value, onChange, showReceiver = true }: Props) {
  const [error, setError] = useState('')

  async function onSearch() {
    setError('')
    try {
      const picked = await openRoadAddressSearch()
      if (!picked) return
      onChange({
        ...value,
        zip: picked.zip,
        address1: picked.address1,
        address2: value.address2 || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '주소 검색에 실패했습니다.')
    }
  }

  return (
    <div className="address-search">
      {showReceiver ? (
        <label>
          받는 분
          <input
            value={value.receiverName || ''}
            onChange={(e) => onChange({ ...value, receiverName: e.target.value })}
            placeholder="주문자와 같으면 이름과 동일하게"
          />
        </label>
      ) : null}
      <div className="address-search-row">
        <label>
          우편번호
          <input value={value.zip || ''} readOnly placeholder="주소 검색으로 자동 입력" />
        </label>
        <button type="button" className="btn btn-soft" onClick={() => void onSearch()}>
          도로명 주소 검색
        </button>
      </div>
      <label>
        기본주소
        <input value={value.address1 || ''} readOnly placeholder="검색하면 도로명이 채워집니다" />
      </label>
      <label>
        상세주소
        <input
          value={value.address2 || ''}
          onChange={(e) => onChange({ ...value, address2: e.target.value })}
          placeholder="동·호수"
        />
      </label>
      {error ? <p className="checkout-error">{error}</p> : null}
    </div>
  )
}
