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
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return SPINE_COLORS[hash % SPINE_COLORS.length]
}

// Strip leading articles so the meaningful part of the title has maximum room.
// "The Five Star Weekend" → "Five Star Weekend" saves 4 chars.
function formatTitle(title: string): string {
  return title.replace(/^(The|A|An)\s+/i, '').trim()
}

// In writing-mode: vertical-rl, each Latin character contributes its advance
// width (~0.55 em) to the column height. Pick a font size so the title fits
// within the ~108 px of available spine height.
function titleFontSize(text: string): number {
  const n = text.length
  if (n <= 8)  return 12
  if (n <= 12) return 11
  if (n <= 17) return 10
  return 9
}

function authorSurname(author: string): string {
  const parts = author.trim().split(/\s+/)
  return parts[parts.length - 1]
}

export function BookSpine({ book, onClick, index }: Props) {
  const color        = getSpineColor(book.id)
  const displayTitle = formatTitle(book.title)
  const fontSize     = titleFontSize(displayTitle)
  const surname      = authorSurname(book.author)

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
        y:       { delay: index * 0.05, duration: 0.4 },
        layout:  { type: 'spring', stiffness: 300, damping: 30 },
      }}
    >
      {/* ── Spine body ── */}
      <div
        className="absolute inset-0 rounded-sm overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${color}f0 0%, ${color} 50%, ${color}cc 100%)`,
          boxShadow: '3px 0 10px rgba(0,0,0,0.5), inset 2px 0 4px rgba(255,255,255,0.1), inset -1px 0 2px rgba(0,0,0,0.3)',
        }}
      >
        {/* Depth gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15 pointer-events-none" />

        {/* Top accent line */}
        <div
          className="absolute pointer-events-none"
          style={{ top: 9, left: 6, right: 5, height: 1, background: 'rgba(255,255,255,0.38)' }}
        />

        {/* ── Title ──
            The container uses normal flex layout (no writing-mode) so CSS
            dimensions mean what they say in screen coordinates.
            The span inside carries writing-mode: vertical-rl, making it
            narrow (~fontSize px wide) and tall (~text-length × advance-width px).
            Flex centers the span within the container both axes. */}
        <div
          className="absolute flex items-center justify-center overflow-hidden"
          style={{ top: 14, left: 3, right: 4, bottom: 58 }}
        >
          <span
            className="text-white font-serif font-semibold"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize,
              letterSpacing: '0.045em',
              lineHeight: 1,
            }}
          >
            {displayTitle}
          </span>
        </div>

        {/* Separator line between title and author */}
        <div
          className="absolute pointer-events-none"
          style={{ bottom: 54, left: 7, right: 6, height: 1, background: 'rgba(255,255,255,0.18)' }}
        />

        {/* ── Author surname ──
            Same centering trick: container in normal flow, span in vertical-rl. */}
        <div
          className="absolute flex items-center justify-center overflow-hidden"
          style={{ bottom: 5, left: 3, right: 4, height: 46 }}
        >
          <span
            className="font-sans font-medium"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: 7,
              letterSpacing: '0.10em',
              lineHeight: 1,
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {surname}
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
