import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, Theme, ThemeId, ThemeTokens } from '../types';

// ---------------------------------------------------------------------------
// Theme presets
// ---------------------------------------------------------------------------

const mahoganyTokens: ThemeTokens = {
  roomBg: '#1a0f0a',
  shelfColor: '#5c2e00',
  shelfEdge: '#2d1400',
  ambientLight: 'rgba(255, 180, 80, 0.08)',
  textPrimary: '#f5e6d3',
  textSecondary: '#c9a882',
  overlayBg: 'rgba(15, 7, 3, 0.85)',
  cardBg: '#2a1508',
  accent: '#c97b38',
};

const minimalistTokens: ThemeTokens = {
  roomBg: '#f0ede8',
  shelfColor: '#e0d9cf',
  shelfEdge: '#b8b0a5',
  ambientLight: 'rgba(255, 255, 255, 0.15)',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b6560',
  overlayBg: 'rgba(240, 237, 232, 0.90)',
  cardBg: '#ffffff',
  accent: '#5a7a6b',
};

export const THEMES: Theme[] = [
  { id: 'mahogany', name: 'Classic Mahogany', tokens: mahoganyTokens },
  { id: 'minimalist', name: 'Modern Minimalist', tokens: minimalistTokens },
  {
    id: 'custom',
    name: 'Custom Palette',
    tokens: { ...mahoganyTokens }, // user overrides these
  },
];

// ---------------------------------------------------------------------------
// Sample books (seed data)
// ---------------------------------------------------------------------------

const SAMPLE_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    synopsis:
      'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
    coverUrl: 'https://books.google.com/books/content?id=TRH5DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    spineColor: '#2d5986',
    spineLabelColor: '#e8f4f8',
    rating: 5,
    dateFinished: '2024-03-15',
    pageCount: 288,
  },
  {
    id: 'book-2',
    title: 'Lessons in Chemistry',
    author: 'Bonnie Garmus',
    synopsis:
      'Chemist Elizabeth Zott is not your average woman. In fact, Elizabeth Zott would be the first to point out that there is no such thing as an average woman.',
    coverUrl: 'https://books.google.com/books/content?id=SWZCEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    spineColor: '#c94040',
    spineLabelColor: '#fff5f5',
    rating: 5,
    dateFinished: '2024-01-20',
    pageCount: 390,
  },
  {
    id: 'book-3',
    title: 'Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    synopsis:
      'On a bitter-cold day in December 1987, a twelve-year-old boy named Sam Masur meets a girl named Sadie Green on a ski lift in Massachusetts.',
    coverUrl: 'https://books.google.com/books/content?id=LCphEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    spineColor: '#e8a030',
    spineLabelColor: '#1a0f00',
    rating: 4,
    dateFinished: '2024-05-08',
    pageCount: 416,
  },
  {
    id: 'book-4',
    title: 'Fourth Wing',
    author: 'Rebecca Yarros',
    synopsis:
      'Twenty-year-old Violet Sorrengail was supposed to enter the Scribe Quadrant, but her mother orders her to the most elite and deadly division.',
    coverUrl: 'https://books.google.com/books/content?id=q3yfEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    spineColor: '#4a1060',
    spineLabelColor: '#f0d0ff',
    rating: 4,
    dateFinished: '2024-06-30',
    pageCount: 528,
  },
  {
    id: 'book-5',
    title: 'Intermezzo',
    author: 'Sally Rooney',
    synopsis:
      'Peter Koubek is a successful lawyer in his thirties, and Ivan Koubek is a twenty-two-year-old chess prodigy. Though the two brothers have little in common, both are grieving.',
    coverUrl: 'https://books.google.com/books/content?id=4JnvEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    spineColor: '#1a4a2a',
    spineLabelColor: '#d0f0dc',
    rating: 3,
    dateFinished: '2024-09-14',
    pageCount: 352,
  },
  {
    id: 'book-6',
    title: 'Orbital',
    author: 'Samantha Harvey',
    synopsis:
      'A novel set on a space station, following six astronauts as they circle the earth sixteen times in a single day.',
    coverUrl: 'https://books.google.com/books/content?id=6MvnEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    spineColor: '#0a1a3a',
    spineLabelColor: '#c0d8ff',
    rating: 5,
    dateFinished: '2024-11-02',
    pageCount: 192,
  },
  {
    id: 'book-7',
    title: 'James',
    author: 'Percival Everett',
    synopsis:
      "A retelling of Huckleberry Finn from the enslaved Jim's point of view. When the raft breaks up, Jim must escape and find his family.",
    coverUrl: 'https://books.google.com/books/content?id=nWXyEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    spineColor: '#7a4a1a',
    spineLabelColor: '#fff0d8',
    rating: 5,
    dateFinished: '2025-01-18',
    pageCount: 320,
  },
  {
    id: 'book-8',
    title: 'The Women',
    author: 'Kristin Hannah',
    synopsis:
      'In 1965, idealistic Frankie McGrath enlists as an Army nurse and is shipped to Vietnam, where she is overwhelmed by the chaos of war.',
    coverUrl: 'https://books.google.com/books/content?id=FU_BEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    spineColor: '#8a1a2a',
    spineLabelColor: '#ffd8dc',
    rating: 5,
    dateFinished: '2025-03-05',
    pageCount: 480,
  },
];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

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
      name: 'spine-storage',
      partialize: (state) => ({
        books: state.books,
        activeThemeId: state.activeThemeId,
        customTokens: state.customTokens,
      }),
    }
  )
);
