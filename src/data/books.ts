export interface Book {
  id: string
  title: string
  author: string
  synopsis: string
  rating: number           // 0.5–5.0 increments (half-star)
  dateRead: string         // legacy display string
  dateReadType?: 'exact' | 'fuzzy' | 'none'
  dateReadExact?: string   // ISO "YYYY-MM-DD"
  dateReadFuzzy?: string   // e.g. "Sometime in 2026"
  coverUrl: string | null
  dominantColor: string
  genre?: string
}

export const SEED_BOOKS: Omit<Book, 'coverUrl' | 'dominantColor'>[] = [
  {
    id: '1',
    title: 'The Housemaid',
    author: 'Freida McFadden',
    synopsis: 'A twisty psychological thriller about a woman who takes a job as a housemaid for a wealthy family, only to discover the dark secrets lurking beneath their perfect facade.',
    rating: 5,
    dateRead: 'March 2024',
  },
  {
    id: '2',
    title: 'The Great Alone',
    author: 'Kristin Hannah',
    synopsis: 'A powerful story of a family who moves to the Alaskan wilderness in 1974, only to find that the brutal landscape pales in comparison to the danger within their own home.',
    rating: 5,
    dateRead: 'January 2024',
  },
  {
    id: '3',
    title: 'The Hotel Nantucket',
    author: 'Elin Hilderbrand',
    synopsis: 'A glamorous summer story set in a newly renovated hotel on Nantucket, where the ghosts of the past and the secrets of the present collide in spectacular fashion.',
    rating: 4,
    dateRead: 'July 2023',
  },
  {
    id: '4',
    title: 'The Five Star Weekend',
    author: 'Elin Hilderbrand',
    synopsis: 'After a personal crisis, a food blogger invites four women from different chapters of her life to her beach house for a weekend that will change all of them forever.',
    rating: 4,
    dateRead: 'August 2023',
  },
  {
    id: '5',
    title: 'The Surrogate',
    author: 'Freida McFadden',
    synopsis: 'A gripping thriller about a surrogate who begins to suspect that the couple she is carrying a child for may have sinister intentions.',
    rating: 4,
    dateRead: 'April 2024',
  },
  {
    id: '6',
    title: 'The Business Trip',
    author: 'Freida McFadden',
    synopsis: 'A chilling tale of two women on the same business trip whose lives intertwine in ways neither could have predicted, with terrifying consequences.',
    rating: 4,
    dateRead: 'February 2024',
  },
  {
    id: '7',
    title: 'The Paradise Problem',
    author: 'Christina Lauren',
    synopsis: 'A fake-dating rom-com where a free-spirited woman agrees to pose as the wife of her longtime crush for a family wedding at a luxurious resort.',
    rating: 4,
    dateRead: 'May 2024',
  },
  {
    id: '8',
    title: 'The Notebook',
    author: 'Nicholas Sparks',
    synopsis: 'The timeless love story of Noah and Allie, two young people from different worlds who fall in love one summer and are separated by life, only to find their way back to each other.',
    rating: 5,
    dateRead: 'December 2023',
  },
  {
    id: '9',
    title: 'It Ends with Us',
    author: 'Colleen Hoover',
    synopsis: 'A brave and heartbreaking novel about a young woman who finds the courage to break the cycle of abuse in her own relationship.',
    rating: 5,
    dateRead: 'November 2023',
  },
  {
    id: '10',
    title: 'One Golden Summer',
    author: 'Carley Fortune',
    synopsis: 'A sweeping novel about second chances, family secrets, and the summer that changes everything for a woman who returns to the lakeside cottage of her childhood.',
    rating: 4,
    dateRead: 'June 2024',
  },
]

export const FALLBACK_COLORS: Record<string, string> = {
  '1': '#8B2635',
  '2': '#1B4F72',
  '3': '#D4A843',
  '4': '#2E7D6B',
  '5': '#6B2D6B',
  '6': '#1A3A5C',
  '7': '#C4622D',
  '8': '#8B4513',
  '9': '#C0392B',
  '10': '#2C7A3A',
}
