import { useState, useEffect, useRef, useCallback } from 'react'
import { Book, SEED_BOOKS, FALLBACK_COLORS } from '../data/books'

const COVERS_CACHE_KEY = 'spine_covers_v2'
const USER_BOOKS_KEY = 'spine_user_books_v1'

function loadCoversCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(COVERS_CACHE_KEY) || '{}') } catch { return {} }
}
function saveCoversCache(c: Record<string, string>) {
  try { localStorage.setItem(COVERS_CACHE_KEY, JSON.stringify(c)) } catch {}
}
function loadUserBooks(): Book[] {
  try { return JSON.parse(localStorage.getItem(USER_BOOKS_KEY) || '[]') } catch { return [] }
}
function saveUserBooks(books: Book[]) {
  try { localStorage.setItem(USER_BOOKS_KEY, JSON.stringify(books)) } catch {}
}

async function fetchOpenLibraryCover(title: string, author: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${title} ${author}`)
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${q}&limit=1&fields=cover_i`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    const coverId = data?.docs?.[0]?.cover_i
    if (!coverId) return null
    return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
  } catch {
    return null
  }
}

function makeSeedBooks(): Book[] {
  return SEED_BOOKS.map((b) => ({
    ...b,
    coverUrl: null,
    dominantColor: FALLBACK_COLORS[b.id] ?? '#5a3e2b',
  }))
}

export function useBookCovers() {
  const [books, setBooks] = useState<Book[]>(() => {
    const userBooks = loadUserBooks()
    return [...makeSeedBooks(), ...userBooks]
  })

  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const cache = loadCoversCache()

    // Apply any already-cached covers immediately — no loading flicker
    if (Object.keys(cache).length > 0) {
      setBooks((prev) => prev.map((b) => (cache[b.id] ? { ...b, coverUrl: cache[b.id] } : b)))
    }

    async function fetchMissing() {
      const allBooks = [...makeSeedBooks(), ...loadUserBooks()]
      for (const book of allBooks) {
        if (cache[book.id]) continue
        const url = await fetchOpenLibraryCover(book.title, book.author)
        if (url) {
          cache[book.id] = url
          saveCoversCache(cache)
          setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, coverUrl: url } : b)))
        }
        // Stagger fetches to avoid rate-limiting
        await new Promise((r) => setTimeout(r, 350))
      }
    }

    fetchMissing()
  }, [])

  const addBook = useCallback((book: Book) => {
    // Persist to user books store
    const userBooks = loadUserBooks()
    saveUserBooks([...userBooks, book])

    // Cache the cover if provided
    if (book.coverUrl) {
      const cache = loadCoversCache()
      cache[book.id] = book.coverUrl
      saveCoversCache(cache)
    }

    setBooks((prev) => [...prev, book])

    // If no cover was provided at add time, fetch it async
    if (!book.coverUrl) {
      fetchOpenLibraryCover(book.title, book.author).then((url) => {
        if (url) {
          const cache = loadCoversCache()
          cache[book.id] = url
          saveCoversCache(cache)
          setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, coverUrl: url } : b)))
        }
      })
    }
  }, [])

  return { books, addBook }
}
