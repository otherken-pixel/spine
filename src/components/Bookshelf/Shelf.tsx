import type { Book as BookType } from '../../types';
import { Book } from './Book';

interface ShelfProps {
  books: BookType[];
  onSelectBook: (id: string) => void;
  shelfIndex: number;
}

export function Shelf({ books, onSelectBook, shelfIndex }: ShelfProps) {
  // Slight y-offset variation gives the wall a handcrafted, organic feel
  const topPad = 16 + (shelfIndex % 2) * 4;

  return (
    <div className="relative w-full mb-6">
      {/* Ambient occlusion on back wall above shelf */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '24px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.18), transparent)',
          zIndex: 0,
        }}
      />

      {/* Book row */}
      <div
        className="relative hide-scroll flex items-end gap-[2px] px-5 pb-0 overflow-x-auto overflow-y-visible"
        style={{ minHeight: `${170 + topPad}px`, paddingTop: `${topPad}px` }}
      >
        {books.map((book) => (
          <Book key={book.id} book={book} onSelect={onSelectBook} />
        ))}
        {/* Breathing room after last book */}
        <div className="flex-shrink-0 w-4" />
      </div>

      {/* ── Shelf surface ── */}
      <div className="relative w-full" style={{ height: '14px', zIndex: 2 }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'var(--shelf-gradient)',
            boxShadow: '0 5px 14px var(--shadow-color), 0 2px 4px rgba(0,0,0,0.28)',
          }}
        />
        {/* Top sheen line */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent 5%, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.18) 60%, transparent 95%)' }}
        />
      </div>

      {/* ── Shelf front edge ── */}
      <div
        className="w-full"
        style={{
          height: '7px',
          background: 'var(--shelf-edge-gradient)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
        }}
      />

      {/* Drop shadow below entire shelf unit */}
      <div
        className="w-full pointer-events-none"
        style={{
          height: '10px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.28), transparent)',
        }}
      />
    </div>
  );
}
