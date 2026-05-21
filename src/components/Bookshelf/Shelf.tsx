import type { Book as BookType } from '../../types';
import { Book } from './Book';

interface ShelfProps {
  books: BookType[];
  onSelectBook: (id: string) => void;
}

export function Shelf({ books, onSelectBook }: ShelfProps) {
  return (
    <div className="relative w-full mb-8">
      {/* Book row */}
      <div
        className="relative flex items-end gap-[2px] px-6 pt-4 pb-0 overflow-x-auto overflow-y-visible"
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          minHeight: '170px',
        }}
      >
        {books.map((book) => (
          <Book key={book.id} book={book} onSelect={onSelectBook} />
        ))}
        {/* Spacer so last book isn't flush against edge */}
        <div className="flex-shrink-0 w-4" />
      </div>

      {/* Shelf surface */}
      <div
        className="relative w-full"
        style={{ height: '14px', zIndex: 2 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to bottom,
              var(--shelf-color) 0%,
              color-mix(in srgb, var(--shelf-color) 80%, #000) 60%,
              var(--shelf-edge) 100%
            )`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
        {/* Shelf top highlight */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)' }}
        />
      </div>

      {/* Shelf underside / shadow */}
      <div
        className="w-full"
        style={{
          height: '8px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)',
        }}
      />
    </div>
  );
}
