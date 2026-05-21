import { motion, AnimatePresence } from 'framer-motion';
import { useBooksStore, THEMES } from '../../store/useBooksStore';
import type { ThemeId, ThemeTokens } from '../../types';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOKEN_LABELS: Array<{ key: keyof ThemeTokens; label: string }> = [
  { key: 'roomBg', label: 'Room / Background' },
  { key: 'shelfColor', label: 'Shelf' },
  { key: 'accent', label: 'Accent' },
  { key: 'textPrimary', label: 'Primary Text' },
  { key: 'cardBg', label: 'Panel Background' },
];

export function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
  const activeThemeId = useBooksStore((s) => s.activeThemeId);
  const setTheme = useBooksStore((s) => s.setTheme);
  const setCustomTokens = useBooksStore((s) => s.setCustomTokens);
  const getActiveTheme = useBooksStore((s) => s.getActiveTheme);
  const customTokens = useBooksStore((s) => s.customTokens);

  const activeTheme = getActiveTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
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
            <div className="px-6 pt-4 pb-6">
              {/* Handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--text-secondary)', opacity: 0.4 }} />

              <h2 className="font-serif text-xl mb-5" style={{ color: 'var(--text-primary)' }}>
                Bookshelf Theme
              </h2>

              {/* Preset chips */}
              <div className="flex gap-3 mb-6">
                {THEMES.map((theme) => (
                  <motion.button
                    key={theme.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme(theme.id as ThemeId)}
                    className="flex-1 rounded-xl py-3 px-2 text-xs text-center font-medium border-2 transition-colors"
                    style={{
                      background: theme.tokens.roomBg,
                      color: theme.tokens.textPrimary,
                      borderColor:
                        activeThemeId === theme.id
                          ? theme.tokens.accent
                          : 'transparent',
                    }}
                  >
                    <span
                      className="block w-6 h-6 rounded-full mx-auto mb-1 border"
                      style={{
                        background: theme.tokens.shelfColor,
                        borderColor: theme.tokens.shelfEdge,
                      }}
                    />
                    {theme.name}
                  </motion.button>
                ))}
              </div>

              {/* Custom palette pickers — only shown when custom is active */}
              <AnimatePresence>
                {activeThemeId === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                      Custom colors
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {TOKEN_LABELS.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {label}
                          </span>
                          <input
                            type="color"
                            value={customTokens[key]}
                            onChange={(e) => setCustomTokens({ [key]: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            style={{ background: 'none' }}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Preview swatch */}
              <div
                className="mt-5 rounded-xl p-4 flex items-center gap-3"
                style={{ background: activeTheme.tokens.roomBg }}
              >
                <div
                  className="w-8 h-16 rounded-sm flex-shrink-0"
                  style={{ background: activeTheme.tokens.shelfColor }}
                />
                <div>
                  <p className="font-serif text-sm" style={{ color: activeTheme.tokens.textPrimary }}>
                    Spine
                  </p>
                  <p className="text-xs" style={{ color: activeTheme.tokens.textSecondary }}>
                    Preview
                  </p>
                </div>
                <div
                  className="ml-auto w-6 h-6 rounded-full"
                  style={{ background: activeTheme.tokens.accent }}
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="mt-5 w-full rounded-xl py-3 text-sm font-medium"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Apply
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
