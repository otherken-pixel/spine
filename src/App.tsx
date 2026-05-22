import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBookCovers } from './hooks/useBookCovers'
import { useReadingGoal } from './hooks/useReadingGoal'
import { useTheme } from './store/themeStore'
import { Bookshelf } from './components/Bookshelf'
import { GridView } from './components/GridView'
import { BookDetail } from './components/BookDetail'
import { ThemePicker } from './components/ThemePicker'
import { AddBookModal } from './components/AddBookModal'
import { ReadingGoalWidget } from './components/ReadingGoalWidget'
import { AIRecommendations } from './components/AIRecommendations'
import { Book } from './data/books'

// ---------------------------------------------------------------------------
// Set your Gemini API key here (or via import.meta.env.VITE_GEMINI_API_KEY)
// ---------------------------------------------------------------------------
const GEMINI_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? ''

type ViewMode = 'shelf' | 'grid'

export default function App() {
  const { books, addBook, updateBook } = useBookCovers()
  const { goal, setGoal } = useReadingGoal()
  const { theme } = useTheme()
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showAddBook, setShowAddBook] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('shelf')

  const bookOpen = selectedBook !== null

  // Count books that have a dateRead logged this calendar year
  const currentYear = new Date().getFullYear()
  const booksReadThisYear = books.filter((b) => {
    if (b.dateReadType === 'none') return false
    const yearMatch = b.dateReadExact
      ? b.dateReadExact.startsWith(String(currentYear))
      : b.dateRead.includes(String(currentYear))
    return yearMatch
  }).length

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${theme.roomBg} 0%, ${theme.roomBgEnd} 100%)` }}
    >
      {/* Ambient ceiling light */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 400,
          height: 220,
          background: 'radial-gradient(ellipse, rgba(255,200,120,0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* ── Header ── */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-20"
        animate={{ opacity: bookOpen ? 0 : 1, y: bookOpen ? -8 : 0 }}
        transition={{ duration: 0.22 }}
        style={{ pointerEvents: bookOpen ? 'none' : 'auto' }}
      >
        {/* Top bar: title + controls */}
        <div
          className="flex items-center justify-between px-5"
          style={{ paddingTop: 'calc(var(--safe-top) + 14px)', paddingBottom: 8 }}
        >
          <div>
            <h1
              className="font-serif font-semibold"
              style={{ fontSize: 28, letterSpacing: '-0.02em', color: theme.textColor }}
            >
              Spine
            </h1>
            <p className="font-sans mt-0.5" style={{ fontSize: 12, color: theme.textSecondary }}>
              {books.length} {books.length === 1 ? 'book' : 'books'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div
              className="flex items-center rounded-2xl p-1"
              style={{ background: theme.buttonBg, border: `1px solid ${theme.buttonBorder}` }}
            >
              {(['shelf', 'grid'] as ViewMode[]).map((v) => (
                <motion.button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className="rounded-xl px-3 py-1.5 font-sans text-xs font-medium"
                  style={{
                    background: viewMode === v
                      ? theme.id === 'minimalist' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)'
                      : 'transparent',
                    color: viewMode === v ? theme.textColor : theme.textSecondary,
                    transition: 'background 0.18s, color 0.18s',
                  }}
                  whileTap={{ scale: 0.93 }}
                >
                  {v === 'shelf' ? (
                    <span className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <rect x="1" y="8" width="11" height="2" rx="1" fill="currentColor" />
                        <rect x="2" y="3" width="2" height="5" rx="0.5" fill="currentColor" opacity="0.6" />
                        <rect x="5.5" y="2" width="2" height="6" rx="0.5" fill="currentColor" opacity="0.6" />
                        <rect x="9" y="4" width="2" height="4" rx="0.5" fill="currentColor" opacity="0.6" />
                      </svg>
                      Shelf
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <rect x="1" y="1" width="4.5" height="5" rx="1" fill="currentColor" opacity="0.7" />
                        <rect x="7.5" y="1" width="4.5" height="5" rx="1" fill="currentColor" opacity="0.7" />
                        <rect x="1" y="7" width="4.5" height="5" rx="1" fill="currentColor" opacity="0.7" />
                        <rect x="7.5" y="7" width="4.5" height="5" rx="1" fill="currentColor" opacity="0.7" />
                      </svg>
                      Grid
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Theme button */}
            <motion.button
              onClick={() => setShowThemePicker(true)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2"
              style={{ background: theme.buttonBg, border: `1px solid ${theme.buttonBorder}` }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="2.5" fill={theme.textSecondary} />
                <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.9 2.9l1.1 1.1M11 11l1.1 1.1M2.9 12.1L4 11M11 4l1.1-1.1"
                  stroke={theme.textSecondary} strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Reading Goal Widget */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReadingGoalWidget
            booksRead={booksReadThisYear}
            goal={goal}
            onSetGoal={setGoal}
          />
        </motion.div>
      </motion.div>

      {/* ── Main content — shelf or grid ── */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: bookOpen ? 0 : 1 }}
        transition={{ duration: 0.28 }}
        style={{ pointerEvents: bookOpen ? 'none' : 'auto' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {viewMode === 'shelf' ? (
            <motion.div
              key="shelf"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ paddingTop: goal ? 164 : 128 }}
            >
              <Bookshelf books={books} onSelectBook={setSelectedBook} />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <GridView books={books} onSelectBook={setSelectedBook} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Book Detail overlay ── */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            key={`detail-${selectedBook.id}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ zIndex: 30 }}
          >
            {/* Back button */}
            <motion.button
              className="absolute z-50 flex items-center gap-1.5 rounded-full px-3 py-2"
              style={{
                top: 'calc(var(--safe-top) + 14px)',
                left: 18,
                background: 'rgba(0,0,0,0.35)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              onClick={() => setSelectedBook(null)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: 0.12 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M8.5 2L4 6.5L8.5 11" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white/75 font-sans text-xs">Back</span>
            </motion.button>

            <BookDetail
              book={selectedBook}
              onDismiss={() => setSelectedBook(null)}
              onUpdate={(id, patch) => {
                updateBook(id, patch)
                // Keep selectedBook in sync so UI reflects saved values
                setSelectedBook((prev) => prev && prev.id === id ? { ...prev, ...patch } : prev)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom action bar ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 flex justify-center gap-3"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 22px)', zIndex: 20, pointerEvents: bookOpen ? 'none' : 'auto' }}
        animate={{ opacity: bookOpen ? 0 : 1, y: bookOpen ? 10 : 0 }}
        transition={{ duration: 0.22 }}
      >
        {/* Add Book FAB */}
        <motion.button
          onClick={() => setShowAddBook(true)}
          className="flex items-center gap-2.5 rounded-full px-5 py-3"
          style={{
            background: theme.buttonBg,
            border: `1px solid ${theme.buttonBorder}`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          whileTap={{ scale: 0.94 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke={theme.textSecondary} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="font-sans text-sm font-medium" style={{ color: theme.textSecondary }}>Add Book</span>
        </motion.button>

        {/* AI Recommendations — only shown if key configured */}
        {GEMINI_KEY && (
          <AIRecommendations books={books} geminiKey={GEMINI_KEY} />
        )}
      </motion.div>

      {/* ── Modals ── */}
      <ThemePicker visible={showThemePicker} onClose={() => setShowThemePicker(false)} />
      <AddBookModal visible={showAddBook} onClose={() => setShowAddBook(false)} onAdd={addBook} />
    </div>
  )
}
