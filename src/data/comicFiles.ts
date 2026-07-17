import { PATH_CARDS } from './paths'

const comicTitles = new Map(PATH_CARDS.map((card) => [card.id, card.title]))

export function getComicUrl(id: string): string | null {
  const title = comicTitles.get(id)
  if (!title) return null

  const fileName = `${id}_${title}_50p_만화형전자책.pdf`
  return `/comics/${encodeURIComponent(fileName)}`
}
