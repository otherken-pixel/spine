import { motion, AnimatePresence } from 'framer-motion'
import { useTheme, THEMES, ThemeId } from '../store/themeStore'

interface Props {
  visible: boolean
  onClose: () => void
}

const THEME_PREVIEWS: Record<ThemeId, { emoji: string; desc: string }> = {
  mahogany: { emoji: '🪵', desc: 'Warm wood, deep shadows' },
  minimalist: { emoji: '◻', desc: 'Clean metal, soft light' },
  custom: { emoji: '◈', desc: 'Your own palette' },
}

export function ThemePicker({ visible, onClose }: Props) {
  const { theme, setThemeId, customColors, setCustomColors } = useTheme()

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Scrim */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 40 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel — always dark so text is always readable */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl"
            style={{
              zIndex: 50,
              background: 'rgba(16,10,6,0.96)',
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
                {(Object.values(THEMES) as Theme[]).map((t) => {
                  const preview = THEME_PREVIEWS[t.id]
                  const isActive = theme.id === t.id
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => setThemeId(t.id)}
                      className="relative flex items-center gap-4 rounded-2xl p-4 text-left w-full"
                      whileTap={{ scale: 0.97 }}
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)',
                        border: isActive ? '1.5px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* Swatch */}
                      <div
                        className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl overflow-hidden"
                        style={{ background: t.shelfBg, border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <span style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>{preview.emoji}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-sans font-medium text-sm">{t.name}</p>
                        <p className="text-white/40 font-sans text-xs mt-0.5">{preview.desc}</p>
                      </div>

                      {/* Checkmark — animated in/out with scale, no layoutId */}
                      <motion.div
                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                        animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        initial={false}
                        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                        style={{ background: 'var(--accent)' }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Custom palette pickers */}
              <AnimatePresence initial={false}>
                {theme.id === 'custom' && (
                  <motion.div
                    key="custom-palette"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="rounded-2xl p-4 mb-4"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                    >
                      <p className="text-white/50 font-sans text-xs uppercase tracking-widest mb-4">Custom Colors</p>
                      <div className="flex flex-col gap-3">
                        {[
                          { label: 'Room Background', key: 'room' as const },
                          { label: 'Shelf Color', key: 'plank' as const },
                          { label: 'Accent', key: 'accent' as const },
                        ].map(({ label, key }) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-white/60 font-sans text-sm">{label}</span>
                            <div
                              className="w-9 h-9 rounded-xl overflow-hidden cursor-pointer"
                              style={{ border: '2px solid rgba(255,255,255,0.15)' }}
                            >
                              <input
                                type="color"
                                value={customColors[key]}
                                onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })}
                                className="w-12 h-12 -translate-x-1 -translate-y-1 cursor-pointer border-0"
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

type Theme = import('../store/themeStore').Theme
