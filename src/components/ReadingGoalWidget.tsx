import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../store/themeStore'

interface Props {
  booksRead: number
  goal: number
  onSetGoal: (n: number) => void
}

const R = 18
const CIRC = 2 * Math.PI * R

export function ReadingGoalWidget({ booksRead, goal, onSetGoal }: Props) {
  const { theme } = useTheme()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const progress = goal > 0 ? Math.min(booksRead / goal, 1) : 0
  const remaining = Math.max(0, goal - booksRead)
  const complete = goal > 0 && booksRead >= goal
  const year = new Date().getFullYear()

  const dark = theme.id !== 'minimalist'
  const cardBg = dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.88)'
  const cardBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)'
  const cardShadow = dark
    ? 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 8px rgba(0,0,0,0.25)'
    : '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)'
  const subduedBg = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'
  const ringTrack = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)'
  const ringFill = complete ? '#22c55e' : theme.accent

  function commitGoal() {
    const n = parseInt(draft)
    if (!isNaN(n) && n > 0) onSetGoal(n)
    setEditing(false)
    setDraft('')
  }

  return (
    <>
      <motion.div
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderTop: `1.5px solid ${theme.accent}55`,
          boxShadow: cardShadow,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: 'spring', stiffness: 320, damping: 30 }}
      >
        {!goal ? (
          // ── No goal state ──────────────────────────────────────
          <div className="flex items-center gap-3 px-4 py-4">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-xl"
              style={{ width: 40, height: 40, background: subduedBg, border: `1px solid ${cardBorder}` }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke={theme.accent} strokeWidth="1.5" strokeDasharray="3.5 2.5" />
                <path d="M10 6v4.5l3 1.5" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif font-semibold leading-tight" style={{ fontSize: 14, color: theme.textColor }}>
                {year} Reading Goal
              </p>
              <p className="font-sans mt-0.5 leading-tight" style={{ fontSize: 11, color: theme.textSecondary }}>
                How many books will you read this year?
              </p>
            </div>
            <motion.button
              onClick={() => { setDraft(''); setEditing(true) }}
              className="flex-shrink-0 flex items-center gap-1 rounded-xl px-3 py-2 font-sans text-xs font-semibold text-white"
              style={{ background: theme.accent, whiteSpace: 'nowrap' }}
              whileTap={{ scale: 0.94 }}
            >
              Set Goal
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2.5 5h5M5 2.5l2.5 2.5L5 7.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </div>
        ) : (
          // ── Goal set state ─────────────────────────────────────
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Compact progress ring */}
            <div className="relative flex-shrink-0" style={{ width: 46, height: 46 }}>
              <svg width="46" height="46" viewBox="0 0 46 46" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="23" cy="23" r={R} fill="none" stroke={ringTrack} strokeWidth="4" />
                <motion.circle
                  cx="23" cy="23" r={R}
                  fill="none"
                  stroke={ringFill}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  initial={{ strokeDashoffset: CIRC }}
                  animate={{ strokeDashoffset: CIRC - CIRC * progress }}
                  transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <motion.span
                  className="font-sans font-bold leading-none"
                  style={{ fontSize: complete ? 11 : 14, color: complete ? '#22c55e' : theme.textColor }}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {complete ? '✓' : booksRead}
                </motion.span>
                <span className="font-sans leading-none" style={{ fontSize: 8, color: theme.textSecondary }}>
                  /{goal}
                </span>
              </div>
            </div>

            {/* Stats + progress bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className="font-serif font-semibold leading-none" style={{ fontSize: 15, color: theme.textColor }}>
                  {complete ? '🎉 Goal reached!' : `${booksRead} of ${goal} books`}
                </span>
                <span className="font-sans" style={{ fontSize: 11, color: theme.textSecondary }}>
                  · {Math.round(progress * 100)}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: ringTrack }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: ringFill }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                  transition={{ duration: 1.0, ease: 'easeOut', delay: 0.25 }}
                />
              </div>
              <p className="font-sans mt-1 leading-none" style={{ fontSize: 10.5, color: theme.textSecondary }}>
                {complete
                  ? `${year} reading goal`
                  : `${remaining} book${remaining !== 1 ? 's' : ''} to go · ${year}`}
              </p>
            </div>

            {/* Edit button */}
            <motion.button
              onClick={() => { setDraft(String(goal)); setEditing(true) }}
              className="flex-shrink-0 rounded-xl p-2.5"
              style={{ background: subduedBg, border: `1px solid ${cardBorder}` }}
              whileTap={{ scale: 0.9 }}
              title="Edit goal"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M9 2L11 4L4.5 10.5H2.5V8.5L9 2Z"
                  stroke={theme.textSecondary} strokeWidth="1.2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {editing && (
          <GoalInputOverlay
            draft={draft}
            onChange={setDraft}
            onCommit={commitGoal}
            onCancel={() => { setEditing(false); setDraft('') }}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function GoalInputOverlay({
  draft, onChange, onCommit, onCancel, theme,
}: {
  draft: string
  onChange: (v: string) => void
  onCommit: () => void
  onCancel: () => void
  theme: import('../store/themeStore').Theme
}) {
  const year = new Date().getFullYear()
  return (
    <>
      {/* Full-screen backdrop */}
      <motion.div
        className="fixed inset-0"
        style={{ zIndex: 55, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />
      {/* Dialog — properly centered via Framer Motion x/y transforms */}
      <motion.div
        className="fixed flex flex-col gap-4"
        style={{
          zIndex: 56,
          top: '50%',
          left: '50%',
          width: 'min(280px, calc(100vw - 40px))',
          padding: 20,
          borderRadius: 20,
          background: theme.id === 'minimalist' ? '#f5f2ed' : '#1c1208',
          border: `1px solid ${theme.id === 'minimalist' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`,
          boxShadow: '0 28px 70px rgba(0,0,0,0.55)',
        }}
        initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-46%' }}
        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
        exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-46%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-serif font-semibold text-center" style={{ fontSize: 17, color: theme.textColor }}>
          Books to read in {year}
        </p>
        <input
          autoFocus
          type="number"
          min={1}
          max={999}
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onCommit(); if (e.key === 'Escape') onCancel() }}
          className="w-full rounded-xl px-4 py-3 font-sans text-center text-2xl font-bold outline-none"
          style={{
            background: theme.id === 'minimalist' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${theme.id === 'minimalist' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`,
            color: theme.textColor,
          }}
          placeholder="12"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-3 font-sans text-sm font-medium"
            style={{ background: theme.buttonBg, color: theme.textSecondary, border: `1px solid ${theme.buttonBorder}` }}
          >
            Cancel
          </button>
          <motion.button
            onClick={onCommit}
            className="flex-1 rounded-xl py-3 font-sans text-sm font-semibold text-white"
            style={{ background: theme.accent }}
            whileTap={{ scale: 0.96 }}
          >
            Save
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}
