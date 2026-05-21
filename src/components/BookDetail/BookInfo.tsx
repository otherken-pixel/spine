import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book, Rating } from '../../types';

interface BookInfoProps {
  book: Book;
  onRatingChange: (r: Rating) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function BookInfo({ book, onRatingChange, onClose, onDelete }: BookInfoProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formattedDate = new Date(book.dateFinished).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="px-6 pb-8" style={{ overflowY: 'auto', maxHeight: '55vh' }}>
      {/* Title & author */}
      <h2 className="font-serif text-2xl leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
        {book.title}
      </h2>
      <p className="text-sm mb-4" style={{ color: 'var(--accent)' }}>
        {book.author}
      </p>

      {/* Star rating */}
      <div className="flex items-center gap-1 mb-4">
        {([1, 2, 3, 4, 5] as Rating[]).map((star) => (
          <motion.button
            key={star}
            whileTap={{ scale: 0.8 }}
            onClick={() => onRatingChange(star)}
            style={{ fontSize: '22px', lineHeight: 1, color: star <= book.rating ? '#f5c842' : 'var(--text-secondary)' }}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            {star <= book.rating ? '★' : '☆'}
          </motion.button>
        ))}
        <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>
          {book.rating}/5
        </span>
      </div>

      {/* Date finished */}
      <div className="flex items-center gap-2 mb-5">
        <CalendarIcon />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Finished {formattedDate}
        </span>
      </div>

      {/* Synopsis */}
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
        {book.synopsis}
      </p>

      {/* Page count */}
      {book.pageCount && (
        <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
          {book.pageCount} pages
        </p>
      )}

      {/* Return button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onClose}
        className="w-full rounded-xl py-3 text-sm font-medium mb-3"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        Return to shelf
      </motion.button>

      {/* Delete — two-tap confirm */}
      <AnimatePresence mode="wait">
        {!confirmDelete ? (
          <motion.button
            key="delete-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setConfirmDelete(true)}
            className="w-full rounded-xl py-2.5 text-sm"
            style={{
              border: '1px solid color-mix(in srgb, var(--shelf-color) 60%, transparent)',
              color: 'var(--text-secondary)',
              background: 'transparent',
            }}
          >
            Remove from shelf
          </motion.button>
        ) : (
          <motion.div
            key="delete-confirm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onDelete}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium"
              style={{ background: '#b83232', color: '#fff' }}
            >
              Yes, remove
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-xl py-2.5 text-sm"
              style={{
                border: '1px solid color-mix(in srgb, var(--shelf-color) 60%, transparent)',
                color: 'var(--text-secondary)',
                background: 'transparent',
              }}
            >
              Cancel
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
