import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { Book } from '../data/books'

interface Props {
  books: Book[]
  onClose: () => void
}

const GENRE_COLORS: Record<string, string> = {
  Fiction: '#c4601e',
  Thriller: '#8B2635',
  Romance: '#c0557a',
  Fantasy: '#5B2C6F',
  'Sci-Fi': '#1B4F72',
  Mystery: '#1A3A5C',
  'Non-Fiction': '#2E7D6B',
  Historical: '#784212',
  Horror: '#4a1942',
  Other: '#5a5a5a',
}

const GENRE_ORDER = Object.keys(GENRE_COLORS)
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function parseBookDate(book: Book): Date | null {
  if (book.dateReadExact) return new Date(book.dateReadExact + 'T00:00:00')
  // Try to parse legacy "Month YYYY" format
  if (book.dateRead) {
    const match = book.dateRead.match(/(\w+)\s+(\d{4})/)
    if (match) {
      const monthIdx = MONTH_ABBR.findIndex(
        (m) => match[1].toLowerCase().startsWith(m.toLowerCase())
      )
      if (monthIdx !== -1) return new Date(parseInt(match[2]), monthIdx, 1)
    }
  }
  return null
}

function normalizeGenre(genre: string | undefined): string {
  if (!genre) return 'Fiction'
  const lower = genre.toLowerCase()
  if (lower.includes('thriller') || lower.includes('mystery')) return 'Thriller'
  if (lower.includes('romance') || lower.includes('romantic')) return 'Romance'
  if (lower.includes('fantasy')) return 'Fantasy'
  if (lower.includes('sci') || lower.includes('science fiction')) return 'Sci-Fi'
  if (lower.includes('horror')) return 'Horror'
  if (lower.includes('non-fiction') || lower.includes('nonfiction') || lower.includes('biography')) return 'Non-Fiction'
  if (lower.includes('histor')) return 'Historical'
  if (lower.includes('fiction')) return 'Fiction'
  return 'Other'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const entries = payload.filter((p: { value: number }) => p.value > 0)
  if (entries.length === 0) return null
  return (
    <div
      style={{
        background: 'rgba(15,10,5,0.92)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p className="font-sans text-white/60 mb-1.5" style={{ fontSize: 11 }}>{label}</p>
      {entries.map((entry: { name: string; value: number; color: string }) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: 2, background: entry.color, flexShrink: 0 }} />
          <span className="font-sans text-white/85" style={{ fontSize: 12 }}>
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ReadingErasChart({ books, onClose }: Props) {
  const { chartData, activeGenres } = useMemo(() => {
    const now = new Date()
    const months: string[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(getMonthKey(d))
    }

    const counts: Record<string, Record<string, number>> = {}
    for (const m of months) counts[m] = {}

    for (const book of books) {
      const date = parseBookDate(book)
      if (!date) continue
      const key = getMonthKey(date)
      if (!counts[key]) continue
      const genre = normalizeGenre(book.genre)
      counts[key][genre] = (counts[key][genre] ?? 0) + 1
    }

    const data = months.map((key) => {
      const [year, month] = key.split('-')
      const label = `${MONTH_ABBR[parseInt(month) - 1]} ${year.slice(2)}`
      return { month: label, ...counts[key] }
    })

    const genresFound = new Set<string>()
    for (const row of data) {
      for (const key of Object.keys(row)) {
        if (key !== 'month') genresFound.add(key)
      }
    }

    const ordered = GENRE_ORDER.filter((g) => genresFound.has(g))

    return { chartData: data, activeGenres: ordered }
  }, [books])

  const totalMapped = books.filter((b) => parseBookDate(b)).length

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 rounded-t-3xl overflow-hidden"
      style={{
        zIndex: 40,
        background: 'rgba(10,6,3,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderBottom: 'none',
        paddingBottom: 'calc(var(--safe-bottom) + 16px)',
        maxHeight: '80vh',
      }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 340, damping: 34 }}
    >
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      <div className="px-5 pt-2 pb-4 flex items-start justify-between">
        <div>
          <h2 className="font-serif text-white font-semibold" style={{ fontSize: 20 }}>Reading Eras</h2>
          <p className="font-sans text-white/40 mt-0.5" style={{ fontSize: 12 }}>
            {totalMapped} book{totalMapped !== 1 ? 's' : ''} mapped over 12 months
          </p>
        </div>
        <motion.button
          onClick={onClose}
          className="rounded-full p-2"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.92 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>

      {totalMapped === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <p className="font-serif text-white/50 text-lg mb-2">No dated reads yet</p>
          <p className="font-sans text-white/30 text-sm">
            Add exact dates to your books to see your reading eras.
          </p>
        </div>
      ) : (
        <>
          <div style={{ height: 220, paddingRight: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs key="gradient-defs">
                  {activeGenres.map((genre) => (
                    <linearGradient key={genre} id={`grad-${genre}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GENRE_COLORS[genre] ?? '#888'} stopOpacity={0.55} />
                      <stop offset="95%" stopColor={GENRE_COLORS[genre] ?? '#888'} stopOpacity={0.04} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                {activeGenres.map((genre) => (
                  <Area
                    key={genre}
                    type="monotone"
                    dataKey={genre}
                    stroke={GENRE_COLORS[genre] ?? '#888'}
                    strokeWidth={2}
                    fill={`url(#grad-${genre})`}
                    stackId="genres"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: GENRE_COLORS[genre] }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Genre legend */}
          {activeGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 px-5 pt-3">
              {activeGenres.map((genre) => (
                <div key={genre} className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: GENRE_COLORS[genre] ?? '#888' }} />
                  <span className="font-sans text-white/60" style={{ fontSize: 11 }}>{genre}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
