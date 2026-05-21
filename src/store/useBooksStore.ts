import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, Theme, ThemeId, ThemeTokens } from '../types';

// ── Theme presets ─────────────────────────────────────────────────────────────

const mahoganyTokens: ThemeTokens = {
  roomBg: '#160c07',
  shelfColor: '#5c2e00',
  shelfEdge: '#2d1400',
  ambientLight: 'rgba(255, 160, 60, 0.10)',
  textPrimary: '#f5e6d3',
  textSecondary: '#c9a882',
  overlayBg: 'rgba(12, 6, 2, 0.80)',
  cardBg: '#221208',
  accent: '#c97b38',
  blurIntensity: 28,
  shadowColor: 'rgba(50, 15, 0, 0.65)',
  shelfGradient: `linear-gradient(
    180deg,
    #7a4020 0%,
    #5c2e00 18%,
    #4a2500 45%,
    #5c2e00 62%,
    #3d1a00 80%,
    #2a1200 100%
  )`,
  shelfEdgeGradient: 'linear-gradient(180deg, #2a1200 0%, #190900 100%)',
};

const minimalistTokens: ThemeTokens = {
  roomBg: '#eceae5',
  shelfColor: '#d4cfc8',
  shelfEdge: '#a09a92',
  ambientLight: 'rgba(255, 255, 255, 0.30)',
  textPrimary: '#18181b',
  textSecondary: '#6b6560',
  overlayBg: 'rgba(236, 234, 229, 0.82)',
  cardBg: '#f8f7f4',
  accent: '#4a7060',
  blurIntensity: 16,
  shadowColor: 'rgba(0, 0, 0, 0.18)',
  shelfGradient: `linear-gradient(
    180deg,
    #f0ece6 0%,
    #ddd8d0 18%,
    #ccc6be 45%,
    #d4cfc8 62%,
    #b8b2aa 80%,
    #a0998f 100%
  )`,
  shelfEdgeGradient: 'linear-gradient(180deg, #a09a92 0%, #8a847c 100%)',
};

export const THEMES: Theme[] = [
  { id: 'mahogany',   name: 'Classic Mahogany',  tokens: mahoganyTokens },
  { id: 'minimalist', name: 'Modern Minimalist',  tokens: minimalistTokens },
  { id: 'custom',     name: 'Custom Palette',     tokens: { ...mahoganyTokens } },
];

// ── Sample books ──────────────────────────────────────────────────────────────

