export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Book {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  coverUrl: string;
  /** Hex color for spine rendering, e.g. "#8B4513" */
  spineColor: string;
  /** Contrasting text color for spine label */
  spineLabelColor: string;
  rating: Rating;
  dateFinished: string; // ISO date string
  pageCount?: number;
  googleBooksId?: string;
}

export type ThemeId = 'mahogany' | 'minimalist' | 'custom';

export interface ThemeTokens {
  /** Room/wall background */
  roomBg: string;
  /** Shelf surface color */
  shelfColor: string;
  /** Shelf edge/shadow */
  shelfEdge: string;
  /** Ambient light tint */
  ambientLight: string;
  /** Primary text */
  textPrimary: string;
  /** Secondary text */
  textSecondary: string;
  /** Overlay backdrop */
  overlayBg: string;
  /** Card/panel background */
  cardBg: string;
  /** Accent color */
  accent: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  tokens: ThemeTokens;
}

export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    pageCount?: number;
  };
}

export interface GoogleBooksResponse {
  items?: GoogleBookVolume[];
  totalItems: number;
}
