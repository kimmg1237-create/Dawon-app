import type { OrderBuyer } from '../data/orderBuyer'

type DaumPostcodeData = {
  zonecode?: string
  roadAddress?: string
  jibunAddress?: string
  autoRoadAddress?: string
  buildingName?: string
}

type DaumPostcodeCtor = new (options: { oncomplete: (data: DaumPostcodeData) => void }) => { open: () => void }

declare global {
  interface Window {
    daum?: { Postcode: DaumPostcodeCtor }
  }
}

const SCRIPT_ID = 'daum-postcode-script'
const SCRIPT_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

function loadDaumScript(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve()
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('주소 검색을 불러오지 못했습니다.')), { once: true })
    })
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('주소 검색을 불러오지 못했습니다.'))
    document.head.appendChild(script)
  })
}

export async function openRoadAddressSearch(): Promise<Pick<OrderBuyer, 'zip' | 'address1'> | null> {
  await loadDaumScript()
  const Postcode = window.daum?.Postcode
  if (!Postcode) throw new Error('주소 검색을 사용할 수 없습니다.')
  return new Promise((resolve) => {
    new Postcode({
      oncomplete(data) {
        const road = data.roadAddress || data.autoRoadAddress || data.jibunAddress || ''
        const building = data.buildingName ? ` (${data.buildingName})` : ''
        resolve({
          zip: data.zonecode || '',
          address1: `${road}${building}`.trim(),
        })
      },
    }).open()
  })
}
