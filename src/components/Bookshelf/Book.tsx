import { motion } from 'framer-motion';
import type { Book as BookType } from '../../types';

interface BookProps {
  book: BookType;
  onSelect: (id: string) => void;
}

// Deterministic width 18–28px based on title length so spines feel varied
function spineWidth(book: BookType): number {
  const base = (book.title.length * 7 + book.id.charCodeAt(book.id.length - 1)) % 12;
  return 18 + base;
}

// Height proportional to page count (200–550 pages → 110–160px)
function spineHeight(book: BookType): number {
  const pages = book.pageCount ?? 300;
  const clamped = Math.min(Math.max(pages, 150), 600);
  return Math.round(110 + ((clamped - 150) / 450) * 50);
}

export function Book({ book, onSelect }: BookProps) {
  const width = spineWidth(book);
  const height = spineHeight(book);

  return (
    <motion.div
      layoutId={`book-${book.id}`}
      onClick={() => onSelect(book.id)}
      className="relative cursor-pointer select-none flex-shrink-0"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transformOrigin: 'bottom center',
      }}
      whileHover={{
        y: -8,
        transition: { type: 'spring', stiffness: 400, damping: 20 },
      }}
      whileTap={{ scale: 0.96 }}
    >
      {/* Spine face */}
      <div
        className="absolute inset-0 rounded-sm overflow-hidden"
        style={{
          background: `linear-gradient(
            to right,
            ${darken(book.spineColor, 20)} 0%,
            ${book.spineColor} 30%,
            ${lighten(book.spineColor, 12)} 60%,
            ${book.spineColor} 80%,
            ${darken(book.spineColor, 15)} 100%
          )`,
          boxShadow: `inset -2px 0 4px rgba(0,0,0,0.35), inset 2px 0 3px rgba(255,255,255,0.08)`,
        }}
      >
        {/* Vertical title label */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            padding: '6px 2px',
          }}
        >
          <span
            className="font-serif text-center leading-tight"
            style={{
              color: book.spineLabelColor,
              fontSize: `${Math.max(8, width - 6)}px`,
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {book.title}
          </span>
        </div>

        {/* Top edge highlight */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `rgba(255,255,255,0.2)` }}
        />
      </div>

      {/* Right-side shadow that bleeds onto the next book */}
      <div
        className="absolute top-0 right-0 h-full w-2 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)',
          transform: 'translateX(100%)',
          zIndex: 1,
        }}
      />
    </motion.div>
  );
}

// Simple color manipulation helpers (no dep needed)
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => Math.min(255, Math.max(0, x)).toString(16).padStart(2, '0')).join('');
}

function lighten(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + amt, g + amt, b + amt);
}

function darken(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r - amt, g - amt, b - amt);
}
