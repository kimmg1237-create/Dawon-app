import type { BookCard } from '../types'

export const BOOKS: BookCard[] = [
  {
    tag: '대표도서 01',
    tagColor: 'var(--color-yellow)',
    title: '자신과의 소통',
    description:
      '오늘의 나를 확인하고, 감정과 생각을 정리하며, 나와 대화하는 힘을 기르는 다원작가의 브랜드 출발점 도서입니다.',
    links: [
      { label: '전자책 보기', href: '#' },
      { label: '오디오북', href: '#' },
      { label: '구매하기', href: '#' },
    ],
  },
  {
    tag: '대표도서 02',
    tagColor: 'var(--color-pink)',
    title: '힐링게임',
    description:
      '상처와 두려움을 지나 작은 실천으로 회복하는 과정, 놀이처럼 자신을 다시 세우는 생활형 마음정리 지침서입니다.',
    links: [
      { label: '전자책 보기', href: '#' },
      { label: '오디오북', href: '#' },
      { label: '구매하기', href: '#' },
    ],
  },
  {
    tag: 'B2B 라이선스',
    tagColor: 'var(--color-mint)',
    title: '기관/학교 프로그램 확장',
    description:
      '학교방송 3분 자기확인 콘텐츠, 도서관 독서후 실천노트, 기업복지 마음정리 세트 및 시니어 기록학교 표준 모델 공급.',
    links: [{ label: '프로그램 제안서 다운로드', href: '#' }],
  },
]
