import './Hero.css'

export function Hero() {
  return (
    <section className="hero" id="intro">
      <h1 className="serif-title">
        나의 하루설계 / My Day Design
        <br />
        오늘 하나를 실천합니다.
      </h1>
      <p>
        Design the day you want. Build the life you hope for.
        <br />
        오늘 한 일, 지금 감정, 내일 할 일, 나에게 한마디를 기록하며 매일 자신과 소통하는 다원작가 맞춤형
        글로벌 생활설계 앱 플랫폼입니다.
      </p>
      <div className="hero-btns">
        <a href="#app-section" className="btn-main btn-filled">
          오늘 카드 쓰기
        </a>
        <a href="#books" className="btn-main btn-outline">
          선정도서 보기
        </a>
      </div>
    </section>
  )
}
