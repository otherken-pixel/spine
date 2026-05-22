import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../store/themeStore'

interface Props {
  booksRead: number
  goal: number
  onSetGoal: (n: number) => void
}

const R = 30
const CIRC = 2 * Math.PI * R

export function ReadingGoalWidget({ booksRead, goal, onSetGoal }: Props) {
  const { theme } = useTheme()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const progress = goal > 0 ? Math.min(booksRead / goal, 1) : 0
  const remaining = Math.max(0, goal - booksRead)
  const complete = goal > 0 && booksRead >= goal

  const cardBg = theme.id === 'minimalist' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'
  const cardBorder = theme.id === 'minimalist' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
  const ringTrack = theme.id === 'minimalist' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'
  const ringFill = complete ? '#22c55e' : theme.accent

  function commitGoal() {
    const n = parseInt(draft)
    if (!isNaN(n) && n > 0) onSetGoal(n)
    setEditing(false)
    setDraft('')
  }

  if (!goal) {
    return (
      <motion.div
        className="mx-5 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke={theme.textSecondary} strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M9 5v4l2.5 2.5" stroke={theme.textSecondary} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="font-sans text-sm flex-1" style={{ color: theme.textSecondary }}>
          Set a reading goal for {new Date().getFullYear()}
        </span>
        <motion.button
          onClick={() => setEditing(true)}
          className="rounded-xl px-3 py-1.5 font-sans text-xs font-semibold"
          style={{ background: theme.accent, color: '#fff' }}
          whileTap={{ scale: 0.94 }}
        >
          Set Goal
        </motion.button>

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
      </motion.div>
    )
  }

  return (
    <motion.div
      className="mx-5 rounded-2xl px-4 py-3 flex items-center gap-4"
      style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Animated ring */}
      <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="36" cy="36" r={R} fill="none" stroke={ringTrack} strokeWidth="5" />
          {/* Progress arc */}
          <motion.circle
            cx="36"
            cy="36"
            r={R}
            fill="none"
            stroke={ringFill}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: CIRC - CIRC * progress }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.25 }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-serif font-bold leading-none"
            style={{ fontSize: 18, color: complete ? '#22c55e' : theme.textColor }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 20 }}
          >
            {booksRead}
          </motion.span>
          <span className="font-sans" style={{ fontSize: 9, color: theme.textSecondary, marginTop: 1 }}>
            of {goal}
          </span>
        </div>
      </div>

      {/* Text info */}
      <div className="flex-1 min-w-0">
        <p className="font-serif font-semibold leading-tight mb-0.5" style={{ fontSize: 15, color: theme.textColor }}>
          {complete ? '🎉 Goal complete!' : `${remaining} book${remaining !== 1 ? 's' : ''} to go`}
        </p>
        <p className="font-sans" style={{ fontSize: 12, color: theme.textSecondary }}>
          {new Date().getFullYear()} reading goal · {Math.round(progress * 100)}%
        </p>
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: ringTrack, maxWidth: 120 }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: ringFill }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>

      {/* Edit button */}
      <motion.button
        onClick={() => { setDraft(String(goal)); setEditing(true) }}
        className="flex-shrink-0 rounded-xl px-2.5 py-2"
        style={{ background: 'transparent', border: `1px solid ${cardBorder}` }}
        whileTap={{ scale: 0.9 }}
        title="Edit goal"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M9 2L11 4L4.5 10.5H2.5V8.5L9 2Z" stroke={theme.textSecondary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

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
    </motion.div>
  )
}

function GoalInputOverlay({
  draft, onChange, onCommit, onCancel, theme
}: {
  draft: string
  onChange: (v: string) => void
  onCommit: () => void
  onCancel: () => void
  theme: import('../store/themeStore').Theme
}) {
  return (
    <>
      <motion.div
        className="fixed inset-0"
        style={{ zIndex: 55, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
      />
      <motion.div
        className="fixed left-1/2 rounded-2xl p-5 flex flex-col gap-4"
        style={{
          zIndex: 56, top: '40%', transform: 'translate(-50%, -50%)',
          width: 260,
          background: theme.id === 'minimalist' ? '#f5f2ed' : '#1a1208',
          border: `1px solid ${theme.id === 'minimalist' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
        initial={{ opacity: 0, scale: 0.92, y: '-48%' }}
        animate={{ opacity: 1, scale: 1, y: '-50%' }}
        exit={{ opacity: 0, scale: 0.92, y: '-48%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-serif font-semibold text-center" style={{ fontSize: 17, color: theme.textColor }}>
          Books to read in {new Date().getFullYear()}
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
            className="flex-1 rounded-xl py-2.5 font-sans text-sm"
            style={{ background: theme.buttonBg, color: theme.textSecondary, border: `1px solid ${theme.buttonBorder}` }}
          >
            Cancel
          </button>
          <motion.button
            onClick={onCommit}
            className="flex-1 rounded-xl py-2.5 font-sans text-sm font-semibold text-white"
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
