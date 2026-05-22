import { createContext, useContext, useState, useEffect, ReactNode, createElement } from 'react'

export type ThemeId = 'mahogany' | 'minimalist' | 'custom'

export interface Theme {
  id: ThemeId
  name: string
  shelfBg: string
  shelfPlankColor: string
  shelfPlankBorder: string
  shelfShadow: string
  roomBg: string
  roomBgEnd: string
  blurIntensity: string
  customAccent?: string
}

export const THEMES: Record<ThemeId, Theme> = {
  mahogany: {
    id: 'mahogany',
    name: 'Classic Mahogany',
    shelfBg: 'linear-gradient(180deg, #3b1f0e 0%, #1a0f07 100%)',
    shelfPlankColor: '#5c3317',
    shelfPlankBorder: '#7a4828',
    shelfShadow: '0 8px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,120,0.15)',
    roomBg: '#1a0f07',
    roomBgEnd: '#0d0805',
    blurIntensity: '20px',
    customAccent: '#c4601e',
  },
  minimalist: {
    id: 'minimalist',
    name: 'Modern Minimalist',
    shelfBg: 'linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 100%)',
    shelfPlankColor: '#c8c8c8',
    shelfPlankBorder: '#b0b0b0',
    shelfShadow: '0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
    roomBg: '#f5f5f0',
    roomBgEnd: '#ebebeb',
    blurIntensity: '12px',
    customAccent: '#333333',
  },
  custom: {
    id: 'custom',
    name: 'Custom Palette',
    shelfBg: 'linear-gradient(180deg, #1a2a3a 0%, #0d1520 100%)',
    shelfPlankColor: '#243447',
    shelfPlankBorder: '#2e4460',
    shelfShadow: '0 8px 32px rgba(0,100,200,0.3), 0 2px 8px rgba(0,0,0,0.4)',
    roomBg: '#0d1520',
    roomBgEnd: '#070d14',
    blurIntensity: '16px',
    customAccent: '#3b82f6',
  },
}

interface ThemeContextType {
  theme: Theme
  setThemeId: (id: ThemeId) => void
  customColors: { room: string; plank: string; accent: string }
  setCustomColors: (c: { room: string; plank: string; accent: string }) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const STORAGE_KEY = 'spine_theme_v1'

interface Stored {
  themeId: ThemeId
  customColors: { room: string; plank: string; accent: string }
}

function loadStored(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Stored
  } catch {}
  return {
    themeId: 'mahogany',
    customColors: { room: '#0d1520', plank: '#243447', accent: '#3b82f6' },
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const stored = loadStored()
  const [themeId, setThemeIdState] = useState<ThemeId>(stored.themeId)
  const [customColors, setCustomColorsState] = useState(stored.customColors)

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ themeId: id, customColors }))
  }

  const setCustomColors = (c: typeof customColors) => {
    setCustomColorsState(c)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ themeId, customColors: c }))
  }

  const base = THEMES[themeId]
  const theme: Theme =
    themeId === 'custom'
      ? {
          ...base,
          roomBg: customColors.room,
          roomBgEnd: customColors.room,
          shelfPlankColor: customColors.plank,
          customAccent: customColors.accent,
        }
      : base

  useEffect(() => {
    document.documentElement.style.setProperty('--room-bg', theme.roomBg)
    document.documentElement.style.setProperty('--room-bg-end', theme.roomBgEnd)
    document.documentElement.style.setProperty('--blur-intensity', theme.blurIntensity)
    document.documentElement.style.setProperty('--accent', theme.customAccent ?? '#c4601e')
  }, [theme])

  return createElement(ThemeContext.Provider, { value: { theme, setThemeId, customColors, setCustomColors } }, children)
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
