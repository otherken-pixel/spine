import { Book } from '../data/books'
import { BookSpine } from './BookSpine'
import { useTheme } from '../store/themeStore'

interface Props {
  books: Book[]
  onSelectBook: (book: Book) => void
}

const BOOKS_PER_SHELF = 5

export function Bookshelf({ books, onSelectBook }: Props) {
  const { theme } = useTheme()

  const shelves: Book[][] = []
  for (let i = 0; i < books.length; i += BOOKS_PER_SHELF) {
    shelves.push(books.slice(i, i + BOOKS_PER_SHELF))
  }

  return (
    <div
      className="perspective-stage w-full h-full overflow-y-auto px-4 py-6"
      style={{ paddingTop: 'calc(var(--safe-top) + 80px)', paddingBottom: 'calc(var(--safe-bottom) + 24px)' }}
    >
      <div className="flex flex-col gap-10 max-w-sm mx-auto">
        {shelves.map((shelfBooks, shelfIndex) => (
          <div key={shelfIndex} className="relative">
            {/* Books sitting on shelf */}
            <div
              className="relative flex items-end gap-1.5 px-4 pb-3 pt-2 justify-center"
              style={{ minHeight: 200 }}
            >
              {shelfBooks.map((book, bookIndex) => (
                <BookSpine
                  key={book.id}
                  book={book}
                  index={shelfIndex * BOOKS_PER_SHELF + bookIndex}
                  onClick={() => onSelectBook(book)}
                />
              ))}
            </div>

            {/* Shelf plank */}
            <div
              className="relative rounded-sm"
              style={{
                height: 18,
                background: `linear-gradient(180deg, ${theme.shelfPlankBorder} 0%, ${theme.shelfPlankColor} 30%, ${theme.shelfPlankColor} 80%, rgba(0,0,0,0.4) 100%)`,
                boxShadow: theme.shelfShadow,
              }}
            >
              {/* Wood grain texture overlay */}
              <div
                className="absolute inset-0 rounded-sm opacity-20"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 12px,
                    rgba(0,0,0,0.15) 12px,
                    rgba(0,0,0,0.15) 13px
                  )`,
                }}
              />
              {/* Top edge highlight */}
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-sm bg-white/20" />
            </div>

            {/* Shelf support brackets */}
            <div className="absolute -left-2 bottom-0 flex flex-col items-center">
              <div
                className="w-1.5 rounded-sm"
                style={{
                  height: 28,
                  background: `linear-gradient(180deg, ${theme.shelfPlankBorder} 0%, ${theme.shelfPlankColor} 100%)`,
                  boxShadow: '1px 0 4px rgba(0,0,0,0.4)',
                }}
              />
            </div>
            <div className="absolute -right-2 bottom-0 flex flex-col items-center">
              <div
                className="w-1.5 rounded-sm"
                style={{
                  height: 28,
                  background: `linear-gradient(180deg, ${theme.shelfPlankBorder} 0%, ${theme.shelfPlankColor} 100%)`,
                  boxShadow: '-1px 0 4px rgba(0,0,0,0.4)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
