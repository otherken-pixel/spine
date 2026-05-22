import { Book } from '../data/books'

export interface YearGroup {
  year: string   // numeric string e.g. "2026", or "__undated__"
  label: string  // display label e.g. "2026" or "Undated"
  books: Book[]
}

const YEAR_RE = /\b(20\d{2}|19\d{2})\b/

export function extractYear(book: Book): string | null {
  if (book.dateReadType === 'exact' && book.dateReadExact) {
    return book.dateReadExact.slice(0, 4)
  }
  if (book.dateReadType === 'fuzzy' && book.dateReadFuzzy) {
    return YEAR_RE.exec(book.dateReadFuzzy)?.[1] ?? null
  }
  if (book.dateReadType === 'none') {
    return null
  }
  // Legacy fallback: dateRead is a display string like "March 2024"
  return YEAR_RE.exec(book.dateRead)?.[1] ?? null
}

export function groupBooksByYear(books: Book[]): YearGroup[] {
  const map = new Map<string, Book[]>()

  for (const book of books) {
    const year = extractYear(book) ?? '__undated__'
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(book)
  }

  const groups: YearGroup[] = Array.from(map.entries()).map(([year, groupBooks]) => ({
    year,
    label: year === '__undated__' ? 'Undated' : year,
    books: groupBooks,
  }))

  // Most recent year first; undated always last
  groups.sort((a, b) => {
    if (a.year === '__undated__') return 1
    if (b.year === '__undated__') return -1
    return parseInt(b.year, 10) - parseInt(a.year, 10)
  })

  return groups
}
