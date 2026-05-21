import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useBooksStore } from '../../store/useBooksStore';
import { Shelf } from './Shelf';

const BOOKS_PER_SHELF = 4;

interface BookshelfProps {
  onOpenTheme: () => void;
  onOpenAdd: () => void;
}

export function Bookshelf({ onOpenTheme, onOpenAdd }: BookshelfProps) {
  const books = useBooksStore((s) => s.books);
  const selectBook = useBooksStore((s) => s.selectBook);
  const [_shelves] = useState(() => BOOKS_PER_SHELF);

  const shelves = useMemo(() => {
    const rows: typeof books[] = [];
    for (let i = 0; i < books.length; i += BOOKS_PER_SHELF) {
      rows.push(books.slice(i, i + BOOKS_PER_SHELF));
    }
    return rows;
  }, [books]);

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: 'var(--room-bg)' }}
    >
      {/* Ambient top light */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% -10%, var(--ambient-light), transparent)',
        }}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-4">
        <div>
          <h1
            className="font-serif text-3xl tracking-wide"
            style={{ color: 'var(--text-primary)' }}
          >
            Spine
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {books.length} book{books.length !== 1 ? 's' : ''} read
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onOpenTheme}
            className="rounded-full w-9 h-9 flex items-center justify-center"
            style={{
              background: 'var(--card-bg)',
              color: 'var(--text-secondary)',
              border: '1px solid color-mix(in srgb, var(--shelf-color) 60%, transparent)',
            }}
            aria-label="Change theme"
          >
            <PaletteIcon />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onOpenAdd}
            className="rounded-full w-9 h-9 flex items-center justify-center font-bold text-lg"
            style={{ background: 'var(--accent)', color: '#fff' }}
            aria-label="Add book"
          >
            +
          </motion.button>
        </div>
      </header>

      {/* Shelves */}
      <main className="pt-6 pb-24">
        {shelves.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Shelf books={row} onSelectBook={selectBook} />
          </motion.div>
        ))}

        {books.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-24 gap-4">
            <p className="text-4xl opacity-30">📚</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your shelf is empty. Add your first book!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function PaletteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}
