import { useState, useEffect, useRef } from 'react'
import { Book, SEED_BOOKS, FALLBACK_COLORS } from '../data/books'

const CACHE_KEY = 'spine_book_covers_v1'

function loadCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveCache(cache: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {}
}

async function fetchCoverUrl(title: string, author: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${title} ${author}`)
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1&fields=items(volumeInfo(imageLinks))`
    )
    if (!res.ok) return null
    const data = await res.json()
    const imageLinks = data?.items?.[0]?.volumeInfo?.imageLinks
    if (!imageLinks) return null
    const url = imageLinks.extraLarge || imageLinks.large || imageLinks.medium || imageLinks.thumbnail
    if (!url) return null
    return url.replace('http://', 'https://').replace('&zoom=1', '&zoom=3')
  } catch {
    return null
  }
}

export function useBookCovers() {
  const [books, setBooks] = useState<Book[]>(() =>
    SEED_BOOKS.map((b) => ({
      ...b,
      coverUrl: null,
      dominantColor: FALLBACK_COLORS[b.id] ?? '#5a3e2b',
    }))
  )

  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const cache = loadCache()

    async function loadAll() {
      for (const book of SEED_BOOKS) {
        const cached = cache[book.id]
        if (cached) {
          setBooks((prev) =>
            prev.map((b) => (b.id === book.id ? { ...b, coverUrl: cached } : b))
          )
        } else {
          const url = await fetchCoverUrl(book.title, book.author)
          if (url) {
            cache[book.id] = url
            saveCache(cache)
            setBooks((prev) =>
              prev.map((b) => (b.id === book.id ? { ...b, coverUrl: url } : b))
            )
          }
          await new Promise((r) => setTimeout(r, 120))
        }
      }
    }

    loadAll()
  }, [])

  return books
}
