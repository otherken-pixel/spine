import { useEffect, useRef } from 'react'
import { Book } from '../data/books'

const CACHE_KEY = 'spine_author_counts_v1'
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface AuthorRecord {
  count: number
  lastChecked: number
}

function loadCache(): Record<string, AuthorRecord> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') } catch { return {} }
}
function saveCache(c: Record<string, AuthorRecord>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)) } catch {}
}

async function fetchWorkCount(author: string): Promise<{ count: number; latestTitle: string | null }> {
  try {
    const q = encodeURIComponent(author)
    const res = await fetch(
      `https://openlibrary.org/search.json?author=${q}&sort=new&limit=1&fields=title,work_count`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return { count: 0, latestTitle: null }
    const data = await res.json()
    return {
      count: data.numFound ?? 0,
      latestTitle: data.docs?.[0]?.title ?? null,
    }
  } catch {
    return { count: 0, latestTitle: null }
  }
}

export function useAuthorWatcher(
  books: Book[],
  updateBook: (id: string, patch: Partial<Book>) => void
) {
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (hasRunRef.current || books.length === 0) return
    hasRunRef.current = true

    const cache = loadCache()
    const now = Date.now()

    // Collect unique authors
    const authorMap: Record<string, string[]> = {}
    for (const book of books) {
      if (!authorMap[book.author]) authorMap[book.author] = []
      authorMap[book.author].push(book.id)
    }

    async function run() {
      for (const [author, ids] of Object.entries(authorMap)) {
        const record = cache[author]
        // Skip if checked within interval
        if (record && now - record.lastChecked < CHECK_INTERVAL_MS) continue

        const { count, latestTitle } = await fetchWorkCount(author)
        if (count === 0) continue

        const isNew = record && count > record.count
        cache[author] = { count, lastChecked: now }
        saveCache(cache)

        if (isNew && latestTitle) {
          for (const id of ids) {
            updateBook(id, { hasNewRelease: true, newReleaseTitle: latestTitle })
          }
        }

        // Stagger to be polite to the API
        await new Promise((r) => setTimeout(r, 600))
      }
    }

    // Run after a short delay so it doesn't block initial render
    const timer = setTimeout(run, 3000)
    return () => clearTimeout(timer)
  }, [books.length]) // eslint-disable-line react-hooks/exhaustive-deps
}
