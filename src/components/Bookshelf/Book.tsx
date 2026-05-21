import { useAnimation, motion } from 'framer-motion';
import type { Book as BookType } from '../../types';

interface BookProps {
  book: BookType;
  onSelect: (id: string) => void;
}

// Deterministic spine width 18–32px so spines feel varied and realistic
function spineWidth(book: BookType): number {
  const seed = book.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 18 + (seed % 15);
}

// Height proportional to page count — thicker books stand taller on shelf
function spineHeight(book: BookType): number {
  const pages = book.pageCount ?? 300;
  const clamped = Math.min(Math.max(pages, 150), 650);
  return Math.round(108 + ((clamped - 150) / 500) * 56);
}

function adjustColor(hex: string, delta: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + delta));
  const g = Math.min(255, Math.max(0, ((n >> 8)  & 255) + delta));
  const b = Math.min(255, Math.max(0,  (n        & 255) + delta));
  return `rgb(${r},${g},${b})`;
}

export function Book({ book, onSelect }: BookProps) {
  const controls = useAnimation();
  const width  = spineWidth(book);
  const height = spineHeight(book);

  // Phase 1: tactile compress (0.08 s) → Phase 2: layoutId spring takes over
  const handleTap = async () => {
    await controls.start({
      scale: 0.97,
      transition: { duration: 0.08, ease: [0.4, 0, 1, 1] },
    });
    onSelect(book.id);
    controls.start({ scale: 1, transition: { duration: 0.12 } });
  };

  const hi     = adjustColor(book.spineColor, +30);
  const mid    = book.spineColor;
  const lo     = adjustColor(book.spineColor, -18);
  const shadow = adjustColor(book.spineColor, -38);

  return (
    <motion.div
      layoutId={`book-${book.id}`}
      animate={controls}
      className="relative cursor-pointer select-none flex-shrink-0"
      style={{ width: `${width}px`, height: `${height}px`, transformOrigin: 'bottom center' }}
      whileHover={{ y: -10, transition: { type: 'spring', stiffness: 380, damping: 22 } }}
      onTap={handleTap}
    >
      {/* ── Spine face with lighting gradient ── */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: '2px 3px 3px 2px',
          background: `linear-gradient(
            to right,
            ${shadow} 0%,
            ${lo}     8%,
            ${mid}    28%,
            ${hi}     55%,
            ${mid}    75%,
            ${lo}     90%,
            ${shadow} 100%
          )`,
          boxShadow: `
            inset -3px 0 5px rgba(0,0,0,0.40),
            inset  2px 0 3px rgba(255,255,255,0.10),
            2px 4px 8px var(--shadow-color)
          `,
        }}
      >
        {/* Vertical title */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            padding: '8px 3px',
          }}
        >
          <span
            className="font-serif leading-none text-center"
            style={{
              color: book.spineLabelColor,
              fontSize: `${Math.max(8, Math.min(width - 6, 13))}px`,
              textShadow: '0 1px 3px rgba(0,0,0,0.55)',
              letterSpacing: '0.03em',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {book.title}
          </span>
        </div>

        {/* Top page-edge sheen */}
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'rgba(255,255,255,0.28)' }} />
        {/* Bottom shadow */}
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: 'rgba(0,0,0,0.22)' }} />
      </div>

      {/* Page-edge strip (right side, cream) */}
      <div
        className="absolute top-0 right-0 h-full pointer-events-none"
        style={{
          width: '3px',
          transform: 'translateX(100%)',
          background: 'linear-gradient(to right, #ccc4a8, #e8e0cc)',
          boxShadow: '1px 0 2px rgba(0,0,0,0.18)',
        }}
      />

      {/* Ambient shadow cast onto neighbour */}
      <div
        className="absolute top-0 right-0 h-full w-3 pointer-events-none"
        style={{
          transform: 'translateX(100%)',
          background: 'linear-gradient(to right, rgba(0,0,0,0.25), transparent)',
          zIndex: 1,
        }}
      />
    </motion.div>
  );
}
