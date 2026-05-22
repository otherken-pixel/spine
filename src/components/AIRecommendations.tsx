import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book } from '../data/books'
import { useTheme } from '../store/themeStore'

interface Recommendation {
  title: string
  author: string
  genre: string
  reason: string
}

interface Props {
  books: Book[]
  geminiKey: string
}

async function fetchRecommendations(books: Book[], apiKey: string): Promise<Recommendation[]> {
  const topRated = [...books]
    .filter((b) => b.rating >= 3)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10)

  const shelf = topRated.map((b) =>
    `- "${b.title}" by ${b.author}${b.genre ? ` (${b.genre})` : ''} — ${b.rating}/5 stars`
  ).join('\n')

  const prompt = `You are a thoughtful book recommendation engine with deep literary knowledge.

The reader's shelf (sorted by rating):
${shelf}

Analyze their reading patterns, preferred authors, genres, and themes. Then recommend exactly 3 books they haven't read yet that would genuinely delight them.

Respond ONLY with a valid JSON array in this exact shape — no markdown, no prose, no explanation:
[
  {"title":"...", "author":"...", "genre":"...", "reason":"..."},
  {"title":"...", "author":"...", "genre":"...", "reason":"..."},
  {"title":"...", "author":"...", "genre":"...", "reason":"..."}
]

Each "reason" should be one sentence that directly connects the recommendation to a specific pattern in their reading history.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
      }),
      signal: AbortSignal.timeout(20000),
    }
  )

  if (!res.ok) throw new Error(`Gemini API error ${res.status}`)
  const data = await res.json()
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  // Strip any accidental markdown fences
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(json) as Recommendation[]
}

export function AIRecommendations({ books, geminiKey }: Props) {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recs, setRecs] = useState<Recommendation[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFetch() {
    if (loading) return
    setOpen(true)
    if (recs) return  // already fetched
    setLoading(true)
    setError(null)
    try {
      const result = await fetchRecommendations(books, geminiKey)
      setRecs(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const dark = theme.id !== 'minimalist'
  const sheetBg = dark ? 'rgba(14,8,4,0.98)' : 'rgba(250,247,242,0.98)'
  const cardBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const cardBorder = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'
  const accentStar = '#f59e0b'

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={handleFetch}
        className="flex items-center gap-2.5 rounded-full px-5 py-3 font-sans text-sm font-medium"
        style={{
          background: theme.buttonBg,
          border: `1px solid ${theme.buttonBorder}`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: theme.textSecondary,
        }}
        whileTap={{ scale: 0.94 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
      >
        {/* Sparkle icon */}
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 1L8.8 5.7H13.5L9.8 8.3L11.2 13L7.5 10.4L3.8 13L5.2 8.3L1.5 5.7H6.2L7.5 1Z" fill={theme.accent} />
        </svg>
        What to Read Next
      </motion.button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 60 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="fixed bottom-0 left-0 right-0 rounded-t-3xl flex flex-col"
              style={{
                zIndex: 61,
                background: sheetBg,
                border: '1px solid rgba(255,255,255,0.08)',
                maxHeight: '82vh',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.06}
              onDragEnd={(_, info) => { if (info.velocity.y > 300 || info.offset.y > 120) setOpen(false) }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
              </div>

              {/* Header */}
              <div className="flex items-center gap-2 px-6 pt-3 pb-4 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 1L8.8 5.7H13.5L9.8 8.3L11.2 13L7.5 10.4L3.8 13L5.2 8.3L1.5 5.7H6.2L7.5 1Z" fill={theme.accent} />
                </svg>
                <h3 className="font-serif font-semibold" style={{ fontSize: 20, color: theme.textColor }}>
                  What to Read Next
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-auto rounded-full p-1.5"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2L10 10M10 2L2 10" stroke={theme.textSecondary} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ paddingBottom: 'calc(var(--safe-bottom) + 24px)' }}>

                {/* Loading */}
                {loading && (
                  <div className="flex flex-col items-center py-12 gap-4">
                    <motion.div
                      className="w-8 h-8 rounded-full border-2"
                      style={{ borderColor: `${theme.accent}40`, borderTopColor: theme.accent }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="font-sans text-sm" style={{ color: theme.textSecondary }}>
                      Analysing your reading patterns…
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && !loading && (
                  <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <p className="font-sans text-sm text-red-400 mb-3">{error}</p>
                    <button
                      onClick={() => { setRecs(null); setError(null); setLoading(true); fetchRecommendations(books, geminiKey).then(setRecs).catch((e) => setError(e.message)).finally(() => setLoading(false)) }}
                      className="font-sans text-xs font-medium px-4 py-2 rounded-xl"
                      style={{ background: theme.buttonBg, color: theme.textSecondary, border: `1px solid ${theme.buttonBorder}` }}
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Results */}
                {recs && !loading && (
                  <div className="flex flex-col gap-4">
                    <p className="font-sans text-xs mb-1" style={{ color: theme.textSecondary }}>
                      Based on your {books.length} books — powered by Gemini
                    </p>
                    {recs.map((rec, i) => (
                      <motion.div
                        key={i}
                        className="rounded-2xl p-4"
                        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: 'spring', stiffness: 320, damping: 28 }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Rank badge */}
                          <div
                            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-serif font-bold"
                            style={{ background: theme.accent, color: '#fff', fontSize: 13 }}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-serif font-semibold leading-snug" style={{ fontSize: 16, color: theme.textColor }}>
                              {rec.title}
                            </p>
                            <p className="font-sans mt-0.5" style={{ fontSize: 12, color: theme.textSecondary }}>
                              {rec.author}
                            </p>
                            {rec.genre && (
                              <span
                                className="inline-block mt-1.5 rounded-full px-2 py-0.5 font-sans"
                                style={{ fontSize: 10, background: `${theme.accent}22`, color: theme.accent, border: `1px solid ${theme.accent}44` }}
                              >
                                {rec.genre}
                              </span>
                            )}
                          </div>
                          <span style={{ color: accentStar, fontSize: 16, flexShrink: 0 }}>★</span>
                        </div>
                        <p className="font-sans mt-3 leading-relaxed" style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)' }}>
                          {rec.reason}
                        </p>
                      </motion.div>
                    ))}

                    {/* Refresh */}
                    <motion.button
                      onClick={() => { setRecs(null); setLoading(true); fetchRecommendations(books, geminiKey).then(setRecs).catch((e) => setError(e.message)).finally(() => setLoading(false)) }}
                      className="w-full rounded-2xl py-3 font-sans text-sm font-medium mt-1"
                      style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: theme.textSecondary }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Refresh suggestions
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
