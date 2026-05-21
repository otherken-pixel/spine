import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useBooksStore } from '../../store/useBooksStore';
import { BookInfo } from './BookInfo';

// ---------------------------------------------------------------------------
// Animation variants for the 3-phase pull-out sequence
// ---------------------------------------------------------------------------

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25, delay: 0.15 } },
};

// The book travels from its shelf position to center stage.
// layoutId handles the shared-element positional transition;
// these variants layer the flip and scale on top.
const bookVariants = {
  shelf: {
    rotateY: 0,
    scale: 1,
    z: 0,
  },
  open: {
    rotateY: 0,
    scale: 1,
    z: 0,
    transition: {
      type: 'spring',
      stiffness: 180,
      damping: 22,
    },
  },
  exit: {
    rotateY: 0,
    scale: 0.9,
    opacity: 0,
    transition: { duration: 0.25 },
  },
};

const COVER_WIDTH = 200;
const COVER_HEIGHT = 300;

export function BookDetail() {
  const selectedBookId = useBooksStore((s) => s.selectedBookId);
  const books = useBooksStore((s) => s.books);
  const selectBook = useBooksStore((s) => s.selectBook);
  const updateBook = useBooksStore((s) => s.updateBook);
  const removeBook = useBooksStore((s) => s.removeBook);

  const book = books.find((b) => b.id === selectedBookId) ?? null;

  // Drag-to-dismiss: track Y drag on the whole panel
  const dragY = useMotionValue(0);
  const panelOpacity = useTransform(dragY, [0, 200], [1, 0]);

  const [isFlipped, setIsFlipped] = useState(false);
  const [flipDeg, setFlipDeg] = useState(0);

  // Reset flip state whenever the selected book changes
  const handleClose = () => {
    setIsFlipped(false);
    setFlipDeg(0);
    selectBook(null);
  };

  const triggerFlip = () => {
    const target = isFlipped ? 0 : 180;
    setFlipDeg(target);
    setIsFlipped(!isFlipped);
  };

  return (
    <AnimatePresence>
      {book && (
        <>
          {/* Backdrop */}
          <motion.div
            key="overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40"
            style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(8px)' }}
            onClick={handleClose}
          />

          {/* Detail panel — draggable downward to dismiss */}
          <motion.div
            key="panel"
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)',
              y: dragY,
              opacity: panelOpacity,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 400 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 400) {
                handleClose();
              } else {
                dragY.set(0);
              }
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { type: 'spring', stiffness: 260, damping: 28 } }}
            exit={{ y: '100%', transition: { type: 'spring', stiffness: 300, damping: 35 } }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full mb-3 mt-1" style={{ background: 'var(--text-secondary)', opacity: 0.4 }} />

            <div
              className="w-full rounded-t-3xl overflow-hidden"
              style={{
                background: 'var(--card-bg)',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
                maxWidth: '480px',
              }}
            >
              {/* 3D Book cover section */}
              <div
                className="flex justify-center items-end pt-8 pb-4"
                style={{ perspective: '800px' }}
              >
                {/* Shared layout element — morphs from the shelf spine */}
                <motion.div
                  layoutId={`book-${book.id}`}
                  variants={bookVariants}
                  initial="shelf"
                  animate="open"
                  exit="exit"
                  style={{
                    width: `${COVER_WIDTH}px`,
                    height: `${COVER_HEIGHT}px`,
                    transformStyle: 'preserve-3d',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={triggerFlip}
                >
                  <motion.div
                    style={{
                      width: '100%',
                      height: '100%',
                      transformStyle: 'preserve-3d',
                      rotateY: flipDeg,
                      transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                      position: 'relative',
                    }}
                    animate={{ rotateY: flipDeg }}
                    transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {/* Front face — cover image */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        boxShadow: '6px 6px 20px rgba(0,0,0,0.5), -2px 0 6px rgba(0,0,0,0.3)',
                      }}
                    >
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={`Cover of ${book.title}`}
                          loading="eager"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      {/* Fallback / placeholder if no cover */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(135deg, ${book.spineColor}, ${book.spineColor}88)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '16px',
                          zIndex: book.coverUrl ? -1 : 0,
                        }}
                      >
                        <span
                          className="font-serif text-center text-sm leading-snug"
                          style={{ color: book.spineLabelColor }}
                        >
                          {book.title}
                        </span>
                      </div>
                    </div>

                    {/* Back face — spine color + hint */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        borderRadius: '4px',
                        background: book.spineColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '6px 6px 20px rgba(0,0,0,0.5)',
                      }}
                    >
                      <span
                        className="font-serif text-center px-4 text-sm"
                        style={{ color: book.spineLabelColor, opacity: 0.6 }}
                      >
                        {book.author}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              <p
                className="text-center text-xs mb-4"
                style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
              >
                Tap cover to flip
              </p>

              {/* Book info scrollable area */}
              <BookInfo
                book={book}
                onRatingChange={(r) => updateBook(book.id, { rating: r })}
                onClose={handleClose}
                onDelete={() => { removeBook(book.id); handleClose(); }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
