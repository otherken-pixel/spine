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
  '#5B2C6F', '#1A5276', '#784212', '#145A32', '#7B241C',
  '#1F618D', '#B7950B', '#186A3B', '#6E2F6E', '#2C3E50',
]

function getSpineColor(id: string): string {
  const n = parseInt(id)
  if (!isNaN(n) && n >= 1 && n <= 10) return SPINE_COLORS[n - 1]
  // Hash string IDs (user-added books) to a consistent color
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return SPINE_COLORS[hash % SPINE_COLORS.length]
}

export function BookSpine({ book, onClick, index }: Props) {
  const spineColor = getSpineColor(book.id)

  return (
    <motion.div
      layoutId={`book-${book.id}`}
      onClick={onClick}
      className="relative cursor-pointer flex-shrink-0"
      style={{ width: 44, height: 180 }}
      whileTap={{ scale: 0.96 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { delay: index * 0.05, duration: 0.4 },
        y: { delay: index * 0.05, duration: 0.4 },
        layout: { type: 'spring', stiffness: 300, damping: 30 },
      }}
    >
      {/* Spine body */}
      <div
        className="absolute inset-0 rounded-sm overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${spineColor}f0 0%, ${spineColor} 50%, ${spineColor}cc 100%)`,
          boxShadow: '3px 0 10px rgba(0,0,0,0.5), inset 2px 0 4px rgba(255,255,255,0.1), inset -1px 0 2px rgba(0,0,0,0.3)',
        }}
      >
        {/* Edge gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-transparent to-black/15 pointer-events-none" />

        {/* Title — vertical writing */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          <span
            className="relative z-10 text-white font-serif font-semibold leading-none text-center px-1 line-clamp-1"
            style={{ fontSize: 10, letterSpacing: '0.06em', maxHeight: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {book.title}
          </span>
        </div>

        {/* Binding crease */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/25 pointer-events-none" />
        <div className="absolute left-1.5 top-0 bottom-0 w-px bg-white/12 pointer-events-none" />
      </div>

      {/* Page edges — right side */}
      <div
        className="absolute right-0 top-0.5 bottom-0.5 rounded-r-sm"
        style={{
          width: 3,
          background: 'linear-gradient(90deg, #e0d4bc 0%, #f5efe0 50%, #e0d4bc 100%)',
          boxShadow: '2px 0 6px rgba(0,0,0,0.35)',
        }}
      />
    </motion.div>
  )
}
