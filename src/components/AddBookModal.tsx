import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book } from '../data/books'

interface Props {
  visible: boolean
  onClose: () => void
  onAdd: (book: Book) => void
}

interface SearchResult {
  title: string
  author: string
  synopsis: string
  coverUrl: string | null
  largeCoverUrl: string | null
}

async function searchOpenLibrary(query: string): Promise<SearchResult[]> {
  try {
    const q = encodeURIComponent(query)
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${q}&limit=6&fields=title,author_name,cover_i,first_sentence`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.docs ?? [])
      .filter((d: Record<string, unknown>) => d.title && (d.author_name as string[])?.[0])
      .map((d: Record<string, unknown>) => ({
        title: d.title as string,
        author: ((d.author_name as string[]) ?? [])[0] ?? '',
        synopsis: (d.first_sentence as { value?: string } | undefined)?.value ?? '',
        coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
        largeCoverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null,
      }))
  } catch {
    return []
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const now = new Date()
const YEARS = Array.from({ length: 10 }, (_, i) => now.getFullYear() - i)

type View = 'search' | 'form'

interface FormState {
  title: string
  author: string
  synopsis: string
  rating: number
  month: number
  year: number
  coverUrl: string | null
}

function defaultForm(): FormState {
  return {
    title: '',
    author: '',
    synopsis: '',
    rating: 4,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    coverUrl: null,
  }
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <motion.button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          whileTap={{ scale: 0.85 }}
          className="text-2xl"
          style={{ color: s <= value ? '#f59e0b' : 'rgba(255,255,255,0.2)' }}
        >
          {s <= value ? '★' : '☆'}
        </motion.button>
      ))}
    </div>
  )
}

export function AddBookModal({ visible, onClose, onAdd }: Props) {
  const [view, setView] = useState<View>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => {
        setView('search')
        setQuery('')
        setResults([])
        setSearching(false)
        setForm(defaultForm())
      }, 400)
      return () => clearTimeout(t)
    } else {
      setTimeout(() => searchRef.current?.focus(), 350)
    }
  }, [visible])

  // Debounced search
  useEffect(() => {
    if (view !== 'search' || query.trim().length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const t = setTimeout(async () => {
      const r = await searchOpenLibrary(query)
      setResults(r)
      setSearching(false)
    }, 420)
    return () => clearTimeout(t)
  }, [query, view])

  function selectResult(r: SearchResult) {
    setForm((prev) => ({
      ...prev,
      title: r.title,
      author: r.author,
      synopsis: r.synopsis,
      coverUrl: r.largeCoverUrl,
    }))
    setView('form')
  }

  function handleAddManually() {
    setForm(defaultForm())
    setView('form')
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.author.trim() || submitting) return
    setSubmitting(true)
    onAdd({
      id: Date.now().toString(),
      title: form.title.trim(),
      author: form.author.trim(),
      synopsis: form.synopsis.trim(),
      rating: form.rating,
      dateRead: `${MONTH_NAMES[form.month]} ${form.year}`,
      coverUrl: form.coverUrl,
      dominantColor: '#5a3e2b',
    })
    onClose()
    setSubmitting(false)
  }

  const canSubmit = form.title.trim().length > 0 && form.author.trim().length > 0

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Scrim */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 40 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl flex flex-col"
            style={{
              zIndex: 50,
              background: 'rgba(16,10,6,0.97)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.1)',
              maxHeight: '88vh',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.velocity.y > 300 || info.offset.y > 150) onClose()
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center px-6 py-3 flex-shrink-0">
              <AnimatePresence mode="wait" initial={false}>
                {view === 'form' && (
                  <motion.button
                    key="back"
                    onClick={() => setView('search')}
                    className="flex items-center gap-1.5 mr-3 -ml-1 py-1 pr-3"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 2L4 7L9 12" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
              <h3 className="font-serif text-white text-xl font-semibold">
                {view === 'search' ? 'Add a Book' : 'Book Details'}
              </h3>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ paddingBottom: 'calc(var(--safe-bottom) + 24px)' }}>
              <AnimatePresence mode="wait" initial={false}>

                {/* — SEARCH VIEW — */}
                {view === 'search' && (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Search input */}
                    <div
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                        <circle cx="7" cy="7" r="4.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" />
                        <path d="M10.5 10.5L13 13" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <input
                        ref={searchRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title or author..."
                        className="flex-1 bg-transparent text-white placeholder-white/30 font-sans text-sm outline-none"
                      />
                      {query.length > 0 && (
                        <motion.button
                          onClick={() => setQuery('')}
                          className="text-white/30 text-lg leading-none"
                          whileTap={{ scale: 0.9 }}
                        >
                          ×
                        </motion.button>
                      )}
                    </div>

                    {/* Loading */}
                    {searching && (
                      <div className="flex justify-center py-6">
                        <motion.div
                          className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/60"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                    )}

                    {/* Results */}
                    {!searching && results.length > 0 && (
                      <div className="flex flex-col gap-2 mb-5">
                        {results.map((r, i) => (
                          <motion.button
                            key={`${r.title}-${i}`}
                            onClick={() => selectResult(r)}
                            className="flex items-center gap-3 rounded-2xl p-3 text-left w-full"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            {/* Thumbnail */}
                            <div
                              className="w-10 h-14 rounded-md flex-shrink-0 overflow-hidden"
                              style={{ background: 'rgba(255,255,255,0.1)' }}
                            >
                              {r.coverUrl ? (
                                <img src={r.coverUrl} alt={r.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-white/20 text-xs">📖</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-sans text-sm font-medium truncate">{r.title}</p>
                              <p className="text-white/45 font-sans text-xs mt-0.5 truncate">{r.author}</p>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                              <path d="M5 2L10 7L5 12" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* No results */}
                    {!searching && query.trim().length >= 2 && results.length === 0 && (
                      <p className="text-white/30 font-sans text-sm text-center py-4 mb-4">
                        No results found
                      </p>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-white/25 font-sans text-xs">or</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Manual add */}
                    <motion.button
                      onClick={handleAddManually}
                      className="w-full rounded-2xl py-3.5 text-center font-sans font-medium text-sm"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add manually
                    </motion.button>
                  </motion.div>
                )}

                {/* — FORM VIEW — */}
                {view === 'form' && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Cover preview */}
                    <AnimatePresence>
                      {form.coverUrl && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex justify-center mb-5"
                        >
                          <div
                            className="rounded-xl overflow-hidden"
                            style={{ width: 90, height: 135, boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
                          >
                            <img src={form.coverUrl} alt={form.title} className="w-full h-full object-cover" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Fields */}
                    <div className="flex flex-col gap-3 mb-5">
                      {/* Title */}
                      <div>
                        <label className="text-white/40 font-sans text-xs uppercase tracking-wider block mb-1.5">Title *</label>
                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                          placeholder="Book title"
                          className="w-full rounded-xl px-4 py-3 font-sans text-sm text-white placeholder-white/25 outline-none"
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </div>

                      {/* Author */}
                      <div>
                        <label className="text-white/40 font-sans text-xs uppercase tracking-wider block mb-1.5">Author *</label>
                        <input
                          type="text"
                          value={form.author}
                          onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                          placeholder="Author name"
                          className="w-full rounded-xl px-4 py-3 font-sans text-sm text-white placeholder-white/25 outline-none"
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </div>

                      {/* Rating */}
                      <div>
                        <label className="text-white/40 font-sans text-xs uppercase tracking-wider block mb-2">Rating</label>
                        <StarPicker value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} />
                      </div>

                      {/* Date Read */}
                      <div>
                        <label className="text-white/40 font-sans text-xs uppercase tracking-wider block mb-1.5">Date Read</label>
                        <div className="flex gap-2">
                          <select
                            value={form.month}
                            onChange={(e) => setForm((p) => ({ ...p, month: parseInt(e.target.value) }))}
                            className="flex-1 rounded-xl px-3 py-3 font-sans text-sm text-white outline-none appearance-none"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                          >
                            {MONTHS.map((m, i) => (
                              <option key={m} value={i} style={{ background: '#160e07' }}>{m}</option>
                            ))}
                          </select>
                          <select
                            value={form.year}
                            onChange={(e) => setForm((p) => ({ ...p, year: parseInt(e.target.value) }))}
                            className="rounded-xl px-3 py-3 font-sans text-sm text-white outline-none appearance-none"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 80 }}
                          >
                            {YEARS.map((y) => (
                              <option key={y} value={y} style={{ background: '#160e07' }}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Synopsis */}
                      <div>
                        <label className="text-white/40 font-sans text-xs uppercase tracking-wider block mb-1.5">
                          Synopsis <span className="normal-case text-white/25">(optional)</span>
                        </label>
                        <textarea
                          value={form.synopsis}
                          onChange={(e) => setForm((p) => ({ ...p, synopsis: e.target.value }))}
                          placeholder="A brief description..."
                          rows={3}
                          className="w-full rounded-xl px-4 py-3 font-sans text-sm text-white placeholder-white/25 outline-none resize-none"
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <motion.button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="w-full rounded-2xl py-4 text-center font-sans font-semibold text-white text-sm"
                      style={{
                        background: canSubmit ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                        color: canSubmit ? 'white' : 'rgba(255,255,255,0.25)',
                        transition: 'background 0.2s, color 0.2s',
                      }}
                      whileTap={canSubmit ? { scale: 0.97 } : {}}
                    >
                      Add to Shelf
                    </motion.button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
