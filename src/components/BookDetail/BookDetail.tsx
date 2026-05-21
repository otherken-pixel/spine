import { useState, useCallback } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, animate,
} from 'framer-motion';
import { useBooksStore } from '../../store/useBooksStore';
import { useColorExtract } from '../../hooks/useColorExtract';
import { BookInfo } from './BookInfo';

const COVER_W = 190;
const COVER_H = 285;

// Spring preset that matches Apple Books fluidity
const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

export function BookDetail() {
  const selectedBookId = useBooksStore((s) => s.selectedBookId);
  const books      = useBooksStore((s) => s.books);
  const selectBook = useBooksStore((s) => s.selectBook);
  const updateBook = useBooksStore((s) => s.updateBook);
  const removeBook = useBooksStore((s) => s.removeBook);
  const getActiveTheme = useBooksStore((s) => s.getActiveTheme);

  const book  = books.find((b) => b.id === selectedBookId) ?? null;
  const theme = getActiveTheme();

  // ── Colour extraction for dynamic glassmorphic tint ──────────────────────
  const [dominantColor, isDark] = useColorExtract(book?.coverUrl);

  // Build tinted glassmorphic style from extracted colour
  const rgb = dominantColor.match(/\d+/g)?.map(Number) ?? [60, 40, 20];
  const [dr, dg, db] = rgb;
  const glassBg = `linear-gradient(
    160deg,
    rgba(${dr},${dg},${db},0.28) 0%,
    rgba(${Math.round(dr*0.7)},${Math.round(dg*0.7)},${Math.round(db*0.7)},0.18) 60%,
    rgba(0,0,0,0.10) 100%
  )`;
  const textOnGlass = isDark ? 'rgba(255,255,255,0.92)' : 'rgba(10,5,2,0.90)';
  const subOnGlass  = isDark ? 'rgba(255,255,255,0.60)' : 'rgba(10,5,2,0.52)';

  // ── Drag-to-dismiss physics ───────────────────────────────────────────────
  const y = useMotionValue(0);
  const x = useMotionValue(0);

  // Background dims as book is dragged away
  const backdropOpacity = useTransform(y, [0, 220], [1, 0]);
  // Book scales down slightly during drag for depth
  const bookScale       = useTransform(y, [0, 220], [1, 0.88]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      const shouldDismiss = info.offset.y > 90 || info.velocity.y > 450;
      if (shouldDismiss) {
        // Snap back motion values before dismount so the next open starts clean
        animate(y, 0, { duration: 0 });
        animate(x, 0, { duration: 0 });
        selectBook(null);
      } else {
        animate(y, 0, SPRING);
        animate(x, 0, SPRING);
      }
    },
    [selectBook, y, x]
  );

  // ── Book cover flip ───────────────────────────────────────────────────────
  const [flipDeg, setFlipDeg]   = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClose = useCallback(() => {
    setIsFlipped(false);
    setFlipDeg(0);
    animate(y, 0, { duration: 0 });
    animate(x, 0, { duration: 0 });
    selectBook(null);
  }, [selectBook, y, x]);

  const triggerFlip = () => {
    const next = isFlipped ? 0 : 180;
    setFlipDeg(next);
    setIsFlipped(!isFlipped);
  };

  return (
    <AnimatePresence>
      {book && (
        /* ── Glassmorphic backdrop ──────────────────────────────────── */
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          style={{ opacity: backdropOpacity }}
          onClick={handleClose}
        >
            {/* Blurred room behind */}
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: `blur(${theme.tokens.blurIntensity}px) saturate(1.6)`,
                WebkitBackdropFilter: `blur(${theme.tokens.blurIntensity}px) saturate(1.6)`,
                background: theme.tokens.overlayBg,
              }}
            />
            {/* Dynamic colour tint from book cover */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ background: glassBg }}
            />
          </motion.div>

      )}
      {book && (
        /* ── Draggable book + info panel ────────────────────────────── */
        <motion.div
          key="detail"
            className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-hidden"
            style={{
              y,
              paddingTop: 'calc(env(safe-area-inset-top) + 48px)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              cursor: 'grab',
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.55 }}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, y: 40, transition: { duration: 0.22 } }}
          >
            {/* Drag hint pill */}
            <motion.div
              className="w-10 h-1 rounded-full mb-5 flex-shrink-0"
              style={{ background: textOnGlass, opacity: 0.35 }}
            />

            {/* ── 3D Book cover ─────────────────────────────── */}
            <motion.div
              className="flex-shrink-0 relative"
              style={{ scale: bookScale }}
              onClick={(e) => { e.stopPropagation(); triggerFlip(); }}
            >
              {/* Page shadow beneath book */}
              <div
                className="absolute bottom-0 inset-x-4 pointer-events-none"
                style={{
                  height: '20px',
                  background: `radial-gradient(ellipse at 50% 100%, var(--shadow-color), transparent 70%)`,
                  transform: 'translateY(8px)',
                  filter: 'blur(6px)',
                }}
              />

              {/* Shared-layout book — morphs from spine on shelf */}
              <motion.div
                layoutId={`book-${book.id}`}
                style={{
                  width: COVER_W,
                  height: COVER_H,
                  transformStyle: 'preserve-3d',
                  perspective: '900px',
                  position: 'relative',
                }}
                transition={SPRING}
              >
                {/* Inner flipper */}
                <motion.div
                  animate={{ rotateY: flipDeg }}
                  transition={{ duration: 0.52, ease: [0.23, 1, 0.32, 1] }}
                  style={{
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    position: 'relative',
                  }}
                >
                  {/* Front face: cover image */}
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      borderRadius: '4px 6px 6px 4px',
                      overflow: 'hidden',
                      boxShadow: '8px 10px 28px rgba(0,0,0,0.55), -2px 0 6px rgba(0,0,0,0.28)',
                    }}
                  >
                    {book.coverUrl && (
                      <img
                        src={book.coverUrl}
                        alt={`Cover of ${book.title}`}
                        crossOrigin="anonymous"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    )}
                    {/* Colour fallback when no cover or while loading */}
                    <div
                      style={{
                        position: 'absolute', inset: 0, zIndex: book.coverUrl ? -1 : 0,
                        background: `linear-gradient(145deg, ${book.spineColor}, ${book.spineColor}aa)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                      }}
                    >
                      <span className="font-serif text-center text-base leading-snug" style={{ color: book.spineLabelColor }}>
                        {book.title}
                      </span>
                    </div>

                    {/* Subtle gloss sheen on cover */}
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.10) 0%, transparent 50%)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  {/* Back face: author on spine colour */}
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      borderRadius: '4px 6px 6px 4px',
                      background: book.spineColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '8px 10px 28px rgba(0,0,0,0.5)',
                    }}
                  >
                    <span
                      className="font-serif-italic text-center px-6 text-base leading-relaxed"
                      style={{ color: book.spineLabelColor, opacity: 0.75 }}
                    >
                      {book.author}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Flip hint */}
            <motion.p
              className="mt-3 text-xs flex-shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55, transition: { delay: 0.6 } }}
              style={{ color: textOnGlass }}
            >
              Tap to flip
            </motion.p>

            {/* ── Info panel ──────────────────────────────────── */}
            <motion.div
              className="w-full mt-5 flex-1 overflow-y-auto hide-scroll rounded-t-3xl flex-shrink-0"
              style={{
                maxWidth: '480px',
                background: glassBg,
                borderTop: `1px solid rgba(${dr},${dg},${db},0.25)`,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { ...SPRING, delay: 0.1 } }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <BookInfo
                book={book}
                textColor={textOnGlass}
                subColor={subOnGlass}
                accentColor={`rgb(${dr},${dg},${db})`}
                onRatingChange={(r) => updateBook(book.id, { rating: r })}
                onClose={handleClose}
                onDelete={() => { removeBook(book.id); handleClose(); }}
              />
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
