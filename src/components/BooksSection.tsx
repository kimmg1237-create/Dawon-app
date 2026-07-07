import { BOOKS } from '../data/books'
import './ContentSections.css'

export function BooksSection() {
  return (
    <section id="books">
      <h2 className="section-title">대표 선정도서 · 신뢰 콘텐츠</h2>
      <p className="section-subtitle">국립중앙도서관 일반도서분야 선정도서 핵심 에코시스템</p>
      <div className="grid-3">
        {BOOKS.map((book) => (
          <div key={book.title} className="content-card">
            <span className="card-tag" style={{ background: book.tagColor }}>{book.tag}</span>
            <h3 className="card-title">{book.title}</h3>
            <p className="card-desc">{book.description}</p>
            <div className="card-links">
              {book.links.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                  {link.label.includes('제안서') && <i className="fa-solid fa-arrow-right" />}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
