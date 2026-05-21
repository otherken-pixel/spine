import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBooksStore } from '../../store/useBooksStore';
import { Shelf } from './Shelf';

const BOOKS_PER_SHELF = 5;

interface BookshelfProps {
  onOpenTheme: () => void;
  onOpenAdd: () => void;
}

export function Bookshelf({ onOpenTheme, onOpenAdd }: BookshelfProps) {
  const books    = useBooksStore((s) => s.books);
  const selectBook = useBooksStore((s) => s.selectBook);

  const shelves = useMemo(() => {
    const rows: typeof books[] = [];
    for (let i = 0; i < books.length; i += BOOKS_PER_SHELF) {
      rows.push(books.slice(i, i + BOOKS_PER_SHELF));
    }
    return rows;
  }, [books]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ background: 'var(--room-bg)' }}>

      {/* ── Ceiling ambient light ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: '220px',
          background: 'radial-gradient(ellipse 90% 50% at 50% -5%, var(--ambient-light), transparent)',
          zIndex: 0,
        }}
      />

      {/* ── Floor vignette ── */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0"
        style={{
          height: '120px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.40), transparent)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-14 pb-3">
        <div>
          <h1 className="font-serif text-3xl tracking-wide" style={{ color: 'var(--text-primary)' }}>
            Spine
          </h1>
          <p className="text-xs mt-0.5 font-light" style={{ color: 'var(--text-secondary)' }}>
            {books.length === 0
              ? 'Your shelf awaits'
              : `${books.length} book${books.length !== 1 ? 's' : ''} read`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onOpenTheme}
            className="rounded-full w-9 h-9 flex items-center justify-center"
            style={{
              background: 'var(--card-bg)',
              color: 'var(--text-secondary)',
              border: '1px solid color-mix(in srgb, var(--shelf-color) 50%, transparent)',
              boxShadow: '0 2px 8px var(--shadow-color)',
            }}
            aria-label="Change theme"
          >
            <PaletteIcon />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onOpenAdd}
            className="rounded-full w-9 h-9 flex items-center justify-center text-lg font-medium"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              boxShadow: '0 2px 10px color-mix(in srgb, var(--accent) 60%, transparent)',
            }}
            aria-label="Add book"
          >
            +
          </motion.button>
        </div>
      </header>

      {/* ── Shelves ── */}
      <main className="relative z-10 pt-6 pb-28">
        {shelves.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24, delay: i * 0.06 }}
          >
            <Shelf books={row} onSelectBook={selectBook} shelfIndex={i} />
          </motion.div>
        ))}

        {books.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center pt-28 gap-3"
          >
            <span className="text-5xl" style={{ opacity: 0.2 }}>📚</span>
            <p className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>
              Your shelf is empty — add your first book
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function PaletteIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5"  cy="7.5"  r=".5" fill="currentColor" />
      <circle cx="6.5"  cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}
