import { useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useBookCovers } from './hooks/useBookCovers'
import { useTheme } from './store/themeStore'
import { Bookshelf } from './components/Bookshelf'
import { BookDetail } from './components/BookDetail'
import { ThemePicker } from './components/ThemePicker'
import { Book } from './data/books'

export default function App() {
  const books = useBookCovers()
  const { theme } = useTheme()
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showThemePicker, setShowThemePicker] = useState(false)

  function handleSelectBook(book: Book) {
    setSelectedBook(book)
  }

  function handleDismiss() {
    setSelectedBook(null)
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${theme.roomBg} 0%, ${theme.roomBgEnd} 100%)` }}
    >
      {/* Room ambient lighting */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(255,200,120,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Header */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 z-20"
        style={{ paddingTop: 'calc(var(--safe-top) + 16px)' }}
        animate={{ opacity: selectedBook ? 0 : 1, y: selectedBook ? -10 : 0 }}
        transition={{ duration: 0.25 }}
      >
        <div>
          <h1
            className="font-serif text-white font-semibold"
            style={{ fontSize: 28, letterSpacing: '-0.02em' }}
          >
            Spine
          </h1>
          <p className="text-white/35 font-sans mt-0.5" style={{ fontSize: 12 }}>
            {books.length} books
          </p>
        </div>

        <motion.button
          onClick={() => setShowThemePicker(true)}
          className="flex items-center gap-2 rounded-2xl px-3 py-2 glass"
          whileTap={{ scale: 0.95 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" fill="rgba(255,255,255,0.6)" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-white/60 font-sans text-xs">Theme</span>
        </motion.button>
      </motion.div>

      {/* Main bookshelf */}
      <LayoutGroup>
        <AnimatePresence mode="wait">
          {!selectedBook ? (
            <motion.div
              key="shelf"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Bookshelf books={books} onSelectBook={handleSelectBook} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Detail overlay */}
        <AnimatePresence>
          {selectedBook && (
            <motion.div
              key={`detail-${selectedBook.id}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ zIndex: 30 }}
            >
              {/* Back button */}
              <motion.button
                className="absolute z-50 flex items-center gap-1.5 rounded-full px-3 py-2 glass"
                style={{ top: 'calc(var(--safe-top) + 16px)', left: 20 }}
                onClick={handleDismiss}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: 0.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7L9 12" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-white/70 font-sans text-xs">Back</span>
              </motion.button>

              <BookDetail book={selectedBook} onDismiss={handleDismiss} />
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>

      {/* Theme picker */}
      <ThemePicker visible={showThemePicker} onClose={() => setShowThemePicker(false)} />
    </div>
  )
}
