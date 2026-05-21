import { motion, AnimatePresence } from 'framer-motion';
import { useBooksStore, THEMES } from '../../store/useBooksStore';
import type { ThemeId, ThemeTokens } from '../../types';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

// Only the colour tokens that make sense to expose in custom palette
const CUSTOM_CONTROLS: Array<{ key: keyof ThemeTokens; label: string }> = [
  { key: 'roomBg',    label: 'Room'       },
  { key: 'shelfColor',label: 'Shelf'      },
  { key: 'accent',    label: 'Accent'     },
  { key: 'cardBg',    label: 'Panel'      },
  { key: 'textPrimary',label: 'Text'      },
];

export function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
  const activeThemeId   = useBooksStore((s) => s.activeThemeId);
  const setTheme        = useBooksStore((s) => s.setTheme);
  const setCustomTokens = useBooksStore((s) => s.setCustomTokens);
  const customTokens    = useBooksStore((s) => s.customTokens);
  const getActiveTheme  = useBooksStore((s) => s.getActiveTheme);

  const activeTheme = getActiveTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ts-backdrop"
          className="fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          style={{
            backdropFilter: `blur(${activeTheme.tokens.blurIntensity}px)`,
            WebkitBackdropFilter: `blur(${activeTheme.tokens.blurIntensity}px)`,
            background: activeTheme.tokens.overlayBg,
          }}
          onClick={onClose}
        />
      )}
      {isOpen && (
        <motion.div
          key="ts-sheet"
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-hidden"
            style={{
              background: activeTheme.tokens.cardBg,
              boxShadow: `0 -12px 50px var(--shadow-color)`,
              maxWidth: 480,
              margin: '0 auto',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }}
            exit={{ y: '100%', transition: { duration: 0.22 } }}
          >
            <div className="px-6 pt-4 pb-7">
              {/* Handle */}
              <div
                className="w-10 h-1 rounded-full mx-auto mb-6"
                style={{ background: activeTheme.tokens.textSecondary, opacity: 0.35 }}
              />

              <h2 className="font-serif text-xl mb-1" style={{ color: activeTheme.tokens.textPrimary }}>
                Bookshelf Theme
              </h2>
              <p className="text-xs font-light mb-5" style={{ color: activeTheme.tokens.textSecondary }}>
                Changes the shelf material, lighting & panel blur
              </p>

              {/* ── Theme cards ── */}
              <div className="flex gap-3 mb-5">
                {THEMES.map((theme) => (
                  <motion.button
                    key={theme.id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setTheme(theme.id as ThemeId)}
                    className="flex-1 rounded-2xl py-4 px-3 flex flex-col items-center gap-2 relative overflow-hidden"
                    style={{
                      background: theme.tokens.roomBg,
                      border: `2px solid ${activeThemeId === theme.id ? theme.tokens.accent : 'transparent'}`,
                      boxShadow: activeThemeId === theme.id
                        ? `0 0 0 1px ${theme.tokens.accent}44, 0 4px 16px ${theme.tokens.shadowColor}`
                        : `0 2px 8px ${theme.tokens.shadowColor}`,
                    }}
                  >
                    {/* Mini shelf preview */}
                    <div className="w-full flex items-end justify-center gap-0.5 h-8">
                      {[10, 14, 12, 11, 13].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            width: 5,
                            height: h,
                            borderRadius: '1px 1px 0 0',
                            background: ['#2d5986','#c94040','#1a5c2e','#6b4c8b','#e8a030'][i],
                            opacity: 0.9,
                          }}
                        />
                      ))}
                    </div>
                    {/* Shelf strip */}
                    <div
                      className="w-full"
                      style={{ height: 4, borderRadius: 1, background: theme.tokens.shelfGradient }}
                    />
                    <span className="text-xs font-medium text-center leading-tight mt-1" style={{ color: theme.tokens.textPrimary }}>
                      {theme.name}
                    </span>

                    {/* Active check */}
                    {activeThemeId === theme.id && (
                      <motion.div
                        layoutId="theme-check"
                        className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: theme.tokens.accent }}
                      >
                        <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* ── Custom palette controls ── */}
              <AnimatePresence>
                {activeThemeId === 'custom' && (
                  <motion.div
                    key="custom-controls"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 28 } }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.18 } }}
                    className="overflow-hidden"
                  >
                    <div
                      className="rounded-2xl p-4 mb-4"
                      style={{ background: `color-mix(in srgb, ${activeTheme.tokens.shelfColor} 20%, transparent)` }}
                    >
                      <p className="text-xs mb-3 font-medium" style={{ color: activeTheme.tokens.textSecondary }}>
                        Custom colours
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        {CUSTOM_CONTROLS.map(({ key, label }) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm font-light" style={{ color: activeTheme.tokens.textSecondary }}>
                              {label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono opacity-50" style={{ color: activeTheme.tokens.textSecondary }}>
                                {String(customTokens[key]).slice(0, 7)}
                              </span>
                              <input
                                type="color"
                                value={String(customTokens[key]).slice(0, 7)}
                                onChange={(e) => setCustomTokens({ [key]: e.target.value })}
                                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0.5"
                                style={{ background: String(customTokens[key]) }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Live preview swatch ── */}
              <motion.div
                className="rounded-2xl p-4 flex items-center gap-3 mb-5"
                style={{ background: activeTheme.tokens.roomBg, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08)` }}
              >
                {/* Mini book spines */}
                <div className="flex items-end gap-0.5">
                  {[12,16,14].map((h,i) => (
                    <div key={i} style={{ width: 7, height: h, borderRadius: '1px 1px 0 0', background: ['#2d5986','#c94040','#e8a030'][i] }} />
                  ))}
                </div>
                {/* Shelf strip */}
                <div style={{ width: 40, height: 4, borderRadius: 1, background: activeTheme.tokens.shelfGradient, flexShrink: 0 }} />
                <div>
                  <p className="font-serif text-sm" style={{ color: activeTheme.tokens.textPrimary }}>Spine</p>
                  <p className="text-xs font-light" style={{ color: activeTheme.tokens.textSecondary }}>
                    {activeTheme.name}
                  </p>
                </div>
                <div
                  className="ml-auto w-5 h-5 rounded-full flex-shrink-0"
                  style={{ background: activeTheme.tokens.accent }}
                />
              </motion.div>

              {/* Apply */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full rounded-2xl py-3.5 text-sm font-medium tracking-wide"
                style={{
                  background: activeTheme.tokens.accent,
                  color: '#fff',
                  boxShadow: `0 4px 16px ${activeTheme.tokens.accent}55`,
                }}
              >
                Apply Theme
              </motion.button>
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );
}
