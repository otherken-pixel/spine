import { useRef, useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Book } from '../data/books'
import { useDominantColor } from '../hooks/useDominantColor'
import { HalfStarRating } from './HalfStarRating'

interface Props {
  book: Book
  onDismiss: () => void
  onUpdate?: (id: string, patch: Partial<Book>) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const FUZZY_OPTIONS = [
  'Early', 'Mid', 'Late',
  'Spring', 'Summer', 'Autumn', 'Winter',
  'Sometime in',
]
const now = new Date()
const YEARS = Array.from({ length: 12 }, (_, i) => now.getFullYear() - i)

type DateMode = 'exact' | 'fuzzy' | 'none'

function formatExactDate(iso: string): string {
  const [y, m] = iso.split('-')
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`
}

export function BookDetail({ book, onDismiss, onUpdate }: Props) {
  const dominant = useDominantColor(book.coverUrl, book.dominantColor)
  const constraintsRef = useRef<HTMLDivElement>(null)

  // Local editable state
  const [rating, setRating] = useState(book.rating)
  const [dateMode, setDateMode] = useState<DateMode>(book.dateReadType ?? 'none')
  const [exactDate, setExactDate] = useState(
    book.dateReadExact ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  )
  const [fuzzyPrefix, setFuzzyPrefix] = useState(
    book.dateReadFuzzy?.split(' ')[0] ?? 'Sometime in'
  )
  const [fuzzyYear, setFuzzyYear] = useState<number>(
    parseInt(book.dateReadFuzzy?.match(/\d{4}/)?.[0] ?? String(now.getFullYear()))
  )
  const [datePanelOpen, setDatePanelOpen] = useState(false)
  const [dirty, setDirty] = useState(false)

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.velocity.y > 300 || info.offset.y > 180) onDismiss()
  }

  function handleRating(v: number) {
    setRating(v)
    setDirty(true)
  }

  function handleSave() {
    if (!onUpdate) return
    const fuzzyString = `${fuzzyPrefix} ${fuzzyYear}`
    const patch: Partial<Book> = {
      rating,
      dateReadType: dateMode,
      dateReadExact: dateMode === 'exact' ? exactDate : undefined,
      dateReadFuzzy: dateMode === 'fuzzy' ? fuzzyString : undefined,
      dateRead:
        dateMode === 'exact'
          ? formatExactDate(exactDate)
          : dateMode === 'fuzzy'
          ? fuzzyString
          : book.dateRead,
    }
    onUpdate(book.id, patch)
    setDirty(false)
  }

  const r = parseInt(dominant.slice(1, 3), 16)
  const g = parseInt(dominant.slice(3, 5), 16)
  const b = parseInt(dominant.slice(5, 7), 16)
  const tintBg = `rgba(${r}, ${g}, ${b}, 0.18)`
  const tintBorder = `rgba(${r}, ${g}, ${b}, 0.35)`
  const tintGlow = `rgba(${r}, ${g}, ${b}, 0.6)`

  const displayDate =
    dateMode === 'exact' && exactDate
      ? formatExactDate(exactDate)
      : dateMode === 'fuzzy'
      ? `${fuzzyPrefix} ${fuzzyYear}`
      : book.dateRead

  const [exactYear, exactMonth] = exactDate.split('-').map(Number)

  return (
    <div ref={constraintsRef} className="absolute inset-0 flex flex-col items-center justify-start pt-8 overflow-hidden">
      {/* Drag handle */}
      <div className="w-10 h-1 rounded-full bg-white/20 mb-6 flex-shrink-0" />

      {/* Draggable book cover */}
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
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            width: 180,
            height: 270,
            boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${tintGlow}, 0 4px 16px rgba(0,0,0,0.5)`,
          }}
        >
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" draggable={false} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4" style={{ background: dominant }}>
              <div className="w-full h-px bg-white/20 mb-4" />
              <p className="font-serif text-white text-center font-semibold leading-tight" style={{ fontSize: 18 }}>{book.title}</p>
              <div className="w-full h-px bg-white/20 mt-4 mb-3" />
              <p className="text-white/70 text-center font-sans" style={{ fontSize: 11 }}>{book.author}</p>
            </div>
          )}
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
          <h2 className="font-serif text-white font-semibold leading-tight mb-1" style={{ fontSize: 22 }}>{book.title}</h2>
          <p className="text-white/60 font-sans mb-4" style={{ fontSize: 14 }}>{book.author}</p>

          {/* Half-star rating row */}
          <div className="flex items-center gap-3 mb-1">
            <HalfStarRating
              value={rating}
              onChange={handleRating}
              size={22}
              color="#f59e0b"
            />
            {rating > 0 && (
              <span className="text-white/45 font-sans" style={{ fontSize: 12 }}>{rating.toFixed(1)}</span>
            )}
          </div>

          {/* Date row */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setDatePanelOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <rect x="1" y="2" width="9" height="8" rx="1.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                <path d="M3.5 1v2M7.5 1v2M1 5h9" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />
              </svg>
              <span className="text-white/60 font-sans" style={{ fontSize: 11 }}>
                {dateMode === 'none' ? 'Log date' : displayDate}
              </span>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d={datePanelOpen ? 'M1 5.5L4 2.5L7 5.5' : 'M1 2.5L4 5.5L7 2.5'} stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Date picker panel */}
          <AnimatePresence>
            {datePanelOpen && (
              <motion.div
                className="mb-4 rounded-xl p-3"
                style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Mode tabs */}
                <div className="flex gap-1 mb-3 rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  {(['exact', 'fuzzy', 'none'] as DateMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setDateMode(m); setDirty(true) }}
                      className="flex-1 rounded-md py-1.5 font-sans capitalize transition-colors"
                      style={{
                        fontSize: 11,
                        background: dateMode === m ? 'rgba(255,255,255,0.18)' : 'transparent',
                        color: dateMode === m ? '#fff' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {m === 'none' ? 'Unknown' : m}
                    </button>
                  ))}
                </div>

                {dateMode === 'exact' && (
                  <div className="flex gap-2">
                    <select
                      value={exactMonth}
                      onChange={(e) => {
                        setExactDate(`${exactYear}-${String(e.target.value).padStart(2, '0')}-01`)
                        setDirty(true)
                      }}
                      className="flex-1 rounded-lg px-2 py-2 font-sans text-white text-xs outline-none appearance-none"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      {MONTH_NAMES.map((mn, i) => (
                        <option key={mn} value={i + 1} style={{ background: '#1a0f07' }}>{mn}</option>
                      ))}
                    </select>
                    <select
                      value={exactYear}
                      onChange={(e) => {
                        setExactDate(`${e.target.value}-${String(exactMonth).padStart(2, '0')}-01`)
                        setDirty(true)
                      }}
                      className="rounded-lg px-2 py-2 font-sans text-white text-xs outline-none appearance-none"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', minWidth: 72 }}
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y} style={{ background: '#1a0f07' }}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}

                {dateMode === 'fuzzy' && (
                  <div className="flex gap-2">
                    <select
                      value={fuzzyPrefix}
                      onChange={(e) => { setFuzzyPrefix(e.target.value); setDirty(true) }}
                      className="flex-1 rounded-lg px-2 py-2 font-sans text-white text-xs outline-none appearance-none"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      {FUZZY_OPTIONS.map((o) => (
                        <option key={o} value={o} style={{ background: '#1a0f07' }}>{o}</option>
                      ))}
                    </select>
                    <select
                      value={fuzzyYear}
                      onChange={(e) => { setFuzzyYear(parseInt(e.target.value)); setDirty(true) }}
                      className="rounded-lg px-2 py-2 font-sans text-white text-xs outline-none appearance-none"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', minWidth: 72 }}
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y} style={{ background: '#1a0f07' }}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}

                {dateMode === 'none' && (
                  <p className="text-white/35 font-sans text-xs text-center py-1">Date not recorded</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-4" />

          {/* Synopsis */}
          <p className="text-white/70 font-sans leading-relaxed" style={{ fontSize: 13 }}>{book.synopsis}</p>
        </div>

        {/* Save bar */}
        <AnimatePresence>
          {dirty && onUpdate && (
            <motion.div
              className="px-5 pb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              <motion.button
                onClick={handleSave}
                className="w-full rounded-xl py-3 font-sans text-sm font-semibold text-white text-center"
                style={{ background: tintBorder }}
                whileTap={{ scale: 0.97 }}
              >
                Save changes
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
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
