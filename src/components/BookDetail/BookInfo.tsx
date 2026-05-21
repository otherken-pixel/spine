import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book, Rating } from '../../types';

interface BookInfoProps {
  book: Book;
  textColor: string;
  subColor: string;
  accentColor: string;
  onRatingChange: (r: Rating) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function BookInfo({ book, textColor, subColor, accentColor, onRatingChange, onClose, onDelete }: BookInfoProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formattedDate = new Date(book.dateFinished + 'T12:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="px-6 pt-5 pb-8">

      {/* ── Title — Playfair Display ── */}
      <h2
        className="font-serif font-semibold leading-tight mb-1"
        style={{ color: textColor, fontSize: 'clamp(1.25rem, 5vw, 1.6rem)' }}
      >
        {book.title}
      </h2>

      {/* Author — Inter light-italic */}
      <p
        className="font-serif-italic text-sm mb-5"
        style={{ color: accentColor, opacity: 0.9 }}
      >
        {book.author}
      </p>

      {/* ── Star rating ── */}
      <div className="flex items-center gap-1 mb-4">
        {([1, 2, 3, 4, 5] as Rating[]).map((star) => (
          <motion.button
            key={star}
            whileTap={{ scale: 0.75 }}
            onClick={() => onRatingChange(star)}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            style={{
              fontSize: '21px',
              lineHeight: 1,
              color: star <= book.rating ? '#f5c842' : subColor,
            }}
          >
            {star <= book.rating ? '★' : '☆'}
          </motion.button>
        ))}
        <span className="text-xs ml-2 font-light" style={{ color: subColor }}>
          {book.rating} / 5
        </span>
      </div>

      {/* ── Metadata row — Inter 300 ── */}
      <div className="flex items-center gap-1.5 mb-5">
        <CalendarIcon color={subColor} />
        <span className="text-xs font-light tracking-wide" style={{ color: subColor }}>
          Finished {formattedDate}
        </span>
        {book.pageCount && (
          <>
            <span style={{ color: subColor, opacity: 0.4 }}>·</span>
            <span className="text-xs font-light" style={{ color: subColor }}>
              {book.pageCount.toLocaleString()} pages
            </span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="mb-4" style={{ height: '1px', background: `${subColor}22` }} />

      {/* ── Synopsis — Inter 300 ── */}
      <p className="text-sm font-light leading-relaxed mb-7" style={{ color: subColor, lineHeight: 1.72 }}>
        {book.synopsis}
      </p>

      {/* ── Return button ── */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
        className="w-full rounded-2xl py-3.5 text-sm font-medium tracking-wide mb-3"
        style={{
          background: accentColor,
          color: '#fff',
          boxShadow: `0 4px 16px ${accentColor}55`,
        }}
      >
        Return to shelf
      </motion.button>

      {/* ── Delete — two-tap confirm ── */}
      <AnimatePresence mode="wait">
        {!confirmDelete ? (
          <motion.button
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setConfirmDelete(true)}
            className="w-full rounded-2xl py-3 text-sm font-light"
            style={{ color: subColor, border: `1px solid ${subColor}30` }}
          >
            Remove from shelf
          </motion.button>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onDelete}
              className="flex-1 rounded-2xl py-3 text-sm font-medium"
              style={{ background: '#c0392b', color: '#fff' }}
            >
              Yes, remove
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-2xl py-3 text-sm font-light"
              style={{ color: subColor, border: `1px solid ${subColor}30` }}
            >
              Cancel
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8"  y1="2" x2="8"  y2="6" />
      <line x1="3"  y1="10" x2="21" y2="10" />
    </svg>
  );
}
