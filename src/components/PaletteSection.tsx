import { PALETTE } from '../data/palette'
import './ContentSections.css'

export function PaletteSection() {
  return (
    <section id="palette">
      <h2 className="section-title">꽃으로 그린 자신과의 소통</h2>
      <p className="section-subtitle">
        수준보다 중요한 것은 멈추지 않는 경험입니다. 감정을 표현하는 따뜻한 아트웍 팔레트.
      </p>
      <div className="palette-grid">
        {PALETTE.map((item) => (
          <div key={item.name} className="palette-item" style={{ backgroundColor: item.color }}>
            <h4>{item.name}</h4>
            <p>{item.meaning}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
