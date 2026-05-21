export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Book {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  coverUrl: string;
  spineColor: string;
  spineLabelColor: string;
  rating: Rating;
  dateFinished: string;
  pageCount?: number;
  googleBooksId?: string;
}

export type ThemeId = 'mahogany' | 'minimalist' | 'custom';

export interface ThemeTokens {
  /* ── Colours ── */
  roomBg: string;
  shelfColor: string;
  shelfEdge: string;
  ambientLight: string;
  textPrimary: string;
  textSecondary: string;
  overlayBg: string;
  cardBg: string;
  accent: string;
  /* ── Material tokens ── */
  /** backdrop-filter blur in px */
  blurIntensity: number;
  /** rgba cast shadow colour */
  shadowColor: string;
  /** CSS gradient for shelf surface */
  shelfGradient: string;
  /** CSS gradient for shelf front edge */
  shelfEdgeGradient: string;
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
