import { motion, AnimatePresence } from 'framer-motion'
import { useTheme, THEMES, ThemeId } from '../store/themeStore'

interface Props {
  visible: boolean
  onClose: () => void
}

const THEME_PREVIEWS: Record<ThemeId, { emoji: string; desc: string }> = {
  mahogany: { emoji: '🪵', desc: 'Warm wood, deep shadows' },
  minimalist: { emoji: '⬜', desc: 'Clean metal, soft light' },
  custom: { emoji: '🎨', desc: 'Your own palette' },
}

export function ThemePicker({ visible, onClose }: Props) {
  const { theme, setThemeId, customColors, setCustomColors } = useTheme()

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Scrim */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ zIndex: 40 }}
          />

          {/* Panel */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
            style={{
              zIndex: 50,
              background: 'rgba(18,12,8,0.92)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: 'calc(var(--safe-bottom) + 16px)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.velocity.y > 300 || info.offset.y > 120) onClose()
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-6 pb-2">
              <h3 className="font-serif text-white text-xl font-semibold mb-1">Shelf Theme</h3>
              <p className="text-white/40 font-sans text-sm mb-6">Choose the look and feel of your bookshelf</p>

              {/* Theme cards */}
              <div className="flex flex-col gap-3 mb-6">
                {(Object.values(THEMES) as typeof THEMES[ThemeId][]).map((t) => {
                  const preview = THEME_PREVIEWS[t.id]
                  const isActive = theme.id === t.id
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => setThemeId(t.id)}
                      className="relative flex items-center gap-4 rounded-2xl p-4 text-left w-full"
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, rgba(196,96,30,0.2), rgba(196,96,30,0.05))`
                          : 'rgba(255,255,255,0.04)',
                        border: isActive ? '1.5px solid rgba(196,96,30,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* Preview swatch */}
                      <div
                        className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
                        style={{ background: t.shelfBg }}
                      >
                        {preview.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-sans font-medium text-sm">{t.name}</p>
                        <p className="text-white/40 font-sans text-xs mt-0.5">{preview.desc}</p>
                      </div>

                      {isActive && (
                        <motion.div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'var(--accent)' }}
                          layoutId="theme-check"
                        >
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Custom palette pickers */}
              <AnimatePresence>
                {theme.id === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-white/60 font-sans text-xs uppercase tracking-widest mb-4">Custom Colors</p>
                      <div className="flex flex-col gap-3">
                        {[
                          { label: 'Room Background', key: 'room' as const },
                          { label: 'Shelf Color', key: 'plank' as const },
                          { label: 'Accent', key: 'accent' as const },
                        ].map(({ label, key }) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-white/60 font-sans text-sm">{label}</span>
                            <div className="relative">
                              <input
                                type="color"
                                value={customColors[key]}
                                onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })}
                                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0.5"
                                style={{ background: 'rgba(255,255,255,0.1)' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={onClose}
                className="w-full rounded-2xl py-3.5 text-center font-sans font-medium text-white text-sm"
                style={{ background: 'var(--accent)' }}
                whileTap={{ scale: 0.97 }}
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
