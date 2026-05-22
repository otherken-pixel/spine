import { useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { Book } from '../data/books'
import { useDominantColor } from '../hooks/useDominantColor'

interface Props {
  book: Book
  onDismiss: () => void
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: 14 }}>
          {s <= rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}

export function BookDetail({ book, onDismiss }: Props) {
  const dominant = useDominantColor(book.coverUrl, book.dominantColor)
  const constraintsRef = useRef<HTMLDivElement>(null)

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.velocity.y > 300 || info.offset.y > 180) {
      onDismiss()
    }
  }

  const r = parseInt(dominant.slice(1, 3), 16)
  const g = parseInt(dominant.slice(3, 5), 16)
  const b = parseInt(dominant.slice(5, 7), 16)
  const tintBg = `rgba(${r}, ${g}, ${b}, 0.18)`
  const tintBorder = `rgba(${r}, ${g}, ${b}, 0.35)`
  const tintGlow = `rgba(${r}, ${g}, ${b}, 0.6)`

  return (
    <div ref={constraintsRef} className="absolute inset-0 flex flex-col items-center justify-start pt-8 overflow-hidden">
      {/* Drag handle hint */}
      <div className="w-10 h-1 rounded-full bg-white/20 mb-6 flex-shrink-0" />

      {/* Book cover — draggable */}
      <motion.div
        layoutId={`book-${book.id}`}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        className="relative flex-shrink-0 cursor-grab active:cursor-grabbing"
        style={{ zIndex: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Book cover card */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            width: 180,
            height: 270,
            boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${tintGlow}, 0 4px 16px rgba(0,0,0,0.5)`,
          }}
        >
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center p-4"
              style={{ background: dominant }}
            >
              <div className="w-full h-px bg-white/20 mb-4" />
              <p className="font-serif text-white text-center font-semibold leading-tight" style={{ fontSize: 18 }}>
                {book.title}
              </p>
              <div className="w-full h-px bg-white/20 mt-4 mb-3" />
              <p className="text-white/70 text-center font-sans" style={{ fontSize: 11 }}>
                {book.author}
              </p>
            </div>
          )}

          {/* Left binding shadow */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
      </motion.div>

      {/* Info card */}
      <motion.div
        className="mt-6 mx-4 rounded-2xl overflow-hidden flex-shrink-0"
        style={{
          background: tintBg,
          border: `1px solid ${tintBorder}`,
          backdropFilter: 'blur(var(--blur-intensity))',
          WebkitBackdropFilter: 'blur(var(--blur-intensity))',
          width: 'calc(100% - 32px)',
          maxWidth: 380,
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.1 }}
      >
        <div className="p-5">
          {/* Title & author */}
          <h2 className="font-serif text-white font-semibold leading-tight mb-1" style={{ fontSize: 22 }}>
            {book.title}
          </h2>
          <p className="text-white/60 font-sans mb-3" style={{ fontSize: 14 }}>
            {book.author}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={book.rating} />
            <span className="text-white/30">·</span>
            <span className="text-white/50 font-sans" style={{ fontSize: 12 }}>
              Read {book.dateRead}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-4" />

          {/* Synopsis */}
          <p
            className="text-white/70 font-sans leading-relaxed"
            style={{ fontSize: 13 }}
          >
            {book.synopsis}
          </p>
        </div>
      </motion.div>

      {/* Swipe hint */}
      <motion.p
        className="mt-4 text-white/25 font-sans text-center flex-shrink-0"
        style={{ fontSize: 12 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Swipe down to close
      </motion.p>
    </div>
  )
}