const SAMPLE_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'The Housemaid',
    author: 'Freida McFadden',
    synopsis: 'Millie Calloway desperately needs a fresh start. When she spots a job listing for a live-in housemaid with wealthy Nina Winchester, it seems like the break she needs. But something is terribly wrong in the Winchester house.',
    coverUrl: 'https://books.google.com/books/content?id=Ny770AEACAAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api',
    googleBooksId: 'Ny770AEACAAJ',
    spineColor: '#7a0a0a', spineLabelColor: '#ffd8d8', rating: 5, dateFinished: '2024-02-10', pageCount: 271,
  },
  {
    id: 'book-2',
    title: 'The Great Alone',
    author: 'Kristin Hannah',
    synopsis: 'In 1974, a desperate family seeks a new beginning in the near-isolated wilderness of Alaska—but the environment proves less threatening than the erratic, violent man they brought with them.',
    coverUrl: 'https://books.google.com/books/content?id=LRekDgAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api',
    googleBooksId: 'LRekDgAAQBAJ',
    spineColor: '#1a3550', spineLabelColor: '#c8e0f0', rating: 5, dateFinished: '2024-04-20', pageCount: 448,
  },
  {
    id: 'book-3',
    title: 'The Hotel Nantucket',
    author: 'Elin Hilderbrand',
    synopsis: 'After a $30 million renovation, the Hotel Nantucket reopens under new ownership. New GM Lizbet Keaton hopes to earn five-star status, but the hotel harbors a dark secret—and a ghost who never checked out.',
    coverUrl: 'https://books.google.com/books/content?id=8nlYEAAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api',
    googleBooksId: '8nlYEAAAQBAJ',
    spineColor: '#3a7a9a', spineLabelColor: '#e8f8ff', rating: 4, dateFinished: '2024-07-15', pageCount: 368,
  },
  {
    id: 'book-4',
    title: 'The Five-Star Weekend',
    author: 'Elin Hilderbrand',
    synopsis: 'After sudden loss, food blogger Hollis Shaw gathers her five closest friends—one from each chapter of her life—for a weekend on Nantucket. The reunion she planned becomes the one she needed.',
    coverUrl: 'https://books.google.com/books/content?id=0vKvEAAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api',
    googleBooksId: '0vKvEAAAQBAJ',
    spineColor: '#c87030', spineLabelColor: '#fff5e8', rating: 4, dateFinished: '2024-08-01', pageCount: 384,
  },
  {
    id: 'book-5',
    title: 'The Surrogate Mother',
    author: 'Freida McFadden',
    synopsis: 'Abby Schwartz wants a baby more than anything. When her assistant Monica offers to be her surrogate, it seems like a dream come true. But the closer Abby gets to having everything she wants, the more she stands to lose.',
    coverUrl: 'https://books.google.com/books/content?id=s9-bzQEACAAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api',
    googleBooksId: 's9-bzQEACAAJ',
    spineColor: '#3a1a4a', spineLabelColor: '#e8d0f8', rating: 4, dateFinished: '2024-05-30', pageCount: 284,
  },
  {
    id: 'book-6',
    title: 'The Business Trip',
    author: 'Jessie Garcia',
    synopsis: 'Stephanie and Jasmine are on the same plane, texting their friends about the same charming stranger named Trent. Then both women vanish. A tense dual-narrative thriller about what really happened at seat 14A.',
    coverUrl: 'https://books.google.com/books/content?id=sWkHEQAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api',
    googleBooksId: 'sWkHEQAAQBAJ',
    spineColor: '#1a2a3a', spineLabelColor: '#c8d8e8', rating: 3, dateFinished: '2024-10-15', pageCount: 320,
  },
  {
    id: 'book-7',
    title: 'The Paradise Problem',
    author: 'Christina Lauren',
    synopsis: 'Anna thought her accidental marriage to Liam West was long behind her. When he needs a wife for a family vacation that will determine his inheritance, their forced fake romance starts to feel dangerously real.',
    coverUrl: 'https://books.google.com/books/content?id=JxrdEAAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api',
    googleBooksId: 'JxrdEAAAQBAJ',
    spineColor: '#2a7a5a', spineLabelColor: '#d8f8e8', rating: 4, dateFinished: '2024-11-28', pageCount: 352,
  },
  {
    id: 'book-8',
    title: 'The Notebook',
    author: 'Nicholas Sparks',
    synopsis: 'In a quiet nursing home, an elderly man reads to a woman with Alzheimer\'s from a faded notebook—the timeless story of Noah and Allie, two lovers separated by circumstance and reunited by something stronger.',
    coverUrl: 'https://books.google.com/books/content?id=1AymTljYK94C&printsec=frontcover&img=1&zoom=2&source=gbs_api',
    googleBooksId: '1AymTljYK94C',
    spineColor: '#2a4a7a', spineLabelColor: '#d8e8ff', rating: 5, dateFinished: '2024-12-20', pageCount: 214,
  },
  {
    id: 'book-9',
    title: 'It Ends with Us',
    author: 'Colleen Hoover',
    synopsis: 'Lily has always been resilient. Moving to Boston, she falls for neurosurgeon Ryle Kincaid—until her first love, Atlas, reappears and forces her to confront everything she thought she knew about strength and love.',
    coverUrl: 'https://books.google.com/books/content?id=Eka9DAAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api',
    googleBooksId: 'Eka9DAAAQBAJ',
    spineColor: '#8a3060', spineLabelColor: '#ffe8f4', rating: 5, dateFinished: '2025-01-08', pageCount: 376,
  },
  {
    id: 'book-10',
    title: 'One Golden Summer',
    author: 'Carley Fortune',
    synopsis: 'At seventeen, Alice photographed three strangers in a yellow speedboat at her grandmother\'s cottage—a moment that changed her life. Years later, one of those strangers walks back in, and everything she buried comes rushing back.',
    coverUrl: 'https://books.google.com/books/content?id=L0oYEQAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api',
    googleBooksId: 'L0oYEQAAQBAJ',
    spineColor: '#c87a10', spineLabelColor: '#fff8d8', rating: 4, dateFinished: '2025-03-14', pageCount: 352,
  },
];

// ── Store ─────────────────────────────────────────────────────────────────────

interface BooksState {
  books: Book[];
  selectedBookId: string | null;
  activeThemeId: ThemeId;
  customTokens: ThemeTokens;

  selectBook: (id: string | null) => void;
  addBook: (book: Book) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  removeBook: (id: string) => void;
  setTheme: (id: ThemeId) => void;
  setCustomTokens: (tokens: Partial<ThemeTokens>) => void;
  getActiveTheme: () => Theme;
}

export const useBooksStore = create<BooksState>()(
  persist(
    (set, get) => ({
      books: SAMPLE_BOOKS,
      selectedBookId: null,
      activeThemeId: 'mahogany',
      customTokens: { ...mahoganyTokens },

      selectBook: (id) => set({ selectedBookId: id }),

      addBook: (book) =>
        set((state) => ({ books: [...state.books, book] })),

      updateBook: (id, updates) =>
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      removeBook: (id) =>
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
          selectedBookId: state.selectedBookId === id ? null : state.selectedBookId,
        })),

      setTheme: (id) => set({ activeThemeId: id }),

      setCustomTokens: (tokens) =>
        set((state) => ({ customTokens: { ...state.customTokens, ...tokens } })),

      getActiveTheme: () => {
        const { activeThemeId, customTokens } = get();
        if (activeThemeId === 'custom') {
          return { id: 'custom', name: 'Custom Palette', tokens: customTokens };
        }
        return THEMES.find((t) => t.id === activeThemeId) ?? THEMES[0];
      },
    }),
    {
      name: 'spine-storage-v2',
      partialize: (state) => ({
        books: state.books,
        activeThemeId: state.activeThemeId,
        customTokens: state.customTokens,
      }),
    }
  )
);
