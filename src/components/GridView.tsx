import { motion } from 'framer-motion'
import { Book } from '../data/books'
import { HalfStarRating } from './HalfStarRating'
import { useTheme } from '../store/themeStore'

interface Props {
  books: Book[]
  onSelectBook: (book: Book) => void
}

export function GridView({ books, onSelectBook }: Props) {
  const { theme } = useTheme()
  const dark = theme.id !== 'minimalist'

  const cardBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)'
  const cardShadow = dark
    ? '0 6px 28px rgba(0,0,0,0.45), 0 1px 6px rgba(0,0,0,0.3)'
    : '0 4px 24px rgba(0,0,0,0.07), 0 1px 6px rgba(0,0,0,0.04)'
  const hoverShadow = dark
    ? '0 16px 48px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)'
    : '0 16px 48px rgba(0,0,0,0.13), 0 4px 12px rgba(0,0,0,0.07)'

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        paddingTop: 'calc(var(--safe-top) + 80px)',
        paddingBottom: 'calc(var(--safe-bottom) + 100px)',
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
          gap: '20px',
          padding: '0 20px',
        }}
      >
        {books.map((book, i) => (
          <motion.article
            key={book.id}
            onClick={() => onSelectBook(book)}
            className="cursor-pointer rounded-2xl overflow-hidden"
            style={{ background: cardBg, boxShadow: cardShadow }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.035, 0.5), type: 'spring', stiffness: 320, damping: 32 }}
            whileHover={{ y: -5, boxShadow: hoverShadow, transition: { duration: 0.18 } }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Cover — 2:3 aspect ratio */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center p-4"
                  style={{ background: `linear-gradient(155deg, ${book.dominantColor}, ${book.dominantColor}cc)` }}
                >
                  <div className="w-full h-px bg-white/25 mb-3" />
                  <p className="font-serif text-white text-center font-semibold leading-snug" style={{ fontSize: 13 }}>
                    {book.title}
                  </p>
                  <div className="w-full h-px bg-white/25 mt-3 mb-2" />
                  <p className="text-white/65 font-sans text-center" style={{ fontSize: 10 }}>{book.author}</p>
                </div>
              )}
              {/* Subtle bottom fade for depth */}
              <div
                className="absolute bottom-0 left-0 right-0 h-8"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.25), transparent)' }}
              />
              {/* New release indicator */}
              {book.hasNewRelease && (
                <div
                  className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5"
                  style={{ background: 'rgba(196,96,30,0.92)', backdropFilter: 'blur(8px)' }}
                >
                  <span
                    className="font-sans font-semibold text-white"
                    style={{ fontSize: 8, letterSpacing: '0.06em' }}
                  >
                    NEW RELEASE
                  </span>
                  <span
                    className="inline-block rounded-full"
                    style={{ width: 5, height: 5, background: '#fff', animation: 'pulse 1.8s ease-in-out infinite' }}
                  />
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="px-3 pt-2.5 pb-3">
              <p
                className="font-serif font-semibold leading-snug mb-0.5"
                style={{ fontSize: 13, color: theme.textColor, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {book.title}
              </p>
              <p
                className="font-sans mb-2 truncate"
                style={{ fontSize: 11, color: theme.textSecondary }}
              >
                {book.author}
              </p>
              {book.rating > 0 && (
                <HalfStarRating value={book.rating} readOnly size={11} color="#f59e0b" />
              )}
            </div>
          </motion.article>
        ))}

        {books.length === 0 && (
          <div
            className="col-span-full flex flex-col items-center justify-center py-20"
            style={{ color: theme.textSecondary }}
          >
            <p className="font-serif text-2xl mb-2" style={{ color: theme.textColor }}>Your shelf is empty</p>
            <p className="font-sans text-sm">Add your first book below</p>
          </div>
        )}
      </div>
    </div>
  )
}
