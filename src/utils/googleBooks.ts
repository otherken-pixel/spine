import type { Book, GoogleBooksResponse, GoogleBookVolume } from '../types';

const API_BASE = 'https://www.googleapis.com/books/v1/volumes';

// Upgrade http thumbnails to https and request larger size
function normalizeCoverUrl(url?: string): string {
  if (!url) return '';
  return url
    .replace(/^http:\/\//, 'https://')
    .replace('zoom=1', 'zoom=2');
}

// Derive a readable spine color from the book's position/id (deterministic)
const SPINE_PALETTE: Array<{ bg: string; text: string }> = [
  { bg: '#2d5986', text: '#e8f4f8' },
  { bg: '#8b2020', text: '#fff0f0' },
  { bg: '#1a5c2e', text: '#d0f0dc' },
  { bg: '#6b4c8b', text: '#f0e8ff' },
  { bg: '#c97b20', text: '#1a0f00' },
  { bg: '#2a5a5a', text: '#d0f0f0' },
  { bg: '#8b5a1a', text: '#fff0d8' },
  { bg: '#4a3a8b', text: '#e8e0ff' },
];

export function deriveSpineColors(seed: string): { spineColor: string; spineLabelColor: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const entry = SPINE_PALETTE[hash % SPINE_PALETTE.length];
  return { spineColor: entry.bg, spineLabelColor: entry.text };
}

export function volumeToBook(volume: GoogleBookVolume): Omit<Book, 'rating' | 'dateFinished'> {
  const { id, volumeInfo } = volume;
  const colors = deriveSpineColors(id);
  return {
    id: `gb-${id}`,
    googleBooksId: id,
    title: volumeInfo.title,
    author: volumeInfo.authors?.join(', ') ?? 'Unknown Author',
    synopsis: volumeInfo.description ?? 'No description available.',
    coverUrl: normalizeCoverUrl(
      volumeInfo.imageLinks?.thumbnail ?? volumeInfo.imageLinks?.smallThumbnail
    ),
    pageCount: volumeInfo.pageCount,
    ...colors,
  };
}

export async function searchBooks(query: string, maxResults = 12): Promise<GoogleBookVolume[]> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
    printType: 'books',
    langRestrict: 'en',
  });
  const response = await fetch(`${API_BASE}?${params}`);
  if (!response.ok) throw new Error(`Google Books API error: ${response.status}`);
  const data: GoogleBooksResponse = await response.json();
  return data.items ?? [];
}

export async function fetchBookById(googleId: string): Promise<GoogleBookVolume | null> {
  const response = await fetch(`${API_BASE}/${googleId}`);
  if (!response.ok) return null;
  return response.json() as Promise<GoogleBookVolume>;
}
