import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleBooksSearch } from '../../hooks/useGoogleBooks';
import { volumeToBook } from '../../utils/googleBooks';
import { useBooksStore } from '../../store/useBooksStore';
import type { Book, Rating } from '../../types';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Lazy-loaded cover: uses IntersectionObserver to load image only when visible
function LazyCover({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="w-12 h-16 rounded flex-shrink-0 overflow-hidden"
      style={{ background: 'var(--shelf-color)' }}
    >
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
      )}
      {(!inView || !loaded) && (
        <div
          className="w-full h-full animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, var(--shelf-color) 25%, var(--shelf-edge) 50%, var(--shelf-color) 75%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}
    </div>
  );
}

export function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const { results, isLoading, error, search, clear } = useGoogleBooksSearch();
  const addBook = useBooksStore((s) => s.addBook);

  const [step, setStep] = useState<'search' | 'confirm'>('search');
  const [query, setQuery] = useState('');
  const [pendingBook, setPendingBook] = useState<Omit<Book, 'rating' | 'dateFinished'> | null>(null);
  const [rating, setRating] = useState<Rating>(4);
  const [dateFinished, setDateFinished] = useState(() => new Date().toISOString().split('T')[0]);

  const handleClose = () => {
    setStep('search');
    setQuery('');
    setPendingBook(null);
    clear();
    onClose();
  };

  const handleSelect = (volume: (typeof results)[0]) => {
    const partial = volumeToBook(volume);
    setPendingBook(partial);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!pendingBook) return;
    addBook({ ...pendingBook, rating, dateFinished });
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="add-backdrop"
          className="fixed inset-0 z-40"
          style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />
      )}
      {isOpen && (
        <motion.div
          key="add-sheet"
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-hidden"
            style={{
              background: 'var(--card-bg)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
              maxWidth: '480px',
              margin: '0 auto',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { type: 'spring', stiffness: 280, damping: 30 } }}
            exit={{ y: '100%', transition: { duration: 0.2 } }}
          >
            <div className="px-6 pt-4 pb-6" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--text-secondary)', opacity: 0.4 }} />

              <AnimatePresence mode="wait">
                {step === 'search' ? (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
                  >
                    <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--text-primary)' }}>
                      Add a Book
                    </h2>

                    <div
                      className="flex items-center gap-2 rounded-xl px-4 py-2 mb-4"
                      style={{ background: 'color-mix(in srgb, var(--shelf-color) 30%, transparent)', border: '1px solid color-mix(in srgb, var(--shelf-color) 60%, transparent)' }}
                    >
                      <SearchIcon />
                      <input
                        type="text"
                        placeholder="Search by title or author…"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          search(e.target.value);
                        }}
                        autoFocus
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: 'var(--text-primary)' }}
                      />
                      {isLoading && <Spinner />}
                    </div>

                    {error && (
                      <p className="text-xs text-red-400 mb-2">{error}</p>
                    )}

                    <div className="overflow-y-auto flex-1">
                      {results.map((vol) => {
                        const info = vol.volumeInfo;
                        const thumb = info.imageLinks?.smallThumbnail ?? '';
                        return (
                          <motion.button
                            key={vol.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(vol)}
                            className="w-full flex items-center gap-3 py-3 border-b text-left"
                            style={{ borderColor: 'color-mix(in srgb, var(--shelf-color) 40%, transparent)' }}
                          >
                            <LazyCover src={thumb.replace('http://', 'https://')} alt={info.title} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                {info.title}
                              </p>
                              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                                {info.authors?.join(', ') ?? 'Unknown'}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}

                      {!isLoading && query && results.length === 0 && (
                        <p className="text-sm text-center pt-8" style={{ color: 'var(--text-secondary)' }}>
                          No results found
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <button
                      onClick={() => setStep('search')}
                      className="flex items-center gap-1 text-sm mb-4"
                      style={{ color: 'var(--accent)' }}
                    >
                      ← Back
                    </button>

                    <h2 className="font-serif text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
                      {pendingBook?.title}
                    </h2>
                    <p className="text-sm mb-5" style={{ color: 'var(--accent)' }}>
                      {pendingBook?.author}
                    </p>

                    <div className="mb-4">
                      <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Your rating
                      </label>
                      <div className="flex gap-1">
                        {([1, 2, 3, 4, 5] as Rating[]).map((s) => (
                          <motion.button
                            key={s}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => setRating(s)}
                            style={{ fontSize: '26px', lineHeight: 1 }}
                          >
                            {s <= rating ? '★' : '☆'}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Date finished
                      </label>
                      <input
                        type="date"
                        value={dateFinished}
                        onChange={(e) => setDateFinished(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-xl px-4 py-2 text-sm outline-none"
                        style={{
                          background: 'color-mix(in srgb, var(--shelf-color) 30%, transparent)',
                          color: 'var(--text-primary)',
                          border: '1px solid color-mix(in srgb, var(--shelf-color) 60%, transparent)',
                        }}
                      />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleConfirm}
                      className="w-full rounded-xl py-3 text-sm font-medium"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      Add to shelf
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function Spinner() {
  return (
    <div
      className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
      style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
    />
  );
}
