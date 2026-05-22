import { motion } from 'framer-motion'
import { Book } from '../data/books'

interface Props {
  book: Book
  onClick: () => void
  index: number
}

const SPINE_COLORS = [
  '#8B2635', '#1B4F72', '#D4A843', '#2E7D6B', '#6B2D6B',
  '#1A3A5C', '#C4622D', '#8B4513', '#C0392B', '#2C7A3A',
]

export function BookSpine({ book, onClick, index }: Props) {
  const spineColor = SPINE_COLORS[parseInt(book.id) - 1] ?? '#5a3e2b'

  return (
    <motion.div
      layoutId={`book-${book.id}`}
      onClick={onClick}
      className="relative cursor-pointer flex-shrink-0"
      style={{
        width: 44,
        height: 180,
        transformStyle: 'preserve-3d',
      }}
      whileTap={{ scale: 0.96 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { delay: index * 0.06, duration: 0.4 },
        y: { delay: index * 0.06, duration: 0.4 },
        layout: { type: 'spring', stiffness: 300, damping: 30 },
      }}
    >
      {/* Book spine body */}
      <div
        className="absolute inset-0 rounded-sm flex flex-col items-center justify-between py-3 overflow-hidden"
        style={{
          background: book.coverUrl
            ? `url(${book.coverUrl}) center/cover no-repeat`
            : `linear-gradient(180deg, ${spineColor} 0%, ${spineColor}cc 100%)`,
          boxShadow: '3px 0 8px rgba(0,0,0,0.5), inset 2px 0 4px rgba(255,255,255,0.08), inset -1px 0 2px rgba(0,0,0,0.3)',
        }}
      >
        {/* Overlay for non-cover books */}
        {!book.coverUrl && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20" />

            {/* Spine text — rotated vertically */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              <div className="relative z-10 flex flex-col items-center gap-1 px-1">
                <span
                  className="text-white font-serif font-semibold leading-none text-center"
                  style={{ fontSize: 10, letterSpacing: '0.05em' }}
                >
                  {book.title}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Shimmer overlay when loading */}
        {!book.coverUrl && (
          <div className="absolute inset-0 shimmer opacity-30" />
        )}

        {/* Binding crease */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/20" />
        <div className="absolute left-1.5 top-0 bottom-0 w-px bg-white/10" />
      </div>

      {/* Page edges — right side */}
      <div
        className="absolute right-0 top-0.5 bottom-0.5 rounded-r-sm"
        style={{
          width: 3,
          background: 'linear-gradient(90deg, #e8dcc8 0%, #f5f0e8 50%, #e8dcc8 100%)',
          boxShadow: '2px 0 4px rgba(0,0,0,0.3)',
        }}
      />
    </motion.div>
  )
}
