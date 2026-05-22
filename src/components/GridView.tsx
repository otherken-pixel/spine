import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book } from '../data/books'
import { HalfStarRating } from './HalfStarRating'
import { useTheme } from '../store/themeStore'
import { groupBooksByYear } from '../utils/groupBooksByYear'

const STORAGE_KEY = 'spine_year_groups_v1'

function loadOpenState(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

function saveOpenState(state: Record<string, boolean>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* quota or private mode */ }
}

interface Props {
  books: Book[]
  onSelectBook: (book: Book) => void
}

interface HeaderProps {
  label: string
  count: number
  isOpen: boolean
  onToggle: () => void
  textColor: string
  textSecondary: string
}

function YearGroupHeader({ label, count, isOpen, onToggle, textColor, textSecondary }: HeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="flex items-baseline gap-3">
        <h2
          className="font-serif font-bold"
          style={{ fontSize: 26, letterSpacing: '-0.02em', color: textColor, lineHeight: 1 }}
        >
          {label}
        </h2>
        <span className="font-sans" style={{ fontSize: 12, color: textSecondary }}>
          {count} {count === 1 ? 'book' : 'books'}
        </span>
      </div>
      <motion.span
        animate={{ rotate: isOpen ? 0 : -90 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ display: 'flex', alignItems: 'center', color: textSecondary, flexShrink: 0 }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.span>
    </button>
  )
}

export function GridView({ books, onSelectBook }: Props) {
  const { theme } = useTheme()
  const dark = theme.id !== 'minimalist'
  const groups = groupBooksByYear(books)
  const yearKeys = groups.map((g) => g.year).join(',')

  const [openYears, setOpenYears] = useState<Record<string, boolean>>(() => {
    const stored = loadOpenState()
    const result: Record<string, boolean> = {}
    for (const group of groups) {
      result[group.year] = stored[group.year] ?? true
    }
    return result
  })

  // Add any newly-encountered year keys (e.g. user adds a book from a new year)
  useEffect(() => {
    const missing = groups.filter((g) => !(g.year in openYears))
    if (missing.length > 0) {
      setOpenYears((prev) => {
        const next = { ...prev }
        for (const g of missing) next[g.year] = true
        return next
      })
    }
  }, [yearKeys]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(year: string) {
    setOpenYears((prev) => {
      const next = { ...prev, [year]: !prev[year] }
      saveOpenState(next)
      return next
    })
  }

  const cardBg = dark ? 'rgba(255,255,255,0.05)' : '#ffffff'
  const cardShadow = dark
    ? '0 6px 28px rgba(0,0,0,0.45), 0 1px 6px rgba(0,0,0,0.3)'
    : '0 4px 20px rgba(0,0,0,0.10), 0 1px 5px rgba(0,0,0,0.07)'
  const hoverShadow = dark
    ? '0 16px 48px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)'
    : '0 16px 48px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.09)'
  const dividerColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'

  if (books.length === 0) {
    return (
      <div
        className="h-full overflow-y-auto flex flex-col items-center justify-center"
        style={{
          paddingTop: 'calc(var(--safe-top) + 164px)',
          paddingBottom: 'calc(var(--safe-bottom) + 100px)',
        }}
      >
        <p className="font-serif text-2xl mb-2" style={{ color: theme.textColor }}>Your shelf is empty</p>
        <p className="font-sans text-sm" style={{ color: theme.textSecondary }}>Add your first book below</p>
      </div>
    )
  }

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        paddingTop: 'calc(var(--safe-top) + 164px)',
        paddingBottom: 'calc(var(--safe-bottom) + 100px)',
      }}
    >
      <div style={{ padding: '0 20px' }}>
        {groups.map((group, gi) => {
          const isOpen = openYears[group.year] ?? true
          return (
            <div key={group.year}>
              {gi > 0 && (
                <div style={{ height: 1, background: dividerColor }} />
              )}

              <YearGroupHeader
                label={group.label}
                count={group.books.length}
                isOpen={isOpen}
                onToggle={() => toggle(group.year)}
                textColor={theme.textColor}
                textSecondary={theme.textSecondary}
              />

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
                        gap: '20px',
                        paddingBottom: '24px',
                      }}
                    >
                      {group.books.map((book, i) => (
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
                            <div
                              className="absolute bottom-0 left-0 right-0 h-8"
                              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.25), transparent)' }}
                            />
                            {book.hasNewRelease && (
                              <div
                                className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5"
                                style={{ background: 'rgba(196,96,30,0.92)', backdropFilter: 'blur(8px)' }}
                              >
                                <span className="font-sans font-semibold text-white" style={{ fontSize: 8, letterSpacing: '0.06em' }}>
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
                              style={{
                                fontSize: 13,
                                color: theme.textColor,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {book.title}
                            </p>
                            <p className="font-sans mb-2 truncate" style={{ fontSize: 11, color: theme.textSecondary }}>
                              {book.author}
                            </p>
                            {book.rating > 0 && (
                              <HalfStarRating value={book.rating} readOnly size={11} color="#f59e0b" />
                            )}
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
